import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CookieConsent } from "./components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chores from "./pages/Chores";
import MyChores from "./pages/MyChores";
import Evaluations from "./pages/Evaluations";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Presentation from "./pages/Presentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/chores" element={
                <ProtectedRoute>
                  <Chores />
                </ProtectedRoute>
              } />
              <Route path="/my-chores" element={
                <ProtectedRoute>
                  <MyChores />
                </ProtectedRoute>
              } />
              <Route path="/evaluations" element={
                <ProtectedRoute>
                  <Evaluations />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/presentation" element={<Presentation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
            <Toaster />
            <Sonner />
          </SidebarProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;