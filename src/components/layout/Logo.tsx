import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  onClick?: () => void;
};

export function Logo({ className, onClick }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="DayTodayNews home"
      className={cn(
        "group flex shrink-0 items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[10px] bg-gradient-primary text-surface-elevated transition-transform duration-200 group-hover:-rotate-6"
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path d="M4 3h5.5a7 7 0 0 1 0 14H4V3Zm3 3v8h2.5a4 4 0 0 0 0-8H7Z" />
          <circle cx="16.5" cy="4" r="1.75" />
        </svg>
      </span>
      <span className="text-[1.0625rem] font-semibold tracking-tight text-text-primary">
        DayToday<span className="text-primary">News</span>
      </span>
    </Link>
  );
}
