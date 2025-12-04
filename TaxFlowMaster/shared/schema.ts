import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientType: text("client_type").notNull(), // individual, business, partnership, pvtltd, others
  contactNumber: text("contact_number").notNull(),
  email: text("email"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  state: text("state"),
  services: text("services").array(), // IT Filing, GST, TDS, Audit, etc.
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive, pending_docs, payment_due
  createdAt: timestamp("created_at").defaultNow(),
});

export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  pan: text("pan"),
  aadhaar: text("aadhaar"),
  gstin: text("gstin"),
  dateOfRegistration: timestamp("date_of_registration"),
  bankDetails: jsonb("bank_details"), // { accountNumber, ifsc, bankName }
  gstPortalUsername: text("gst_portal_username"),
  gstPortalPassword: text("gst_portal_password"),
  itPortalUsername: text("it_portal_username"),
  itPortalPassword: text("it_portal_password"),
  tdsLogin: text("tds_login"),
  documents: text("documents").array(), // Array of document file paths/names
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  serviceName: text("service_name").notNull(),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").notNull().default("unpaid"), // paid, unpaid, partially_paid
  paymentMode: text("payment_mode"), // cash, upi, bank, cheque
  paymentDate: timestamp("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  serviceName: text("service_name").notNull(), // IT Return, GST Filing, GSTR-1/3B, TDS Return
  dueDate: timestamp("due_date").notNull(),
  reminderDate: timestamp("reminder_date"),
  status: text("status").notNull().default("pending"), // pending, completed, overdue
  notes: text("notes"),
});

export const firmSettings = pgTable("firm_settings", {
  id: serial("id").primaryKey(),
  firmName: text("firm_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  gstin: text("gstin"),
  logo: text("logo"), // path to logo file
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true });
export const insertFirmSettingsSchema = createInsertSchema(firmSettings).omit({ id: true });

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type FirmSettings = typeof firmSettings.$inferSelect;
export type InsertFirmSettings = z.infer<typeof insertFirmSettingsSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferSelect;
