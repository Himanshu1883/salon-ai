import { auth } from "@/lib/auth";
import { readFile, stat } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.salonId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: segments } = await params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowedPrefixes = ["bills", "documents", "consultations", "hairstyles"];
  if (!allowedPrefixes.includes(segments[0])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const salonIdFromPath = segments[1];
  if (salonIdFromPath !== session.user.salonId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const relativePath = segments.join("/");
  const absolutePath = path.join(process.cwd(), "uploads", relativePath);

  const uploadsRoot = path.join(process.cwd(), "uploads");
  const resolved = path.resolve(absolutePath);
  if (!resolved.startsWith(path.resolve(uploadsRoot))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await stat(resolved);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const buffer = await readFile(resolved);
  const filename = path.basename(resolved);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
