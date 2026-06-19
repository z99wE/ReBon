import React from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { IconZap } from "@/components/Icons";
import { auth as clientAuth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

export default function Login() {
  const verifyFirebaseTokenMutation = trpc.auth.verifyFirebaseToken.useMutation({
    onSuccess: () => {
      toast.success("Welcome to ReBon!");
      window.location.href = "/dashboard";
    },
    onError: (e) => toast.error(e.message),
  });

  const devLoginMutation = trpc.auth.devLogin.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the Demo Arena!");
      window.location.href = "/dashboard";
    },
    onError: (e) => toast.error(e.message),
  });

  React.useEffect(() => {
    getRedirectResult(clientAuth)
      .then((result) => {
        if (result) {
          result.user.getIdToken().then((idToken) => {
            verifyFirebaseTokenMutation.mutate({ idToken, name: result.user.displayName || undefined });
          }).catch((tokenErr) => {
            console.error("Failed to get ID token from redirect result:", tokenErr);
          });
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(clientAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      verifyFirebaseTokenMutation.mutate({ idToken, name: result.user.displayName || undefined });
    } catch (e: any) {
      console.warn("Popup sign-in failed/closed, falling back to redirect...", e);
      try {
        await signInWithRedirect(clientAuth, googleProvider);
      } catch (redirectErr: any) {
        toast.error(redirectErr.message || "Google Sign-In failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden pb-16">
      {/* Premium organic/carbon gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[oklch(0.47_0.09_160)]/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-violet/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Wordmark only — no icon squatting */}
      <div className="relative z-10 mb-8 text-center animate-fade-up">
        <p className="font-black text-white tracking-[0.25em] text-sm uppercase mb-1">REBON</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
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
                disabled={verifyFirebaseTokenMutation.isPending}
                className="btn-primary w-full justify-center gap-2 py-3.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.9,0.6 -2.07,0.98 -3.3,0.98 -2.34,0 -4.33,-1.58 -5.03,-3.7H3.03v2.7C4.52,18.73 8.04,20.6 12,20.6z" />
                  <path d="M6.97,13.08a5.1,5.1 0 0 1 0,-3.2v-2.7H3.03a8.6,8.6 0 0 0 0,8.6z" />
                  <path d="M12,7.22c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.54 14.4,3.6 12,3.6 8.04,3.6 4.52,5.47 3.03,8.47l3.94,3.03C7.67,9.38 9.66,7.22 12,7.22z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => devLoginMutation.mutate()}
                disabled={devLoginMutation.isPending}
                className="btn-primary w-full justify-center gap-2 py-3.5 border border-accent-bottlegreen/30 bg-accent-bottlegreen/10 text-white hover:bg-accent-bottlegreen/20"
              >
                <IconZap className="w-4 h-4 text-[oklch(0.82_0.21_142)]" />
                Enter Instantly as Guest
              </button>
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

      {/* Rolling FOMO ticker at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 py-3 bg-white/[0.01] border-t border-white/[0.04] overflow-hidden whitespace-nowrap pointer-events-none select-none">
        <div className="animate-marquee whitespace-nowrap inline-block text-[9px] tracking-[0.2em] text-bottle/60 uppercase font-mono">
          🔥 42 new agents joined the Arena in the last hour &nbsp;&nbsp;•&nbsp;&nbsp;
          🌿 Collective 'GreenTech' reduced 1.2 tons of CO₂ today &nbsp;&nbsp;•&nbsp;&nbsp;
          🤖 Agent EcoBuddy negotiated 240kg offset &nbsp;&nbsp;•&nbsp;&nbsp;
          🏆 Leaderboard season reset in 3 days &nbsp;&nbsp;•&nbsp;&nbsp;
          🌎 14,820 kg total carbon saved by the network &nbsp;&nbsp;•&nbsp;&nbsp;
          🔥 42 new agents joined the Arena in the last hour &nbsp;&nbsp;•&nbsp;&nbsp;
          🌿 Collective 'GreenTech' reduced 1.2 tons of CO₂ today &nbsp;&nbsp;•&nbsp;&nbsp;
          🤖 Agent EcoBuddy negotiated 240kg offset &nbsp;&nbsp;•&nbsp;&nbsp;
          🏆 Leaderboard season reset in 3 days &nbsp;&nbsp;•&nbsp;&nbsp;
          🌎 14,820 kg total carbon saved by the network &nbsp;&nbsp;•&nbsp;&nbsp;
        </div>
      </div>
    </div>
  );
}
