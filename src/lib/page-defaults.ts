import type { ItemValue, PageSchema, PageText, PageValues } from "./page-content";

// The fixed pages' fields and the words they shipped with. Hindi is empty
// where the page was English-only, which shows the English until an admin adds
// Hindi under Admin → Pages. In markdown fields, "[Something]" without a link
// marks a detail still to be filled in (company name, contact email…).

const t = (en: string, hi = ""): PageText => ({ en, hi });
const list = (...lines: string[]) => lines.map((line) => t(line));
const legalSection = (id: string, title: string, body: string): ItemValue => ({ id, title: t(title), body: t(body) });

const hero = (withHighlight: boolean) => ({
  title: "Top of the page",
  fields: [
    { key: "heroEyebrow", label: "Small label above the title", kind: "line" as const },
    { key: "heroTitle", label: "Title", kind: "line" as const },
    ...(withHighlight
      ? [{ key: "heroHighlight", label: "End of the title, in colour", kind: "line" as const }]
      : []),
    { key: "heroDescription", label: "Introduction", kind: "text" as const },
  ],
});

const legalSchema = (key: string, label: string, path: string): PageSchema => ({
  key,
  label,
  path,
  groups: [
    {
      title: "Page",
      fields: [
        { key: "title", label: "Title", kind: "line" },
        { key: "description", label: "Introduction", kind: "text" },
        { key: "lastUpdated", label: "Last updated", kind: "date", hint: "Leave empty to show a [Date] placeholder." },
      ],
    },
    {
      title: "Sections",
      fields: [
        {
          key: "sections",
          label: "Sections",
          kind: "items",
          max: 30,
          itemLabel: "Section",
          hint: "The id is the section's web address, e.g. #cookies; the footer's Cookie Policy link uses #cookies on the Privacy Policy.",
          fields: [
            { key: "title", label: "Heading", kind: "line" },
            { key: "id", label: "Id (web address after #)", kind: "id" },
            { key: "body", label: "Text", kind: "markdown" },
          ],
        },
      ],
    },
  ],
});

