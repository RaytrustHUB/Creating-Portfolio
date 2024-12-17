import Navigation from "@/components/Navigation";
import Projects from "@/components/Projects";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Projects />
      </main>
    </div>
  );
}
