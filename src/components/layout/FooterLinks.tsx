import Link from "next/link";
import type { FooterGroup } from "@/config/footerNavigation";
import { toneStyle } from "@/lib/tones";

export function FooterLinks({ groups }: { groups: FooterGroup[] }) {
  return (
    <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4 lg:gap-x-8">
      {groups.map((group) => {
        const id = `footer-${group.title.toLowerCase()}`;
        return (
          <div key={group.title} style={toneStyle(group.tone)}>
            <h2
              id={id}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-primary"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-(color:--tone)" />
              {group.title}
            </h2>
            <ul aria-labelledby={id} className="mt-4 space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block rounded py-1.5 text-sm text-text-secondary transition-[color,translate] duration-200 hover:translate-x-0.5 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-x-0"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