export const pageSchemas: PageSchema[] = [
  {
    key: "about",
    label: "About Us",
    path: "/about",
    groups: [
      hero(true),
      {
        title: "Why DayTodayNews",
        fields: [
          { key: "whyTitle", label: "Section title", kind: "line" },
          { key: "whyDescription", label: "Section introduction", kind: "text" },
          {
            key: "principles",
            label: "Cards",
            kind: "items",
            max: 6,
            itemLabel: "Card",
            fields: [
              { key: "title", label: "Title", kind: "line" },
              { key: "body", label: "Text", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Our coverage",
        fields: [
          { key: "coverageTitle", label: "Section title", kind: "line" },
          { key: "coverageDescription", label: "Section introduction", kind: "text" },
          {
            key: "coverageCategories",
            label: "Categories shown",
            kind: "categories",
            max: 16,
            hint: "Each card shows the category's name, description and icon from Admin → Categories.",
          },
        ],
      },
      {
        title: "Who it's for",
        fields: [
          { key: "buildersTitle", label: "Section title", kind: "line" },
          { key: "buildersDescription", label: "Section introduction", kind: "text" },
          { key: "audiences", label: "Audiences", kind: "list", max: 12, itemLabel: "Audience" },
        ],
      },
      {
        title: "Independent, practical & useful",
        fields: [
          { key: "independentTitle", label: "Section title", kind: "line" },
          { key: "independentBody", label: "Text", kind: "markdown" },
          { key: "commitments", label: "Commitments (with ticks)", kind: "list", max: 8, itemLabel: "Commitment" },
        ],
      },
      {
        title: "Team section",
        fields: [
          {
            key: "teamLinkLabel",
            label: "Link text before the company name",
            kind: "line",
            hint: "The company name, logo and description, and whether the section shows, are set in Admin → SEO → Brand & Credits.",
          },
        ],
      },
      {
        title: "Closing call to action",
        fields: [
          { key: "ctaTitle", label: "Title", kind: "line" },
          { key: "ctaDescription", label: "Text", kind: "text" },
          { key: "ctaPrimary", label: "Main button (opens Write for Us)", kind: "line" },
          { key: "ctaSecondary", label: "Second button (opens Contact)", kind: "line" },
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Contact Us",
    path: "/contact",
    groups: [
      hero(false),
      {
        title: "How can we help?",
        fields: [
          { key: "helpTitle", label: "Section title", kind: "line" },
          { key: "helpDescription", label: "Section introduction", kind: "text" },
          {
            key: "channels",
            label: "Cards",
            kind: "items",
            max: 6,
            itemLabel: "Card",
            fields: [
              { key: "title", label: "Title", kind: "line" },
              { key: "body", label: "Text", kind: "text" },
              { key: "subject", label: "Subject to pick in the form", kind: "line" },
            ],
          },
          { key: "subjectLabel", label: "Label before each card's subject", kind: "line" },
        ],
      },
      {
        title: "Message form",
        fields: [
          { key: "formTitle", label: "Form title", kind: "line" },
          { key: "formNote", label: "Line under the title", kind: "line" },
          {
            key: "formSubjects",
            label: "Subjects in the form's list",
            kind: "list",
            max: 12,
            itemLabel: "Subject",
            hint: "Field labels and messages of the form are in Admin → Site Text → forms.",
          },
        ],
      },
    ],
  },
  {
    key: "write-for-us",
    label: "Write for Us",
    path: "/write-for-us",
    groups: [
      hero(true),
      {
        title: "What we look for",
        fields: [
          { key: "lookForTitle", label: "Section title", kind: "line" },
          { key: "lookForDescription", label: "Section introduction", kind: "text" },
          {
            key: "topics",
            label: "Topics (also the choices in the pitch form)",
            kind: "items",
            max: 12,
            itemLabel: "Topic",
            fields: [
              { key: "label", label: "Topic", kind: "line" },
              { key: "description", label: "Short description", kind: "line" },
            ],
          },
        ],
      },
      {
        title: "Good submissions",
        fields: [
          { key: "goodTitle", label: "Section title", kind: "line" },
          {
            key: "goodItems",
            label: "Points",
            kind: "items",
            max: 8,
            itemLabel: "Point",
            fields: [
              { key: "title", label: "Title", kind: "line" },
              { key: "body", label: "Text", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Before you submit",
        fields: [
          { key: "beforeTitle", label: "Section title", kind: "line" },
          { key: "beforeDescription", label: "Section introduction", kind: "text" },
          { key: "beforeList", label: "Guidelines (with ticks)", kind: "list", max: 10, itemLabel: "Guideline" },
        ],
      },
      {
        title: "Submission process",
        fields: [
          { key: "processTitle", label: "Section title", kind: "line" },
          {
            key: "processSteps",
            label: "Steps",
            kind: "items",
            max: 8,
            itemLabel: "Step",
            fields: [
              { key: "title", label: "Step", kind: "line" },
              { key: "body", label: "Text", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Standards & policies",
        fields: [
          { key: "lengthTitle", label: "Length & originality: title", kind: "line" },
          { key: "lengthBody", label: "Length & originality: text", kind: "markdown" },
          { key: "authorTitle", label: "Author requirements: title", kind: "line" },
          { key: "authorList", label: "Author requirements", kind: "list", max: 10, itemLabel: "Requirement" },
          { key: "reviewTitle", label: "Editorial review: title", kind: "line" },
          { key: "reviewBody", label: "Editorial review: text", kind: "markdown" },
          { key: "sponsoredTitle", label: "Sponsored content policy: title", kind: "line" },
          { key: "sponsoredBody", label: "Sponsored content policy: text", kind: "markdown" },
        ],
      },
      {
        title: "Pitch form",
        fields: [
          { key: "pitchTitle", label: "Form title", kind: "line" },
          {
            key: "pitchNote",
            label: "Line under the title",
            kind: "line",
            hint: "Field labels and messages of the form are in Admin → Site Text → forms.",
          },
        ],
      },
    ],
  },
  {
    key: "advertise",
    label: "Advertise",
    path: "/advertise",
    groups: [
      hero(true),
      {
        title: "Ways to work with us",
        fields: [
          { key: "optionsTitle", label: "Section title", kind: "line" },
          { key: "optionsDescription", label: "Section introduction", kind: "text" },
          {
            key: "options",
            label: "Options (also the choices in the enquiry form)",
            kind: "items",
            max: 10,
            itemLabel: "Option",
            fields: [
              { key: "title", label: "Option", kind: "line" },
              { key: "body", label: "Text", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Audience",
        fields: [
          { key: "audienceTitle", label: "Section title", kind: "line" },
          { key: "audienceDescription", label: "Section introduction", kind: "text" },
          {
            key: "stats",
            label: "Statistics (add only verified numbers)",
            kind: "items",
            max: 6,
            itemLabel: "Statistic",
            fields: [
              { key: "value", label: "Number, e.g. 50,000+", kind: "line" },
              { key: "label", label: "What it measures, e.g. monthly readers", kind: "line" },
            ],
          },
        ],
      },
      {
        title: "Editorial disclosure",
        fields: [
          { key: "disclosureTitle", label: "Section title", kind: "line" },
          { key: "disclosureBody", label: "Text", kind: "markdown" },
        ],
      },
      {
        title: "Enquiry form & media kit",
        fields: [
          { key: "formTitle", label: "Form title", kind: "line" },
          { key: "formNote", label: "Line under the title", kind: "line" },
          { key: "budgets", label: "Budget ranges in the form", kind: "list", max: 8, itemLabel: "Range" },
          {
            key: "mediaKitUrl",
            label: "Media kit link (PDF), optional",
            kind: "line",
            hint: "A link to the media kit (https://…). The button is hidden while this is empty.",
          },
          { key: "mediaKitLabel", label: "Media kit button text", kind: "line" },
        ],
      },
    ],
  },
  {
    ...legalSchema("editorial-policy", "Editorial Policy", "/editorial-policy"),
  },
  legalSchema("privacy-policy", "Privacy Policy", "/privacy-policy"),
  legalSchema("terms", "Terms & Conditions", "/terms"),
  legalSchema("disclaimer", "Disclaimer", "/disclaimer"),
];

export const pageDefaults: Record<string, PageValues> = {
  about: {
    heroEyebrow: t("About DayTodayNews"),
    heroTitle: t("Technology insights for people"),
    heroHighlight: t("building what’s next."),
    heroDescription: t(
      "DayTodayNews covers practical technology: software development, AI and automation, business technology, startups and digital growth, written for the people who build and run modern teams.",
    ),
    whyTitle: t("Why DayTodayNews"),
    whyDescription: t("There is no shortage of technology news. What is harder to find is guidance you can act on."),
    principles: [
      {
        title: t("Practical over noise"),
        body: t(
          "We focus on what you can apply: use cases, trade-offs, costs and implementation steps, rather than headlines for their own sake.",
        ),
      },
      {
        title: t("Explained clearly"),
        body: t(
          "Complex topics like AI agents, architecture or outsourcing models are broken down in plain language, without unnecessary jargon.",
        ),
      },
      {
        title: t("Built for decisions"),
        body: t(
          "Articles are written to help readers compare options and choose confidently, whether that is a tool, a stack or a partner.",
        ),
      },
    ],
    coverageTitle: t("Explore Our Coverage"),
    coverageDescription: t("Seven areas, one goal: helping you make better technology decisions."),
    coverageCategories: ["ai-automation", "software", "development", "hiring-outsourcing", "business", "startups", "insights"],
    buildersTitle: t("Built for Builders"),
    buildersDescription: t(
      "Our content is written for people making technology decisions, whether they write the code, fund the product or lead the team.",
    ),
    audiences: list(
      "Founders",
      "Developers",
      "Technology teams",
      "Business leaders",
      "Marketers",
      "Technology decision-makers",
    ),
    independentTitle: t("Independent, Practical & Useful"),
    independentBody: t(
      "We choose topics based on what readers need to understand, not on what is loudest this week. Where we compare tools, platforms or service models, we try to explain the trade-offs honestly so you can judge what fits your situation.\n\nDayTodayNews is a growing publication. If you spot an error or think something could be clearer, we would genuinely like to hear from you.",
    ),
    commitments: list(
      "We aim to be accurate and to cite sources where they matter.",
      "We update articles when tools, prices or best practices change.",
      "Any sponsored or commercial content will be clearly labelled.",
    ),
    teamLinkLabel: t("Visit"),
    ctaTitle: t("Have an idea worth sharing?"),
    ctaDescription: t("We welcome practical, well-researched ideas from people who work with technology every day."),
    ctaPrimary: t("Write for Us"),
    ctaSecondary: t("Contact Us"),
  },
  contact: {
    heroEyebrow: t("Contact"),
    heroTitle: t("Let’s start a conversation."),
    heroDescription: t(
      "Whether you have feedback, a correction, a story idea or a partnership in mind, we would like to hear from you.",
    ),
    helpTitle: t("How can we help?"),
    helpDescription: t("Use the form and pick the subject that fits best, so your message reaches the right person."),
    channels: [
      {
        title: t("General Enquiries"),
        body: t("Questions about DayTodayNews, feedback on the site or anything else."),
        subject: t("General enquiry"),
      },
      {
        title: t("Editorial"),
        body: t("Corrections, article suggestions or questions about something we published."),
        subject: t("Editorial"),
      },
      {
        title: t("Partnerships"),
        body: t("Collaboration, sponsorship or other business opportunities."),
        subject: t("Partnerships"),
      },
    ],
    subjectLabel: t("Subject:"),
    formTitle: t("Send us a message"),
    formNote: t("All fields are required."),
    formSubjects: list("General enquiry", "Editorial", "Partnerships", "Other"),
  },
  "write-for-us": {
    heroEyebrow: t("Write for DayTodayNews"),
    heroTitle: t("Have an idea"),
    heroHighlight: t("worth sharing?"),
    heroDescription: t(
      "If you work with technology and know your subject well, we would love to hear your ideas. We are looking for practical, useful articles that help our readers make better decisions.",
    ),
    lookForTitle: t("What We Look For"),
    lookForDescription: t("Topics our readers care about most."),
    topics: [
      { label: t("AI & Automation"), description: t("AI agents, workflows, tools, costs and real business use cases") },
      { label: t("Software & IT"), description: t("Software development, SaaS, ERP, CRM, cloud, cybersecurity and APIs") },
      { label: t("Business Technology & Growth"), description: t("Digital transformation, automation, sales and marketing technology") },
      { label: t("Startups & Entrepreneurship"), description: t("SaaS models, MVPs, funding, product development and scaling") },
      { label: t("Industry Technology"), description: t("Technology in healthcare, education, manufacturing, finance and retail") },
      { label: t("Hardware & Emerging Technology"), description: t("IoT, networking, semiconductors, robotics and smart devices") },
      { label: t("Business Opportunities & Global Markets"), description: t("B2B opportunities, market entry, trade and procurement") },
    ],
    goodTitle: t("Good Submissions"),
    goodItems: [
      { title: t("Original and useful"), body: t("A fresh angle or first-hand experience readers can't find everywhere else.") },
      { title: t("Well researched"), body: t("Claims are accurate, current and supported by reliable sources.") },
      { title: t("Practical and actionable"), body: t("Readers finish with steps, frameworks or examples they can apply.") },
      { title: t("Clear and easy to understand"), body: t("Plain language, logical structure and no unnecessary jargon.") },
      { title: t("Relevant to our audience"), body: t("Written for technology and business readers making real decisions.") },
    ],
    beforeTitle: t("Before You Submit"),
    beforeDescription: t("Please check your pitch against these guidelines."),
    beforeList: list(
      "Original content only: not published elsewhere, including your own site.",
      "No plagiarism or AI-generated text passed off as original work.",
      "No excessive promotional content or unnatural links.",
      "Proper sources and attribution where necessary.",
      "Clear structure: headings, short paragraphs and examples.",
    ),
    processTitle: t("How Submission Works"),
    processSteps: [
      { title: t("Pitch an outline"), body: t("Send a working title and a short outline with the form below. No full draft yet.") },
      { title: t("Editorial feedback"), body: t("An editor replies within a week with a yes, a suggested angle, or a no with reasons.") },
      { title: t("Write the draft"), body: t("Write the full article following our structure: takeaways, examples, comparison, FAQs and sources.") },
      { title: t("Review & fact-check"), body: t("We edit for clarity, check facts and sources, and may ask for changes.") },
      { title: t("Publication"), body: t("We schedule the article, add internal links and share it with our readers and newsletter.") },
    ],
    lengthTitle: t("Article Length & Originality"),
    lengthBody: t(
      "Most guides run **1,500–2,500 words**; explainers 1,200–1,800 and comparisons 1,800–2,500. Length follows the topic: a complete answer matters more than a word count.\n\nArticles must be **original and unpublished** (including on your own site), written for our readers, and based on real experience. AI may help with research or editing, but the ideas, examples and final text must be yours and fact-checked.",
    ),
    authorTitle: t("Who Can Write for Us"),
    authorList: list(
      "Practitioners: consultants, founders, CTOs, architects, engineers and specialists.",
      "First-hand experience with the subject you write about.",
      "A real name and a short, verifiable professional bio.",
      "Disclosure of any commercial interest in the products you mention.",
    ),
    reviewTitle: t("Editorial Review"),
    reviewBody: t(
      "Every contribution is edited and fact-checked by our team before publishing. We may change headlines, structure and wording, add internal links, and remove promotional claims. Publication is never guaranteed, and accepted guest articles are labelled as guest contributions.",
    ),
    sponsoredTitle: t("Sponsored Content Policy"),
    sponsoredBody: t(
      "Paid placements are a separate product, described on our [Advertise](/advertise) page. Sponsored articles are clearly labelled, reviewed by our editors, and their links to the sponsor carry rel=\"sponsored\". We do not sell dofollow links or promise search rankings. Guest contributions are free and never include paid links.",
    ),
    pitchTitle: t("Pitch your idea"),
    pitchNote: t("Share a short outline first; there is no need to send a full draft."),
  },
  advertise: {
    heroEyebrow: t("Advertise with DayTodayNews"),
    heroTitle: t("Reach technology and business"),
    heroHighlight: t("decision-makers."),
    heroDescription: t(
      "Put your product, service or story in front of founders, CTOs, business owners and technology buyers who read DayTodayNews to make better decisions.",
    ),
    optionsTitle: t("Ways to Work With Us"),
    optionsDescription: t("Every paid placement is clearly labelled and reviewed by our editors."),
    options: [
      { title: t("Sponsored articles"), body: t("An in-depth article or case study about your product, written to our editorial standards and labelled as sponsored.") },
      { title: t("Display advertising"), body: t("Banner placements on the homepage, article pages, category pages and directories.") },
      { title: t("Newsletter sponsorship"), body: t("A clearly marked sponsor slot in our weekly brief to subscribers.") },
      { title: t("Brand features"), body: t("Founder interviews, expert interviews and brand stories for your audience.") },
      { title: t("Product launches"), body: t("Launch announcements and product demonstrations for new tools and services.") },
      { title: t("Sponsored company profiles"), body: t("A Featured listing in our business, software or startup directory.") },
    ],
    audienceTitle: t("Our Audience"),
    audienceDescription: t(
      "Readers come from the United States, the United Kingdom, Canada, Australia, the UAE and India, looking for practical guidance on AI, software and business technology.",
    ),
    stats: [],
    disclosureTitle: t("Editorial Disclosure"),
    disclosureBody: t(
      "Advertising never decides what we write. Sponsored articles are labelled **Sponsored**, name the sponsor and are reviewed by our editors. Links in paid placements carry rel=\"sponsored\", as Google requires: we do not sell dofollow links or promise rankings. Featured directory listings are marked as paid placements. Read our [editorial policy](/editorial-policy).",
    ),
    formTitle: t("Tell us about your campaign"),
    formNote: t("We reply within two working days with options and prices."),
    budgets: list("Under $500", "$500 – $2,000", "$2,000 – $5,000", "$5,000+", "Not sure yet"),
    mediaKitUrl: t(""),
    mediaKitLabel: t("Download the media kit"),
  },
  "editorial-policy": {
    title: t("Editorial Policy"),
    description: t(
      "How DayTodayNews chooses, researches, writes, reviews and corrects its articles, and how we keep editorial and commercial content apart.",
    ),
    lastUpdated: "",
    sections: [
      legalSection(
        "standards",
        "Our Standards",
        "We publish practical, accurate and original guidance on technology, AI, software and business. Every article answers a real question our readers have, explains trade-offs honestly, and helps them make a decision. We would rather publish one complete answer than several thin articles on the same topic.",
      ),
      legalSection(
        "research",
        "Research, Sources & Citations",
        "Facts, figures and prices come from primary or authoritative sources, which we link to. We do not invent statistics or search figures. Cost and pricing information is described as an estimate with its date and source, because prices change.",
      ),
      legalSection(
        "review",
        "Editorial Review & Fact-Checking",
        "Every article has an owner responsible for its accuracy and is reviewed by an editor before publishing. The editor checks facts, sources, claims and structure. Articles are marked with their publication date and, when meaningfully changed, the date they were updated.",
      ),
      legalSection(
        "ai",
        "Use of AI",
        "We may use AI tools to support research, outlines and editing. AI-generated text is never published without human review: a person checks every fact and adds the original analysis, examples and judgement.",
      ),
      legalSection(
        "corrections",
        "Corrections",
        "If we get something wrong, we fix it promptly and, for significant errors, say what changed. To report an error, please use our [contact page](/contact) and choose Editorial.",
      ),
      legalSection(
        "guest",
        "Guest Contributions",
        "We welcome articles from practitioners (see [Write for Us](/write-for-us)). Guest articles go through the same review as our own, are labelled as guest contributions, and contain no paid links.",
      ),
      legalSection(
        "sponsored",
        "Sponsored Content & Advertising",
        "Sponsored articles are clearly labelled, name the sponsor and are reviewed by our editors. Links in paid content carry rel=\"sponsored\". Advertisers do not influence our independent coverage, and we do not sell links for search rankings. See [Advertise](/advertise).",
      ),
      legalSection(
        "directory",
        "Directory Listings",
        "Companies list themselves in our directories; our team reviews each listing before it goes live. **Featured** listings are paid placements. **Verified** means our team has checked the company's details. A listing is not an endorsement.",
      ),
      legalSection(
        "independence",
        "Independence",
        "Editorial decisions, including which topics we cover and what we conclude, are made by the DayTodayNews editorial team. Commercial relationships, including with our technology partner, do not determine our editorial opinions.",
      ),
    ],
  },
  "privacy-policy": {
    title: t("Privacy Policy"),
    description: t("How we collect, use and protect information when you use DayTodayNews."),
    lastUpdated: "",
    sections: [
      legalSection(
        "introduction",
        "Introduction",
        "This Privacy Policy explains how DayTodayNews, operated by [Company legal name] (“we”, “us” or “our”), collects, uses and protects information when you visit our website or interact with our content.\n\nBy using the website, you acknowledge the practices described in this policy.",
      ),
      legalSection(
        "information-we-collect",
        "Information We Collect",
        "We may collect the following types of information:\n\n- **Information you provide**, such as your name, email address and message when you contact us, subscribe to updates or submit a contributor pitch.\n- **Technical information**, such as browser type, device information, pages visited and approximate location derived from your IP address.\n- **Usage information** about how you interact with the website, collected through cookies or similar technologies where enabled.",
      ),
      legalSection(
        "how-we-use-information",
        "How We Use Information",
        "We may use information to:\n\n- Operate, maintain and improve the website and its content.\n- Respond to enquiries, feedback and contributor submissions.\n- Send newsletters or updates you have chosen to receive.\n- Understand how the website is used so we can make it more useful.\n- Protect the website against misuse and comply with legal obligations.",
      ),
      legalSection(
        "cookies",
        "Cookies and Similar Technologies",
        "Cookies are small files stored on your device. We may use cookies and similar technologies to remember preferences, understand website usage and keep the website secure.\n\nYou can control or delete cookies through your browser settings. Disabling some cookies may affect how parts of the website work.",
      ),
      legalSection(
        "analytics",
        "Analytics",
        "We may use analytics tools to understand aggregated traffic and usage patterns, such as which articles are read most. Where analytics providers are used, they process information according to their own privacy policies. The specific providers in use will be listed here: [Analytics providers].",
      ),
      legalSection(
        "third-party-services",
        "Third-Party Services",
        "The website may rely on third-party services such as hosting, email delivery or embedded content, and may link to external websites. These services and websites have their own privacy practices, and we are not responsible for how they handle your information.",
      ),
      legalSection(
        "data-security",
        "Data Security",
        "We take reasonable technical and organisational measures to protect information against unauthorised access, loss or misuse. However, no method of transmission or storage over the internet is completely secure, and we cannot guarantee absolute security.",
      ),
      legalSection(
        "data-retention",
        "Data Retention",
        "We keep personal information only for as long as it is needed for the purposes described in this policy, or as required by law. When it is no longer needed, we delete or anonymise it.",
      ),
      legalSection(
        "your-rights",
        "Your Rights",
        "Depending on where you live, you may have the right to:\n\n- Access the personal information we hold about you.\n- Ask us to correct or delete your information.\n- Object to or restrict certain processing.\n- Withdraw consent where processing is based on consent, such as newsletters.\n\nTo make a request, please contact us using the details below.",
      ),
      legalSection(
        "childrens-privacy",
        "Children's Privacy",
        "The website is intended for a general professional audience and is not directed at children. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.",
      ),
      legalSection(
        "changes",
        "Changes to This Policy",
        "We may update this Privacy Policy from time to time. Changes take effect when the updated policy is published on this page, and the “Last updated” date above will be revised.",
      ),
      legalSection(
        "contact",
        "Contact Us",
        "For questions about this policy or your information, please use our [contact page](/contact) or email [Privacy contact email].",
      ),
    ],
  },
  terms: {
    title: t("Terms & Conditions"),
    description: t("The rules and conditions for using the DayTodayNews website and its content."),
    lastUpdated: "",
    sections: [
      legalSection(
        "introduction",
        "Introduction",
        "These Terms & Conditions apply to your use of the DayTodayNews website, operated by [Company legal name]. By accessing or using the website, you agree to these terms. If you do not agree, please do not use the website.",
      ),
      legalSection(
        "use-of-the-website",
        "Use of the Website",
        "You may use the website for lawful, personal and professional informational purposes. You agree not to:\n\n- Use the website in a way that breaks any applicable law or regulation.\n- Attempt to gain unauthorised access to the website, its servers or related systems.\n- Interfere with the website’s operation, for example through excessive automated requests.\n- Copy or republish content in bulk without permission.",
      ),
      legalSection(
        "intellectual-property",
        "Intellectual Property",
        "Unless stated otherwise, the content on this website, including articles, graphics, logos and design, is owned by or licensed to DayTodayNews. You may share links to our content and quote short excerpts with clear attribution and a link to the original article. Any other reuse requires our prior written permission.",
      ),
      legalSection(
        "user-content",
        "User Content",
        "If you send us content, such as a contributor pitch, feedback or a message, you confirm that you have the right to share it and that it does not infringe anyone else’s rights.\n\nTerms for published contributor articles, including ownership and licensing, will be agreed with each contributor before publication.",
      ),
      legalSection(
        "external-links",
        "External Links",
        "The website may contain links to third-party websites. These links are provided for convenience; we do not control those websites and are not responsible for their content, availability or practices.",
      ),
      legalSection(
        "accuracy",
        "Accuracy of Information",
        "We aim to keep content accurate and up to date, but technology, prices and best practices change quickly. Content is provided for general information and may not reflect the latest developments. See our [Disclaimer](/disclaimer) for more detail.",
      ),
      legalSection(
        "limitation-of-liability",
        "Limitation of Liability",
        "To the extent permitted by law, DayTodayNews is not liable for any loss or damage arising from your use of, or reliance on, the website or its content. The website is provided “as is” and “as available”, without warranties of any kind.",
      ),
      legalSection(
        "changes-to-the-website",
        "Changes to the Website",
        "We may update, change, suspend or remove any part of the website or its content at any time, without prior notice.",
      ),
      legalSection(
        "changes-to-these-terms",
        "Changes to These Terms",
        "We may revise these terms from time to time. The updated version applies from the date it is published on this page. Continuing to use the website after changes means you accept the revised terms.",
      ),
      legalSection(
        "governing-law",
        "Governing Law",
        "These terms are governed by the laws of [Governing jurisdiction]. Any disputes will be subject to the courts of that jurisdiction, unless applicable law requires otherwise.",
      ),
      legalSection(
        "contact",
        "Contact",
        "Questions about these terms can be sent through our [contact page](/contact) or to [Contact email].",
      ),
    ],
  },
  disclaimer: {
    title: t("Disclaimer"),
    description: t("How to read and use the information published on DayTodayNews."),
    lastUpdated: "",
    sections: [
      legalSection(
        "general-information",
        "General Information",
        "The content published on DayTodayNews is provided for general informational and educational purposes only. It is intended to help readers understand technology topics and the options available to them.",
      ),
      legalSection(
        "no-professional-advice",
        "No Professional Advice",
        "Our articles do not constitute professional advice of any kind, including technical, legal, financial, tax or business advice, and should not automatically be treated as such.\n\nEvery organisation’s situation is different. Before making important decisions, such as choosing a vendor, investing in a technology or changing how your team works, consider consulting a qualified professional who understands your circumstances.",
      ),
      legalSection(
        "accuracy",
        "Accuracy of Information",
        "We work to keep our content accurate and current, but we make no guarantees about its completeness, reliability or suitability. Tools, pricing, regulations and best practices change frequently, so some information may become outdated after publication.",
      ),
      legalSection(
        "external-links",
        "External Links",
        "Articles may link to external websites, tools or resources. We do not control and are not responsible for the content, accuracy or practices of these third parties. A link does not imply endorsement.",
      ),
      legalSection(
        "commercial-disclosure",
        "Affiliate / Commercial Disclosure",
        "DayTodayNews may, in the future, include affiliate links or other commercial arrangements. Where content includes such a relationship, it will be clearly disclosed within that content.\n\nDetails of any current arrangements will be listed here: [Commercial arrangements, if any].",
      ),
      legalSection(
        "advertising",
        "Advertising",
        "The website may display advertising or sponsored content. Any sponsored content will be clearly labelled so it can be distinguished from editorial content.",
      ),
      legalSection(
        "editorial-independence",
        "Editorial Independence",
        "Editorial decisions, including which topics we cover and what we conclude, are made by the DayTodayNews editorial team. Commercial relationships, where they exist, do not determine our editorial opinions.",
      ),
      legalSection(
        "limitation-of-liability",
        "Limitation of Liability",
        "To the extent permitted by law, DayTodayNews and [Company legal name] are not liable for any loss or damage resulting from the use of, or reliance on, information published on this website. See our [Terms & Conditions](/terms) for more detail.",
      ),
      legalSection(
        "changes",
        "Changes to This Disclaimer",
        "We may update this disclaimer from time to time. The latest version will always be available on this page.",
      ),
      legalSection(
        "contact",
        "Contact",
        "If you have questions about this disclaimer or spot something that needs correcting, please use our [contact page](/contact).",
      ),
    ],
  },
};

export const getPageSchema = (key: string) => pageSchemas.find((schema) => schema.key === key);
