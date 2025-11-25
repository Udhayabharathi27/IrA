import { 
  type User, 
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type Driver,
  type InsertDriver,
  type Consignor,
  type InsertConsignor,
  type Consignee,
  type InsertConsignee,
  type ConsignmentNote,
  type InsertConsignmentNote,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type ConsignmentDetails,
  type InsertConsignmentDetails,
  users,
  vehicleMaster,
  driverMaster,
  consignorMaster,
  consigneeMaster,
  consignmentNote,
  invoiceLineItems,
  consignmentDetails
} from "@shared/schema";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";

import dotenv from "dotenv";
dotenv.config();

import * as schema from "@shared/schema";

const sql = postgres(process.env.DATABASE_URL || "", {
  // optional: any postgres-js options
});


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

if (process.env.DATABASE_URL.includes("helium") || process.env.DATABASE_URL.includes("localhost") === false && !process.env.DATABASE_URL.match(/replit|neon\.tech/)) {
  throw new Error(
    "DATABASE_URL appears to be misconfigured. " +
    "It should point to a valid Replit/Neon database host. " +
    "Current value contains: " + new URL(process.env.DATABASE_URL).hostname
  );
}

// const queryClient = postgres(process.env.DATABASE_URL);
// const db = drizzle(queryClient);

export const db = drizzle(sql, { schema });

// optional: export a DB type if you want strong typing elsewhere
export type Database = typeof db;

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Driver methods
  getAllDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: number): Promise<boolean>;
  
  // Consignor methods
  getAllConsignors(): Promise<Consignor[]>;
  getConsignor(id: number): Promise<Consignor | undefined>;
  createConsignor(consignor: InsertConsignor): Promise<Consignor>;
  updateConsignor(id: number, consignor: Partial<InsertConsignor>): Promise<Consignor | undefined>;
  deleteConsignor(id: number): Promise<boolean>;
  
  // Consignee methods
  getAllConsignees(): Promise<Consignee[]>;
  getConsignee(id: number): Promise<Consignee | undefined>;
  createConsignee(consignee: InsertConsignee): Promise<Consignee>;
  updateConsignee(id: number, consignee: Partial<InsertConsignee>): Promise<Consignee | undefined>;
  deleteConsignee(id: number): Promise<boolean>;
  
  // LR/Consignment Note methods
  getAllConsignmentNotes(): Promise<any[]>;
  getConsignmentNote(id: number): Promise<any | undefined>;
  createConsignmentNote(data: {
    note: InsertConsignmentNote;
    invoices: Omit<InsertInvoiceLineItem, "consignmentId">[];
    details: Omit<InsertConsignmentDetails, "consignmentId">;
  }): Promise<{ note: ConsignmentNote; invoices: InvoiceLineItem[]; details: ConsignmentDetails }>;
  updateConsignmentNote(id: number, data: {
    note?: Partial<InsertConsignmentNote>;
    invoices?: Omit<InsertInvoiceLineItem, "consignmentId">[];
    details?: Partial<Omit<InsertConsignmentDetails, "consignmentId">>;
  }): Promise<any | undefined>;
  deleteConsignmentNote(id: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Vehicle methods
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicleMaster).orderBy(vehicleMaster.vehicleId);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicleMaster).where(eq(vehicleMaster.vehicleId, id)).limit(1);
    return result[0];
  }

  // In storage.ts - update the createVehicle method
