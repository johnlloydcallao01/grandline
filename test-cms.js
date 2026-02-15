
const apiKey = 'db6c3436-72f8-47d0-855a-30112b7e9214';
const url = 'http://localhost:3001/api/course-categories/active';

console.log(`Fetching ${url}...`);
const start = Date.now();

fetch(url, {
  headers: {
    'PAYLOAD_API_KEY': apiKey
  }
})
.then(res => {
  console.log('Status:', res.status);
  return res.text().then(text => ({ status: res.status, text }));
})
.then(({ status, text }) => {
  const time = Date.now() - start;
  console.log(`Time: ${time}ms`);
  if (status !== 200) {
    console.error('Error:', text);
  } else {
    console.log('Success. Response length:', text.length);
  }
})
.catch(err => {
  console.error('Fetch error:', err);
});
