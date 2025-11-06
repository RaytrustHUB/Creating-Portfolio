import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
});

export default function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = "Failed to send message";
        let validationErrors: any = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // Check if there are validation details (from ZodError)
          if (errorData.details && Array.isArray(errorData.details)) {
            validationErrors = errorData.details;
          }
        } catch {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = new Error(`${errorMessage} (${response.status})`) as any;
        if (validationErrors) {
          error.validationErrors = validationErrors;
        }
        
        throw error;
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error: any) => {
      console.error("Contact form mutation error:", error);
      
      // Handle validation errors from API
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        const fieldErrors: Record<string, string> = {};
        error.validationErrors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            const fieldName = err.path[0] as string;
            fieldErrors[fieldName] = err.message || "Invalid value";
          }
        });
        
        // Set form errors
        Object.keys(fieldErrors).forEach((field) => {
          form.setError(field as any, {
            type: "server",
            message: fieldErrors[field],
          });
        });
        
        toast({
          title: "Validation Error",
          description: "Please check the form fields and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "contact@example.com",
      href: "mailto:contact@example.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "San Francisco, CA",
      href: null,
    },
  ];

  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have a question or want to work together? Drop me a message!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                <p className="text-muted-foreground">
                  Feel free to reach out through the form or use the contact details below.
                </p>
              </div>
              {contactInfo.map((item) => {
                const content = (
                  <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">{item.label}</h3>
                      <p className="text-base font-medium">{item.value}</p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block"
                    target={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "_blank"}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>
                    {content}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          disabled={mutation.isPending}
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormDescription>
                        Your full name (2-100 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your.email@example.com" 
                          {...field} 
                          disabled={mutation.isPending}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormDescription>
                        Your email address where I can reach you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell me about your project, question, or just say hello!"
                          className="min-h-[120px] resize-y"
                          {...field}
                          disabled={mutation.isPending}
                          maxLength={1000}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0} / 1000 characters (minimum 10)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutation.isError && !(mutation.error as any)?.validationErrors && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {mutation.error instanceof Error 
                        ? mutation.error.message 
                        : "Failed to send message. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                  size="lg"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
