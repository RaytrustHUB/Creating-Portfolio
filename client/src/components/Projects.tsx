import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      title: "Weather Dashboard",
      description: "Real-time weather forecasting with interactive maps and detailed meteorological data visualization",
      image: "https://images.unsplash.com/photo-1592210454359-9043f067919b",
      github: "#",
      demo: "/projects/weather",
      tags: ["React", "OpenWeatherAPI", "Tailwind CSS", "TypeScript"],
    },
    {
      title: "Recipe Finder",
      description: "AI-powered recipe search engine with ingredient recognition and dietary preferences",
      image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f",
      github: "#",
      demo: "#",
      tags: ["Next.js", "API Integration", "PostgreSQL", "TailwindCSS"],
    },
    {
      title: "Markdown Notes",
      description: "Feature-rich markdown editor with real-time preview and cloud sync capabilities",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db",
      github: "#",
      demo: "#",
      tags: ["React", "Express", "MongoDB", "Socket.io"],
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full flex flex-col hover-card cursor-pointer">
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
                    <a href={project.demo} target="_blank" rel="noopener">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
