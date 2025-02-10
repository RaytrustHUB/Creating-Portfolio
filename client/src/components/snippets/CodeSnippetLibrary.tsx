import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Tag, X, Pencil, Trash2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SnippetDialog } from "./SnippetDialog";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  id: number;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CodeSnippetLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch snippets with search and tag filters
  const { data: snippets, isLoading } = useQuery<Snippet[]>({
    queryKey: ['snippets', searchQuery, selectedTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      const response = await fetch(`/api/snippets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch snippets');
      return response.json();
    }
  });

  // Fetch all available tags
  const { data: tags } = useQuery<{ id: number; name: string; count: number }[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });

  // Delete mutation
  const deleteSnippet = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete snippet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: "Success",
        description: "Snippet deleted successfully",
      });
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Code Snippet Library</h1>
        <Button onClick={() => {
          setSelectedSnippet(null);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Snippet
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.name ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
                <span className="ml-1 text-xs">({tag.count})</span>
                {selectedTag === tag.name && (
                  <X className="w-3 h-3 ml-1" onClick={() => setSelectedTag(null)} />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
              <CardContent className="h-40 bg-muted mt-4" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {snippets?.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{snippet.title}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSnippet(snippet);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this snippet?")) {
                          deleteSnippet.mutate(snippet.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                {snippet.description && (
                  <p className="text-sm text-muted-foreground">{snippet.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-auto rounded-md">
                  <SyntaxHighlighter
                    language={snippet.language.toLowerCase()}
                    style={oneDark}
                    customStyle={{ margin: 0 }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {snippet.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Updated {new Date(snippet.updatedAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <SnippetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
    </div>
  );
}