import { SidebarTrigger } from "@/components/ui/sidebar";
import { HouseholdSwitcher } from "@/components/HouseholdSwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "See you later! ✨",
        description: "You've been logged out successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.message
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ChoreVibe
          </span>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <HouseholdSwitcher />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}