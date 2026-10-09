import { Logo } from "./Logo";
import { SubscribeButton } from "./SubscribeButton";

/** Footer top row: brand statement plus a compact subscribe CTA. */
export function FooterBrand() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
      <div>
        <Logo />
        <p className="mt-6 max-w-xl text-2xl leading-snug font-semibold tracking-[-0.02em] text-balance text-text-primary sm:text-[1.75rem]">
          Practical technology insights for the people{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">building what&apos;s next.</span>
        </p>
        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-text-secondary">
          Explore AI, software, automation, business technology and the ideas shaping modern
          digital teams.
        </p>
      </div>

      <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated/80 p-5 shadow-[0_18px_40px_-28px] shadow-primary/40 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-semibold text-text-primary">Stay connected</p>
          <p className="mt-1 text-sm text-text-muted">One practical brief, every Friday.</p>
        </div>
        <SubscribeButton size="md" className="shrink-0" />
      </div>
    </div>
  );
}
