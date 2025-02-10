import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, X } from "lucide-react";
import { useState, useMemo } from "react";

export default function Projects() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const projects = [
    {
      title: "Weather Dashboard",
      description: "Real-time weather forecasting with interactive maps and detailed meteorological data visualization",
      image: "https://images.unsplash.com/photo-1592210454359-9043f067919b",
      github: "#",
      demo: "/projects/weather",
      tags: ["React", "OpenWeatherAPI", "TanStack Query", "TypeScript"],
    },
    {
      title: "Task Manager",
      description: "A powerful task management application with real-time updates and collaborative features",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
      github: "#",
      demo: "/projects/tasks",
      tags: ["React", "PostgreSQL", "WebSocket", "Drizzle ORM"],
    },
    {
      title: "Code Snippet Library",
      description: "A searchable collection of code snippets with syntax highlighting and sharing capabilities",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      github: "#",
      demo: "/projects/snippets",
      tags: ["React", "PostgreSQL", "Syntax Highlighting", "Search"],
    },
  ];

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
          <p className="text-muted-foreground">
            Here are some of my recent projects that showcase my skills and
            expertise.
          </p>
        </motion.div>

        {/* Filter Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {Array.from(new Set(projects.flatMap(p => p.tags))).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              {selectedTags.includes(tag) && (
                <X className="h-3 w-3 mr-1" />
              )}
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects
              .filter(project => 
                selectedTags.length === 0 || 
                selectedTags.every(tag => project.tags.includes(tag))
              )
              .map((project, index) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/50 rounded-lg"
                >
                  <Card className="h-full flex flex-col hover-card">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                    <CardContent className="flex-grow pt-6">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-sm bg-primary/10 text-primary rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.github} target="_blank" rel="noopener">
                          <Github className="h-4 w-4 mr-2" />
                          Code
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={project.demo}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}