import { footerNavigation } from "@/config/footerNavigation";
import { toneStyle } from "@/lib/tones";
import { FooterBottomBar } from "./FooterBottomBar";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-surface">
      {/* Restrained pink → purple → blue glow behind the brand row */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-60" />
        <div
          style={toneStyle("pink")}
          className="absolute -top-40 left-[5%] h-80 w-[36rem] rounded-full bg-(color:--tone)/10 blur-3xl"
        />
        <div className="absolute -top-44 left-[38%] h-80 w-[30rem] rounded-full bg-accent-secondary/10 blur-3xl" />
        <div className="absolute -top-32 right-[2%] h-72 w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-14">
          <FooterBrand />
        </div>
        <div className="border-t border-border py-10 sm:py-12">
          <FooterLinks groups={footerNavigation} />
        </div>
        <FooterBottomBar />
      </div>
    </footer>
  );
}
