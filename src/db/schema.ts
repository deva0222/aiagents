import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["ADMIN", "CLIENT"] }).default("CLIENT").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  projectType: text("project_type").notNull(),
  description: text("description").notNull(),
  budgetRange: text("budget_range"),
  status: text("status", { enum: ["NEW", "CONTACTED", "DISCUSSION", "PROPOSAL_SENT", "WAITING_FOR_CLIENT", "APPROVED", "REJECTED", "CONVERTED", "CLOSED"] }).default("NEW").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  clientId: text("client_id").notNull().references(() => users.id),
  requestId: text("request_id").references(() => requests.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status", { enum: ["NOT_STARTED", "IN_PROGRESS", "WAITING_FOR_CLIENT", "ON_HOLD", "COMPLETED"] }).default("NOT_STARTED").notNull(),
  progress: integer("progress").default(0),
  totalValue: integer("total_value").default(0),
  amountPaid: integer("amount_paid").default(0),
  startDate: text("start_date"),
  expectedCompletionDate: text("expected_completion_date"),
  description: text("description"),
  projectManager: text("project_manager"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["PENDING", "IN_PROGRESS", "COMPLETED"] }).default("PENDING").notNull(),
  order: integer("order").notNull(),
  deadline: text("deadline"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const quotations = sqliteTable("quotations", {
  id: text("id").primaryKey(),
  requestId: text("request_id").references(() => requests.id),
  clientId: text("client_id").references(() => users.id),
  totalAmount: integer("total_amount").notNull(),
  status: text("status", { enum: ["DRAFT", "SENT", "ACCEPTED", "REJECTED"] }).default("DRAFT").notNull(),
  items: text("items").notNull(), // JSON string array of { service, quantity, price }
  validUntil: text("valid_until"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().unique(), // e.g. INV-2026-0001
  projectId: text("project_id").references(() => projects.id),
  clientId: text("client_id").notNull().references(() => users.id),
  totalAmount: integer("total_amount").notNull(),
  amountPaid: integer("amount_paid").default(0),
  status: text("status", { enum: ["DRAFT", "SENT", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"] }).default("DRAFT").notNull(),
  dueDate: text("due_date"),
  items: text("items").notNull(), // JSON string array of { description, amount }
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id),
  clientId: text("client_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED"] }).default("PENDING").notNull(),
  method: text("method"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(), // e.g. TKT-2026-0001
  clientId: text("client_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH"] }).default("MEDIUM").notNull(),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED"] }).default("OPEN").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const ticketMessages = sqliteTable("ticket_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => supportTickets.id),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isInternal: integer("is_internal", { mode: 'boolean' }).default(false).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projectMessages = sqliteTable("project_messages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isInternal: integer("is_internal", { mode: 'boolean' }).default(false).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id),
  ticketId: text("ticket_id").references(() => supportTickets.id),
  userId: text("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const portfolio = sqliteTable("portfolio", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  technologies: text("technologies"), // JSON string array
  isPublished: integer("is_published", { mode: 'boolean' }).default(true).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isPublished: integer("is_published", { mode: 'boolean' }).default(false).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0),
  isPublished: integer("is_published", { mode: 'boolean' }).default(true).notNull(),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
