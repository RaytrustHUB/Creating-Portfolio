import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Skill {
  name: string;
  level: number;
  color: string;
}

interface SkillProgressProps {
  skills: Skill[];
}

export default function SkillProgress({ skills }: SkillProgressProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div ref={containerRef} className="space-y-8">
      {skills.map((skill, index) => (
        <div key={skill.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-sm font-medium"
            >
              {skill.name}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-sm text-muted-foreground"
            >
              {skill.level}%
            </motion.span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={isInView ? { width: `${skill.level}%`, opacity: 1 } : {}}
              transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: skill.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
