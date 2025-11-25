import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";


import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { sql } from "drizzle-orm";

/* -----------------------------------------------------
   CONSIGNOR (Receiver)
----------------------------------------------------- */
export const consignorMaster = pgTable("consignor_master", {
  consignorId: serial("consignor_id").primaryKey(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 200 }),
  addressLine1: varchar("address_line1", { length: 200 }),
  addressLine2: varchar("address_line2", { length: 200 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  contactNo: varchar("contact_no", { length: 30 }),
  tinNo: varchar("tin_no", { length: 50 }),
  gstNo: varchar("gst_no", { length: 50 }),
});

/* -----------------------------------------------------
   CONSIGNEE (Sender)
----------------------------------------------------- */
export const consigneeMaster = pgTable("consignee_master", {
  consigneeId: serial("consignee_id").primaryKey(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 200 }),
  addressLine1: varchar("address_line1", { length: 200 }),
  addressLine2: varchar("address_line2", { length: 200 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  contactNo: varchar("contact_no", { length: 30 }),
  tinNo: varchar("tin_no", { length: 50 }),
  gstNo: varchar("gst_no", { length: 50 }),
});

/* -----------------------------------------------------
   DRIVER
----------------------------------------------------- */
export const driverMaster = pgTable("driver_master", {
  driverId: serial("driver_id").primaryKey(),
  driverName: varchar("driver_name", { length: 200 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 20 }),
  licenseNo: varchar("license_no", { length: 50 }).unique(),
  licenseValidity: date("license_validity"),
  address: text("address"),
  aadhaarNo: varchar("aadhaar_no", { length: 20 }),
  active: boolean("active").default(true),
  remarks: text("remarks"),
});

/* -----------------------------------------------------
   VEHICLE
----------------------------------------------------- */
export const vehicleMaster = pgTable("vehicle_master", {
  vehicleId: serial("vehicle_id").primaryKey(),
  vehicleNo: varchar("vehicle_no", { length: 50 }).unique().notNull(),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  registrationDate: date("registration_date"),
  capacityTons: numeric("capacity_tons", { precision: 10, scale: 3 }),
  ownerPartyId: integer("owner_party_id"),
  active: boolean("active").default(true),
  remarks: text("remarks"),
});

/* -----------------------------------------------------
   CONSIGNMENT NOTE
----------------------------------------------------- */
export const consignmentNote = pgTable("consignment_note", {
  consignmentId: serial("consignment_id").primaryKey(),

  consignorId: integer("consignor_id")
    .notNull()
    .references(() => consignorMaster.consignorId),

  consigneeId: integer("consignee_id")
    .notNull()
    .references(() => consigneeMaster.consigneeId),

  vehicleId: integer("vehicle_id").references(() => vehicleMaster.vehicleId),
  driverId: integer("driver_id").references(() => driverMaster.driverId),

  cnoteNo: varchar("cnote_no", { length: 50 }).unique().notNull(),

  bookingDate: date("booking_date"),
  cnoteEntryDate: date("cnote_entry_date"),
  esdDate: date("esd_date"),

  paymentType: varchar("payment_type", { length: 50 }),
  billingParty: varchar("billing_party", { length: 100 }),

  fromLocation: varchar("from_location", { length: 100 }),
  toLocation: varchar("to_location", { length: 100 }),
  transportMode: varchar("transport_mode", { length: 50 }),
  serviceType: varchar("service_type", { length: 50 }),
  enteredBy: varchar("entered_by", { length: 100 }),

  totalChargedWeight: numeric("total_charged_weight", {
    precision: 10,
    scale: 3,
  }),

  importPermitNo: varchar("import_permit_no", { length: 50 }),
  exportPermitNo: varchar("export_permit_no", { length: 50 }),
  transportPermitNo: varchar("transport_permit_no", { length: 50 }),
  ewayBillNo: varchar("eway_bill_no", { length: 50 }),
  addlTaxInvoiceNo: varchar("addl_tax_invoice_no", { length: 50 }),
  manualLrNo: varchar("manual_lr_no", { length: 50 }),
  isInsured: boolean("is_insured").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

/* -----------------------------------------------------
   CONSIGNMENT DETAILS (1-to-1)
----------------------------------------------------- */
export const consignmentDetails = pgTable("consignment_details", {
  consignmentId: integer("consignment_id")
    .primaryKey()
    .references(() => consignmentNote.consignmentId, { onDelete: "cascade" }),

  riskType: varchar("risk_type", { length: 50 }),
  owner: varchar("owner", { length: 100 }),
  linfoxVendorCode: varchar("linfox_vendor_code", { length: 100 }),
  typeOfCnote: varchar("type_of_cnote", { length: 50 }),
  vhcNo: varchar("vhc_no", { length: 50 }),
  vehicleNo: varchar("vehicle_no", { length: 50 }),
  shipmentNo: varchar("shipment_no", { length: 50 }),
  packagingType: varchar("packaging_type", { length: 50 }),
  weight: numeric("weight", { precision: 10, scale: 3 }),
  saidToContain: varchar("said_to_contain", { length: 200 }),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  specialInstructions: text("special_instructions"),
  remarks: text("remarks"),
});

/* -----------------------------------------------------
   INVOICE LINE ITEMS
----------------------------------------------------- */
export const invoiceLineItems = pgTable("invoice_line_items", {
  invoiceLineId: serial("invoice_line_id").primaryKey(),

  consignmentId: integer("consignment_id")
    .notNull()
    .references(() => consignmentNote.consignmentId, { onDelete: "cascade" }),

  sno: integer("sno"),
  invoiceNo: varchar("invoice_no", { length: 50 }),
  noOfPages: integer("no_of_pages"),
  invoiceDate: date("invoice_date"),
  invoiceValueRs: numeric("invoice_value_rs", { precision: 14, scale: 2 }),
  noOfCases: integer("no_of_cases"),
  noOfUnits: integer("no_of_units"),
  actualWeightT: numeric("actual_weight_t", { precision: 10, scale: 3 }),
  chargedWeightT: numeric("charged_weight_t", { precision: 10, scale: 3 }),
});

/* -----------------------------------------------------
   PROOF OF DELIVERY
----------------------------------------------------- */
export const proofOfDelivery = pgTable("proof_of_delivery", {
  podId: serial("pod_id").primaryKey(),

  consignmentId: integer("consignment_id")
    .notNull()
    .references(() => consignmentNote.consignmentId, { onDelete: "cascade" }),

  consignorSigned: boolean("consignor_signed"),
  consignorSignDate: date("consignor_sign_date"),
  receivedByName: varchar("received_by_name", { length: 200 }),
  receivedDate: date("received_date"),
  receivedAsPerCnote: boolean("received_as_per_cnote"),
  additionalRemarks: text("additional_remarks"),
});
