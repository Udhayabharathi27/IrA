import { Request, Response } from "express";
import { db } from "../db/connection";
import {
  consignmentNote,
  consignorMaster,
  consigneeMaster,
  driverMaster,
  vehicleMaster,
  invoiceLineItems,
  consignmentDetails
}  from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateLRConsignmentPDF } from "../utils/pdf-generator";

export class ConsignmentController {
  generatePDF = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const [cnote] = await db
      .select()
      .from(consignmentNote)
      .where(eq(consignmentNote.consignmentId, id));

    if (!cnote) return res.status(404).send("Consignment Not Found");

    // Fetch consignor
    const [consignor] = await db
      .select()
      .from(consignorMaster)
      .where(eq(consignorMaster.consignorId, cnote.consignorId));

    // Fetch consignee
    const [consignee] = await db
      .select()
      .from(consigneeMaster)
      .where(eq(consigneeMaster.consigneeId, cnote.consigneeId));

    // Fetch driver if exists
    let driver = null;
    if (cnote.driverId !== null) {
      [driver] = await db
        .select()
        .from(driverMaster)
        .where(eq(driverMaster.driverId, cnote.driverId));
    }

    // Fetch vehicle if exists
    let vehicle = null;
    if (cnote.vehicleId !== null) {
      [vehicle] = await db
        .select()
        .from(vehicleMaster)
        .where(eq(vehicleMaster.vehicleId, cnote.vehicleId));
    }

    // Fetch invoice lines
    const invoices = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.consignmentId, id));

    // Generate PDF
    const filepath = await generateLRConsignmentPDF(
      {
        ...cnote,
        consignor,
        consignee,
        driver,
        vehicle
      },
      invoices
    );

    res.download(filepath);
  };
}
