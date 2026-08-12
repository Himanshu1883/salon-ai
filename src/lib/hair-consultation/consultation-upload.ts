import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function consultationPhotoUrl(storagePath: string) {
  return `/api/uploads/${storagePath.replace(/\\/g, "/")}`;
}

export async function saveConsultationPhoto(
  file: File | Buffer,
  salonId: string,
  customerId: string,
  consultationId: string,
  suffix = "photo",
  mimeType = "image/jpeg"
): Promise<{ path?: string; error?: string }> {
  if (process.env.VERCEL === "1" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Photo uploads require storage in production. Set BLOB_READ_WRITE_TOKEN or upload locally.",
    };
  }

  let buffer: Buffer;
  let type = mimeType;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    if (file.size === 0) return { error: "Empty file" };
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Photo must be 8MB or smaller" };
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return { error: "Photo must be JPG, PNG, or WebP" };
    }
    type = file.type;
    buffer = Buffer.from(await file.arrayBuffer());
  }

  const ext = EXTENSIONS[type] ?? ".jpg";
  const filename = `${suffix}-${randomUUID()}${ext}`;
  const relativeDir = path.join(
    "consultations",
    salonId,
    customerId,
    consultationId
  );
  const absoluteDir = path.join(process.cwd(), "uploads", relativeDir);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), buffer);

  return {
    path: path.join(relativeDir, filename).replace(/\\/g, "/"),
  };
}

export async function saveConsultationPhotoBase64(
  base64: string,
  salonId: string,
  customerId: string,
  consultationId: string,
  suffix: string
): Promise<{ path?: string; error?: string }> {
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  return saveConsultationPhoto(
    buffer,
    salonId,
    customerId,
    consultationId,
    suffix,
    "image/png"
  );
}
