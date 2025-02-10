import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";

export default function TaskManagerPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Task Manager</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
