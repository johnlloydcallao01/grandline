import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PrivacyPageContent } from "@encreasl/ui/privacy-page-content";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <PrivacyPageContent />

      <Footer />
    </main>
  );
}
