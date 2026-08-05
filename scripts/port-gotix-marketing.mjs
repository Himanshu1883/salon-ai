/**
 * Ports marketing-redesign (TanStack) into the Next.js App Router.
 * Safe to re-run; overwrites generated files with UTF-8.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "marketing-redesign");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function copyDir(from, to) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function transformTsx(code, { isPage = false } = {}) {
  let out = code;

  out = out.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']@tanstack\/react-router["'];?\r?\n?/g,
    () => `import Link from "next/link";\n`
  );

  if (/\bLink\b/.test(out) && !/from ["']next\/link["']/.test(out)) {
    out = `import Link from "next/link";\n` + out;
  }

  out = out.replace(/(\s)to="/g, '$1href="');
  out = out.replace(/(\s)to=\{/g, "$1href={");
  out = out.replace(/href="\/register"/g, 'href="/signup"');
  out = out.replace(/\{ to: "/g, '{ href: "');
  out = out.replace(/to: "\/register"/g, 'href: "/signup"');
  out = out.replace(/key=\{l\.to\}/g, "key={l.href}");
  out = out.replace(/(?<!\.)to=\{l\.to\}/g, "href={l.href}");
  out = out.replace(/href=\{l\.to\}/g, "href={l.href}");

  // Footer-style objects: { label: "...", to: "..." }
  out = out.replace(
    /\{ label: "([^"]+)", to: "([^"]+)" \}/g,
    '{ label: "$1", href: "$2" }'
  );

  out = out.replace(
    /import\s+(\w+)\s+from\s+["']@\/assets\/([^"']+)["'];?\r?\n?/g,
    (_m, name, file) => `const ${name} = "/gotix/${file}";\n`
  );

  // Remove createFileRoute with named component
  out = out.replace(
    /export const Route = createFileRoute\([^)]*\)\(\{[\s\S]*?component:\s*(\w+)\s*,\s*\}\);?\r?\n*/m,
    ""
  );

  // Remove createFileRoute with inline arrow component — capture JSX body
  out = out.replace(
    /export const Route = createFileRoute\([^)]*\)\(\{[\s\S]*?component:\s*\(\)\s*=>\s*\(([\s\S]*?)\),\s*\}\);?\r?\n*/m,
    (_m, jsx) =>
      `export default function Page() {\n  return (\n${jsx}\n  );\n}\n`
  );

  const needsClient =
    /\buse(State|Effect|Ref|Memo|Callback|ReducedMotion|Scroll|Transform|Pathname)\b/.test(
      out
    ) ||
    /from ["']framer-motion["']/.test(out) ||
    /onSubmit=\{|onClick=\{|onChange=\{/.test(out);

  // Reorder: use client, imports, consts, rest
  const useClientWanted = needsClient;
  out = out.replace(/^["']use client["'];\r?\n+/, "");

  const imports = [];
  const assetConsts = [];
  const other = [];
  const lines = out.split(/\r?\n/);
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
      assetConsts.push(trimmed);
      i += 1;
      continue;
    }
    other.push(line);
    i += 1;
  }
  while (other.length && other[0].trim() === "") other.shift();

  out = "";
  if (useClientWanted) out += `"use client";\n\n`;
  if (imports.length) out += imports.join("\n") + "\n\n";
  if (assetConsts.length) out += assetConsts.join("\n") + "\n\n";
  out += other.join("\n");
  if (!out.endsWith("\n")) out += "\n";

  if (isPage) {
    out = out.replace(/function Home\(/, "function HomePageView(");
    if (/function HomePageView\(/.test(out) && !/export default/.test(out)) {
      out += `\nexport default HomePageView;\n`;
    } else if (!/export default/.test(out)) {
      const fn = out.match(/function\s+(\w+)\s*\(/)?.[1];
      if (fn) out += `\nexport default ${fn};\n`;
    } else {
      out = out.replace(/export default Home;/, "export default HomePageView;");
    }
  }

  return out;
}

function extractMeta(code) {
  const title = code.match(/const TITLE = "([^"]+)"/)?.[1] ?? null;
  const descMatch = code.match(/const DESC =\s*\r?\n?\s*"([^"]+)"/);
  return { title, description: descMatch?.[1] ?? null };
}

// assets
copyDir(path.join(SRC, "src/assets"), path.join(ROOT, "public", "gotix"));

// site-data
let siteData = read(path.join(SRC, "src/lib/site-data.ts"));
siteData = siteData.replaceAll('to: "/register" as const', 'to: "/signup" as const');
write(path.join(ROOT, "src/lib/site-data.ts"), siteData);

// components
for (const file of fs.readdirSync(path.join(SRC, "src/components/site"))) {
  if (!file.endsWith(".tsx")) continue;
  write(
    path.join(ROOT, "src/components/site", file),
    transformTsx(read(path.join(SRC, "src/components/site", file)), {
      isPage: false,
    })
  );
}

const routes = [
  { file: "index.tsx", view: "home.tsx", appPath: "(marketing)/page.tsx" },
  { file: "modules.tsx", view: "modules.tsx", appPath: "(marketing)/modules/page.tsx" },
  { file: "platform.tsx", view: "platform.tsx", appPath: "(marketing)/platform/page.tsx" },
  { file: "solutions.tsx", view: "solutions.tsx", appPath: "(marketing)/solutions/page.tsx" },
  { file: "features.tsx", view: "features.tsx", appPath: "(marketing)/features/page.tsx" },
  { file: "ai.tsx", view: "ai.tsx", appPath: "(marketing)/ai/page.tsx" },
  { file: "pricing.tsx", view: "pricing.tsx", appPath: "(marketing)/pricing/page.tsx" },
  { file: "about.tsx", view: "about.tsx", appPath: "(about)/about/page.tsx" },
  { file: "contact.tsx", view: "contact.tsx", appPath: "(marketing)/contact/page.tsx" },
  { file: "testimonials.tsx", view: "testimonials.tsx", appPath: "(marketing)/testimonials/page.tsx" },
  { file: "faq.tsx", view: "faq.tsx", appPath: "(marketing)/faq/page.tsx" },
  { file: "demo.tsx", view: "demo.tsx", appPath: "demo/page.tsx" },
  { file: "privacy.tsx", view: "privacy.tsx", appPath: "(marketing)/privacy/page.tsx" },
  { file: "terms.tsx", view: "terms.tsx", appPath: "(marketing)/terms/page.tsx" },
  { file: "security.tsx", view: "security.tsx", appPath: "(marketing)/security/page.tsx" },
];

for (const route of routes) {
  const raw = read(path.join(SRC, "src/routes", route.file));
  const meta = extractMeta(raw);
  const transformed = transformTsx(raw, { isPage: true });
  write(path.join(ROOT, "src/components/site/pages", route.view), transformed);

  const exportName =
    transformed.match(/export default function (\w+)/)?.[1] ||
    transformed.match(/export default (\w+)/)?.[1];
  const importFrom = `@/components/site/pages/${route.view.replace(/\.tsx$/, "")}`;

  let page = `import type { Metadata } from "next";\nimport ${exportName} from "${importFrom}";\n\n`;
  page += `export const metadata: Metadata = {\n`;
  if (meta.title) page += `  title: ${JSON.stringify(meta.title)},\n`;
  if (meta.description)
    page += `  description: ${JSON.stringify(meta.description)},\n`;
  page += `};\n\nexport default function Page() {\n  return <${exportName} />;\n}\n`;
  write(path.join(ROOT, "src/app", route.appPath), page);
  console.log("wrote", route.appPath, "→", exportName);
}

// remove old root page.tsx so (marketing)/page.tsx owns /
const oldHome = path.join(ROOT, "src/app/page.tsx");
if (fs.existsSync(oldHome)) {
  fs.unlinkSync(oldHome);
  console.log("removed src/app/page.tsx (home is under (marketing)/page.tsx)");
}

console.log("Done.");
