const fetch = require('node-fetch');

async function testCreateChat() {
    const url = 'http://localhost:3001/api/chats';
    const API_KEY = '619c0072-f9d2-41a3-b91a-523901cb8342';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${API_KEY}`
    };

    const body = {
        type: 'instructor_trainee',
        title: 'Test Subject',
        status: 'active',
        participants: [2, 4], // user 2, instructor user 4
        metadata: {
            isAskInstructor: true,
            subject: 'Test Subject',
            status: 'pending'
        }
    };

    console.log('Creating chat...', body);
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
}

testCreateChat();