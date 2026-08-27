export function getSalonLogoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `/api/public/salon-logo/${path}`;
}

export function formatSalonAddress(salon: {
  address?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}): string | null {
  if (salon.address?.trim()) {
    return salon.address.trim();
  }

  const line1 = salon.addressLine1?.trim();
  const city = salon.city?.trim();
  const state = salon.state?.trim();
  const pincode = salon.pincode?.trim();

  const locality = [city, state].filter(Boolean).join(", ");
  const line2 = [locality, pincode].filter(Boolean).join(" ").trim();

  if (line1 && line2) return `${line1}, ${line2}`;
  if (line1) return line1;
  if (line2) return line2;

  return null;
}

export function formatSalonPhone(
  businessPhone?: string | null,
  phone?: string | null
): string | null {
  const value = businessPhone?.trim() || phone?.trim();
  return value || null;
}
