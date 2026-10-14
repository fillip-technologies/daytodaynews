import Link from "@/i18n/Link";
import { getI18n } from "@/i18n/server";

// Replaces Next's default 404, which switches to a black background in OS dark mode.
export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-text-secondary">{t.notFound.description}</p>
      <Link
        href="/"
        className="mt-8 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-hover hover:decoration-primary-hover"
      >
        {t.notFound.back}
      </Link>
    </main>
  );
}
