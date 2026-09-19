import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppLayout from "./layouts/AppLayout";
import { DevErrorBoundary } from "@/components/diagnostics/DevErrorBoundary";
import { RenderProfiler } from "@/components/diagnostics/RenderProfiler";

// New page structure
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Journey = lazy(() => import("./pages/Journey"));
const Quests = lazy(() => import("./pages/Quests"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const QuestHistory = lazy(() => import("./pages/QuestHistory"));

// Auth pages — untouched
const Auth = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

// Root layout for every authenticated /… route. This is what fixes the
// "screen goes dark for a second when switching pages" bug — see the
// explanation in App's own comment below for the full root-cause story.
// Short version: AppLayout (and the SystemBar nav inside it) now mounts
// ONCE here and stays mounted across every in-app navigation, instead of
// being re-declared fresh inside every single <Route element={...}>
// (which is what forced React Router to fully unmount and remount the
// whole shell — nav bar included — on every click). Suspense now wraps
// only <Outlet /> (the page content), scoped to the content area, with
// a small spinner instead of a bare full-screen div — so a slow chunk
// load shows a spinner in the content area with the nav bar still
// visible and stable, not the entire screen going blank.
const ProtectedLayout = () => (
  <ProtectedRoute>
    <AppLayout>
      <Suspense fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Outlet />
      </Suspense>
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

                {/* Protected app routes — AppLayout is now a single
                    persistent layout route (element on the PARENT
                    Route, children rendered via Outlet) instead of
                    being repeated inside every child route's element.
                    That repetition was the actual bug: React Router
                    treats each Route's `element` as its own tree, so
                    navigating from one route to another was unmounting
                    and remounting AppLayout (SystemBar included) from
                    scratch every single time. */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<RenderProfiler id="Dashboard"><Dashboard /></RenderProfiler>} />
                  <Route path="/journey" element={<RenderProfiler id="Journey"><Journey /></RenderProfiler>} />
                  <Route path="/quests" element={<RenderProfiler id="Quests"><Quests /></RenderProfiler>} />
                  <Route path="/mentor" element={<RenderProfiler id="Mentor"><Mentor /></RenderProfiler>} />
                  <Route path="/profile" element={<RenderProfiler id="Profile"><Profile /></RenderProfiler>} />
                  <Route path="/profile/history" element={<RenderProfiler id="QuestHistory"><QuestHistory /></RenderProfiler>} />
                  {/* Founder Decision (Profile/Settings separation chunk):
                      a sub-route of /profile, exactly like /profile/history
                      above — reached via a link from the Profile page, not
                      a new persistent SystemBar item. SystemBar's nav rail
                      is a fixed 5-item layout; adding a 6th item there is a
                      navigation redesign, which this chunk doesn't
                      authorize. */}
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
