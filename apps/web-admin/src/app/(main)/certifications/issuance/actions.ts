'use server';

export async function getEligibleEnrollments() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.PAYLOAD_API_KEY;

    if (!apiUrl || !apiKey) {
        throw new Error('Missing API configuration');
    }

    // Fetch passed enrollments
    const res = await fetch(`${apiUrl}/course-enrollments?where[finalEvaluation][equals]=passed&depth=3&limit=100`, {
        headers: {
            'Authorization': `users API-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        console.error('Failed to fetch enrollments:', await res.text());
        throw new Error(`Failed to fetch enrollments: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Filter out enrollments that already have a certificate issued
    const eligibleEnrollments = data.docs ? data.docs.filter((doc: any) => doc.certificateIssued !== true) : [];
    
    return eligibleEnrollments;
}

export async function issueCertificate(enrollmentId: number) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.PAYLOAD_API_KEY;

    if (!apiUrl || !apiKey) {
        throw new Error('Missing API configuration');
    }

    // Call the dedicated CMS endpoint to handle the entire PDF generation and DB transaction
    const res = await fetch(`${apiUrl}/generate-certificate`, {
        method: 'POST',
        headers: {
            'Authorization': `users API-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate certificate: ${res.statusText}`);
    }

    return await res.json();
}
