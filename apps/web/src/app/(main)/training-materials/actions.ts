'use server';

import { getServerUser, getServerToken } from '@/app/actions/auth';
import type { CourseEnrollment, Trainee, Media, Course } from '@/types/course';

export interface FrontendMaterial {
  id: string;
  title: string;
  category: string;
  type: string;
  size: string;
  date: string;
  image: string;
  href: string | null;
  hasMultipleFiles: boolean;
  allFiles?: { url: string; filename: string }[];
  isRequired: boolean;
  courseName: string;
  lessonTitle?: string;
  isLessonMaterial: boolean;
  description?: string;
  materialId?: string; // The ID of the actual Material document
}

export async function getMaterialDetails(id: string, isLessonMaterial: boolean, clientToken?: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const apiKey = process.env.PAYLOAD_API_KEY || 'db6c3436-72f8-47d0-855a-30112b7e9214';

  const user = await getServerUser();
  const serverToken = await getServerToken();
  const token = serverToken || clientToken;

  if (!user || !user.id || (!token && !apiKey)) {
    return null;
  }

  const collection = isLessonMaterial ? 'lesson-materials' : 'course-materials';

  try {
    const res = await fetch(`${apiUrl}/${collection}/${id}?depth=2`, {
      headers: {
        Authorization: `users API-Key ${apiKey}`
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching material details for ${id}:`, error);
    return null;
  }
}

export async function getEnrolledMaterials(clientToken?: string): Promise<FrontendMaterial[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const apiKey = process.env.PAYLOAD_API_KEY || 'db6c3436-72f8-47d0-855a-30112b7e9214';

  const user = await getServerUser();

  // Try getting token from getServerToken() or fallback to passed token
  const serverToken = await getServerToken();
  const token = serverToken || clientToken;

  // If we don't have a token, we can't reliably get the user's ID to fetch enrollments
  if (!user || !user.id || (!token && !apiKey)) {
    console.error("[ACTION] Missing user or tokens");
    return [];
  }

  try {
    // 1. Get Trainee ID for the current user
    const traineeRes = await fetch(`${apiUrl}/trainees?where[user][equals]=${user.id}&limit=1`, {
      headers: {
        Authorization: `users API-Key ${apiKey}`
      },
      cache: 'no-store',
    });

    if (!traineeRes.ok) {
      console.error("[ACTION] Failed to fetch trainee profile", traineeRes.status);
      return [];
    }
    const traineeData = await traineeRes.json();
    const trainee: Trainee | undefined = traineeData.docs?.[0];

    if (!trainee) {
      console.error("[ACTION] No trainee profile found for user:", user.id);
      return [];
    }

    // 2. Get active enrollments
    const enrollmentsRes = await fetch(
      `${apiUrl}/course-enrollments?where[student][equals]=${trainee.id}&where[status][equals]=active&limit=100`,
      {
        headers: {
          Authorization: `users API-Key ${apiKey}`
        },
        cache: 'no-store',
      }
    );

    if (!enrollmentsRes.ok) {
      console.error("[ACTION] Failed to fetch enrollments", enrollmentsRes.status);
      return [];
    }
    const enrollmentsData = await enrollmentsRes.json();
    const enrollments: CourseEnrollment[] = enrollmentsData.docs || [];

    if (enrollments.length === 0) {
      console.log("[ACTION] No active enrollments found for trainee:", trainee.id);
      return [];
    }

    // Extract Course IDs
    const courseIds = enrollments.map(e => {
      if (typeof e.course === 'object' && e.course !== null) return (e.course as Course).id;
      return e.course;
    }).filter(Boolean);

    if (courseIds.length === 0) return [];

    // Build the query string for IN
    const courseQueryString = courseIds.map((id, index) => `where[or][${index}][course][equals]=${id}`).join('&');

    // 3. Fetch Course Materials for those courses
    const courseMatRes = await fetch(
      `${apiUrl}/course-materials?${courseQueryString}&depth=2&limit=100`,
      {
        headers: {
          Authorization: `users API-Key ${apiKey}`
        },
        cache: 'no-store',
      }
    );

    let courseMaterialsRaw: any[] = [];
    if (courseMatRes.ok) {
      const matData = await courseMatRes.json();
      courseMaterialsRaw = matData.docs || [];
    } else {
      console.error("[ACTION] Failed to fetch course materials", courseMatRes.status);
    }

    // 4. Fetch Lesson Materials
    // To get lesson materials efficiently without a massive join, we can query lesson-materials
    // where the lesson's module belongs to the enrolled courses. However, Payload REST API doesn't 
    // support deep relationship filtering (lesson.module.course = X) natively.
    // Instead, we will fetch the courses with depth: 3 to get their modules and lessons,
    // extract all lesson IDs, and then fetch lesson-materials for those lessons.

    const coursesRes = await fetch(
      `${apiUrl}/courses?${courseIds.map((id, index) => `where[or][${index}][id][equals]=${id}`).join('&')}&depth=3&limit=100`,
      {
        headers: {
          Authorization: `users API-Key ${apiKey}`
        },
        cache: 'no-store',
      }
    );

    let lessonMaterialsRaw: any[] = [];

    if (coursesRes.ok) {
      const coursesData = await coursesRes.json();
      const coursesWithModules = coursesData.docs || [];

      const lessonIds: string[] = [];
      const lessonMap = new Map<string, { courseName: string, lessonTitle: string }>();

      coursesWithModules.forEach((course: any) => {
        if (Array.isArray(course.modules)) {
          course.modules.forEach((module: any) => {
            if (Array.isArray(module.items)) {
              module.items.forEach((item: any) => {
                if (item.relationTo === 'course-lessons' && item.value && item.value.id) {
                  lessonIds.push(item.value.id);
                  lessonMap.set(item.value.id, {
                    courseName: course.title,
                    lessonTitle: item.value.title
                  });
                }
              });
            }
          });
        }
      });

      if (lessonIds.length > 0) {
        // Chunk lesson IDs to avoid URI too long errors
        const chunkSize = 20;
        for (let i = 0; i < lessonIds.length; i += chunkSize) {
          const chunk = lessonIds.slice(i, i + chunkSize);
          const lessonQueryString = chunk.map((id, index) => `where[or][${index}][lesson][equals]=${id}`).join('&');

          const lessonMatRes = await fetch(
            `${apiUrl}/lesson-materials?${lessonQueryString}&depth=2&limit=100`,
            {
              headers: {
                Authorization: `users API-Key ${apiKey}`
              },
              cache: 'no-store',
            }
          );

          if (lessonMatRes.ok) {
            const lessonMatData = await lessonMatRes.json();
            const docs = lessonMatData.docs || [];
            // Attach courseName and lessonTitle for frontend mapping
            docs.forEach((doc: any) => {
              const lessonId = typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson;
              const meta = lessonMap.get(lessonId);
              if (meta) {
                doc._injectedCourseName = meta.courseName;
                doc._injectedLessonTitle = meta.lessonTitle;
              }
            });
            lessonMaterialsRaw = [...lessonMaterialsRaw, ...docs];
          }
        }
      }
    } else {
      console.error("[ACTION] Failed to fetch courses to resolve lessons", coursesRes.status);
    }

    // 5. Helper function to map CMS material to frontend UI structure
    const mapMaterial = (cm: any, isLessonMaterial: boolean): FrontendMaterial | null => {
      const material = cm.material;
      if (!material) return null;

      let courseName = 'Course Material';
      let category = 'General';

      if (isLessonMaterial) {
        courseName = cm._injectedCourseName || 'Lesson Material';
      } else {
        courseName = typeof cm.course === 'object' && cm.course?.title ? cm.course.title : 'Course Material';
        category = Array.isArray(cm.course?.category) && cm.course.category.length > 0
          ? cm.course.category[0].name
          : 'General';
      }

      const hasMultipleFiles = Array.isArray(material.media) && material.media.length > 1;
      let primaryMedia: Media | null = null;
      if (Array.isArray(material.media) && material.media.length > 0) {
        primaryMedia = material.media[0];
      } else if (material.media && typeof material.media === 'object') {
        primaryMedia = material.media as Media;
      }

      // Determine Type
      let type = 'Link';
      if (material.materialSource === 'media' && primaryMedia?.mimeType) {
        if (primaryMedia.mimeType.includes('pdf')) type = 'PDF';
        else if (primaryMedia.mimeType.includes('video')) type = 'Video';
        else if (primaryMedia.mimeType.includes('audio')) type = 'Audio';
        else if (primaryMedia.mimeType.includes('image')) type = 'Image';
        else if (primaryMedia.mimeType.includes('word') || primaryMedia.mimeType.includes('document')) type = 'Document';
        else if (primaryMedia.mimeType.includes('presentation') || primaryMedia.mimeType.includes('powerpoint')) type = 'Presentation';
        else type = 'File';
      }

      // Determine Size
      let sizeStr = 'N/A';
      if (primaryMedia?.filesize) {
        const kb = primaryMedia.filesize / 1024;
        if (kb > 1024) {
          sizeStr = `${(kb / 1024).toFixed(1)} MB`;
        } else {
          sizeStr = `${Math.round(kb)} KB`;
        }
      }

      // Determine Link
      let href: string | null = null;
      let allFiles: { url: string; filename: string }[] = [];

      if (!hasMultipleFiles) {
        if (material.materialSource === 'external' && material.externalUrl) {
          href = material.externalUrl;
        } else if (material.materialSource === 'media' && primaryMedia) {
          href = primaryMedia.cloudinaryURL || primaryMedia.url || null;
        }
      } else {
        if (material.materialSource === 'media' && Array.isArray(material.media)) {
          allFiles = material.media
            .filter((m: any) => m?.cloudinaryURL || m?.url)
            .map((m: any) => ({
              url: m.cloudinaryURL || m.url,
              filename: m.filename || 'download'
            }));
        }
      }

      // Determine Color (Randomish based on type)
      let bgImage = 'bg-gray-100';
      switch (type) {
        case 'PDF': bgImage = 'bg-red-100'; break;
        case 'Video': bgImage = 'bg-blue-100'; break;
        case 'Document': bgImage = 'bg-indigo-100'; break;
        case 'Presentation': bgImage = 'bg-orange-100'; break;
        case 'Image': bgImage = 'bg-green-100'; break;
        case 'Audio': bgImage = 'bg-purple-100'; break;
        default: bgImage = 'bg-gray-100'; break;
      }

      return {
        id: cm.id,
        title: material.title,
        category: category,
        type: type,
        size: sizeStr,
        date: new Date(material.createdAt || cm.createdAt).toISOString().split('T')[0],
        image: bgImage,
        href: href,
        hasMultipleFiles,
        allFiles,
        isRequired: cm.isRequired || false,
        courseName,
        lessonTitle: isLessonMaterial ? cm._injectedLessonTitle : undefined,
        isLessonMaterial,
        description: material.description,
        materialId: material.id,
      };
    };

    const mappedCourseMaterials = courseMaterialsRaw.map(m => mapMaterial(m, false)).filter(Boolean) as FrontendMaterial[];
    const mappedLessonMaterials = lessonMaterialsRaw.map(m => mapMaterial(m, true)).filter(Boolean) as FrontendMaterial[];

    const allMaterials = [...mappedCourseMaterials, ...mappedLessonMaterials];

    // Remove duplicates based on material ID if attached to multiple courses
    const uniqueMaterials = Array.from(new Map(allMaterials.map(m => [m.id, m])).values());

    return uniqueMaterials;

  } catch (error) {
    console.error('Error fetching training materials:', error);
    return [];
  }
}