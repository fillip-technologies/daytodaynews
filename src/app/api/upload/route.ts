import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { ALLOWED_IMAGE_FORMATS, imageUploadError } from "@/lib/image-upload";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const invalid = imageUploadError(file);
    if (invalid || !(file instanceof File)) {
      return NextResponse.json({ error: invalid ?? "No file provided" }, { status: 400 });
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret || apiSecret.trim() === "" || apiSecret.includes("<your_api_secret>")) {
      return NextResponse.json(
        {
          error:
            "Cloudinary API Secret is not configured in .env. Please add CLOUDINARY_API_SECRET to your .env file.",
        },
        { status: 500 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "daytodaynews/articles",
      resource_type: "image",
      allowed_formats: ALLOWED_IMAGE_FORMATS,
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
