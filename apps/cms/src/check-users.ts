import { getPayload } from 'payload';
import configPromise from '@payload-config';

async function check() {
  const payload = await getPayload({ config: configPromise });
  const users = await payload.find({
    collection: 'users',
    limit: 5,
    sort: '-createdAt'
  });
  console.log(JSON.stringify(users.docs.map(u => ({ id: u.id, email: u.email, gender: u.gender, civilStatus: u.civilStatus })), null, 2));
  process.exit(0);
}
check();