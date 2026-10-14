import nodemailer from "nodemailer";

export function createMailTransporter() {
  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.MAIL_PORT || "587", 10);
  const secure = port === 465;
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export const defaultSender = `"${process.env.MAIL_FROM_NAME || "DayTodayNews"}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || "developer4.filliptechnologies@gmail.com"}>`;

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, text, html, replyTo }: SendEmailOptions) {
  try {
    const transporter = createMailTransporter();
    const info = await transporter.sendMail({
      from: defaultSender,
      to,
      subject,
      text,
      html,
      replyTo,
    });
    console.log(`✉️ Email sent to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Escapes text for safe use inside email HTML (reader input is untrusted). */
function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One-line text for email subjects: no line breaks, length capped. */
function subjectLine(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, 200);
}

/**
 * Sends notification to admin and confirmation to user when a contact form is submitted.
 */
export async function sendContactNotification(submission: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.MAIL_FROM_ADDRESS || "developer4.filliptechnologies@gmail.com";

  // 1. Alert Admin
  await sendEmail({
    to: adminEmail,
    subject: subjectLine(`[DayTodayNews Contact] ${submission.subject} from ${submission.name}`),
    replyTo: submission.email,
    text: `New contact submission received:\n\nName: ${submission.name}\nEmail: ${submission.email}\nSubject: ${submission.subject}\n\nMessage:\n${submission.message}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">New Contact Message</h2>
        <p><strong>From:</strong> ${esc(submission.name)} (&lt;<a href="mailto:${esc(submission.email)}">${esc(submission.email)}</a>&gt;)</p>
        <p><strong>Subject:</strong> ${esc(submission.subject)}</p>
        <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
          <p style="white-space: pre-wrap; margin: 0;">${esc(submission.message)}</p>
        </div>
      </div>
    `,
  });

  // 2. Confirmation to User
  await sendEmail({
    to: submission.email,
    subject: subjectLine(`Thanks for contacting DayTodayNews: ${submission.subject}`),
    text: `Hi ${submission.name},\n\nThank you for reaching out. We have received your message regarding "${submission.subject}" and our team will get back to you shortly.\n\nBest regards,\nThe DayTodayNews Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a;">Thanks for reaching out!</h2>
        <p>Hi ${esc(submission.name)},</p>
        <p>We've received your message regarding <strong>${esc(submission.subject)}</strong>. Our editorial team will review it and get back to you shortly.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">DayTodayNews Editorial & Operations</p>
      </div>
    `,
  });
}

/**
 * Sends notification to admin and confirmation to user when a contributor pitch is submitted.
 */
export async function sendContributorNotification(pitch: {
  name: string;
  email: string;
  topic: string;
  idea: string;
  message: string;
  portfolio?: string | null;
}) {
  const adminEmail = process.env.MAIL_FROM_ADDRESS || "developer4.filliptechnologies@gmail.com";
  // Only real web links become clickable; anything else (e.g. javascript:) is dropped.
  const portfolio = pitch.portfolio && /^https?:\/\//i.test(pitch.portfolio) ? pitch.portfolio : null;

  // Alert Admin
  await sendEmail({
    to: adminEmail,
    subject: subjectLine(`[Contributor Pitch] "${pitch.idea}" by ${pitch.name}`),
    replyTo: pitch.email,
    text: `New article idea submitted:\n\nName: ${pitch.name}\nEmail: ${pitch.email}\nTopic: ${pitch.topic}\nPortfolio: ${portfolio || "N/A"}\nIdea: ${pitch.idea}\n\nOutline:\n${pitch.message}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a;">New Contributor Pitch</h2>
        <p><strong>Contributor:</strong> ${esc(pitch.name)} (&lt;<a href="mailto:${esc(pitch.email)}">${esc(pitch.email)}</a>&gt;)</p>
        <p><strong>Topic:</strong> ${esc(pitch.topic)}</p>
        <p><strong>Working Title / Idea:</strong> ${esc(pitch.idea)}</p>
        ${portfolio ? `<p><strong>Portfolio / URL:</strong> <a href="${esc(portfolio)}">${esc(portfolio)}</a></p>` : ""}
        <div style="background: #f8fafc; border-left: 4px solid #ec4899; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
          <p style="white-space: pre-wrap; margin: 0;">${esc(pitch.message)}</p>
        </div>
      </div>
    `,
  });

  // Confirmation to Contributor
  await sendEmail({
    to: pitch.email,
    subject: subjectLine(`We received your pitch: "${pitch.idea}"`),
    text: `Hi ${pitch.name},\n\nThank you for pitching "${pitch.idea}" to DayTodayNews. Our editorial team reviews contributor submissions weekly and will follow up with feedback.\n\nBest,\nThe DayTodayNews Editorial Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a;">Thanks for your pitch!</h2>
        <p>Hi ${esc(pitch.name)},</p>
        <p>Thank you for submitting your pitch: <strong>"${esc(pitch.idea)}"</strong> in the <em>${esc(pitch.topic)}</em> category.</p>
        <p>Our editorial team reviews story outlines weekly and will follow up if it's a good fit for our publishing schedule.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">DayTodayNews Editorial Team</p>
      </div>
    `,
  });
}

/**
 * Sends a welcome email when a user subscribes to the newsletter.
 */
export async function sendNewsletterWelcome(email: string) {
  return sendEmail({
    to: email,
    subject: `Welcome to the DayTodayNews Weekly Brief!`,
    text: `Welcome to DayTodayNews!\n\nYou're now subscribed to our weekly brief covering artificial intelligence, software architecture, modern engineering, and startup growth.\n\nExpect our next issue this Friday.\n\nBest,\nDayTodayNews Editorial Team`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; line-height: 1.6; color: #1e293b; max-width: 560px;">
        <h2 style="color: #0f172a; margin-top: 0;">Stay ahead of what's next.</h2>
        <p>You're now subscribed to the <strong>DayTodayNews Weekly Brief</strong>.</p>
        <p>Every Friday, we deliver curated analysis on artificial intelligence, software development, cloud infrastructure, and the technology trends shaping modern teams.</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            Free, weekly, and practical. You can update your preferences or unsubscribe at any time.
          </p>
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">The DayTodayNews Team</p>
      </div>
    `,
  });
}
