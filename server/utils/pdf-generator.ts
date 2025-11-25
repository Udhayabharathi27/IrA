import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateLRConsignmentPDF(data: any, invoices: any[]) {
  return new Promise<string>((resolve, reject) => {
    const outputDir = path.join(__dirname, "../../tmp");
    fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, `LR-${data.cnoteNo}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 20 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ------------------------------------------------------
    // 🔷 PAGE HEADER: LINFOX Logo + Title
    // ------------------------------------------------------
    doc.font("Helvetica-Bold").fontSize(20);
    doc.text("LINFOX", 250, 30);  // You can replace with actual logo later

    doc.fontSize(14);
    doc.text("CONSIGNMENT NOTE", 210, 60);

    // -----------------------------------------------------------------
    // 🔷 BOX 1: CNote + Dates + Payment + Billing Party (Top Box)
    // -----------------------------------------------------------------
    const topBoxY = 100;
    const boxHeight = 70;
    doc.rect(20, topBoxY, 560, boxHeight).stroke();

    // draw internal vertical lines
    doc.moveTo(150, topBoxY).lineTo(150, topBoxY + boxHeight).stroke();
    doc.moveTo(280, topBoxY).lineTo(280, topBoxY + boxHeight).stroke();
    doc.moveTo(410, topBoxY).lineTo(410, topBoxY + boxHeight).stroke();

    doc.font("Helvetica").fontSize(9);
    doc.text(`CNote No:\n${data.cnoteNo}`, 25, topBoxY + 5);

    doc.text(`Bkg. Date:\n${data.bookingDate}`, 155, topBoxY + 5);

    doc.text(`CNote Entry Dt:\n${data.cnoteEntryDate}`, 285, topBoxY + 5);

    doc.text(`ESD:\n${data.esdDate}`, 415, topBoxY + 5);

    doc.text(`Billing Party:\n${data.billingParty}`, 25, topBoxY + 40);

    doc.text(`Entered By:\n${data.enteredBy}`, 155, topBoxY + 40);

    doc.text(`From:\n${data.fromLocation}`, 285, topBoxY + 40);

    doc.text(`To:\n${data.toLocation}`, 415, topBoxY + 40);

    // ------------------------------------------------------
    // 🔷 CONSIGNOR / CONSIGNEE BLOCK
    // ------------------------------------------------------
    const partyBoxY = 180;
    doc.rect(20, partyBoxY, 560, 100).stroke();

    // middle line
    doc.moveTo(300, partyBoxY).lineTo(300, partyBoxY + 100).stroke();

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("CONSIGNOR", 25, partyBoxY + 5);
    doc.text("CONSIGNEE", 305, partyBoxY + 5);

    doc.font("Helvetica").fontSize(9);

    doc.text(`${data.consignor.name}\n${data.consignor.addressLine1}\n${data.consignor.addressLine2}`, 25, partyBoxY + 25, {
      width: 260
    });

    doc.text(`${data.consignee.name}\n${data.consignee.addressLine1}\n${data.consignee.addressLine2}`, 305, partyBoxY + 25, {
      width: 260
    });

    // ------------------------------------------------------
    // 🔷 INVOICE TABLE
    // ------------------------------------------------------
    const tableTop = 300;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Invoice Details", 20, tableTop - 15);

    // table border
    doc.rect(20, tableTop, 560, 120).stroke();

    // table columns
    const cols = [20, 60, 160, 260, 360, 430, 490];
    cols.forEach((x) => {
      doc.moveTo(x, tableTop).lineTo(x, tableTop + 120).stroke();
    });

    // header row line
    doc.moveTo(20, tableTop + 20).lineTo(580, tableTop + 20).stroke();

    // headers
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("S.No", cols[0] + 3, tableTop + 5);
    doc.text("Invoice No", cols[1] + 3, tableTop + 5);
    doc.text("Invoice Dt", cols[2] + 3, tableTop + 5);
    doc.text("Invoice Value", cols[3] + 3, tableTop + 5);
    doc.text("No. of Cases", cols[4] + 3, tableTop + 5);
    doc.text("Actual WT (T)", cols[5] + 3, tableTop + 5);

    // rows
    doc.font("Helvetica").fontSize(9);
    let rowY = tableTop + 25;

    invoices.forEach((inv) => {
      doc.text(inv.sno, cols[0] + 5, rowY);
      doc.text(inv.invoiceNo, cols[1] + 5, rowY);
      doc.text(inv.invoiceDate, cols[2] + 5, rowY);
      doc.text(inv.invoiceValueRs, cols[3] + 5, rowY);
      doc.text(inv.noOfCases, cols[4] + 5, rowY);
      doc.text(inv.actualWeightT, cols[5] + 5, rowY);
      rowY += 20;
    });

    // ------------------------------------------------------
    // Finish Document
    // ------------------------------------------------------
    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}
