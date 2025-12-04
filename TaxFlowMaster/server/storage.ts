import { 
  clients, 
  kycDocuments, 
  payments, 
  reminders, 
  firmSettings,
  users,
  type Client, 
  type InsertClient,
  type KycDocument,
  type InsertKycDocument,
  type Payment,
  type InsertPayment,
  type Reminder,
  type InsertReminder,
  type FirmSettings,
  type InsertFirmSettings,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  searchClients(query: string): Promise<Client[]>;

  // KYC Documents
  getKycByClientId(clientId: number): Promise<KycDocument | undefined>;
  createKycDocument(kyc: InsertKycDocument): Promise<KycDocument>;
  updateKycDocument(clientId: number, kyc: Partial<InsertKycDocument>): Promise<KycDocument | undefined>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByClientId(clientId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  // Reminders
  getAllReminders(): Promise<Reminder[]>;
  getRemindersByClientId(clientId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;

  // Firm Settings
  getFirmSettings(): Promise<FirmSettings | undefined>;
  updateFirmSettings(settings: InsertFirmSettings): Promise<FirmSettings>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalClients: number;
    upcomingDues: number;
    outstandingAmount: number;
    monthlyRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private kycDocuments: Map<number, KycDocument>;
  private payments: Map<number, Payment>;
  private reminders: Map<number, Reminder>;
  private firmSettings: FirmSettings | undefined;
  private currentUserId: number;
  private currentClientId: number;
  private currentKycId: number;
  private currentPaymentId: number;
  private currentReminderId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.kycDocuments = new Map();
    this.payments = new Map();
    this.reminders = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentKycId = 1;
    this.currentPaymentId = 1;
    this.currentReminderId = 1;

    // Initialize with default firm settings
    this.firmSettings = {
      id: 1,
      firmName: "Sharma & Associates",
      contactPerson: "CA Rajesh Sharma",
      contactNumber: "+91 98765 43210",
      email: "contact@sharmaassociates.com",
      address: "123 Business District, Mumbai, Maharashtra - 400001",
      gstin: "27XXXXX1234X1ZX",
      logo: null
    };
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Clients
  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient,
      id, 
      createdAt: new Date(),
      address: insertClient.address || null,
      email: insertClient.email || null,
      whatsapp: insertClient.whatsapp || null,
      state: insertClient.state || null,
      services: insertClient.services || null,
      notes: insertClient.notes || null,
      status: insertClient.status || "active"
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    
    const updated: Client = { ...existing, ...clientUpdate };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  async searchClients(query: string): Promise<Client[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.clients.values()).filter(client =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.contactNumber.includes(query) ||
      client.email?.toLowerCase().includes(lowerQuery) ||
      client.clientType.toLowerCase().includes(lowerQuery)
    );
  }

  // KYC Documents
  async getKycByClientId(clientId: number): Promise<KycDocument | undefined> {
    return Array.from(this.kycDocuments.values()).find(kyc => kyc.clientId === clientId);
  }

  async createKycDocument(insertKyc: InsertKycDocument): Promise<KycDocument> {
    const id = this.currentKycId++;
    const kyc: KycDocument = { 
      ...insertKyc, 
      id,
      pan: insertKyc.pan || null,
      aadhaar: insertKyc.aadhaar || null,
      gstin: insertKyc.gstin || null,
      dateOfRegistration: insertKyc.dateOfRegistration || null,
      bankDetails: insertKyc.bankDetails || null,
      gstPortalUsername: insertKyc.gstPortalUsername || null,
      gstPortalPassword: insertKyc.gstPortalPassword || null,
      itPortalUsername: insertKyc.itPortalUsername || null,
      itPortalPassword: insertKyc.itPortalPassword || null,
      tdsLogin: insertKyc.tdsLogin || null,
      documents: insertKyc.documents || null
    };
    this.kycDocuments.set(id, kyc);
    return kyc;
  }

  async updateKycDocument(clientId: number, kycUpdate: Partial<InsertKycDocument>): Promise<KycDocument | undefined> {
    const existing = Array.from(this.kycDocuments.values()).find(kyc => kyc.clientId === clientId);
    if (!existing) return undefined;
    
    const updated: KycDocument = { ...existing, ...kycUpdate };
    this.kycDocuments.set(existing.id, updated);
    return updated;
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPaymentsByClientId(clientId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.clientId === clientId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt: new Date(),
      invoiceNumber: insertPayment.invoiceNumber || `INV-${String(id).padStart(6, '0')}`,
      notes: insertPayment.notes || null,
      status: insertPayment.status || "unpaid",
      paymentMode: insertPayment.paymentMode || null,
      paymentDate: insertPayment.paymentDate || null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentUpdate: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existing = this.payments.get(id);
    if (!existing) return undefined;
    
    const updated: Payment = { ...existing, ...paymentUpdate };
    this.payments.set(id, updated);
    return updated;
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }

  // Reminders
  async getAllReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }

  async getRemindersByClientId(clientId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(reminder => reminder.clientId === clientId);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = { 
      ...insertReminder, 
      id,
      notes: insertReminder.notes || null,
      status: insertReminder.status || "pending",
      reminderDate: insertReminder.reminderDate || null
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, reminderUpdate: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const existing = this.reminders.get(id);
    if (!existing) return undefined;
    
    const updated: Reminder = { ...existing, ...reminderUpdate };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Firm Settings
  async getFirmSettings(): Promise<FirmSettings | undefined> {
    return this.firmSettings;
  }

  async updateFirmSettings(settings: InsertFirmSettings): Promise<FirmSettings> {
    this.firmSettings = { ...this.firmSettings, ...settings, id: 1 };
    return this.firmSettings;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalClients: number;
    upcomingDues: number;
    outstandingAmount: number;
    monthlyRevenue: number;
  }> {
    const totalClients = this.clients.size;
    
    const currentDate = new Date();
    const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDues = Array.from(this.reminders.values()).filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      return dueDate >= currentDate && dueDate <= nextWeek && reminder.status === 'pending';
    }).length;

    const outstandingPayments = Array.from(this.payments.values()).filter(payment => 
      payment.status === 'unpaid' || payment.status === 'partially_paid'
    );
    const outstandingAmount = outstandingPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.feeAmount.toString()), 0
    );

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthlyPayments = Array.from(this.payments.values()).filter(payment => {
      if (payment.status !== 'paid' || !payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.feeAmount.toString()), 0
    );

    return {
      totalClients,
      upcomingDues,
      outstandingAmount,
      monthlyRevenue
    };
  }
}

export const storage = new MemStorage();
