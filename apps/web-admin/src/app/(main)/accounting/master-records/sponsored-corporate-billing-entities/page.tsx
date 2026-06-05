import { getSponsorRegister, getCorporateAccountRegister, type SponsorRegisterResponse, type CorporateAccountRegisterResponse } from './actions';
import { SponsorsClient } from './SponsorsClient';

export default async function SponsoredCorporateBillingEntitiesPage() {
  let initialSponsorData: SponsorRegisterResponse | null = null;
  let initialCorporateAccountData: CorporateAccountRegisterResponse | null = null;

  try {
    [initialSponsorData, initialCorporateAccountData] = await Promise.all([
      getSponsorRegister({ page: 1 }),
      getCorporateAccountRegister({ page: 1 }),
    ]);
  } catch {
    // Server-side fetch may fail (no auth token in SSR); client will retry
  }

  return (
    <SponsorsClient
      initialSponsorData={initialSponsorData}
      initialCorporateAccountData={initialCorporateAccountData}
    />
  );
}
