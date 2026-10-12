"use server";

import { getCurrentUser } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export type UploadResult = {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
};

export async function uploadCoverImage(formData: FormData): Promise<UploadResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Staff editorial access required to upload images." };
    }

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "Please select a valid image file to upload." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files (JPEG, PNG, WebP, GIF, SVG) are supported." };
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Image size exceeds 10MB limit." };
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret || apiSecret.trim() === "" || apiSecret.includes("<your_api_secret>")) {
      return {
        success: false,
        error:
          "Cloudinary API Secret is not configured in .env. Please set CLOUDINARY_API_SECRET with your Cloudinary secret key.",
      };
    }

    // Convert file to Buffer and Data URI for Cloudinary uploader
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "daytodaynews/articles",
      resource_type: "image",
      overwrite: false,
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image to Cloudinary.",
    };
  }
}

export async function uploadArticleImage(formData: FormData): Promise<UploadResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Staff editorial access required to upload images." };
    }

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: "Please select a valid image file to upload." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files (JPEG, PNG, WebP, GIF, SVG) are supported." };
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Image size exceeds 10MB limit." };
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret || apiSecret.trim() === "" || apiSecret.includes("<your_api_secret>")) {
      return {
        success: false,
        error:
          "Cloudinary API Secret is not configured in .env. Please set CLOUDINARY_API_SECRET with your Cloudinary secret key.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "daytodaynews/articles/inline",
      resource_type: "image",
      overwrite: false,
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary inline upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image to Cloudinary.",
    };
  }
}

export async function deleteCloudinaryImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized." };
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      return { success: false, error: "CLOUDINARY_API_SECRET is missing." };
    }

    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return { success: false, error: String(error) };
  }
}
