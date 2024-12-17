import { Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="w-10 h-10 relative hover:bg-transparent"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="sun"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all" />
              </motion.div>
            ) : theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Moon className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all" />
              </motion.div>
            ) : (
              <motion.div
                key="system"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                <Monitor className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className="cursor-pointer group flex items-center gap-2 px-3 py-2"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="h-4 w-4 transition-transform group-hover:scale-110" />
            </motion.div>
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className="cursor-pointer group flex items-center gap-2 px-3 py-2"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Moon className="h-4 w-4 transition-transform group-hover:scale-110" />
            </motion.div>
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className="cursor-pointer group flex items-center gap-2 px-3 py-2"
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Monitor className="h-4 w-4 transition-transform group-hover:scale-110" />
            </motion.div>
            <span>System</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
