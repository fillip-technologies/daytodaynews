import "dotenv/config";
import { createMailTransporter, defaultSender } from "../src/lib/mail";

async function verifySmtp() {
  console.log("📨 Verifying SMTP configuration...");
  console.log(`  Host:   ${process.env.MAIL_HOST}`);
  console.log(`  Port:   ${process.env.MAIL_PORT}`);
  console.log(`  User:   ${process.env.MAIL_USERNAME}`);
  console.log(`  Sender: ${defaultSender}`);

  const transporter = createMailTransporter();

  try {
    console.log("Connecting to SMTP server...");
    await transporter.verify();
    console.log("✅ SMTP Server connection and authentication SUCCESSFUL!");
  } catch (error) {
    console.error("❌ SMTP Verification failed:", error);
    process.exit(1);
  }
}

verifySmtp();
