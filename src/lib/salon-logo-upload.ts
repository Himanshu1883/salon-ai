import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function saveSalonLogo(
  file: File,
  salonId: string
): Promise<{ path?: string; error?: string }> {
  if (file.size === 0) {
    return { error: "Select an image to upload" };
  }

  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Logo uploads require Vercel Blob in production. Set BLOB_READ_WRITE_TOKEN or upload locally.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Logo must be 2MB or smaller" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Logo must be a JPG, PNG, or WebP image" };
  }

  const ext = EXTENSIONS[file.type] ?? (path.extname(file.name) || ".png");
  const filename = `${randomUUID()}${ext}`;
  const relativeDir = path.join("logos", salonId);
  const absoluteDir = path.join(process.cwd(), "uploads", relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);

  return { path: path.join(relativeDir, filename).replace(/\\/g, "/") };
}
