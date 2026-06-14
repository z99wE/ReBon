/**
 * ReBon Icon System — Ionicons-inspired greyscale SVG icons
 * All icons are monochrome, stroke-based, no fill colours.
 * Size defaults to 20px. Use className to override.
 */

interface IconProps {
  className?: string;
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 512 512",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 32,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function IconLeaf({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M416 32C240 32 80 172 80 352c0 72 26 136 68 184" />
      <path d="M416 32C416 32 416 240 256 352S80 352 80 352" />
      <line x1="256" y1="352" x2="80" y2="432" />
    </svg>
  );
}

export function IconFlash({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M315.27 33L96 300h176l-28.73 179L448 212H272L315.27 33z" />
    </svg>
  );
}

export function IconCar({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="48" y="192" width="416" height="208" rx="48" ry="48" />
      <path d="M112 192l50-112h196l50 112" />
      <circle cx="144" cy="400" r="48" />
      <circle cx="368" cy="400" r="48" />
      <line x1="48" y1="288" x2="464" y2="288" />
    </svg>
  );
}

export function IconRestaurant({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M192 96v128a64 64 0 01-128 0V96" />
      <line x1="128" y1="224" x2="128" y2="448" />
      <line x1="64" y1="96" x2="64" y2="160" />
      <line x1="128" y1="96" x2="128" y2="160" />
      <line x1="192" y1="96" x2="192" y2="160" />
      <path d="M384 96c0 0-64 48-64 160s64 64 64 64v128" />
    </svg>
  );
}

export function IconCart({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="176" cy="416" r="32" />
      <circle cx="384" cy="416" r="32" />
      <path d="M48 80h64l48 224h224l48-160H160" />
    </svg>
  );
}

export function IconPodium({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="32" y="320" width="128" height="160" rx="4" />
      <rect x="192" y="224" width="128" height="256" rx="4" />
      <rect x="352" y="272" width="128" height="208" rx="4" />
      <path d="M96 320V192M256 224V96M416 272V160" />
    </svg>
  );
}

export function IconPeople({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="192" cy="144" r="80" />
      <path d="M16 416c0-106 80-176 176-176s176 70 176 176" />
      <circle cx="368" cy="160" r="64" />
      <path d="M368 224c64 0 128 48 128 160" />
    </svg>
  );
}

export function IconGlobe({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="256" cy="256" r="208" />
      <path d="M48 256h416M256 48c-64 64-96 128-96 208s32 144 96 208M256 48c64 64 96 128 96 208s-32 144-96 208" />
    </svg>
  );
}

export function IconMic({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="160" y="32" width="192" height="288" rx="96" />
      <path d="M96 256c0 88 72 160 160 160s160-72 160-160" />
      <line x1="256" y1="416" x2="256" y2="480" />
      <line x1="192" y1="480" x2="320" y2="480" />
    </svg>
  );
}

export function IconSwords({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <line x1="64" y1="448" x2="448" y2="64" />
      <path d="M384 64h64v64l-192 192-64-64L384 64z" />
      <path d="M160 320L64 448l48 0l0-48" />
      <line x1="448" y1="448" x2="64" y2="64" />
      <path d="M128 64H64v64l192 192 64-64L128 64z" />
      <path d="M352 320l96 128-48 0 0-48" />
    </svg>
  );
}

export function IconRobot({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <rect x="96" y="192" width="320" height="256" rx="32" />
      <rect x="160" y="256" width="64" height="64" rx="8" />
      <rect x="288" y="256" width="64" height="64" rx="8" />
      <line x1="192" y1="384" x2="320" y2="384" />
      <path d="M256 192v-64" />
      <circle cx="256" cy="112" r="32" />
      <line x1="96" y1="320" x2="48" y2="320" />
      <line x1="416" y1="320" x2="464" y2="320" />
    </svg>
  );
}

export function IconTarget({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="256" cy="256" r="208" />
      <circle cx="256" cy="256" r="128" />
      <circle cx="256" cy="256" r="48" />
    </svg>
  );
}

export function IconTrendingUp({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <polyline points="352 144 448 144 448 240" />
      <path d="M64 368L192 240l96 96L448 144" />
    </svg>
  );
}

export function IconBarChart({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <line x1="256" y1="448" x2="256" y2="64" />
      <line x1="128" y1="448" x2="128" y2="192" />
      <line x1="384" y1="448" x2="384" y2="128" />
      <line x1="48" y1="448" x2="464" y2="448" />
    </svg>
  );
}

export function IconShare({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <circle cx="384" cy="96" r="64" />
      <circle cx="128" cy="256" r="64" />
      <circle cx="384" cy="416" r="64" />
      <line x1="192" y1="224" x2="320" y2="128" />
      <line x1="192" y1="288" x2="320" y2="384" />
    </svg>
  );
}

export function IconStar({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M256 48l56 168h176l-142 104 54 168L256 384 112 488l54-168L24 216h176z" />
    </svg>
  );
}

export function IconCheckmark({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <polyline points="96 256 208 368 416 144" />
    </svg>
  );
}

export function IconAdd({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <line x1="256" y1="112" x2="256" y2="400" />
      <line x1="112" y1="256" x2="400" y2="256" />
    </svg>
  );
}

export function IconArrowForward({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M268 112l144 144-144 144" />
      <line x1="100" y1="256" x2="412" y2="256" />
    </svg>
  );
}

export function IconShield({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M256 48L80 128v128c0 112 80 192 176 208 96-16 176-96 176-208V128L256 48z" />
    </svg>
  );
}

export function IconPulse({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <polyline points="48 256 144 256 192 128 256 384 304 192 352 256 464 256" />
    </svg>
  );
}

export function IconLayers({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <polygon points="256 48 464 176 256 304 48 176 256 48" />
      <polyline points="48 304 256 432 464 304" />
    </svg>
  );
}

export function IconChatbubble({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M80 80h352a32 32 0 0132 32v192a32 32 0 01-32 32H176l-96 80V304H80a32 32 0 01-32-32V112a32 32 0 0132-32z" />
    </svg>
  );
}

export function IconEye({ className = "w-5 h-5", size = 20 }: IconProps) {
  return (
    <svg {...base(size)} className={className} aria-hidden="true">
      <path d="M256 112C128 112 48 256 48 256s80 144 208 144 208-144 208-144S384 112 256 112z" />
      <circle cx="256" cy="256" r="64" />
    </svg>
  );
}

export function IconTrophy({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h3" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1h-3" />
      <path d="M4 21h16" />
      <path d="M9 21v-4" />
      <path d="M15 21v-4" />
      <path d="M6 4v5a6 6 0 0 0 12 0V4" />
    </svg>
  );
}

export function IconMedal({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="6" />
      <path d="M8.21 3.06 7 8l5 2 5-2-1.21-4.94a1 1 0 0 0-.97-.76H9.18a1 1 0 0 0-.97.76Z" />
    </svg>
  );
}

export function IconBookOpen({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function IconGitCompare({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  );
}

export function IconZap({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconLock({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconMail({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function IconPhone({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconCheck({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconUser({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconLogout({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconHeart({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconTree({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12 7 7" />
      <path d="M12 12l5-5" />
      <path d="M12 7 8 3" />
      <path d="M12 7l4-4" />
      <path d="M9 22h6" />
    </svg>
  );
}

export function IconTrendingDown({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

export function IconCopy({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconArrowLeft({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconMicOff({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function IconCpu({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}
