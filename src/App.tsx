import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppLayout from "./layouts/AppLayout";
import { DevErrorBoundary } from "@/components/diagnostics/DevErrorBoundary";
import { RouteErrorBoundary } from "@/components/diagnostics/RouteErrorBoundary";
import { RenderProfiler } from "@/components/diagnostics/RenderProfiler";
import { lazyWithRetry } from "./lib/lazyWithRetry";

// Protected app pages — wrapped with retry and chunk recovery
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Journey = lazyWithRetry(() => import("./pages/Journey"));
const Quests = lazyWithRetry(() => import("./pages/Quests"));
const Mentor = lazyWithRetry(() => import("./pages/Mentor"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const QuestHistory = lazyWithRetry(() => import("./pages/QuestHistory"));

// Auth and standalone pages — wrapped with retry and chunk recovery
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Landing = lazyWithRetry(() => import("./pages/Landing"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// A small, centered spinner — reuses the exact same visual language as
// ProtectedRoute's own auth-loading state below, rather than inventing a
// second loading style. Used for standalone routes (Auth/NotFound) that
// have no persistent shell to keep visible around them.
function CenteredSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!user) {
    return (
      <Suspense fallback={<CenteredSpinner />}>
        <Landing />
      </Suspense>
    );
  }

  return <>{children}</>;
};

// Root layout for every authenticated /… route. AppLayout (and the SystemBar nav inside it)
// mounts ONCE here and stays mounted across every in-app navigation.
// Suspense wraps only <Outlet /> (the page content), scoped to the content area.
// RouteErrorBoundary isolates page-level render crashes so that navigation remains fully functional.
const ProtectedLayout = () => (
  <ProtectedRoute>
    <AppLayout>
      <RouteErrorBoundary>
        <Suspense fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <DevErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="Monarch" defaultMode="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth/landing/404 — no persistent shell, each gets
                    its own small Suspense boundary rather than sharing
                    one root-level boundary with the protected routes. */}
                <Route path="/auth" element={
                  <Suspense fallback={<CenteredSpinner />}>
                    <RenderProfiler id="Auth"><Auth /></RenderProfiler>
                  </Suspense>
                } />

                {/* Protected app routes — AppLayout is a persistent layout route.
                    Children render inside ProtectedLayout via Outlet with RouteErrorBoundary protection. */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<RenderProfiler id="Dashboard"><Dashboard /></RenderProfiler>} />
                  <Route path="/journey" element={<RenderProfiler id="Journey"><Journey /></RenderProfiler>} />
                  <Route path="/quests" element={<RenderProfiler id="Quests"><Quests /></RenderProfiler>} />
                  <Route path="/mentor" element={<RenderProfiler id="Mentor"><Mentor /></RenderProfiler>} />
                  <Route path="/profile" element={<RenderProfiler id="Profile"><Profile /></RenderProfiler>} />
                  <Route path="/profile/history" element={<RenderProfiler id="QuestHistory"><QuestHistory /></RenderProfiler>} />
                  <Route path="/profile/settings" element={<RenderProfiler id="Settings"><Settings /></RenderProfiler>} />
                </Route>

                <Route path="*" element={
                  <Suspense fallback={<CenteredSpinner />}>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </DevErrorBoundary>
);

export default App;
