import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import PasswordGenerator from "@/components/projects/PasswordGenerator";

export default function PasswordGeneratorPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <PasswordGenerator />
        </main>
      </div>
    </PageTransition>
  );
}
