import ReactMarkdown from "react-markdown";
import Link from "@/i18n/Link";

/**
 * Text written under Admin → Pages (paragraphs, **bold**, lists, links). The
 * surrounding element styles it; links to this site keep the reader's language.
 */
export function PageMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children: label }) =>
          href?.startsWith("/") && !href.startsWith("//") ? (
            <Link href={href}>{label}</Link>
          ) : (
            <a href={href} target="_blank" rel="noopener">
              {label}
            </a>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
