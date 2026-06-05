import { getBankAccountRegister, getCustomerRegister, getVendorRegister } from './actions';
import { BusinessPartiesClient } from './BusinessPartiesClient';

type BusinessPartiesPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
  }>;
};

function normalizeBusinessPartiesTab(value?: string | string[]) {
  const tabValue = Array.isArray(value) ? value[0] : value;
  return tabValue === 'vendors' || tabValue === 'bank-accounts' ? tabValue : 'customers';
}

export default async function BusinessPartiesPage({ searchParams }: BusinessPartiesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab = normalizeBusinessPartiesTab(resolvedSearchParams?.tab);
  const [initialCustomerData, initialVendorData, initialBankAccountData] = await Promise.all([
    getCustomerRegister().catch(() => null),
    getVendorRegister().catch(() => null),
    getBankAccountRegister().catch(() => null),
  ]);

  return (
    <BusinessPartiesClient
      initialCustomerData={initialCustomerData}
      initialVendorData={initialVendorData}
      initialBankAccountData={initialBankAccountData}
      initialTab={initialTab}
    />
  );
}
