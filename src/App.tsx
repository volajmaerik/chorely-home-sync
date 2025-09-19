import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chores from "./pages/Chores";
import MyChores from "./pages/MyChores";
import Evaluations from "./pages/Evaluations";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/chores" element={<Chores />} />
                <Route path="/my-chores" element={<MyChores />} />
                <Route path="/evaluations" element={<Evaluations />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;