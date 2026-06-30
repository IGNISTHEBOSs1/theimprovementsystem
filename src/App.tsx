import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppLayout from "./layouts/AppLayout";

// New page structure
import Dashboard from "./pages/Dashboard";
import Journey from "./pages/Journey";
import Quests from "./pages/Quests";
import Mentor from "./pages/Mentor";
import Profile from "./pages/Profile";

// Auth pages — untouched
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="Monarch" defaultMode="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth — no layout */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected app routes — all wrapped in AppLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/journey" element={
              <ProtectedRoute>
                <AppLayout><Journey /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/quests" element={
              <ProtectedRoute>
                <AppLayout><Quests /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/mentor" element={
              <ProtectedRoute>
                <AppLayout><Mentor /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
