import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppLayout from "./layouts/AppLayout";

// New page structure
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Journey = lazy(() => import("./pages/Journey"));
const Quests = lazy(() => import("./pages/Quests"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Profile = lazy(() => import("./pages/Profile"));

// Auth pages — untouched
const Auth = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
