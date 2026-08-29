import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import { analyzePriceList } from "./pipeline";
import { parsePrice } from "./parse-price";
import { classifyRawRows } from "./grouping";
import { parseCsvText } from "./parsers/csv";
import { applyColumnMapping, autoMapColumns } from "./column-mapping";
import { CSV_TEMPLATE } from "./preview";

function fail(message: string): never {
  throw new Error(message);
}

function assert(condition: unknown, message: string) {
  if (!condition) fail(message);
}

async function main() {
  const fixtureCsv = join(dirname(fileURLToPath(import.meta.url)), "fixtures/blushberry_price_list.csv");
  const csvPath =
    process.env.BLUSHBERRY_CSV ??
    (existsSync(fixtureCsv)
      ? fixtureCsv
      : "C:/Users/mohit/OneDrive/Desktop/blushberry_price_list.csv");
  const pdfPath =
    process.env.BLUSHBERRY_PDF ??
    "C:/Users/mohit/OneDrive/Desktop/Copy of Blushberry Price List.pdf.pdf";

  const price = parsePrice("₹1,000 Only");
  assert(price.amount === 1000 && price.isFixedPrice, "₹1,000 Only should be 1000 fixed");
  const starting = parsePrice("450+");
  assert(starting.amount === 450 && starting.isStartingPrice, "450+ should be starting price");
  const only = parsePrice("700/- Only");
  assert(only.amount === 700 && only.isFixedPrice, "700/- Only should be fixed");

  const csv = readFileSync(csvPath);
  const table = parseCsvText(csv.toString("utf8"));
  const headers = table[0];
  const mapping = autoMapColumns(headers);
  const rows = applyColumnMapping(headers, table.slice(1), mapping);
  const classified = classifyRawRows(rows, "blushberry_price_list.csv", "csv");

  const audiences = new Set(classified.map((r) => r.audience));
  assert(audiences.has("WOMEN"), "CSV should detect Women");
  assert(audiences.has("MEN"), "CSV should detect Men");
  assert(audiences.has("COUPLES"), "CSV should detect Couples");

  const combo1 = classified.find((r) => r.name === "Combo Package 1");
  assert(combo1?.type === "PACKAGE", "COMBO PACKAGE 1 should be a package");
  assert(combo1?.price === 700, "Combo Package 1 should cost 700, not per item");
  assert(
    combo1?.includedItems.map((i) => i.name).join("|").includes("Fruit Facial"),
    "Combo 1 should include Fruit Facial"
  );
  assert(
    combo1?.includedItems.some((i) => /threading/i.test(i.name)),
    "Combo 1 should include Threading & Upperlips"
  );
  assert(
    !classified.some((r) => r.name === "Fruit Facial, Bleach, Clean Up" && r.type === "SERVICE"),
    "Combo contents should not become a priced service"
  );

  const facial = classified.find(
    (r) => r.name === "Normal Facial (Fruit)" && r.audience === "WOMEN"
  );
  assert(facial?.type === "SERVICE" && facial.price === 700, "Normal Facial (Fruit) should be 700");
  assert(facial?.category === "Facials", "FACIALS should normalize to Facials");

  const hairCut = classified.find(
    (r) => r.audience === "MEN" && r.name === "Hair Cut" && r.category === "Cut & Styling"
  );
  assert(hairCut?.price === 250, "Men hair cut should be 250");

  const silver = classified.find((r) => /pre bridal package silver/i.test(r.name));
  assert(silver?.type === "PACKAGE", "Pre bridal silver should be a package");
  assert(silver?.price === 29080, "Silver package total should be 29080");
  const lotus = silver?.includedItems.find((i) => i.name === "Lotus Clean UP");
  assert(lotus?.quantity === 2, "Repeated Lotus Clean UP should have quantity 2");
  assert(
    !classified.some((r) => r.name === "Package Total"),
    "Package Total rows must not become services"
  );

  const couple = classified.find((r) => r.audience === "COUPLES");
  assert(couple?.type === "PACKAGE", "Couples row should remain a package");

  const csvPreview = await analyzePriceList({
    buffer: csv,
    filename: "blushberry_price_list.csv",
    fileType: "csv",
    salonName: "Test Salon",
    existing: [],
  });
  assert("preview" in csvPreview, "CSV analyze should return a preview");
  if ("preview" in csvPreview) {
    console.log("CSV preview", csvPreview.preview.counts);
    assert(csvPreview.preview.counts.packages >= 9, "Expected at least 9 packages from CSV");
    assert(csvPreview.preview.counts.services >= 80, "Expected many normal services from CSV");
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Menu");
  for (const row of parseCsvText(CSV_TEMPLATE)) {
    sheet.addRow(row);
  }
  const xlsxBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const xlsxPreview = await analyzePriceList({
    buffer: xlsxBuffer,
    filename: "sample-menu.xlsx",
    fileType: "xlsx",
    salonName: "Test Salon",
    existing: [],
  });
  assert("preview" in xlsxPreview, "Excel analyze should return a preview");
  if ("preview" in xlsxPreview) {
    console.log("XLSX preview", xlsxPreview.preview.counts);
    assert(
      xlsxPreview.preview.counts.services + xlsxPreview.preview.counts.packages >= 3,
      "Excel template should extract services"
    );
  }

  const pdf = readFileSync(pdfPath);
  const pdfPreview = await analyzePriceList({
    buffer: pdf,
    filename: "blushberry.pdf",
    fileType: "pdf",
    salonName: "Test Salon",
    existing: [],
  });
  assert("preview" in pdfPreview, "PDF analyze should return a preview");
  if ("preview" in pdfPreview) {
    const records = pdfPreview.preview.records;
    console.log("PDF preview", pdfPreview.preview.counts, pdfPreview.preview.warnings);
    const pdfCombo = records.find((r) => r.name === "Combo Package 1");
    assert(pdfCombo?.type === "PACKAGE" && pdfCombo.price === 700, "PDF combo 1 should be ₹700 package");
    assert(
      (pdfCombo?.includedItems.length ?? 0) >= 3,
      "PDF combo 1 should include multiple items, not four ₹700 services"
    );
    const menRecords = records.filter((r) => r.audience === "MEN");
    assert(menRecords.length > 10, `PDF should extract a men's section (got ${menRecords.length})`);
    assert(
      records.some((r) => /keratin/i.test(r.name)),
      "PDF should extract keratin/hair treatment"
    );
    assert(
      records.some((r) => r.audience === "WOMEN" && r.category === "Facials"),
      "PDF should extract women's facials"
    );
    assert(
      records.some((r) => /pre bridal package gold/i.test(r.name) && r.price === 44680),
      "PDF gold pre-bridal should use package total"
    );
    assert(
      !records.some((r) => /^free-/i.test(r.name) && r.type === "SERVICE" && r.price === 0 && r.action === "CREATE"),
      "Free lines should not become ready ₹0 services"
    );
    assert(
      records.some((r) => /couple/i.test(r.name) && r.type === "PACKAGE"),
      "PDF should keep couple makeover as a package"
    );
  }

  console.log("Blushberry CSV, Excel, and PDF fixture checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
