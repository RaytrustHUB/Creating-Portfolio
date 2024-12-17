import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import PageTransition from "@/components/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Hero />
        </main>
      </div>
    </PageTransition>
  );
}
