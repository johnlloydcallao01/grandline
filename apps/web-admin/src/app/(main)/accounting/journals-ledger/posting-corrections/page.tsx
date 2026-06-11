import { getOpeningBalRegister } from './actions';
import PostingCorrectionsClient from './PostingCorrectionsClient';

export default async function PostingCorrectionsPage() {
  const initialData = await getOpeningBalRegister().catch(() => null);
  return <PostingCorrectionsClient initialData={initialData} />;
}
