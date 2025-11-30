import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const ThemeToggle = () => {
  const { theme, updateTheme } = useAuth();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}
      className="border-border bg-card hover:bg-secondary"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};