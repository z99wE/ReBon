import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import RebonLayout from "./components/RebonLayout";

// Eagerly loaded — these are entry points and must be instant
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazily loaded — reduces initial bundle size; loaded only when the user navigates
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const LogActivity = lazy(() => import("./pages/LogActivity"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Community = lazy(() => import("./pages/Community"));
const Collective = lazy(() => import("./pages/Collective"));
const Mirror = lazy(() => import("./pages/Mirror"));
const Stories = lazy(() => import("./pages/Stories"));
const Assistant = lazy(() => import("./pages/Assistant"));
const AgentArena = lazy(() => import("./pages/AgentArena"));

/** Minimal loading fallback shown during lazy-page hydration */
function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#050505]"
      aria-busy="true"
      aria-label="Loading page…"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/dashboard">{() => <RebonLayout><Dashboard /></RebonLayout>}</Route>
        <Route path="/log">{() => <RebonLayout><LogActivity /></RebonLayout>}</Route>
        <Route path="/leaderboard">{() => <RebonLayout><Leaderboard /></RebonLayout>}</Route>
        <Route path="/community">{() => <RebonLayout><Community /></RebonLayout>}</Route>
        <Route path="/collective">{() => <RebonLayout><Collective /></RebonLayout>}</Route>
        <Route path="/mirror">{() => <RebonLayout><Mirror /></RebonLayout>}</Route>
        <Route path="/stories">{() => <RebonLayout><Stories /></RebonLayout>}</Route>
        <Route path="/assistant">{() => <RebonLayout><Assistant /></RebonLayout>}</Route>
        <Route path="/arena">{() => <RebonLayout><AgentArena /></RebonLayout>}</Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" toastOptions={{ style: { background: "oklch(0.14 0.010 240)", border: "1px solid oklch(0.22 0.012 240)", color: "oklch(0.92 0.015 75)" } }} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
