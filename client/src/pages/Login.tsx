import React from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { IconZap } from "@/components/Icons";
import { auth as clientAuth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [checkingRedirect, setCheckingRedirect] = React.useState(true);
  const [loginStatus, setLoginStatus] = React.useState<string | null>(null);

  const verifyFirebaseTokenMutation = trpc.auth.verifyFirebaseToken.useMutation({
    onSuccess: () => {
      toast.success("Welcome to ReBon!");
      window.location.href = "/dashboard";
    },
    onError: (e) => {
      toast.error(e.message);
      setLoginStatus(null);
      setCheckingRedirect(false);
    },
  });

  const devLoginMutation = trpc.auth.devLogin.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the Demo Arena!");
      window.location.href = "/dashboard";
    },
    onError: (e) => toast.error(e.message),
  });
  const showDevLogin = import.meta.env.DEV || import.meta.env.MODE === "test" || import.meta.env.VITE_ALLOW_DEMO_AUTH === "true";

  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
      return;
    }

    getRedirectResult(clientAuth)
      .then((result) => {
        if (result) {
          setLoginStatus("Finishing Google sign-in...");
          result.user.getIdToken().then((idToken) => {
            verifyFirebaseTokenMutation.mutate({ idToken, name: result.user.displayName || undefined });
          }).catch((tokenErr) => {
            console.error("Failed to get ID token from redirect result:", tokenErr);
            setLoginStatus(null);
            setCheckingRedirect(false);
          });
        } else {
          setLoginStatus(null);
          setCheckingRedirect(false);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        setLoginStatus(null);
        setCheckingRedirect(false);
      });
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    try {
      setCheckingRedirect(true);
      setLoginStatus("Opening Google sign-in...");
      const result = await signInWithPopup(clientAuth, googleProvider);
      setLoginStatus("Finishing login...");
      const idToken = await result.user.getIdToken();
      verifyFirebaseTokenMutation.mutate({ idToken, name: result.user.displayName || undefined });
    } catch (e: unknown) {
      console.warn("Popup sign-in failed/closed, falling back to redirect...", e);
      try {
        setLoginStatus("Redirecting to Google...");
        await signInWithRedirect(clientAuth, googleProvider);
      } catch (redirectErr: unknown) {
        toast.error(redirectErr instanceof Error ? redirectErr.message : "Google Sign-In failed");
        setLoginStatus(null);
        setCheckingRedirect(false);
      }
    }
  };

  const showLoading = authLoading || checkingRedirect || verifyFirebaseTokenMutation.isPending;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Premium organic/carbon gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[oklch(0.47_0.09_160)]/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-violet/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-md relative z-10 py-12">
        {/* Wordmark only — no icon squatting */}
        <div className="text-center mb-8 animate-fade-up">
          <p className="font-black text-white tracking-[0.25em] text-sm uppercase mb-1">REBON</p>
        </div>

        {/* Card */}
        <div className="w-full animate-fade-up">
          <div className="glass-card border border-white/8 rounded-md p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-lg font-bold text-white uppercase tracking-tight mb-1">Sign in to ReBon</h1>
                <p className="text-xs text-bottle">Choose your access method to enter the Arena.</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={showLoading}
                  className="btn-primary w-full justify-center gap-2 py-3.5"
                >
                  {showLoading && !isAuthenticated ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                      Signing in...
                    </>
                  ) : (
                    "Continue with Google"
                  )}
                </button>

                {showLoading && !isAuthenticated && loginStatus && (
                  <p className="text-xs text-white/45 text-center font-mono tracking-wide">
                    {loginStatus}
                  </p>
                )}

                {showDevLogin && (
                  <button
                    type="button"
                    onClick={() => devLoginMutation.mutate()}
                    disabled={showLoading || devLoginMutation.isPending}
                    className="btn-primary w-full justify-center gap-2 py-3.5 border border-accent-bottlegreen/30 bg-accent-bottlegreen/10 text-white hover:bg-accent-bottlegreen/20"
                  >
                    Enter Instantly as Guest
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trust indicators — text only */}
          <div className="mt-8 flex items-center justify-center gap-6 text-center">
            <span className="text-[9px] font-bold tracking-[0.2em] text-bottle uppercase">Secure Auth</span>
            <span className="text-white/10">·</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-bottle uppercase">Instant ID</span>
            <span className="text-white/10">·</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-bottle uppercase">Synced Access</span>
          </div>
        </div>
      </div>

      {/* Rolling FOMO ticker at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 py-3 bg-white/[0.01] border-t border-white/[0.04] overflow-hidden whitespace-nowrap pointer-events-none select-none">
        <div className="animate-marquee whitespace-nowrap inline-block text-[9px] tracking-[0.2em] text-bottle/60 uppercase font-mono">
          42 new agents joined the Arena in the last hour &nbsp;&nbsp;•&nbsp;&nbsp;
          Collective 'GreenTech' reduced 1.2 tons of CO₂ today &nbsp;&nbsp;•&nbsp;&nbsp;
          Agent EcoBuddy negotiated 240kg offset &nbsp;&nbsp;•&nbsp;&nbsp;
          Leaderboard season reset in 3 days &nbsp;&nbsp;•&nbsp;&nbsp;
          14,820 kg total carbon saved by the network &nbsp;&nbsp;•&nbsp;&nbsp;
          42 new agents joined the Arena in the last hour &nbsp;&nbsp;•&nbsp;&nbsp;
          Collective 'GreenTech' reduced 1.2 tons of CO₂ today &nbsp;&nbsp;•&nbsp;&nbsp;
          Agent EcoBuddy negotiated 240kg offset &nbsp;&nbsp;•&nbsp;&nbsp;
          Leaderboard season reset in 3 days &nbsp;&nbsp;•&nbsp;&nbsp;
          14,820 kg total carbon saved by the network &nbsp;&nbsp;•&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}
