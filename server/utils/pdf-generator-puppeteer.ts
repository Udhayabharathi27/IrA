// src/utils/pdf-generator-puppeteer.ts
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { buildHtml } from "./html-template";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function imageToBase64(filePath: string) {
  const image = fs.readFileSync(filePath);
  return image.toString("base64");
}

export async function generatePdfFile(data: any, invoices: any[], logoFileUrl: string) {
  // Build file URL for logo if provided (developer instruction: use uploaded path)
  // const logoFileUrl = logoFilePath ? `file://${path.resolve(logoFilePath)}` : null;

  const base64Logo = imageToBase64(logoFileUrl);
  const logoUrl = `data:image/png;base64,${base64Logo}`;

  const html = buildHtml(data, invoices, logoUrl);

  // Launch puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--allow-file-access-from-files",
      "--disable-features=IsolateOrigins,site-per-process",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });
  const page = await browser.newPage();

  // Set content
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Emulate media for printing
  await page.emulateMediaType("screen");

  // Prepare output path
  const outDir = path.resolve(__dirname, "../../tmp");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `LR-${data.cnoteNo || Date.now()}.pdf`);

  // PDF options for A4, with margins
  await page.pdf({
    path: outFile,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" }
  });

  await browser.close();
  return outFile;
}
