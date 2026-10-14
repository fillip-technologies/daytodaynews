import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, Placeholder, type LegalSection } from "@/components/static/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | DayTodayNews",
  description: "How DayTodayNews collects, uses and protects information when you use our website.",
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <p>
          This Privacy Policy explains how DayTodayNews, operated by <Placeholder>Company legal name</Placeholder>{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), collects, uses and protects information when you
          visit our website or interact with our content.
        </p>
        <p>By using the website, you acknowledge the practices described in this policy.</p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>
            <strong>Information you provide</strong>, such as your name, email address and message when you contact
            us, subscribe to updates or submit a contributor pitch.
          </li>
          <li>
            <strong>Technical information</strong>, such as browser type, device information, pages visited and
            approximate location derived from your IP address.
          </li>
          <li>
            <strong>Usage information</strong> about how you interact with the website, collected through cookies or
            similar technologies where enabled.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    content: (
      <>
        <p>We may use information to:</p>
        <ul>
          <li>Operate, maintain and improve the website and its content.</li>
          <li>Respond to enquiries, feedback and contributor submissions.</li>
          <li>Send newsletters or updates you have chosen to receive.</li>
          <li>Understand how the website is used so we can make it more useful.</li>
          <li>Protect the website against misuse and comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Similar Technologies",
    content: (
      <>
        <p>
          Cookies are small files stored on your device. We may use cookies and similar technologies to remember
          preferences, understand website usage and keep the website secure.
        </p>
        <p>
          You can control or delete cookies through your browser settings. Disabling some cookies may affect how
          parts of the website work.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    content: (
      <p>
        We may use analytics tools to understand aggregated traffic and usage patterns, such as which articles are
        read most. Where analytics providers are used, they process information according to their own privacy
        policies. The specific providers in use will be listed here: <Placeholder>Analytics providers</Placeholder>.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
    content: (
      <p>
        The website may rely on third-party services such as hosting, email delivery or embedded content, and may
        link to external websites. These services and websites have their own privacy practices, and we are not
        responsible for how they handle your information.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <p>
        We take reasonable technical and organisational measures to protect information against unauthorised access,
        loss or misuse. However, no method of transmission or storage over the internet is completely secure, and we
        cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <p>
        We keep personal information only for as long as it is needed for the purposes described in this policy,
        or as required by law. When it is no longer needed, we delete or anonymise it.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Ask us to correct or delete your information.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is based on consent, such as newsletters.</li>
        </ul>
        <p>To make a request, please contact us using the details below.</p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: (
      <p>
        The website is intended for a general professional audience and is not directed at children. We do not
        knowingly collect personal information from children. If you believe a child has provided us with personal
        information, please contact us so we can delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. Changes take effect when the updated policy is published
        on this page, and the &ldquo;Last updated&rdquo; date above will be revised.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <p>
        For questions about this policy or your information, please use our <Link href="/contact">contact page</Link>{" "}
        or email <Placeholder>Privacy contact email</Placeholder>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How we collect, use and protect information when you use DayTodayNews."
      lastUpdated={null}
      sections={sections}
    />
  );
}
