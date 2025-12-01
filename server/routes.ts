import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertDriverSchema, 
  insertConsignorSchema, 
  insertConsigneeSchema,
  insertConsignmentNoteSchema,
  insertInvoiceLineItemSchema,
  insertConsignmentDetailsSchema,
  insertFreightSchema
} from "@shared/schema";
import { z } from "zod";

import { combinedAuth } from "../middlewares/combinedAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vehicle Master Routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ 
        message: "Failed to fetch vehicles",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

app.post("/api/vehicles", async (req, res) => {
  try {
    console.log("Received vehicle data:", req.body);
    const validatedData = insertVehicleSchema.parse(req.body);
    console.log("Validated vehicle data:", validatedData);
    
    const vehicle = await storage.createVehicle(validatedData);
    console.log("Created vehicle:", vehicle);
    
    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return res.status(400).json({ 
        message: "Invalid vehicle data", 
        errors: error.errors 
      });
    }
    console.error("Error creating vehicle:", error);
    res.status(500).json({ 
      message: "Failed to create vehicle",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, validatedData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Driver Master Routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const driver = await storage.getDriver(id);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver:", error);
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const validatedData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(validatedData);
      res.status(201).json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      }
      console.error("Error creating driver:", error);
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  app.put("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDriverSchema.partial().parse(req.body);
      const driver = await storage.updateDriver(id, validatedData);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid driver data", errors: error.errors });
      }
      console.error("Error updating driver:", error);
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDriver(id);
      if (!success) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting driver:", error);
      res.status(500).json({ message: "Failed to delete driver" });
    }
  });

  // Consignor Master Routes
  app.get("/api/consignors", async (req, res) => {
    try {
      const consignors = await storage.getAllConsignors();
      res.json(consignors);
    } catch (error) {
      console.error("Error fetching consignors:", error);
      res.status(500).json({ message: "Failed to fetch consignors" });
    }
  });

  app.get("/api/consignors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consignor = await storage.getConsignor(id);
      if (!consignor) {
        return res.status(404).json({ message: "Consignor not found" });
      }
      res.json(consignor);
    } catch (error) {
      console.error("Error fetching consignor:", error);
      res.status(500).json({ message: "Failed to fetch consignor" });
    }
  });

  app.post("/api/consignors", async (req, res) => {
    try {
      const validatedData = insertConsignorSchema.parse(req.body);
      const consignor = await storage.createConsignor(validatedData);
      res.status(201).json(consignor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid consignor data", errors: error.errors });
      }
      console.error("Error creating consignor:", error);
      res.status(500).json({ message: "Failed to create consignor" });
    }
  });

  app.put("/api/consignors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsignorSchema.partial().parse(req.body);
      const consignor = await storage.updateConsignor(id, validatedData);
      if (!consignor) {
        return res.status(404).json({ message: "Consignor not found" });
      }
      res.json(consignor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid consignor data", errors: error.errors });
      }
      console.error("Error updating consignor:", error);
      res.status(500).json({ message: "Failed to update consignor" });
    }
  });

  app.delete("/api/consignors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConsignor(id);
      if (!success) {
        return res.status(404).json({ message: "Consignor not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consignor:", error);
      res.status(500).json({ message: "Failed to delete consignor" });
    }
  });

  // Consignee Master Routes
  app.get("/api/consignees", async (req, res) => {
    try {
      const consignees = await storage.getAllConsignees();
      res.json(consignees);
    } catch (error) {
      console.error("Error fetching consignees:", error);
      res.status(500).json({ message: "Failed to fetch consignees" });
    }
  });

  app.get("/api/consignees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consignee = await storage.getConsignee(id);
      if (!consignee) {
        return res.status(404).json({ message: "Consignee not found" });
      }
      res.json(consignee);
    } catch (error) {
      console.error("Error fetching consignee:", error);
      res.status(500).json({ message: "Failed to fetch consignee" });
    }
  });

  app.post("/api/consignees", async (req, res) => {
    try {
      const validatedData = insertConsigneeSchema.parse(req.body);
      const consignee = await storage.createConsignee(validatedData);
      res.status(201).json(consignee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid consignee data", errors: error.errors });
      }
      console.error("Error creating consignee:", error);
      res.status(500).json({ message: "Failed to create consignee" });
    }
  });

  app.put("/api/consignees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsigneeSchema.partial().parse(req.body);
      const consignee = await storage.updateConsignee(id, validatedData);
      if (!consignee) {
        return res.status(404).json({ message: "Consignee not found" });
      }
      res.json(consignee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid consignee data", errors: error.errors });
      }
      console.error("Error updating consignee:", error);
      res.status(500).json({ message: "Failed to update consignee" });
    }
  });

  app.delete("/api/consignees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConsignee(id);
      if (!success) {
        return res.status(404).json({ message: "Consignee not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consignee:", error);
      res.status(500).json({ message: "Failed to delete consignee" });
    }
  });

  // LR/Consignment Note Routes
  app.get("/api/lrs", async (req, res) => {
    try {
      const lrs = await storage.getAllConsignmentNotes();
      res.json(lrs);
    } catch (error) {
      console.error("Error fetching LRs:", error);
      res.status(500).json({ message: "Failed to fetch LRs" });
    }
  });

  app.get("/api/recent/lrs", async (req, res) => {
    try {
      const lrs = await storage.getAllConsignmentNotes();

      if (!Array.isArray(lrs)) {
        console.log("❌ lrs is not array:", lrs);
        return res.json([]);
      }

      // Sort by consignmentId (DESC) to show recent first
      const sorted = lrs.sort((a, b) => Number(b.consignmentId) - Number(a.consignmentId));

      const formatted = await Promise.all(
        sorted.map(async (lr) => {
          const consignor = await storage.getConsignor(lr.consignorId);
          const consignee = await storage.getConsignee(lr.consigneeId);
          const vehicle = await storage.getVehicle(lr.vehicleId);

          return {
            id: lr.consignmentId,
            cnoteNo: lr.cnoteNo,
            date: lr.bookingDate,
            consignor: consignor?.name,
            consignee: consignee?.name,
            vehicle: vehicle?.vehicleNo,
            status: lr.transportMode || "in-transit",
          };
        })
      );

      console.log("API sending:", formatted);
      res.json(formatted);
    } catch (err) {
      console.error("API error:", err);
      res.json([]); // ALWAYS return an array to avoid frontend crashes
    }
  });

  app.get("/api/lrs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("id:", id);
      const lr = await storage.getConsignmentNote(id);
      if (!lr) {
        return res.status(404).json({ message: "LR not found" });
      }
      res.json(lr);
    } catch (error) {
      console.error("Error fetching LR:", error);
      res.status(500).json({ message: "Failed to fetch LR" });
    }
  });

  app.get("/api/recent/lrs", async (req, res) => {
  try {
    console.log("🔄 /api/recent/lrs endpoint called");
    console.log("🔐 User making request:", (req as any).user);
    
    const lrs = await storage.getAllConsignmentNotes();
    console.log("📦 Raw LRs from storage:", lrs);

    if (!Array.isArray(lrs)) {
      console.log("❌ lrs is not array:", typeof lrs, lrs);
      return res.json([]);
    }

    console.log(`📊 Found ${lrs.length} LRs`);

    // Sort by consignmentId (DESC) to show recent first
    const sorted = lrs.sort((a, b) => Number(b.consignmentId) - Number(a.consignmentId));
    console.log("🔄 Sorted LRs:", sorted.length);

    const formatted = await Promise.all(
      sorted.map(async (lr, index) => {
        console.log(`📝 Processing LR ${index + 1}:`, lr.consignmentId);
        
        const consignor = await storage.getConsignor(lr.consignorId);
        const consignee = await storage.getConsignee(lr.consigneeId);
        const vehicle = lr.vehicleId ? await storage.getVehicle(lr.vehicleId) : null;

        const result = {
          id: lr.consignmentId,
          cnoteNo: lr.cnoteNo,
          date: lr.bookingDate,
          consignor: consignor?.name || "Unknown",
          consignee: consignee?.name || "Unknown",
          vehicle: vehicle?.vehicleNo || "Not assigned",
          status: lr.transportMode || "in-transit",
        };
        
        console.log(`✅ Processed LR ${index + 1}:`, result);
        return result;
      })
    );

    console.log("🚀 API sending response:", formatted.length, "items");
    res.json(formatted);
  } catch (err) {
    console.error("💥 API error in /api/recent/lrs:", err);
    res.status(500).json({ 
      error: "Failed to fetch recent LRs",
      message: err instanceof Error ? err.message : String(err)
    });
  }
});

  app.put("/api/lrs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        note: insertConsignmentNoteSchema.partial().optional(),
        invoices: z.array(insertInvoiceLineItemSchema.omit({ consignmentId: true })).optional(),
        details: insertConsignmentDetailsSchema.omit({ consignmentId: true }).partial().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      const lr = await storage.updateConsignmentNote(id, validatedData);
      if (!lr) {
        return res.status(404).json({ message: "LR not found" });
      }
      res.json(lr);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid LR data", errors: error.errors });
      }
      console.error("Error updating LR:", error);
      res.status(500).json({ message: "Failed to update LR" });
    }
  });

  app.delete("/api/lrs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConsignmentNote(id);
      if (!success) {
        return res.status(404).json({ message: "LR not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting LR:", error);
      res.status(500).json({ message: "Failed to delete LR" });
    }
  });

