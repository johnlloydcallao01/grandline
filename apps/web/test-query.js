const apiUrl = 'http://localhost:3001/api';
const apiKey = 'db6c3436-72f8-47d0-855a-30112b7e9214';

async function test() {
  // Test 1: Get trainee ID for user 75
  const traineeRes = await fetch(`${apiUrl}/trainees?where[user][equals]=75`, {
    headers: { Authorization: `users API-Key ${apiKey}` }
  });
  const traineeData = await traineeRes.json();
  console.log("Trainee Data for User 75:", JSON.stringify(traineeData.docs, null, 2));

  if (traineeData.docs && traineeData.docs.length > 0) {
    const traineeId = traineeData.docs[0].id;
    console.log(`\nFetching certificates for trainee ID: ${traineeId}`);
    
    // Test 2: Get certificates for this trainee
    const certsRes = await fetch(`${apiUrl}/certificates?where[trainee][equals]=${traineeId}&depth=2`, {
      headers: { Authorization: `users API-Key ${apiKey}` }
    });
    const certsData = await certsRes.json();
    console.log(`Certificates found: ${certsData.docs?.length}`);
    if (certsData.docs?.length > 0) {
      console.log("First certificate:", certsData.docs[0].id, certsData.docs[0].certificateCode);
    }
  }
}
test();