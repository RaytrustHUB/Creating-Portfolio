import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load pages for code splitting - reduces initial bundle size
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const WeatherDashboard = lazy(() => import("./pages/WeatherDashboard"));
const SnippetsPage = lazy(() => import("./pages/SnippetsPage"));
const TaskManagerPage = lazy(() => import("./pages/TaskManagerPage"));
const PasswordGeneratorPage = lazy(() => import("./pages/PasswordGeneratorPage"));

// Loading component for lazy-loaded routes
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/projects" component={Projects} />
        <Route path="/contact" component={Contact} />
        <Route path="/projects/weather" component={WeatherDashboard} />
        <Route path="/projects/snippets" component={SnippetsPage} />
        <Route path="/projects/tasks" component={TaskManagerPage} />
        <Route path="/projects/password-generator" component={PasswordGeneratorPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;