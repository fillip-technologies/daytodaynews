import { isLocale, defaultLocale } from "@/i18n/config";
import { redirectOrNotFound } from "@/lib/redirects";

// Unknown paths under a locale ("/en/nope"): follow a redirect from Admin →
// Redirects if one exists, otherwise render the localized 404 inside the site layout.
export default async function UnknownPage({ params }: PageProps<"/[lang]/[...rest]">) {
  const { lang, rest } = await params;
  return redirectOrNotFound(`/${rest.join("/")}`, isLocale(lang) ? lang : defaultLocale);
}