// Freight Master Routes
  app.get("/api/freights", async (req, res) => {
    try {
      const freights = await storage.getAllFreights();
      res.json(freights);
    } catch (error) {
      console.error("Error fetching freights:", error);
      res.status(500).json({ message: "Failed to fetch freight rates" });
    }
  });

  app.get("/api/freights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const freight = await storage.getFreight(id);
      if (!freight) {
        return res.status(404).json({ message: "Freight rate not found" });
      }
      res.json(freight);
    } catch (error) {
      console.error("Error fetching freight:", error);
      res.status(500).json({ message: "Failed to fetch freight rate" });
    }
  });

  app.post("/api/freights", async (req, res) => {
    try {
      const validatedData = insertFreightSchema.parse(req.body);
      const freight = await storage.createFreight(validatedData);
      res.status(201).json(freight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid freight data", errors: error.errors });
      }
      console.error("Error creating freight:", error);
      res.status(500).json({ message: "Failed to create freight rate" });
    }
  });

  app.put("/api/freights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFreightSchema.partial().parse(req.body);
      const freight = await storage.updateFreight(id, validatedData);
      if (!freight) {
        return res.status(404).json({ message: "Freight rate not found" });
      }
      res.json(freight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid freight data", errors: error.errors });
      }
      console.error("Error updating freight:", error);
      res.status(500).json({ message: "Failed to update freight rate" });
    }
  });

  app.delete("/api/freights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFreight(id);
      if (!success) {
        return res.status(404).json({ message: "Freight rate not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting freight:", error);
      res.status(500).json({ message: "Failed to delete freight rate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
