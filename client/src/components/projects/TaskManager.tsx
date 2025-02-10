import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
});

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TaskManager() {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
    },
  });

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });

  const createTask = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (values: TaskFormValues & { id: number }) => {
      const response = await fetch(`/api/tasks/${values.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setSelectedTask(null);
      form.reset();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
  });

  function onSubmit(values: TaskFormValues) {
    if (selectedTask) {
      updateTask.mutate({ ...values, id: selectedTask.id });
    } else {
      createTask.mutate(values);
    }
  }

  function getPriorityBadge(priority: Task["priority"]) {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    } as const;

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  }

  function getStatusIcon(status: Task["status"]) {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks?.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {task.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedTask(task);
                    form.reset({
                      title: task.title,
                      description: task.description || "",
                      status: task.status,
                      priority: task.priority,
                      dueDate: task.dueDate || "",
                    });
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task?")) {
                      deleteTask.mutate(task.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {getStatusIcon(task.status)}
                <span>{task.status.replace("_", " ")}</span>
                {getPriorityBadge(task.priority)}
              </div>
              {task.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
              {task.dueDate && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Due {format(new Date(task.dueDate), "PP")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
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
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setSelectedTask(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTask ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
