import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import RebonLayout from "./components/RebonLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import LogActivity from "./pages/LogActivity";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import Collective from "./pages/Collective";
import Mirror from "./pages/Mirror";
import Stories from "./pages/Stories";
import Assistant from "./pages/Assistant";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard">{() => <RebonLayout><Dashboard /></RebonLayout>}</Route>
      <Route path="/log">{() => <RebonLayout><LogActivity /></RebonLayout>}</Route>
      <Route path="/leaderboard">{() => <RebonLayout><Leaderboard /></RebonLayout>}</Route>
      <Route path="/community">{() => <RebonLayout><Community /></RebonLayout>}</Route>
      <Route path="/collective">{() => <RebonLayout><Collective /></RebonLayout>}</Route>
      <Route path="/mirror">{() => <RebonLayout><Mirror /></RebonLayout>}</Route>
      <Route path="/stories">{() => <RebonLayout><Stories /></RebonLayout>}</Route>
      <Route path="/assistant">{() => <RebonLayout><Assistant /></RebonLayout>}</Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
