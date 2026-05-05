import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
        theme === "dark" ? "bg-black/50 border border-white/20" : "bg-zinc-200 border border-zinc-300"
      }`}
    >
      <span className="sr-only">Toggle Theme</span>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute w-5 h-5 rounded-full grid place-items-center ${
          theme === "dark" ? "bg-white shadow-[0_0_8px_#39ff14] text-black" : "bg-white shadow-md text-amber-500"
        }`}
        style={{ left: theme === "dark" ? "2px" : "calc(100% - 22px)" }}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </motion.div>
    </button>
  );
}
