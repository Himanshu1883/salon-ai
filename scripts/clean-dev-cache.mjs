import { rmSync } from "node:fs";
import path from "node:path";

const targets = [path.join(process.cwd(), ".next")];

for (const target of targets) {
  try {
    rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  } catch (error) {
    console.warn(`Could not remove ${target}:`, error);
  }
}
