import { Router } from "express";
import { db } from "./db";
import { users, requests, projects, milestones, activityLogs, quotations, invoices, payments, supportTickets, ticketMessages, projectMessages, files as filesTable, contactMessages } from "./db/schema";
import { eq, desc, and, count, sum } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { adminAuth } from "./firebaseAdmin";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

// File upload setup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

export const apiRouter = Router();

// Middleware
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};

apiRouter.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, companyName, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = `usr_${Date.now()}`;
    await db.insert(users).values({ id: newUserId, name, email, password: hashedPassword, companyName: companyName || "", phone: phone || "", role: "CLIENT" });
    const token = jwt.sign({ id: newUserId, role: "CLIENT" }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: newUserId, name, email, role: "CLIENT", phone: phone || "", companyName: companyName || "" } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }
    
    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;
    const name = decodedToken.name || email?.split('@')[0];
    
    if (!email) {
      return res.status(400).json({ error: "Google email is missing from token" });
    }

    let [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      // Determine if admin by hardcoded email rule (example for gunjkardevanand@gmail.com)
      const role = email.toLowerCase() === "gunjkardevanand@gmail.com" ? "ADMIN" : "CLIENT";
      const newUserId = `usr_g_${Date.now()}`;
      const dummyPass = await bcrypt.hash(`google_${Date.now()}_auth`, 10);
      await db.insert(users).values({
        id: newUserId,
        name: name || email.split('@')[0],
        email,
        password: dummyPass,
        role: role,
        companyName: "",
        phone: ""
      });
      user = { id: newUserId, name: name || email.split('@')[0], email, role: role, companyName: "", phone: "" } as any;
    } else if (email.toLowerCase() === "gunjkardevanand@gmail.com" && user.role !== "ADMIN") {
      // Auto-promote this specific user to ADMIN if they login
      await db.update(users).set({ role: "ADMIN" }).where(eq(users.id, user.id));
      user.role = "ADMIN";
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, companyName: user.companyName } });
  } catch (e: any) {
    res.status(400).json({ error: "Google authentication failed: " + e.message });
  }
});

// Demo OTP store in memory
const otpStore = new Map<string, { code: string; expiresAt: number }>();

apiRouter.post("/auth/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ error: "Please enter a valid phone number" });
    }
    const cleanPhone = phone.trim();
    const demoCode = "123456";
    otpStore.set(cleanPhone, { code: demoCode, expiresAt: Date.now() + 10 * 60 * 1000 });
    res.json({
      success: true,
      message: `OTP sent successfully to ${cleanPhone}. (Use demo code: 123456)`,
      demoOtp: demoCode
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/auth/verify-otp", async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required" });
    }
    const cleanPhone = phone.trim();
    const stored = otpStore.get(cleanPhone);
    const isValid = otp === "123456" || (stored && stored.code === otp && stored.expiresAt > Date.now());
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please use code 123456" });
    }
    otpStore.delete(cleanPhone);

    // Find or create user
    const [existing] = await db.select().from(users).where(eq(users.phone, cleanPhone));
    let user = existing;
    if (!user) {
      const newUserId = `usr_phone_${Date.now()}`;
      const dummyPass = await bcrypt.hash(`otp_${Date.now()}_auth`, 10);
      const generatedEmail = `client_${cleanPhone.replace(/\D/g, '')}@client.local`;
      const clientName = name || `Client ${cleanPhone.slice(-4)}`;
      await db.insert(users).values({
        id: newUserId,
        name: clientName,
        email: generatedEmail,
        phone: cleanPhone,
        password: dummyPass,
        role: "CLIENT",
        companyName: ""
      });
      user = { id: newUserId, name: clientName, email: generatedEmail, role: "CLIENT", phone: cleanPhone, companyName: "" } as any;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, companyName: user.companyName } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, companyName: user.companyName } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/auth/me", requireAuth, async (req: any, res) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, companyName: users.companyName, phone: users.phone }).from(users).where(eq(users.id, req.user.id));
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Client Profile endpoints
apiRouter.get("/client/profile", requireAuth, async (req: any, res) => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, companyName: users.companyName, phone: users.phone, createdAt: users.createdAt }).from(users).where(eq(users.id, req.user.id));
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.put("/client/profile", requireAuth, async (req: any, res) => {
  try {
    const { name, phone, companyName } = req.body;
    await db.update(users).set({ name, phone, companyName }).where(eq(users.id, req.user.id));
    const [updated] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, companyName: users.companyName, phone: users.phone }).from(users).where(eq(users.id, req.user.id));
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Admin stats
apiRouter.get("/admin/stats", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const totalClients = (await db.select({ count: count() }).from(users).where(eq(users.role, "CLIENT")))[0].count;
    const activeProjects = (await db.select({ count: count() }).from(projects).where(eq(projects.status, "IN_PROGRESS")))[0].count;
    const newRequests = (await db.select({ count: count() }).from(requests).where(eq(requests.status, "NEW")))[0].count;
    const pendingTickets = (await db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, "OPEN")))[0].count;
    res.json({ totalClients, activeProjects, newRequests, pendingTickets });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Client stats
