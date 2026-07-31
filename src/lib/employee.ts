export type EmployeeOtherDocument = {
  name: string;
  url: string;
};

export function parseOtherDocuments(raw: string | null | undefined): EmployeeOtherDocument[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is EmployeeOtherDocument =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as EmployeeOtherDocument).name === "string" &&
        typeof (item as EmployeeOtherDocument).url === "string"
    );
  } catch {
    return [];
  }
}

export function getEmployeeDocumentUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api/uploads/${path}`;
}

export function maskAadhar(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function maskPan(value: string | null | undefined): string {
  if (!value) return "—";
  const normalized = value.toUpperCase();
  if (normalized.length < 4) return "****";
  return `${"X".repeat(normalized.length - 4)}${normalized.slice(-4)}`;
}

export function formatDocumentLabel(path: string): string {
  const filename = path.split("/").pop() ?? path;
  return filename.replace(/^[a-f0-9-]{36}\./i, "document.");
}
