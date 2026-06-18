import React from "react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { IconArrowForward, IconGlobe, IconLeaf, IconMail, IconPhone, IconShield, IconZap } from "@/components/Icons";
import { auth as clientAuth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

type Step = "identifier" | "otp" | "name";

export default function Login() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("identifier");
  const [identifierType, setIdentifierType] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const verifyFirebaseTokenMutation = trpc.auth.verifyFirebaseToken.useMutation({
    onSuccess: () => {
      toast.success("Welcome to ReBon!");
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

  const sendOtpMutation = trpc.auth.sendOtp.useMutation({
    onSuccess: (data) => {
      setStep("otp");
      // In dev mode, show the OTP directly so demo works without email
      if (data.preview?.startsWith("DEV_MODE:")) {
        const code = data.preview.replace("DEV_MODE:", "");
        setDevOtp(code);
        toast.success(`Dev mode: your OTP is ${code}`, { duration: 30000 });
      } else {
        toast.success(`Code sent to ${identifier}`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation({
    onSuccess: () => {
      toast.success("Welcome to ReBon!");
      // Force a page reload to pick up the new session cookie
      window.location.href = "/dashboard";
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtpMutation.mutate({ identifier: identifier.trim(), identifierType });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate({ identifier: identifier.trim(), otp: otp.trim(), name: name.trim() || undefined });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Premium organic/carbon gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[oklch(0.47_0.09_160)]/15 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-violet/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 text-center animate-fade-up">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded bg-white/5 border border-white/12 flex items-center justify-center shadow-lg">
            <IconLeaf className="w-4 h-4 text-white/90" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tight">ReBon</span>
        </div>
        <p className="label-tech text-[9px] text-white/30">Carbon intelligence platform</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass-card border border-white/8 rounded-md p-8 shadow-2xl">

          {step === "identifier" && (
            <form onSubmit={handleSendOtp} noValidate className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white uppercase tracking-tight mb-1">Sign in to ReBon</h1>
                <p className="text-xs text-white/40">Select your authorization channel to verify credentials.</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={verifyFirebaseTokenMutation.isPending}
                className="btn-primary w-full justify-center gap-2 mb-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.9,0.6 -2.07,0.98 -3.3,0.98 -2.34,0 -4.33,-1.58 -5.03,-3.7H3.03v2.7C4.52,18.73 8.04,20.6 12,20.6z" />
                  <path d="M6.97,13.08a5.1,5.1 0 0 1 0,-3.2v-2.7H3.03a8.6,8.6 0 0 0 0,8.6z" />
                  <path d="M12,7.22c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.54 14.4,3.6 12,3.6 8.04,3.6 4.52,5.47 3.03,8.47l3.94,3.03C7.67,9.38 9.66,7.22 12,7.22z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-white/6 flex-1" />
                <span className="text-[9px] text-white/20 uppercase tracking-widest font-black font-mono">OR SIGN IN WITH CODE</span>
                <div className="h-px bg-white/6 flex-1" />
              </div>

              {/* Toggle email / phone */}
              <div className="flex border border-white/8 bg-white/3 p-1 rounded-md" role="group" aria-label="Sign in method">
                <button
                  type="button"
                  onClick={() => setIdentifierType("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${identifierType === "email" ? "bg-[oklch(0.47_0.09_160)] text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
                  aria-pressed={identifierType === "email"}
                >
                  <IconMail className="w-3.5 h-3.5" aria-hidden="true" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setIdentifierType("phone")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${identifierType === "phone" ? "bg-[oklch(0.47_0.09_160)] text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
                  aria-pressed={identifierType === "phone"}
                >
                  <IconPhone className="w-3.5 h-3.5" aria-hidden="true" /> Phone
                </button>
              </div>

              <div>
                <label htmlFor="identifier" className="label-tech mb-2 block">
                  {identifierType === "email" ? "Email Address" : "Phone Number"}
                </label>
                <input
                  id="identifier"
                  type={identifierType === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={identifierType === "email" ? "name@example.com" : "+1 555 000 0000"}
                  required
                  autoComplete={identifierType === "email" ? "email" : "tel"}
                  className="w-full px-4 py-3 rounded bg-white/5 border border-white/8 text-white placeholder-white/20 focus:outline-none focus:border-[oklch(0.47_0.09_160)] transition-colors text-sm"
                  aria-describedby="identifier-hint"
                />
                <p id="identifier-hint" className="mt-2 text-[10px] text-white/30">
                  {identifierType === "phone" ? "Include country code (e.g., +1 555...)" : "A one-time passcode will be delivered to this inbox."}
                </p>
              </div>

              <button
                type="submit"
                disabled={!identifier.trim() || sendOtpMutation.isPending}
                className="btn-primary w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                aria-busy={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>Send code <IconArrowForward className="w-3.5 h-3.5" aria-hidden="true" /></>
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
              <button
                type="button"
                onClick={() => { setStep("identifier"); setOtp(""); setDevOtp(null); }}
                className="label-tech text-white/40 hover:text-white mb-2 flex items-center gap-1 transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-bold text-white uppercase tracking-tight mb-1">Enter your code</h1>
                <p className="text-xs text-white/40">
                  We sent a 6-digit code to <span className="text-white/80 font-medium">{identifier}</span>
                </p>
              </div>

              {devOtp && (
                <div className="p-4 rounded bg-white/4 border border-white/8 text-white/80 text-xs flex items-center gap-2">
                  <IconZap className="w-4 h-4 text-[oklch(0.47_0.09_160)] flex-shrink-0" aria-hidden="true" />
                  <span>Dev mode — code: <strong className="font-mono text-sm tracking-wider text-white">{devOtp}</strong></span>
                </div>
              )}

              <div>
                <label htmlFor="otp" className="label-tech mb-2 block">One-Time Passcode</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoComplete="one-time-code"
                  className="w-full px-4 py-3 rounded bg-white/5 border border-white/8 text-white placeholder-white/10 focus:outline-none focus:border-[oklch(0.47_0.09_160)] transition-colors text-2xl font-mono tracking-[0.5em] text-center"
                  aria-label="One-time passcode"
                />
              </div>

              <div>
                <label htmlFor="display-name" className="label-tech mb-2 block">
                  Your name <span className="text-white/20 font-normal">(optional)</span>
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded bg-white/5 border border-white/8 text-white placeholder-white/20 focus:outline-none focus:border-[oklch(0.47_0.09_160)] transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                className="btn-primary w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                aria-busy={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>Verify &amp; enter <IconArrowForward className="w-3.5 h-3.5" aria-hidden="true" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => sendOtpMutation.mutate({ identifier: identifier.trim(), identifierType })}
                disabled={sendOtpMutation.isPending}
                className="w-full text-center label-tech text-[9px] text-white/30 hover:text-white/60 bg-transparent border-0 cursor-pointer transition-colors"
              >
                Didn't receive it? Resend code
              </button>
            </form>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-white/20 font-mono">
          <span className="flex items-center gap-1.5"><IconShield className="w-3 h-3" aria-hidden="true" /> SECURE AUTH</span>
          <span className="flex items-center gap-1.5"><IconZap className="w-3 h-3" aria-hidden="true" /> INSTANT ID</span>
          <span className="flex items-center gap-1.5"><IconGlobe className="w-3 h-3" aria-hidden="true" /> SYNCED ACCESS</span>
        </div>
      </div>
    </div>
  );
}
