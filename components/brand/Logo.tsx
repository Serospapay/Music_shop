import Link from "next/link";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className = "", showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90 ${className}`}
      aria-label="Октава — на головну"
    >
      <svg
        className="h-9 w-9 shrink-0 text-brand-400 transition-colors group-hover:text-brand-300"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5" className="opacity-90" />
        <path
          d="M11 20c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          className="opacity-80"
        />
        <path
          d="M14 14v12M20 12v16M26 14v12"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          className="opacity-55"
        />
      </svg>
      {showWordmark ? (
        <span className="font-display text-[1.35rem] leading-none tracking-tight text-white sm:text-2xl">
          Октава
        </span>
      ) : null}
    </Link>
  );
}
