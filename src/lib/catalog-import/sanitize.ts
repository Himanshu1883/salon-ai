const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAGS = /<[^>]*>/g;

export function sanitizeImportText(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(TAGS, "").replace(CONTROL_CHARS, "").replace(/\u00a0/g, " ").trim();
}

export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, "");
}

export function safeFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "upload";
  return collapseWhitespace(base.replace(/[^\w.\- ()[\]]+/g, "_")).slice(0, 180) || "upload";
}
