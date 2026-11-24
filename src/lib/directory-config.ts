import { cleanEmail, cleanHttpUrl, cleanLine, cleanText } from "@/lib/validation";

// The three directories (business, software, startups): their URLs, which
// fields each one uses, and the cleaning of submitted listings. Pure module:
// shared by the public pages, the submission action and the admin editor.

export type ListingKind = "BUSINESS" | "SOFTWARE" | "STARTUP";
export type ListingTier = "BASIC" | "VERIFIED" | "FEATURED";
export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";

export const listingKinds: ListingKind[] = ["BUSINESS", "SOFTWARE", "STARTUP"];

/** Unprefixed base path of each directory. */
export const directoryPath: Record<ListingKind, string> = {
  BUSINESS: "/business-directory",
  SOFTWARE: "/software-directory",
  STARTUP: "/startup-directory",
};

export const directoryKindLabel: Record<ListingKind, string> = {
  BUSINESS: "Business",
  SOFTWARE: "Software",
  STARTUP: "Startup",
};

export const listingPath = (kind: ListingKind, slug: string) => `${directoryPath[kind]}/${slug}`;
export const submitPath = (kind: ListingKind) => `${directoryPath[kind]}/submit`;

/** Suggested categories (free text is allowed; the directory filters use what listings have). */
export const suggestedCategories: Record<ListingKind, string[]> = {
  BUSINESS: [
    "AI Automation",
    "Software Development",
    "Web & App Development",
    "IT Services",
    "Cybersecurity",
    "Cloud & DevOps",
    "Digital Marketing",
    "Data & Analytics",
    "Hardware",
    "Consulting",
  ],
  SOFTWARE: [
    "AI Tools",
    "Automation",
    "CRM",
    "ERP",
    "Project Management",
    "Marketing",
    "Accounting & Finance",
    "HR & Recruitment",
    "Customer Support",
    "Developer Tools",
    "Cybersecurity",
  ],
  STARTUP: ["AI", "SaaS", "Fintech", "Healthtech", "Edtech", "E-commerce", "Agritech", "Climate", "Deep Tech", "Other"],
};

export const startupStages = ["Idea", "Pre-seed", "Seed", "Series A", "Series B+", "Bootstrapped", "Profitable"];
export const pricingModels = ["Free", "Freemium", "Subscription", "One-time licence", "Usage-based", "Custom quote", "Open source"];

/** Fields of a listing, with the directories that use them. */
export type ListingFieldKey =
  | "name"
  | "tagline"
  | "description"
  | "logoUrl"
  | "website"
  | "email"
  | "phone"
  | "country"
  | "city"
  | "category"
  | "services"
  | "specialties"
  | "certifications"
  | "pricingModel"
  | "platforms"
  | "screenshots"
  | "useCases"
  | "targetCustomers"
  | "alternatives"
  | "foundedYear"
  | "teamSize"
  | "stage"
  | "funding";

type FieldDef = {
  key: ListingFieldKey;
  /** Label per directory (the same field means different things, e.g. services vs features). */
  label: Partial<Record<ListingKind, string>> & { default: string };
  kinds: ListingKind[];
  type: "line" | "text" | "lines" | "url" | "email" | "year";
  required?: boolean;
  max: number;
  hint?: string;
};

const ALL: ListingKind[] = ["BUSINESS", "SOFTWARE", "STARTUP"];

export const listingFields: FieldDef[] = [
  { key: "name", label: { default: "Name", SOFTWARE: "Product name", BUSINESS: "Company name", STARTUP: "Startup name" }, kinds: ALL, type: "line", required: true, max: 150 },
  { key: "tagline", label: { default: "One-line summary" }, kinds: ALL, type: "line", required: true, max: 200 },
  { key: "description", label: { default: "Description", BUSINESS: "Company description" }, kinds: ALL, type: "text", required: true, max: 5000, hint: "What you do, for whom, and what makes you different." },
  { key: "website", label: { default: "Website", SOFTWARE: "Product website" }, kinds: ALL, type: "url", required: true, max: 2048 },
  { key: "email", label: { default: "Email for enquiries" }, kinds: ALL, type: "email", required: true, max: 254, hint: "Reader enquiries are sent here. It is not shown on the site." },
  { key: "logoUrl", label: { default: "Logo URL" }, kinds: ALL, type: "url", max: 2048, hint: "A link to your logo image (https://…)." },
  { key: "phone", label: { default: "Phone" }, kinds: ["BUSINESS"], type: "line", max: 40 },
  { key: "country", label: { default: "Country" }, kinds: ALL, type: "line", required: true, max: 80 },
  { key: "city", label: { default: "City" }, kinds: ["BUSINESS", "STARTUP"], type: "line", max: 80 },
  { key: "category", label: { default: "Category", BUSINESS: "Industry / business category", SOFTWARE: "Product category", STARTUP: "Sector" }, kinds: ALL, type: "line", required: true, max: 120 },
  { key: "services", label: { default: "Products & services", SOFTWARE: "Key features", STARTUP: "Product / what you build" }, kinds: ALL, type: "lines", max: 3000, hint: "One per line." },
  { key: "specialties", label: { default: "Specialties" }, kinds: ["BUSINESS"], type: "lines", max: 2000, hint: "One per line." },
  { key: "certifications", label: { default: "Certifications & credentials" }, kinds: ["BUSINESS"], type: "lines", max: 2000, hint: "One per line, e.g. ISO 27001." },
  { key: "pricingModel", label: { default: "Pricing model" }, kinds: ["SOFTWARE"], type: "line", max: 150 },
  { key: "platforms", label: { default: "Supported platforms" }, kinds: ["SOFTWARE"], type: "line", max: 255, hint: "e.g. Web, iOS, Android, Windows" },
  { key: "screenshots", label: { default: "Screenshot URLs" }, kinds: ["SOFTWARE"], type: "lines", max: 5000, hint: "One https:// image link per line." },
  { key: "useCases", label: { default: "Use cases" }, kinds: ["SOFTWARE"], type: "lines", max: 2000, hint: "One per line." },
  { key: "targetCustomers", label: { default: "Target customers" }, kinds: ["SOFTWARE", "STARTUP"], type: "lines", max: 2000, hint: "One per line." },
  { key: "alternatives", label: { default: "Alternatives" }, kinds: ["SOFTWARE"], type: "lines", max: 1000, hint: "Other products buyers compare you with, one per line." },
  { key: "foundedYear", label: { default: "Founded (year)" }, kinds: ALL, type: "year", max: 4 },
  { key: "teamSize", label: { default: "Team size" }, kinds: ["BUSINESS", "STARTUP"], type: "line", max: 40 },
  { key: "stage", label: { default: "Stage" }, kinds: ["STARTUP"], type: "line", max: 60 },
  { key: "funding", label: { default: "Funding raised" }, kinds: ["STARTUP"], type: "line", max: 150 },
];

