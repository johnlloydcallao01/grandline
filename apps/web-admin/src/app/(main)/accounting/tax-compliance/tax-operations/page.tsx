import { getTaxCodesRegister } from './actions';
import TaxOperationsClient from './TaxOperationsClient';

export default async function TaxOperationsPage() {
  const initialData = await getTaxCodesRegister().catch(() => null);
  return <TaxOperationsClient initialData={initialData} />;
}
