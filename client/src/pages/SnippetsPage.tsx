import Navigation from "@/components/Navigation";
import CodeSnippetLibrary from "@/components/snippets/CodeSnippetLibrary";
import PageTransition from "@/components/PageTransition";

export default function SnippetsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
           <CodeSnippetLibrary />
        </main>
      </div>
    </PageTransition>
  );
}