import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertKycDocumentSchema, 
  insertPaymentSchema, 
  insertReminderSchema,
  insertFirmSettingsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const { search } = req.query;
      let clients;
      
      if (search && typeof search === 'string') {
        clients = await storage.searchClients(search);
      } else {
        clients = await storage.getAllClients();
      }
      
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // KYC Documents
  app.get("/api/clients/:clientId/kyc", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const kyc = await storage.getKycByClientId(clientId);
      res.json(kyc);
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      res.status(500).json({ message: "Failed to fetch KYC documents" });
    }
  });

  app.post("/api/clients/:clientId/kyc", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const validatedData = insertKycDocumentSchema.parse({
        ...req.body,
        clientId
      });
      const kyc = await storage.createKycDocument(validatedData);
      res.status(201).json(kyc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid KYC data", errors: error.errors });
      }
      console.error("Error creating KYC document:", error);
      res.status(500).json({ message: "Failed to create KYC document" });
    }
  });

  app.put("/api/clients/:clientId/kyc", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const validatedData = insertKycDocumentSchema.partial().parse(req.body);
      const kyc = await storage.updateKycDocument(clientId, validatedData);
      
      if (!kyc) {
        return res.status(404).json({ message: "KYC document not found" });
      }
      
      res.json(kyc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid KYC data", errors: error.errors });
      }
      console.error("Error updating KYC document:", error);
      res.status(500).json({ message: "Failed to update KYC document" });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/clients/:clientId/payments", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const payments = await storage.getPaymentsByClientId(clientId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching client payments:", error);
      res.status(500).json({ message: "Failed to fetch client payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, validatedData);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePayment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/clients/:clientId/reminders", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const reminders = await storage.getRemindersByClientId(clientId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching client reminders:", error);
      res.status(500).json({ message: "Failed to fetch client reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertReminderSchema.partial().parse(req.body);
      const reminder = await storage.updateReminder(id, validatedData);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);
      
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Firm Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getFirmSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching firm settings:", error);
      res.status(500).json({ message: "Failed to fetch firm settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertFirmSettingsSchema.parse(req.body);
      const settings = await storage.updateFirmSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating firm settings:", error);
      res.status(500).json({ message: "Failed to update firm settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
