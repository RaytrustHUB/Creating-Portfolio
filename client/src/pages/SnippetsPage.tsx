import CodeSnippetLibrary from "@/components/snippets/CodeSnippetLibrary";
import PageTransition from "@/components/PageTransition";

export default function SnippetsPage() {
  return (
    <PageTransition>
      <CodeSnippetLibrary />
    </PageTransition>
  );
}