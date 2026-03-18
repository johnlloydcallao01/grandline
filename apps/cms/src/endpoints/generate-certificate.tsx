import { PayloadRequest } from 'payload';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { CertificatePDF } from '../components/CertificatePDF';
import { randomBytes } from 'crypto';

export const generateCertificateEndpoint = async (req: PayloadRequest) => {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to send progress
  const sendProgress = async (progress: number, message: string, data?: any) => {
    const chunk = JSON.stringify({ progress, message, ...data }) + '\n';
    await writer.write(encoder.encode(chunk));
  };

  (async () => {
    try {
      const { payload, user } = req;
      
      // Check authentication and authorization
      if (!user) {
        await sendProgress(0, 'Unauthorized');
        await writer.close();
        return;
      }
      
      // Only admins, instructors, or service accounts can manually trigger this
      if (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'service') {
        await sendProgress(0, 'Forbidden');
        await writer.close();
        return;
      }

      const body = await req.json?.() || {};
      const { enrollmentId } = body;

      if (!enrollmentId) {
        await sendProgress(0, 'enrollmentId is required');
        await writer.close();
        return;
      }

      await sendProgress(10, 'Fetching enrollment data...');

      // 1. Fetch Enrollment (with student and course populated)
      const enrollment = await payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 3, 
      });

      if (!enrollment) {
        await sendProgress(0, 'Enrollment not found');
        await writer.close();
        return;
      }

      if (enrollment.finalEvaluation !== 'passed') {
        await sendProgress(0, 'Cannot issue certificate for non-passed enrollment');
        await writer.close();
        return;
      }

      if (enrollment.certificateIssued) {
        await sendProgress(0, 'Certificate already issued for this enrollment');
        await writer.close();
        return;
      }

      await sendProgress(20, 'Preparing certificate data...');

      // 2. Extract Data
      const course = typeof enrollment.course === 'object' ? enrollment.course : null;
      if (!course) {
        await sendProgress(0, 'Course data missing');
        await writer.close();
        return;
      }

      const template = typeof course.certificateTemplate === 'object' ? course.certificateTemplate : null;
      if (!template) {
        await sendProgress(0, 'No certificate template assigned to this course');
        await writer.close();
        return;
      }

      const studentUser = enrollment.student && typeof enrollment.student === 'object' && typeof enrollment.student.user === 'object' 
          ? enrollment.student.user : null;
      const studentName = studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : `Student #${typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student}`;

      let instructorName = 'Unknown Instructor';
      if (course.instructor && typeof course.instructor === 'object') {
          const instructorUser = typeof course.instructor.user === 'object' ? course.instructor.user : null;
          if (instructorUser) {
              instructorName = `${instructorUser.firstName} ${instructorUser.lastName}`;
          }
      }

      // Generate Certificate ID
      const year = new Date().getFullYear();
      const rand = randomBytes(4).toString('hex').toUpperCase();
      const certificateCode = `CERT-${year}-${rand}`;

      // 3. Prepare PDF Generation
      let backgroundUrl = '';
      if (template.backgroundImage && typeof template.backgroundImage === 'object') {
          const bgImage = template.backgroundImage as any;
          if (bgImage.cloudinaryURL) {
              backgroundUrl = bgImage.cloudinaryURL;
          } else if (bgImage.url) {
              backgroundUrl = bgImage.url.startsWith('http') 
                  ? bgImage.url 
                  : `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}${bgImage.url}`;
          }
      }

      // Parse Canvas Schema
      let canvasElements: any[] = [];
      let canvasWidth = 3508; 
      let canvasHeight = 2480;
      let backgroundFit: 'cover' | 'contain' = 'contain';

      if (template.canvasSchema && typeof template.canvasSchema === 'object' && !Array.isArray(template.canvasSchema)) {
          const schema = template.canvasSchema as any;
          if (schema.elements && Array.isArray(schema.elements)) {
              canvasElements = schema.elements;
          }
          if (schema.width) canvasWidth = Number(schema.width);
          if (schema.height) canvasHeight = Number(schema.height);
          if (schema.backgroundFit) backgroundFit = schema.backgroundFit;
      } else if (Array.isArray(template.canvasSchema)) {
          canvasElements = template.canvasSchema;
      } else {
          // Fallback default schema
          canvasElements = [
              { type: 'text', content: 'Certificate of Completion', x: 300, y: 100, width: 200, style: { fontSize: 30, textAlign: 'center', fontWeight: 'bold' } },
              { type: 'text', content: 'This is to certify that', x: 300, y: 160, width: 200, style: { fontSize: 16, textAlign: 'center' } },
              { type: 'text', content: '', field: 'student_name', x: 300, y: 200, width: 200, style: { fontSize: 24, textAlign: 'center', fontWeight: 'bold' } },
              { type: 'text', content: 'has successfully completed the course', x: 300, y: 240, width: 200, style: { fontSize: 16, textAlign: 'center' } },
              { type: 'text', content: '', field: 'course_title', x: 300, y: 280, width: 200, style: { fontSize: 20, textAlign: 'center', fontWeight: 'bold' } },
              { type: 'text', content: 'on {{completionDate}}', x: 300, y: 320, width: 200, style: { fontSize: 14, textAlign: 'center' } },
              { type: 'text', content: 'Instructor: {{instructorName}}', x: 100, y: 450, style: { fontSize: 12 } },
              { type: 'text', content: 'Certificate ID: {{certificateId}}', x: 600, y: 450, style: { fontSize: 10 } },
          ];
      }

      const completionDate = enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : new Date().toLocaleDateString();

      // Sanitize elements
      const sanitizedElements = canvasElements.map(el => {
          if (!el) return null;
          const cleanEl = JSON.parse(JSON.stringify(el));
          if (!cleanEl.style) cleanEl.style = {};
          Object.keys(cleanEl.style).forEach(key => {
              if (cleanEl.style[key] === null || cleanEl.style[key] === undefined || cleanEl.style[key] === 'undefined') {
                  delete cleanEl.style[key];
              }
          });
          return cleanEl;
      }).filter(Boolean);

      await sendProgress(40, 'Generating PDF...');

      // 4. Generate PDF Stream -> Buffer
      console.log("Generating PDF with template:", template.name, "and canvasWidth:", canvasWidth);
      
      const pdfStream = await renderToStream(
          <CertificatePDF 
              backgroundUrl={backgroundUrl}
              backgroundFit={backgroundFit}
              elements={sanitizedElements}
              width={canvasWidth}
              height={canvasHeight}
              data={{
                  studentName,
                  courseTitle: course.title,
                  completionDate,
                  instructorName,
                  certificateId: certificateCode
              }}
          />
      );

      const chunks: Buffer[] = [];
      for await (const chunk of pdfStream) {
          chunks.push(Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);

      await sendProgress(60, 'Uploading certificate file...');

      // 5. Upload PDF to Media Collection
      const uploadedMedia = await payload.create({
          collection: 'media',
          data: {
              alt: `Certificate for ${studentName} - ${certificateCode}`,
          },
          file: {
              data: pdfBuffer,
              mimetype: 'application/pdf',
              name: `${certificateCode}.pdf`,
              size: pdfBuffer.length,
          },
          overrideAccess: true, 
      });

      await sendProgress(80, 'Creating certificate record...');

      // 6. Create Certificate Record
      const certificate = await payload.create({
          collection: 'certificates',
          data: {
              certificateCode,
              trainee: typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student,
              course: course.id,
              enrollment: enrollment.id,
              issueDate: new Date().toISOString(),
              file: uploadedMedia.id,
              metadata: {
                  studentName,
                  courseTitle: course.title,
                  completionDate,
                  instructorName
              },
              status: 'active'
          },
          overrideAccess: true,
      });

      await sendProgress(90, 'Finalizing enrollment...');

      // 7. Update Enrollment Status
      await payload.update({
          collection: 'course-enrollments',
          id: enrollment.id,
          data: {
              certificateIssued: true
          },
          overrideAccess: true,
      });

      await sendProgress(100, 'Certificate generated successfully', {
          success: true, 
          certificateId: certificate.id,
          certificateCode
      });

      await writer.close();

    } catch (error: any) {
      console.error('Error generating certificate:', error);
      await sendProgress(0, error.message || 'Internal server error', { error: true });
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/x-ndjson', // Newline Delimited JSON
      'Transfer-Encoding': 'chunked'
    }
  });
};
