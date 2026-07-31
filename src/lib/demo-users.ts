import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";

export const DEMO_CREDENTIALS = [
  { email: "demo@salon.ai", password: "demo1234" },
  { email: "admin@salon.ai", password: "admin1234" },
  { email: "overdue@salon.ai", password: "demo1234" },
  { email: "test@abc.com", password: "abc@123" },
] as const;

/** Ensure known demo accounts use the documented passwords (bcrypt, cost 10). */
export async function syncDemoUserPasswords(prisma: PrismaClient) {
  for (const { email, password } of DEMO_CREDENTIALS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;

    const valid = await bcrypt.compare(password, user.password);
    if (valid) continue;

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    console.log(`Updated password for ${email}`);
  }
}
