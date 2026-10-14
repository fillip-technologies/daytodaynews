import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, Placeholder, type LegalSection } from "@/components/static/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | DayTodayNews",
  description: "The terms that apply when you use the DayTodayNews website and its content.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <p>
        These Terms &amp; Conditions apply to your use of the DayTodayNews website, operated by{" "}
        <Placeholder>Company legal name</Placeholder>. By accessing or using the website, you agree to these terms.
        If you do not agree, please do not use the website.
      </p>
    ),
  },
  {
    id: "use-of-the-website",
    title: "Use of the Website",
    content: (
      <>
        <p>You may use the website for lawful, personal and professional informational purposes. You agree not to:</p>
        <ul>
          <li>Use the website in a way that breaks any applicable law or regulation.</li>
          <li>Attempt to gain unauthorised access to the website, its servers or related systems.</li>
          <li>Interfere with the website&rsquo;s operation, for example through excessive automated requests.</li>
          <li>Copy or republish content in bulk without permission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p>
        Unless stated otherwise, the content on this website, including articles, graphics, logos and design, is
        owned by or licensed to DayTodayNews. You may share links to our content and quote short excerpts with clear
        attribution and a link to the original article. Any other reuse requires our prior written permission.
      </p>
    ),
  },
  {
    id: "user-content",
    title: "User Content",
    content: (
      <>
        <p>
          If you send us content, such as a contributor pitch, feedback or a message, you confirm that you have the
          right to share it and that it does not infringe anyone else&rsquo;s rights.
        </p>
        <p>
          Terms for published contributor articles, including ownership and licensing, will be agreed with each
          contributor before publication.
        </p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "External Links",
    content: (
      <p>
        The website may contain links to third-party websites. These links are provided for convenience; we do not
        control those websites and are not responsible for their content, availability or practices.
      </p>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy of Information",
    content: (
      <p>
        We aim to keep content accurate and up to date, but technology, prices and best practices change quickly.
        Content is provided for general information and may not reflect the latest developments. See our{" "}
        <Link href="/disclaimer">Disclaimer</Link> for more detail.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the extent permitted by law, DayTodayNews is not liable for any loss or damage arising from your use of,
        or reliance on, the website or its content. The website is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;, without warranties of any kind.
      </p>
    ),
  },
  {
    id: "changes-to-the-website",
    title: "Changes to the Website",
    content: (
      <p>
        We may update, change, suspend or remove any part of the website or its content at any time, without prior
        notice.
      </p>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "Changes to These Terms",
    content: (
      <p>
        We may revise these terms from time to time. The updated version applies from the date it is published on
        this page. Continuing to use the website after changes means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: (
      <p>
        These terms are governed by the laws of <Placeholder>Governing jurisdiction</Placeholder>. Any disputes will
        be subject to the courts of that jurisdiction, unless applicable law requires otherwise.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about these terms can be sent through our <Link href="/contact">contact page</Link> or to{" "}
        <Placeholder>Contact email</Placeholder>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      description="The rules and conditions for using the DayTodayNews website and its content."
      lastUpdated={null}
      sections={sections}
    />
  );
}
