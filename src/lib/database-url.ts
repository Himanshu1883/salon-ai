function isPostgresUrl(url: string | undefined): url is string {
  return (
    !!url &&
    (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

function isRailwayPrivateUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".railway.internal");
  } catch {
    return url.includes(".railway.internal");
  }
}

function isRailwayPublicUrl(url: string): boolean {
  return url.includes(".proxy.rlwy.net") || url.includes(".railway.app");
}

/** Use public Railway URL locally when configured. */
export function resolveDatabaseUrl(
  preferMigration = false
): string | undefined {
  const databaseUrl = process.env.DATABASE_URL;
  const publicUrl = process.env.DATABASE_PUBLIC_URL;
  const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

  if (!onRailway && isPostgresUrl(publicUrl)) {
    return publicUrl;
  }

  if (
    !onRailway &&
    isPostgresUrl(databaseUrl) &&
    isRailwayPrivateUrl(databaseUrl) &&
    isPostgresUrl(publicUrl)
  ) {
    return publicUrl;
  }

  const candidates = preferMigration
    ? [
        process.env.DIRECT_DATABASE_URL,
        process.env.POSTGRES_URL_NON_POOLING,
        process.env.DATABASE_PUBLIC_URL,
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
      ]
    : [
        process.env.POSTGRES_PRISMA_URL,
        process.env.POSTGRES_URL,
        process.env.DATABASE_PUBLIC_URL,
        process.env.DATABASE_URL,
      ];

  return candidates.filter(isPostgresUrl)[0];
}

export function requiresRailwaySsl(url: string): boolean {
  return isRailwayPublicUrl(url);
}

export { isPostgresUrl, isRailwayPrivateUrl, isRailwayPublicUrl };
