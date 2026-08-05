import fs from "node:fs";
import path from "node:path";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

function reorder(code) {
  const useClient = /^["']use client["'];\r?\n/.test(code);
  let body = code.replace(/^["']use client["'];\r?\n+/, "");

  const imports = [];
  const consts = [];
  const other = [];

  // Parse loosely by lines, supporting multi-line imports
  const lines = body.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("import ")) {
      let block = line;
      while (!block.includes(";") && i + 1 < lines.length) {
        i += 1;
        block += "\n" + lines[i];
      }
      imports.push(block);
      i += 1;
      continue;
    }

    if (/^const \w+ = "\/gotix\/[^"]+";\s*$/.test(trimmed)) {
      consts.push(trimmed);
      i += 1;
      // skip following blank
      continue;
    }

    // comment about missing asset next to consts - keep with other
    other.push(line);
    i += 1;
  }

  // Trim leading blanks from other
  while (other.length && other[0].trim() === "") other.shift();

  let out = "";
  if (useClient) out += '"use client";\n\n';
  if (imports.length) out += imports.join("\n") + "\n";
  if (consts.length) out += (imports.length ? "\n" : "") + consts.join("\n") + "\n";
  if (other.length) out += (imports.length || consts.length ? "\n" : "") + other.join("\n");
  if (!out.endsWith("\n")) out += "\n";
  return out;
}

const root = path.resolve("src/components/site");
for (const file of walk(root)) {
  const before = fs.readFileSync(file, "utf8");
  if (!before.includes("/gotix/") && !before.includes("use client")) continue;
  const after = reorder(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    console.log("reordered", path.relative(process.cwd(), file));
  }
}