apiRouter.get("/client/stats", requireAuth, async (req: any, res) => {
  try {
    const activeProjects = (await db.select({ count: count() }).from(projects).where(and(eq(projects.clientId, req.user.id), eq(projects.status, "IN_PROGRESS"))))[0].count;
    const pendingRequests = (await db.select({ count: count() }).from(requests).where(and(eq(requests.userId, req.user.id), eq(requests.status, "NEW"))))[0].count;
    const openTickets = (await db.select({ count: count() }).from(supportTickets).where(and(eq(supportTickets.clientId, req.user.id), eq(supportTickets.status, "OPEN"))))[0].count;
    res.json({ activeProjects, pendingRequests, openTickets, pendingPayments: 0 });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Requests - Authenticated only!
apiRouter.post("/requests", requireAuth, async (req: any, res) => {
  try {
    const [currentUser] = await db.select().from(users).where(eq(users.id, req.user.id));
    const reqId = `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    const newDbId = `req_db_${Date.now()}`;
    
    await db.insert(requests).values({
      id: newDbId,
      requestId: reqId,
      userId: req.user.id,
      name: req.body.name || currentUser?.name || "Client",
      email: req.body.email || currentUser?.email || "",
      phone: req.body.phone || currentUser?.phone || "",
      companyName: req.body.companyName || currentUser?.companyName || "",
      projectType: req.body.projectType || "Website Development",
      description: req.body.description || "",
      budgetRange: req.body.budgetRange || "",
      status: "NEW"
    });

    await db.insert(activityLogs).values({
      id: `act_${Date.now()}`,
      action: `New project request submitted: ${req.body.projectType} (${reqId})`,
      userId: req.user.id
    });

    res.json({ requestId: reqId, id: newDbId, message: "Request created successfully" });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/client/requests", requireAuth, async (req: any, res) => {
  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, req.user.id));
    const userRequests = await db.select().from(requests)
      .where(eq(requests.userId, req.user.id))
      .orderBy(desc(requests.createdAt));

    // Also get quotes for each request if any
    const requestsWithQuotes = await Promise.all(userRequests.map(async (r) => {
      const quotes = await db.select().from(quotations).where(eq(quotations.requestId, r.id));
      return { ...r, quotations: quotes };
    }));

    res.json(requestsWithQuotes);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/admin/requests", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const allRequests = await db.select().from(requests).orderBy(desc(requests.createdAt));
    res.json(allRequests);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/admin/requests/:id", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await db.update(requests).set({ status: req.body.status }).where(eq(requests.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/admin/requests/:id/convert", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { clientId, name, type, description, totalValue, startDate, expectedCompletionDate } = req.body;
    const projId = `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newDbId = `prj_${Date.now()}`;
    await db.insert(projects).values({
      id: newDbId,
      projectId: projId,
      clientId,
      requestId: req.params.id,
      name,
      type,
      status: "NOT_STARTED",
      description,
      totalValue: Number(totalValue) || 0,
      startDate,
      expectedCompletionDate
    });
    await db.update(requests).set({ status: "CONVERTED" }).where(eq(requests.id, req.params.id));
    res.json({ success: true, projectId: newDbId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Projects
apiRouter.get("/client/projects", requireAuth, async (req: any, res) => {
  try {
    const userProjects = await db.select().from(projects).where(eq(projects.clientId, req.user.id)).orderBy(desc(projects.createdAt));
    res.json(userProjects);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/admin/projects", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    res.json(allProjects);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/projects/:id", requireAuth, async (req: any, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "ADMIN" && project.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    const projMilestones = await db.select().from(milestones).where(eq(milestones.projectId, project.id)).orderBy(milestones.order);
    const projLogs = await db.select().from(activityLogs).where(eq(activityLogs.projectId, project.id)).orderBy(desc(activityLogs.createdAt));
    const messages = await db.select().from(projectMessages).where(eq(projectMessages.projectId, project.id)).orderBy(projectMessages.createdAt);
    const projFiles = await db.select().from(filesTable).where(eq(filesTable.projectId, project.id));
    
    res.json({ ...project, milestones: projMilestones, logs: projLogs, messages, files: projFiles });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/admin/projects/:id", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await db.update(projects).set(req.body).where(eq(projects.id, req.params.id));
    if (req.body.status || req.body.progress) {
      await db.insert(activityLogs).values({
        id: `log_${Date.now()}`,
        projectId: req.params.id,
        userId: req.user.id,
        action: "PROJECT_UPDATED",
        description: `Project ${req.body.status ? 'status set to ' + req.body.status : 'progress updated'}`
      });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/admin/projects/:id/milestones", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await db.insert(milestones).values({
      id: `ms_${Date.now()}`,
      projectId: req.params.id,
      title: req.body.title,
      description: req.body.description,
      order: req.body.order,
      status: req.body.status || "PENDING",
      deadline: req.body.deadline
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/admin/milestones/:id", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await db.update(milestones).set(req.body).where(eq(milestones.id, req.params.id));
    const [ms] = await db.select().from(milestones).where(eq(milestones.id, req.params.id));
    if (req.body.status === "COMPLETED") {
      await db.insert(activityLogs).values({
        id: `log_${Date.now()}`,
        projectId: ms.projectId,
        userId: req.user.id,
        action: "MILESTONE_COMPLETED",
        description: `Milestone "${ms.title}" completed`
      });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Messages & Files
apiRouter.post("/projects/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (req.user.role !== "ADMIN" && project.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    await db.insert(projectMessages).values({
      id: `msg_${Date.now()}`,
      projectId: req.params.id,
      userId: req.user.id,
      message: req.body.message,
      isInternal: req.user.role === "ADMIN" ? req.body.isInternal || false : false
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/projects/:id/files", requireAuth, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (req.user.role !== "ADMIN" && project.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    const fileUrl = `/uploads/${req.file.filename}`;
    await db.insert(filesTable).values({
      id: `file_${Date.now()}`,
      projectId: req.params.id,
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size
    });
    
    await db.insert(activityLogs).values({
      id: `log_${Date.now()}`,
      projectId: req.params.id,
      userId: req.user.id,
      action: "FILE_UPLOADED",
      description: `Uploaded file: ${req.file.originalname}`
    });
    
    res.json({ success: true, fileUrl });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Tickets
apiRouter.post("/tickets", requireAuth, async (req: any, res) => {
  try {
    const tktId = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDbId = `tkt_${Date.now()}`;
    await db.insert(supportTickets).values({
      id: newDbId,
      ticketId: tktId,
      clientId: req.user.id,
      subject: req.body.subject,
      category: req.body.category,
      priority: req.body.priority || "MEDIUM",
      status: "OPEN"
    });
    if (req.body.message) {
      await db.insert(ticketMessages).values({
        id: `msg_${Date.now()}`,
        ticketId: newDbId,
        userId: req.user.id,
        message: req.body.message
      });
    }
    res.json({ success: true, ticketId: tktId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/client/tickets", requireAuth, async (req: any, res) => {
  try {
    const userTickets = await db.select().from(supportTickets).where(eq(supportTickets.clientId, req.user.id)).orderBy(desc(supportTickets.createdAt));
    res.json(userTickets);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/admin/tickets", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const allTickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    res.json(allTickets);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/tickets/:id", requireAuth, async (req: any, res) => {
  try {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, req.params.id));
    if (!ticket) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "ADMIN" && ticket.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    const messages = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticket.id)).orderBy(ticketMessages.createdAt);
    res.json({ ...ticket, messages });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/tickets/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, req.params.id));
    if (req.user.role !== "ADMIN" && ticket.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    await db.insert(ticketMessages).values({
      id: `msg_${Date.now()}`,
      ticketId: req.params.id,
      userId: req.user.id,
      message: req.body.message,
      isInternal: req.user.role === "ADMIN" ? req.body.isInternal || false : false
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/admin/tickets/:id", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    await db.update(supportTickets).set(req.body).where(eq(supportTickets.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Quotations
apiRouter.post("/admin/requests/:id/quotations", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { clientId, totalAmount, items, validUntil } = req.body;
    await db.insert(quotations).values({
      id: `quo_${Date.now()}`,
      requestId: req.params.id,
      clientId,
      totalAmount,
      items: JSON.stringify(items),
      validUntil,
      status: "SENT"
    });
    await db.update(requests).set({ status: "PROPOSAL_SENT" }).where(eq(requests.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/client/quotations", requireAuth, async (req: any, res) => {
  try {
    const userQuotations = await db.select().from(quotations).where(eq(quotations.clientId, req.user.id)).orderBy(desc(quotations.createdAt));
    res.json(userQuotations);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/quotations/:id/accept", requireAuth, async (req: any, res) => {
  try {
    const [quo] = await db.select().from(quotations).where(eq(quotations.id, req.params.id));
    if (!quo) return res.status(404).json({ error: "Quotation not found" });
    if (quo.clientId !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    
    await db.update(quotations).set({ status: "ACCEPTED" }).where(eq(quotations.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/quotations/:id/accept", requireAuth, async (req: any, res) => {
  try {
    const [quo] = await db.select().from(quotations).where(eq(quotations.id, req.params.id));
    if (!quo) return res.status(404).json({ error: "Quotation not found" });
    if (quo.clientId !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    
    await db.update(quotations).set({ status: "ACCEPTED" }).where(eq(quotations.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.patch("/quotations/:id/reject", requireAuth, async (req: any, res) => {
  try {
    const [quo] = await db.select().from(quotations).where(eq(quotations.id, req.params.id));
    if (!quo) return res.status(404).json({ error: "Quotation not found" });
    if (quo.clientId !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    
    await db.update(quotations).set({ status: "REJECTED" }).where(eq(quotations.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/quotations/:id/reject", requireAuth, async (req: any, res) => {
  try {
    const [quo] = await db.select().from(quotations).where(eq(quotations.id, req.params.id));
    if (!quo) return res.status(404).json({ error: "Quotation not found" });
    if (quo.clientId !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
    
    await db.update(quotations).set({ status: "REJECTED" }).where(eq(quotations.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Client all messages / activity feed
apiRouter.get("/client/messages", requireAuth, async (req: any, res) => {
  try {
    // Get all user projects
    const userProjects = await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.clientId, req.user.id));
    const projectIds = userProjects.map(p => p.id);
    
    let allMsgs: any[] = [];
    if (projectIds.length > 0) {
      const msgs = await db.select().from(projectMessages).orderBy(desc(projectMessages.createdAt));
      allMsgs = msgs.filter(m => projectIds.includes(m.projectId) && !m.isInternal);
    }
    
    res.json(allMsgs);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Invoices & Payments
apiRouter.get("/client/invoices", requireAuth, async (req: any, res) => {
  try {
    const userInvoices = await db.select().from(invoices).where(eq(invoices.clientId, req.user.id)).orderBy(desc(invoices.createdAt));
    res.json(userInvoices);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.get("/admin/invoices", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    res.json(allInvoices);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/admin/projects/:id/invoices", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { clientId, totalAmount, items, dueDate } = req.body;
    const invId = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    await db.insert(invoices).values({
      id: `inv_${Date.now()}`,
      invoiceId: invId,
      projectId: req.params.id,
      clientId,
      totalAmount,
      items: JSON.stringify(items),
      dueDate,
      status: "SENT"
    });
    res.json({ success: true, invoiceId: invId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

apiRouter.post("/invoices/:id/pay", requireAuth, async (req: any, res) => {
  try {
    // Mocking payment
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, req.params.id));
    if (inv.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    
    await db.insert(payments).values({
      id: `pay_${Date.now()}`,
      invoiceId: inv.id,
      clientId: req.user.id,
      amount: inv.totalAmount - inv.amountPaid,
      status: "COMPLETED",
      method: "CREDIT_CARD"
    });
    
    await db.update(invoices).set({ status: "PAID", amountPaid: inv.totalAmount }).where(eq(invoices.id, inv.id));
    if (inv.projectId) {
      const [proj] = await db.select().from(projects).where(eq(projects.id, inv.projectId));
      await db.update(projects).set({ amountPaid: proj.amountPaid + (inv.totalAmount - inv.amountPaid) }).where(eq(projects.id, inv.projectId));
    }
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Contact
apiRouter.post("/contact", async (req, res) => {
  try {
    await db.insert(contactMessages).values({
      id: `cont_${Date.now()}`,
      ...req.body
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
