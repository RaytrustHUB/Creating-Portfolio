import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import WeatherDashboard from "@/components/projects/WeatherDashboard";

export default function WeatherDashboardPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <WeatherDashboard />
        </main>
      </div>
    </PageTransition>
  );
}
