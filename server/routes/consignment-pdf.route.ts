// src/routes/consignment-pdf.route.ts
import express from "express";
import { consignmentNote, consignorMaster, consigneeMaster, invoiceLineItems, consignmentDetails } from "../db/schema";
import { eq } from "drizzle-orm";
import { generatePdfFile } from "../utils/pdf-generator-puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../storage";

import { pathToFileURL } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/:id/pdf", async (req, res) => {
  const id = Number(req.params.id);

  try {
    // 1️⃣ Fetch Consignment Note
    const [lr] = await db
      .select()
      .from(consignmentNote)
      .where(eq(consignmentNote.consignmentId, id));

    if (!lr) return res.status(404).send("Consignment not found");

    // 2️⃣ Fetch Consignor
    const [consignor] = await db
      .select()
      .from(consignorMaster)
      .where(eq(consignorMaster.consignorId, lr.consignorId));

    // 3️⃣ Fetch Consignee
    const [consignee] = await db
      .select()
      .from(consigneeMaster)
      .where(eq(consigneeMaster.consigneeId, lr.consigneeId));

    // 4️⃣ Fetch Invoice Line Items
    const invoices = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.consignmentId, id));

    // 5️⃣ Fetch Consignment Details (vehicle, risk, vendor code…)
    const [details] = await db
      .select()
      .from(consignmentDetails)
      .where(eq(consignmentDetails.consignmentId, id));

    // 6️⃣ Build Final Data Object
    const data = {
      ...lr,
      consignor,
      consignee,
      details,
      totalChargedWeight: invoices.reduce(
        (sum, inv) => sum + Number(inv.chargedWeightT || 0),
        0
      ),
    };

    // 7️⃣ Logo path
    const logoFilePath = path.resolve(__dirname, "../../assets/logo.png");
    // console.log("logoFilePath....", logoFilePath);

    // const logoUrl = pathToFileURL(logoFilePath).href;
    // console.log("logoUrl....", logoUrl);
    // 8️⃣ Generate PDF
    const pdfPath = await generatePdfFile(data, invoices, logoFilePath);


    // 9️⃣ Show PDF in browser tab (not download)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=LR-${lr.cnoteNo}.pdf`
    );
    res.sendFile(pdfPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF");
  }
});

// router.get("/:id/pdf", async (req, res) => {
//   const id = Number(req.params.id);

//   try {
//     // Fetch real LR data from DB using Drizzle
//     const lr = await db.query.consignmentNote.findFirst({
//       where: eq(consignmentNote.consignmentId, id),
//     });

//     if (!lr) {
//       return res.status(404).send("Consignment not found");
//     }

//     const data = {
//       cnoteNo: lr.cnoteNo,
//       bookingDate: lr.bookingDate,
//       cnoteEntryDate: lr.cnoteEntryDate,
//       esdDate: lr.esdDate,
//       billingParty: lr.billingParty,
//       enteredBy: lr.enteredBy,
//       fromLocation: lr.fromLocation,
//       toLocation: lr.toLocation,
//       consignor: lr.consignor,
//       consignee: lr.consignee,
//       totalChargedWeight: lr.totalChargedWeight,
//       importPermitNo: lr.importPermitNo,
//       exportPermitNo: lr.exportPermitNo,
//       ewayBillNo: lr.ewayBillNo,
//       riskType: lr.riskType,
//       linfoxVendorCode: lr.linfoxVendorCode,
//       typeOfCnote: lr.typeOfCnote,
//       vehicleNo: lr.vehicleNo,
//       vehicleType: lr.vehicleType,
//       specialInstructions: lr.specialInstructions
//     };

//     const invoices = lr.invoices;

//     const logoFilePath = path.resolve(__dirname, "../../assets/logo.png");

//     const pdfPath = await generatePdfFile(data, invoices, logoFilePath);

//     // OPEN PDF IN NEW TAB
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `inline; filename=LR-${data.cnoteNo}.pdf`);
//     res.sendFile(pdfPath);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to generate PDF");
//   }
// });

export default router;
