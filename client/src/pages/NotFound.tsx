import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] px-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* 404 monogram */}
        <div className="mb-8">
          <p className="text-[120px] font-black text-white/5 leading-none select-none" aria-hidden="true">404</p>
          <div className="-mt-16 mb-4">
            <span className="label-tech text-white/30">SIGNAL LOST</span>
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-card border border-white/10 rounded-2xl p-8 mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            The route you’re looking for doesn’t exist or has been moved.
            Your carbon journey continues — let’s get you back on track.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary py-3 px-6 rounded-xl text-sm font-bold">
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost py-3 px-6 rounded-xl text-sm font-bold border border-white/10"
          >
            Go Back
          </button>
        </div>

        <p className="mt-8 text-white/20 text-xs tracking-widest uppercase">
          ReBon · Carbon Intelligence Platform
        </p>
      </div>
    </div>
  );
}
