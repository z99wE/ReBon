import React, { useState } from "react";
import { toast } from "sonner";

interface SocialShareProps {
  /** Primary share text (tweet copy, LinkedIn summary, etc.) */
  text: string;
  /** URL to share — defaults to window.location.href */
  url?: string;
  /** Optional title for LinkedIn / Pinterest */
  title?: string;
  /** Which platforms to display (all shown by default) */
  platforms?: Array<"x" | "linkedin" | "facebook" | "pinterest" | "whatsapp" | "copy">;
  /** Visual variant */
  variant?: "compact" | "full";
  /** Called after any share button is clicked */
  onShare?: (platform: string) => void;
}

// ── Platform icon SVGs ────────────────────────────────────────────────────────

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// ── Platform config ───────────────────────────────────────────────────────────

const PLATFORM_CONFIG = {
  x: {
    label: "X / Twitter",
    labelShort: "X",
    icon: XIcon,
    color: "hover:bg-neutral-800 hover:border-neutral-600 hover:text-white",
    build: (text: string, url: string, _title: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 240))}&url=${encodeURIComponent(url)}`,
  },
  linkedin: {
    label: "LinkedIn",
    labelShort: "LI",
    icon: LinkedInIcon,
    color: "hover:bg-[#0077b5]/20 hover:border-[#0077b5]/40 hover:text-[#0077b5]",
    build: (text: string, url: string, title: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text.slice(0, 700))}`,
  },
  facebook: {
    label: "Facebook",
    labelShort: "FB",
    icon: FacebookIcon,
    color: "hover:bg-[#1877f2]/20 hover:border-[#1877f2]/40 hover:text-[#1877f2]",
    build: (_text: string, url: string, _title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  pinterest: {
    label: "Pinterest",
    labelShort: "PIN",
    icon: PinterestIcon,
    color: "hover:bg-[#e60023]/20 hover:border-[#e60023]/40 hover:text-[#e60023]",
    build: (text: string, url: string, _title: string) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text.slice(0, 500))}`,
  },
  whatsapp: {
    label: "WhatsApp",
    labelShort: "WA",
    icon: WhatsAppIcon,
    color: "hover:bg-[#25d366]/20 hover:border-[#25d366]/40 hover:text-[#25d366]",
    build: (text: string, url: string, _title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  copy: {
    label: "Copy",
    labelShort: "COPY",
    icon: CopyIcon,
    color: "hover:bg-white/10 hover:border-white/20 hover:text-white",
    build: () => "",
  },
} as const;

type Platform = keyof typeof PLATFORM_CONFIG;

// ── Component ─────────────────────────────────────────────────────────────────

export function SocialShare({
  text,
  url,
  title = "ReBon Carbon Intelligence",
  platforms = ["x", "linkedin", "facebook", "whatsapp", "copy"],
  variant = "compact",
  onShare,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.origin : "https://rebon.app");

  const handleClick = async (platform: Platform) => {
    onShare?.(platform);

    if (platform === "copy") {
      await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const cfg = PLATFORM_CONFIG[platform];
    const intentUrl = cfg.build(text, shareUrl, title);
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  if (variant === "full") {
    return (
      <div className="flex flex-wrap gap-2">
        {(platforms as Platform[]).map((p) => {
          const cfg = PLATFORM_CONFIG[p];
          const Icon = cfg.icon;
          return (
            <button
              key={p}
              onClick={() => handleClick(p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-semibold transition-all duration-200 ${cfg.color}`}
              title={`Share on ${cfg.label}`}
              aria-label={`Share on ${cfg.label}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {p === "copy" && copied ? "Copied!" : cfg.label}
            </button>
          );
        })}
      </div>
    );
  }

  // compact variant — icon-only with tooltip on hover
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] uppercase tracking-wider text-white/30 font-mono mr-1">Share:</span>
      {(platforms as Platform[]).map((p) => {
        const cfg = PLATFORM_CONFIG[p];
        const Icon = cfg.icon;
        return (
          <button
            key={p}
            onClick={() => handleClick(p)}
            className={`p-1.5 rounded bg-white/5 border border-white/8 text-white/40 text-[10px] font-mono transition-all duration-150 ${cfg.color}`}
            title={`Share on ${cfg.label}`}
            aria-label={`Share on ${cfg.label}`}
          >
            <Icon className="w-3 h-3" />
          </button>
        );
      })}
    </div>
  );
}

export default SocialShare;
