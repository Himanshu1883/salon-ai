import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MIME_FROM_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function resolveImageMime(file: File): string | null {
  const normalizedType = file.type?.toLowerCase();
  if (normalizedType === "image/jpg") return "image/jpeg";
  if (normalizedType && Object.hasOwn(EXTENSIONS, normalizedType)) {
    return normalizedType;
  }

  const ext = path.extname(file.name).toLowerCase();
  return MIME_FROM_EXT[ext] ?? null;
}

async function saveToLocalDisk(
  buffer: Buffer,
  salonId: string,
  ext: string
): Promise<{ path?: string; error?: string }> {
  const filename = `${randomUUID()}${ext}`;
  const relativeDir = path.join("logos", salonId);
  const absoluteDir = path.join(process.cwd(), "uploads", relativeDir);

  try {
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(path.join(absoluteDir, filename), buffer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save logo file";
    return { error: `Logo upload failed: ${message}` };
  }

  return { path: path.join(relativeDir, filename).replace(/\\/g, "/") };
}

function shouldRetryWithPublic(message: string) {
  return /cannot use private access on a public store/i.test(message);
}

async function saveToBlob(
  buffer: Buffer,
  salonId: string,
  ext: string,
  contentType: string
): Promise<{ path?: string; error?: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return {
      error:
        "Logo uploads require Vercel Blob in production. Set BLOB_READ_WRITE_TOKEN in your environment.",
    };
  }

  const pathname = `logos/${salonId}/${randomUUID()}${ext}`;
  const attempts = ["private", "public"] as const;

  let lastMessage = "Could not upload to storage";
  for (const access of attempts) {
    try {
      await put(pathname, buffer, {
        access,
        contentType,
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { path: pathname };
    } catch (error) {
      lastMessage =
        error instanceof Error ? error.message : "Could not upload to storage";
      if (access === "private" && shouldRetryWithPublic(lastMessage)) {
        continue;
      }
      break;
    }
  }

  return { error: `Logo upload failed: ${lastMessage}` };
}

export async function saveSalonLogo(
  file: File,
  salonId: string
): Promise<{ path?: string; error?: string }> {
  if (file.size === 0) {
    return { error: "Select an image to upload" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Logo must be 2MB or smaller" };
  }

  const mime = resolveImageMime(file);
  if (!mime) {
    return { error: "Logo must be a JPG, PNG, or WebP image" };
  }

  const ext = EXTENSIONS[mime] ?? (path.extname(file.name) || ".png");
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToBlob(buffer, salonId, ext, mime);
  }

  return saveToLocalDisk(buffer, salonId, ext);
}
