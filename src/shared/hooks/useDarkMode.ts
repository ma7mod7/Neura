import { useTheme } from "../context/ThemeContext";
export const useDarkMode = () => {
  return useTheme();
};