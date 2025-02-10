import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const snippetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  tags: z.array(z.string()).optional(),
});

type SnippetFormValues = z.infer<typeof snippetFormSchema>;

interface SnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippet?: {
    id: number;
    title: string;
    description: string | null;
    code: string;
    language: string;
    tags: string[];
  };
}

export function SnippetDialog({ open, onOpenChange, snippet }: SnippetDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetFormSchema),
    defaultValues: snippet || {
      title: "",
      description: "",
      code: "",
      language: "javascript",
      tags: [],
    },
  });

  const createSnippet = useMutation({
    mutationFn: async (values: SnippetFormValues) => {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to create snippet");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      onOpenChange(false);
      form.reset();
    },
  });

  const updateSnippet = useMutation({
    mutationFn: async (values: SnippetFormValues) => {
      const response = await fetch(`/api/snippets/${snippet?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to update snippet");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      onOpenChange(false);
    },
  });

  function onSubmit(values: SnippetFormValues) {
    if (snippet) {
      updateSnippet.mutate(values);
    } else {
      createSnippet.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{snippet ? "Edit Snippet" : "Create New Snippet"}</DialogTitle>
          <DialogDescription>
            {snippet
              ? "Update your code snippet with a title, description, and code."
              : "Add a new code snippet to your library."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter snippet title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter snippet description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., javascript, python, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <CodeEditor
                      value={field.value}
                      language={form.watch("language")}
                      onChange={(evn) => field.onChange(evn.target.value)}
                      padding={15}
                      style={{
                        fontSize: 12,
                        backgroundColor: "#1e1e1e",
                        fontFamily:
                          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {snippet ? "Update Snippet" : "Create Snippet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
