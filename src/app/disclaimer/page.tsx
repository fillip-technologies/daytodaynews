import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, Placeholder, type LegalSection } from "@/components/static/LegalPageLayout";

export const metadata: Metadata = {
  title: "Disclaimer | DayTodayNews",
  description: "Important information about how to use the content published on DayTodayNews.",
  alternates: { canonical: "/disclaimer" },
};

const sections: LegalSection[] = [
  {
    id: "general-information",
    title: "General Information",
    content: (
      <p>
        The content published on DayTodayNews is provided for general informational and educational purposes only.
        It is intended to help readers understand technology topics and the options available to them.
      </p>
    ),
  },
  {
    id: "no-professional-advice",
    title: "No Professional Advice",
    content: (
      <>
        <p>
          Our articles do not constitute professional advice of any kind, including technical, legal, financial,
          tax or business advice, and should not automatically be treated as such.
        </p>
        <p>
          Every organisation&rsquo;s situation is different. Before making important decisions, such as choosing a
          vendor, investing in a technology or changing how your team works, consider consulting a qualified
          professional who understands your circumstances.
        </p>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy of Information",
    content: (
      <p>
        We work to keep our content accurate and current, but we make no guarantees about its completeness,
        reliability or suitability. Tools, pricing, regulations and best practices change frequently, so some
        information may become outdated after publication.
      </p>
    ),
  },
  {
    id: "external-links",
    title: "External Links",
    content: (
      <p>
        Articles may link to external websites, tools or resources. We do not control and are not responsible for
        the content, accuracy or practices of these third parties. A link does not imply endorsement.
      </p>
    ),
  },
  {
    id: "commercial-disclosure",
    title: "Affiliate / Commercial Disclosure",
    content: (
      <>
        <p>
          DayTodayNews may, in the future, include affiliate links or other commercial arrangements. Where content
          includes such a relationship, it will be clearly disclosed within that content.
        </p>
        <p>
          Details of any current arrangements will be listed here:{" "}
          <Placeholder>Commercial arrangements, if any</Placeholder>.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising",
    content: (
      <p>
        The website may display advertising or sponsored content. Any sponsored content will be clearly labelled
        so it can be distinguished from editorial content.
      </p>
    ),
  },
  {
    id: "editorial-independence",
    title: "Editorial Independence",
    content: (
      <p>
        Editorial decisions, including which topics we cover and what we conclude, are made by the DayTodayNews
        editorial team. Commercial relationships, where they exist, do not determine our editorial opinions.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the extent permitted by law, DayTodayNews and <Placeholder>Company legal name</Placeholder> are not liable
        for any loss or damage resulting from the use of, or reliance on, information published on this website.
        See our <Link href="/terms">Terms &amp; Conditions</Link> for more detail.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Disclaimer",
    content: (
      <p>
        We may update this disclaimer from time to time. The latest version will always be available on this page.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        If you have questions about this disclaimer or spot something that needs correcting, please use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      description="How to read and use the information published on DayTodayNews."
      lastUpdated={null}
      sections={sections}
    />
  );
}
