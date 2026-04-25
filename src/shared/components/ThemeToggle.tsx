import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="
        p-2 rounded-full transition-all duration-300
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-yellow-400
      "
    >
      {isDark ? (
        <Sun size={20} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
};

export default ThemeToggle;