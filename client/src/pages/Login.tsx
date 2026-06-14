import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { IconArrowForward, IconGlobe, IconLeaf, IconMail, IconPhone, IconShield, IconZap } from "@/components/Icons";

type Step = "identifier" | "otp" | "name";

export default function Login() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("identifier");
  const [identifierType, setIdentifierType] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Vibrant abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-emerald-500/20 to-teal-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-gradient-to-tr from-pink-600/20 to-orange-500/10 blur-3xl" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <IconLeaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ReBon</span>
        </div>
        <p className="text-sm text-zinc-400 max-w-xs">Carbon intelligence for the climate generation</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">

          {step === "identifier" && (
            <form onSubmit={handleSendOtp} noValidate>
              <h1 className="text-xl font-bold text-white mb-1">Sign in to ReBon</h1>
              <p className="text-sm text-zinc-400 mb-6">No password needed. We'll send you a 6-digit code.</p>

              {/* Toggle email / phone */}
              <div className="flex rounded-lg bg-zinc-800 p-1 mb-4" role="group" aria-label="Sign in method">
                <button
                  type="button"
                  onClick={() => setIdentifierType("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${identifierType === "email" ? "bg-violet-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                  aria-pressed={identifierType === "email"}
                >
                  <IconMail className="w-4 h-4" aria-hidden="true" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setIdentifierType("phone")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${identifierType === "phone" ? "bg-violet-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                  aria-pressed={identifierType === "phone"}
                >
                  <IconPhone className="w-4 h-4" aria-hidden="true" /> Phone
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="identifier" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  {identifierType === "email" ? "Email address" : "Phone number"}
                </label>
                <input
                  id="identifier"
                  type={identifierType === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={identifierType === "email" ? "you@example.com" : "+1 555 000 0000"}
                  required
                  autoComplete={identifierType === "email" ? "email" : "tel"}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                  aria-describedby="identifier-hint"
                />
                <p id="identifier-hint" className="mt-1.5 text-xs text-zinc-500">
                  {identifierType === "phone" ? "Include country code, e.g. +44 7700 900000" : "We'll send a sign-in code to this address"}
                </p>
              </div>

              <button
                type="submit"
                disabled={!identifier.trim() || sendOtpMutation.isPending}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-[0.98]"
                aria-busy={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>Send code <IconArrowForward className="w-4 h-4" aria-hidden="true" /></>
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <button
                type="button"
                onClick={() => { setStep("identifier"); setOtp(""); setDevOtp(null); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-white mb-1">Enter your code</h1>
              <p className="text-sm text-zinc-400 mb-6">
                We sent a 6-digit code to <span className="text-violet-400 font-medium">{identifier}</span>
              </p>

              {devOtp && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                  <IconZap className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>Dev mode — your code is <strong className="font-mono text-base">{devOtp}</strong></span>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-zinc-300 mb-1.5">6-digit code</label>
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-2xl font-mono tracking-[0.5em] text-center"
                  aria-label="One-time passcode"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="display-name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Your name <span className="text-zinc-500 font-normal">(optional)</span>
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-[0.98]"
                aria-busy={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>Verify &amp; enter ReBon <IconArrowForward className="w-4 h-4" aria-hidden="true" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => sendOtpMutation.mutate({ identifier: identifier.trim(), identifierType })}
                disabled={sendOtpMutation.isPending}
                className="w-full mt-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Didn't receive it? Resend code
              </button>
            </form>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-600">
          <span className="flex items-center gap-1.5"><IconShield className="w-3.5 h-3.5" aria-hidden="true" /> No password stored</span>
          <span className="flex items-center gap-1.5"><IconZap className="w-3.5 h-3.5" aria-hidden="true" /> Instant access</span>
          <span className="flex items-center gap-1.5"><IconGlobe className="w-3.5 h-3.5" aria-hidden="true" /> Any device</span>
        </div>
      </div>
    </div>
  );
}
