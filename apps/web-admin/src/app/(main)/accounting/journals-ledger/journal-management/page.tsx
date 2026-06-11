import { getJournalEntriesRegister } from './actions';
import JournalManagementClient from './JournalManagementClient';

export default async function JournalManagementPage() {
  const initialData = await getJournalEntriesRegister().catch(() => null);
  return <JournalManagementClient initialData={initialData} />;
}
