import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { subscribeHref } from "@/config/navigation";
import { cn } from "@/lib/cn";

type SubscribeButtonProps = {
  label?: string;
  href?: string;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
};

export function SubscribeButton({
  label = "Subscribe",
  href = subscribeHref,
  size = "sm",
  className,
  onClick,
}: SubscribeButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
        "bg-accent text-surface-elevated transition-[translate,box-shadow] duration-150",
        "hover:-translate-y-px hover:shadow-lg hover:shadow-accent/25 motion-reduce:hover:translate-y-0",
        "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
        size === "sm" ? "h-10 px-4 text-sm" : "h-12 px-6 text-base",
        className,
      )}
    >
      {label}
      <Icon
        name="arrowRight"
        className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}
