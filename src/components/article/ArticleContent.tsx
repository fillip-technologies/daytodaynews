import ReactMarkdown from "react-markdown";
import Link from "@/i18n/Link";

const linkClass =
  "font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-hover hover:decoration-primary-hover";

type ArticleContentProps = {
  content: string;
};

/**
 * Normalizes article markdown so that raw HTML images or standalone image URLs
 * are gracefully converted into markdown images before rendering.
 */
function normalizeArticleContent(raw: string): string {
  if (!raw) return "";

  let processed = raw;

  // 1. Convert HTML <img src="..." alt="..." /> to Markdown ![alt](src)
  processed = processed.replace(
    /<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']?([^"']*)["']?[^>]*\/?>/gi,
    (_match, src, alt) => `\n\n![${alt || "Illustration"}](${src})\n\n`
  );
  processed = processed.replace(
    /<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi,
    (_match, alt, src) => `\n\n![${alt || "Illustration"}](${src})\n\n`
  );

  // 2. Convert standalone image URLs on their own lines to Markdown image syntax
  processed = processed.replace(
    /^(https?:\/\/(?:res\.cloudinary\.com\/[^\s]+|[^\s]+\.(?:png|jpe?g|webp|gif|svg|avif))(\?[^\s]*)?)$/gim,
    '\n\n![]($1)\n\n'
  );

  return processed;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const normalizedContent = normalizeArticleContent(content);

  return (
    <div className="article-body">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <div className="mb-5 text-base leading-relaxed text-text-secondary sm:text-lg">
              {children}
            </div>
          ),
          ul: ({ children }) => (
            <ul className="my-5 list-disc space-y-2 pl-6 text-base text-text-secondary sm:text-lg">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-2 pl-6 text-base text-text-secondary sm:text-lg">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 rounded-2xl border-l-4 border-primary bg-primary/5 px-6 py-4 text-base italic text-text-primary sm:text-lg">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-10 border-border" />
          ),
          // Internal links keep the reader's language (/articles/x → /hi/articles/x).
          a: ({ href, children }) =>
            href?.startsWith("/") && !href.startsWith("//") ? (
              <Link href={href} className={linkClass}>
                {children}
              </Link>
            ) : (
              <a href={href} className={linkClass}>
                {children}
              </a>
            ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-primary">
              {children}
            </em>
          ),
          code: ({ children }) => (
            <code className="rounded border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-sm text-primary">
              {children}
            </code>
          ),
          img: ({ src, alt }) => {
            if (!src) return null;
            const cleanAlt = typeof alt === "string" ? alt.trim() : "";
            return (
              <figure className="my-8 block w-full">
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
                  <img
                    src={src}
                    alt={cleanAlt || "Article illustration"}
                    className="mx-auto block h-auto max-h-[700px] w-full object-contain transition-transform duration-300 hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
                {cleanAlt ? (
                  <figcaption className="mt-2.5 text-center text-xs font-medium text-text-muted">
                    {cleanAlt}
                  </figcaption>
                ) : null}
              </figure>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
