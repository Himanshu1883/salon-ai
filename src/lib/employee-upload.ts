import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
};

export async function saveEmployeeDocument(
  file: File,
  salonId: string,
  employeeId: string
): Promise<{ path?: string; error?: string }> {
  if (file.size === 0) {
    return {};
  }

  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Document uploads require Vercel Blob in production. Set BLOB_READ_WRITE_TOKEN or upload locally.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Document must be 5MB or smaller" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Document must be a PDF, JPG, or PNG file" };
  }

  const ext =
    EXTENSIONS[file.type] ?? (path.extname(file.name) || ".bin");
  const filename = `${randomUUID()}${ext}`;
  const relativeDir = path.join("documents", salonId, employeeId);
  const absoluteDir = path.join(process.cwd(), "uploads", relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);

  return { path: path.join(relativeDir, filename).replace(/\\/g, "/") };
}
