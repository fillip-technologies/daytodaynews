// Rules for staff image uploads, shared by the upload actions and /api/upload.
// SVG is excluded: it can carry scripts. Cloudinary re-checks the real file
// format against ALLOWED_IMAGE_FORMATS, so a renamed file can't slip through.

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const ALLOWED_IMAGE_FORMATS = ["jpg", "png", "webp", "gif", "avif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Why `file` can't be uploaded, or null when it can. */
export function imageUploadError(file: unknown): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return "Please select a valid image file to upload.";
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, GIF or AVIF images are supported.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image size exceeds 10MB limit.";
  }
  return null;
}
