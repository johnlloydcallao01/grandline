import { getGeneralLedgerRegister } from './actions';
import LedgerReportingClient from './LedgerReportingClient';

export default async function LedgerReportingPage() {
  const initialData = await getGeneralLedgerRegister().catch(() => null);
  return <LedgerReportingClient initialData={initialData} />;
}
