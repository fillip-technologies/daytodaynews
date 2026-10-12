import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "eeoc88be",
  api_key: process.env.CLOUDINARY_API_KEY || "526255767589351",
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  console.log("Testing Cloudinary credentials...");
  console.log("Cloud Name:", cloudinary.config().cloud_name);
  console.log("API Key:", cloudinary.config().api_key);
  console.log("Secret set:", Boolean(cloudinary.config().api_secret));

  const ping = await cloudinary.api.ping();
  console.log("✓ Cloudinary Ping:", ping);
}

main().catch((err) => {
  console.error("Cloudinary test error:", err);
  process.exit(1);
});