export const fieldsFor = (kind: ListingKind) => listingFields.filter((field) => field.kinds.includes(kind));
export const fieldLabel = (field: FieldDef, kind: ListingKind) => field.label[kind] ?? field.label.default;

export type ListingInput = Partial<Record<ListingFieldKey, string | number | null>>;
export type CleanListing = {
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  category: string | null;
  services: string | null;
  specialties: string | null;
  certifications: string | null;
  pricingModel: string | null;
  platforms: string | null;
  screenshots: string | null;
  useCases: string | null;
  targetCustomers: string | null;
  alternatives: string | null;
  foundedYear: number | null;
  teamSize: string | null;
  stage: string | null;
  funding: string | null;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const linesOf = (value: unknown, max: number) =>
  cleanText(value, max)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .join("\n") || null;

/** "example.com" → "https://example.com/". */
export function normalizeWebsite(value: unknown): string | null {
  const text = cleanLine(value, 2048);
  if (!text) return null;
  return cleanHttpUrl(/^https?:\/\//i.test(text) ? text : `https://${text}`);
}

/**
 * Validates a listing for `kind`. `strict` (public submissions) enforces the
 * required fields; staff saves only need a name.
 */
export function cleanListing(kind: ListingKind, input: ListingInput, strict: boolean): Result<CleanListing> {
  const used = new Set(fieldsFor(kind).map((f) => f.key));
  const value: Record<string, string | number | null> = {};
  for (const field of listingFields) {
    if (!used.has(field.key)) {
      value[field.key] = null;
      continue;
    }
    const raw = input[field.key];
    const label = fieldLabel(field, kind);
    let clean: string | number | null;
    switch (field.type) {
      case "line":
        clean = cleanLine(raw, field.max) || null;
        break;
      case "text":
        clean = cleanText(raw, field.max) || null;
        break;
      case "lines":
        clean = linesOf(raw, field.max);
        break;
      case "url": {
        const text = cleanLine(raw, field.max);
        clean = text ? normalizeWebsite(text) : null;
        if (text && !clean) return { ok: false, error: `${label}: enter a full web address (https://…).` };
        break;
      }
      case "email": {
        const text = cleanLine(raw, field.max);
        clean = text ? cleanEmail(text) : null;
        if (text && !clean) return { ok: false, error: `${label}: enter a valid email address.` };
        break;
      }
      case "year": {
        const text = cleanLine(String(raw ?? ""), 4);
        const year = text ? Number(text) : null;
        if (year !== null && (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear())) {
          return { ok: false, error: `${label}: enter a year like 2019.` };
        }
        clean = year;
        break;
      }
    }
    if ((strict ? field.required : field.key === "name") && !clean) {
      return { ok: false, error: `Please fill in: ${label}.` };
    }
    value[field.key] = clean;
  }
  if (typeof value.screenshots === "string") {
    const urls = value.screenshots.split("\n").map((u) => cleanHttpUrl(u)).filter(Boolean);
    value.screenshots = urls.slice(0, 8).join("\n") || null;
  }
  return { ok: true, value: value as unknown as CleanListing };
}

export function slugifyListing(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "listing"
  );
}

/** Slugs that would collide with fixed routes. */
export const RESERVED_LISTING_SLUGS = new Set(["submit", "page", "category"]);

/** A listing page is thin (kept out of search results) until it has a real description. */
export const isThinListing = (listing: { description: string | null }) => (listing.description ?? "").trim().length < 200;
