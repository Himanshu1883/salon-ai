import { readFile, stat } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function readFromDisk(relativePath: string) {
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const absolutePath = path.join(uploadsRoot, relativePath);
  const resolved = path.resolve(absolutePath);
  if (!resolved.startsWith(path.resolve(uploadsRoot))) {
    return null;
  }

  try {
    await stat(resolved);
  } catch {
    return null;
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const buffer = await readFile(resolved);
  return { buffer, contentType };
}

async function readFromBlob(pathname: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  for (const access of ["private", "public"] as const) {
    try {
      const result = await get(pathname, { access, token });
      if (result?.statusCode === 200 && result.stream) {
        return {
          stream: result.stream,
          contentType:
            result.blob.contentType ??
            CONTENT_TYPES[path.extname(pathname).toLowerCase()] ??
            "application/octet-stream",
        };
      }
    } catch {
      // Try the other access mode; private stores reject public reads.
    }
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments?.length || segments[0] !== "logos") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relativePath = segments.join("/");
  const local = await readFromDisk(relativePath);
  if (local) {
    return new NextResponse(local.buffer, {
      headers: {
        "Content-Type": local.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  const blob = await readFromBlob(relativePath);
  if (blob) {
    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type": blob.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