async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
  try {
    const result = await db.insert(vehicleMaster).values(vehicle).returning();
    if (result.length === 0) {
      throw new Error("Failed to create vehicle - no data returned");
    }
    return result[0];
  } catch (error) {
    console.error("Database error in createVehicle:", error);
    throw error;
  }
}

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicleMaster).set(vehicle).where(eq(vehicleMaster.vehicleId, id)).returning();
    return result[0];
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicleMaster).where(eq(vehicleMaster.vehicleId, id)).returning();
    return result.length > 0;
  }

  // Driver methods
  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(driverMaster).orderBy(driverMaster.driverId);
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const result = await db.select().from(driverMaster).where(eq(driverMaster.driverId, id)).limit(1);
    return result[0];
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const result = await db.insert(driverMaster).values(driver).returning();
    return result[0];
  }

  async updateDriver(id: number, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const result = await db.update(driverMaster).set(driver).where(eq(driverMaster.driverId, id)).returning();
    return result[0];
  }

  async deleteDriver(id: number): Promise<boolean> {
    const result = await db.delete(driverMaster).where(eq(driverMaster.driverId, id)).returning();
    return result.length > 0;
  }

  // Consignor methods
  async getAllConsignors(): Promise<Consignor[]> {
    return await db.select().from(consignorMaster).orderBy(consignorMaster.consignorId);
  }

  async getConsignor(id: number): Promise<Consignor | undefined> {
    const result = await db.select().from(consignorMaster).where(eq(consignorMaster.consignorId, id)).limit(1);
    return result[0];
  }

  async createConsignor(consignor: InsertConsignor): Promise<Consignor> {
    const result = await db.insert(consignorMaster).values(consignor).returning();
    return result[0];
  }

  async updateConsignor(id: number, consignor: Partial<InsertConsignor>): Promise<Consignor | undefined> {
    const result = await db.update(consignorMaster).set(consignor).where(eq(consignorMaster.consignorId, id)).returning();
    return result[0];
  }

  async deleteConsignor(id: number): Promise<boolean> {
    const result = await db.delete(consignorMaster).where(eq(consignorMaster.consignorId, id)).returning();
    return result.length > 0;
  }

  // Consignee methods
  async getAllConsignees(): Promise<Consignee[]> {
    return await db.select().from(consigneeMaster).orderBy(consigneeMaster.consigneeId);
  }

  async getConsignee(id: number): Promise<Consignee | undefined> {
    const result = await db.select().from(consigneeMaster).where(eq(consigneeMaster.consigneeId, id)).limit(1);
    return result[0];
  }

  async createConsignee(consignee: InsertConsignee): Promise<Consignee> {
    const result = await db.insert(consigneeMaster).values(consignee).returning();
    return result[0];
  }

  async updateConsignee(id: number, consignee: Partial<InsertConsignee>): Promise<Consignee | undefined> {
    const result = await db.update(consigneeMaster).set(consignee).where(eq(consigneeMaster.consigneeId, id)).returning();
    return result[0];
  }

  async deleteConsignee(id: number): Promise<boolean> {
    const result = await db.delete(consigneeMaster).where(eq(consigneeMaster.consigneeId, id)).returning();
    return result.length > 0;
  }

  // LR/Consignment Note methods
  async getAllConsignmentNotes(): Promise<any[]> {
    const notes = await db.select()
      .from(consignmentNote)
      .orderBy(consignmentNote.consignmentId);
    
    return notes;
  }

  async getConsignmentNote(id: number): Promise<any | undefined> {
    const noteResult = await db.select({
      note: consignmentNote,
      consignor: consignorMaster,
      consignee: consigneeMaster,
      vehicle: vehicleMaster,
      driver: driverMaster,
    })
    .from(consignmentNote)
    .leftJoin(consignorMaster, eq(consignmentNote.consignorId, consignorMaster.consignorId))
    .leftJoin(consigneeMaster, eq(consignmentNote.consigneeId, consigneeMaster.consigneeId))
    .leftJoin(vehicleMaster, eq(consignmentNote.vehicleId, vehicleMaster.vehicleId))
    .leftJoin(driverMaster, eq(consignmentNote.driverId, driverMaster.driverId))
    .where(eq(consignmentNote.consignmentId, id))
    .limit(1);

    if (noteResult.length === 0) return undefined;

    const invoices = await db.select().from(invoiceLineItems)
      .where(eq(invoiceLineItems.consignmentId, id));

    const details = await db.select().from(consignmentDetails)
      .where(eq(consignmentDetails.consignmentId, id))
      .limit(1);

    return {
      ...noteResult[0],
      invoices,
      details: details[0]
    };
  }

  async createConsignmentNote(data: {
    note: InsertConsignmentNote;
    invoices: Omit<InsertInvoiceLineItem, "consignmentId">[];
    details: Omit<InsertConsignmentDetails, "consignmentId">;
  }): Promise<{ note: ConsignmentNote; invoices: InvoiceLineItem[]; details: ConsignmentDetails }> {
    const noteResult = await db.insert(consignmentNote).values(data.note).returning();
    const createdNote = noteResult[0];

    const invoicesWithId = data.invoices.map(inv => ({
      ...inv,
      consignmentId: createdNote.consignmentId
    }));
    const createdInvoices = await db.insert(invoiceLineItems).values(invoicesWithId).returning();

    const detailsWithId = {
      ...data.details,
      consignmentId: createdNote.consignmentId
    };
    const createdDetails = await db.insert(consignmentDetails).values(detailsWithId).returning();

    return {
      note: createdNote,
      invoices: createdInvoices,
      details: createdDetails[0]
    };
  }

async testConnection(): Promise<boolean> {
  try {
    await db.select().from(vehicleMaster).limit(1);
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

  async updateConsignmentNote(id: number, data: {
    note?: Partial<InsertConsignmentNote>;
    invoices?: Omit<InsertInvoiceLineItem, "consignmentId">[];
    details?: Partial<Omit<InsertConsignmentDetails, "consignmentId">>;
  }): Promise<any | undefined> {
    if (data.note) {
      await db.update(consignmentNote).set(data.note).where(eq(consignmentNote.consignmentId, id));
    }

    if (data.invoices) {
      await db.delete(invoiceLineItems).where(eq(invoiceLineItems.consignmentId, id));
      const invoicesWithId = data.invoices.map(inv => ({
        ...inv,
        consignmentId: id
      }));
      await db.insert(invoiceLineItems).values(invoicesWithId);
    }

    if (data.details) {
      await db.update(consignmentDetails).set(data.details).where(eq(consignmentDetails.consignmentId, id));
    }

    return await this.getConsignmentNote(id);
  }

  async deleteConsignmentNote(id: number): Promise<boolean> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.consignmentId, id));
    await db.delete(consignmentDetails).where(eq(consignmentDetails.consignmentId, id));
    const result = await db.delete(consignmentNote).where(eq(consignmentNote.consignmentId, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
