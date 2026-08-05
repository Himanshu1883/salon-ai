import fs from "node:fs";

const map = {
  privacy: "PrivacyPageView",
  terms: "TermsPageView",
  security: "SecurityPageView",
};

for (const [name, exp] of Object.entries(map)) {
  const view = `src/components/site/pages/${name}.tsx`;
  let c = fs.readFileSync(view, "utf8");
  c = c.replace(/import Link from "next\/link";\r?\n/, "");
  c = c.replace(
    "export default function Page()",
    `export default function ${exp}()`
  );
  fs.writeFileSync(view, c);

  const metaTitle = c.match(/const TITLE = "([^"]+)"/)?.[1];
  const metaDesc = c.match(/const DESC =\s*\r?\n?\s*"([^"]+)"/)?.[1];
  fs.writeFileSync(
    `src/app/(marketing)/${name}/page.tsx`,
    `import type { Metadata } from "next";
import ${exp} from "@/components/site/pages/${name}";

export const metadata: Metadata = {
  title: ${JSON.stringify(metaTitle)},
  description: ${JSON.stringify(metaDesc)},
};

export default function Page() {
  return <${exp} />;
}
`
  );
  console.log("fixed", name);
}
