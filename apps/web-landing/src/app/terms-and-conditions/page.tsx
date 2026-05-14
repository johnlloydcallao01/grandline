import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TermsPageContent } from "@encreasl/ui/terms-page-content";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <TermsPageContent />

      <Footer />
    </main>
  );
}
