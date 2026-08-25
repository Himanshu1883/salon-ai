import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { resolveDatabaseUrl, requiresRailwaySsl } from "../src/lib/database-url";
import { prisma } from "../src/lib/prisma";

async function main() {
  const url = resolveDatabaseUrl(false);
  console.log("resolved host:", url ? new URL(url).hostname : "none");

  const user = await prisma.user.findUnique({
    where: { email: "admin@salon.ai" },
    select: { id: true, email: true, password: true, updatedAt: true },
  });

  if (!user) {
    console.log("prisma: user NOT FOUND");
    return;
  }

  console.log("prisma user id:", user.id);
  console.log("password hash prefix:", user.password.slice(0, 29));
  console.log("hash length:", user.password.length);
  console.log("admin1234 valid:", await bcrypt.compare("admin1234", user.password));

  if (!url) return;

  const pool = new Pool({
    connectionString: url,
    ...(requiresRailwaySsl(url) ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  const raw = await pool.query<{ password: string; id: string }>(
    `SELECT id, password FROM "User" WHERE email = $1 LIMIT 1`,
    ["admin@salon.ai"]
  );
  await pool.end();

  const row = raw.rows[0];
  if (!row) {
    console.log("raw sql: user NOT FOUND");
    return;
  }

  console.log("raw sql id:", row.id);
  console.log("same id as prisma:", row.id === user.id);
  console.log("same hash as prisma:", row.password === user.password);
  console.log("raw admin1234 valid:", await bcrypt.compare("admin1234", row.password));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
