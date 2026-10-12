import Link from "next/link";
import Image from "next/image";
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
        "group flex shrink-0 items-center rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      <Image
        src="/brand/day-to-day-news-logo.png"
        alt="Day to Day News"
        width={1589}
        height={989}
        priority
        className="h-12 w-24 object-contain transition-transform duration-200 group-hover:scale-[1.02] sm:h-14 sm:w-32"
      />
    </Link>
  );
}
