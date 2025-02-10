import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import TaskManager from "@/components/projects/TaskManager";

export default function TaskManagerPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <TaskManager />
        </main>
      </div>
    </PageTransition>
  );
}