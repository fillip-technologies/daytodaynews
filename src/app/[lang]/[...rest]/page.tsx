import { notFound } from "next/navigation";

// Unknown paths under a locale ("/en/nope") render the localized 404 inside the site layout.
export default function UnknownPage() {
  notFound();
}
