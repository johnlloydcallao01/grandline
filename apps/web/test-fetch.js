const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';
const PAYLOAD_API_KEY = '619c0072-f9d2-41a3-b91a-523901cb8342';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `users API-Key ${PAYLOAD_API_KEY}`
};

async function testFetch() {
    try {
        console.log("1. Fetching trainees...");
        const traineeRes = await fetch(`${API_BASE_URL}/trainees`, { headers });
        if (!traineeRes.ok) throw new Error(`Failed to fetch trainees: ${traineeRes.status}`);
        const traineeData = await traineeRes.json();

        if (traineeData.docs.length === 0) {
            console.log("No trainees found in the database.");
            return;
        }

        console.log(`Found ${traineeData.docs.length} trainees.`);

        // Use the first trainee or a specific one
        const trainee = traineeData.docs[0];
        console.log(`Using Trainee ID: ${trainee.id}, User ID: ${typeof trainee.user === 'object' ? trainee.user.id : trainee.user}`);

        console.log("\n2. Fetching enrollments for this trainee...");
        const enrollmentsRes = await fetch(`${API_BASE_URL}/course-enrollments?where[student][equals]=${trainee.id}&limit=100&depth=4`, { headers });
        if (!enrollmentsRes.ok) throw new Error(`Failed to fetch enrollments: ${enrollmentsRes.status}`);
        const enrollmentsData = await enrollmentsRes.json();

        console.log(`Found ${enrollmentsData.docs.length} enrollments.`);

        if (enrollmentsData.docs.length > 0) {
            enrollmentsData.docs.forEach((enrollment, i) => {
                console.log(`\nEnrollment ${i + 1}:`);
                console.log(`Course Title: ${enrollment.course?.title || 'Unknown'}`);

                const course = enrollment.course;
                if (course) {
                    if (course.instructor) {
                        const inst = course.instructor;
                        console.log(`- Instructor ID: ${inst.id}`);
                        console.log(`- Instructor User ID: ${inst.user?.id || inst.user}`);
                        console.log(`- Instructor Name: ${inst.user?.firstName} ${inst.user?.lastName}`);
                    } else {
                        console.log("- No main instructor assigned.");
                    }
                }
            });
        }
    } catch (err) {
        console.error("Error during test:", err.message);
    }
}

testFetch();