import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import {
  authenticate,
  generateEntityId,
  generateReferenceNumber,
  hashPassword,
  rateLimitMiddleware,
  requirePermission,
  signSessionToken,
  verifyPassword,
  verifyPlainPasscodeConstantTime,
  verifySessionToken,
} from './server/security.ts';
import {
  appendAuditLog,
  getDb,
  ROLE_PERMISSIONS,
  saveDb,
  type ProjectStatus,
} from './server/store.ts';

function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = parsed.data;
    next();
  };
}

function resolvePermissions(roles: string[]): string[] {
  const perms = new Set<string>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] || []) {
      perms.add(p);
    }
  }
  return Array.from(perms);
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Basic security headers compatible with AI Studio iframe preview
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  const authLimiter = rateLimitMiddleware(40, 15 * 60 * 1000);
  const publicFormLimiter = rateLimitMiddleware(30, 15 * 60 * 1000);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'afrinovera-platform' });
  });

  // ==========================================
  // PUBLIC WEBSITE API
  // ==========================================

  app.get('/api/public/bootstrap', (_req, res) => {
    const db = getDb();
    const publishedServices = db.services.filter((s) => s.isPublished);
    const portfolio = db.projects.filter(
      (p) => p.isPublicPortfolio && p.clientDisplayConsent
    );
    const posts = db.blogPosts.filter((b) => b.isPublished);
    res.json({
      settings: db.settings,
      services: publishedServices,
      featuredProjects: portfolio.filter((p) => p.isFeatured).slice(0, 3),
      latestPosts: posts.slice(0, 3),
    });
  });

  app.get('/api/public/services/:slug', (req, res) => {
    const db = getDb();
    const service = db.services.find(
      (s) => s.slug === req.params.slug && s.isPublished
    );
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ service });
  });

  app.get('/api/public/portfolio', (req, res) => {
    const db = getDb();
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const projects = db.projects.filter((p) => {
      if (!p.isPublicPortfolio || !p.clientDisplayConsent) return false;
      if (category !== 'all' && p.category !== category) return false;
      return true;
    });
    res.json({ projects });
  });

  app.get('/api/public/insights', (req, res) => {
    const db = getDb();
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const posts = db.blogPosts.filter((p) => {
      if (!p.isPublished) return false;
      if (category !== 'all' && p.categorySlug !== category) return false;
      if (q) {
        const hay = `${p.title.en} ${p.excerpt.en} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    res.json({ posts });
  });

  app.get('/api/public/insights/:slug', (req, res) => {
    const db = getDb();
    const post = db.blogPosts.find((p) => p.slug === req.params.slug && p.isPublished);
    if (!post) return res.status(404).json({ error: 'Article not found' });
    res.json({ post });
  });

  const quoteSchema = z.object({
    fullName: z.string().trim().min(2, 'Full name is required').max(120),
    email: z.string().trim().email('Valid email is required').max(160),
    phone: z.string().trim().min(6, 'Phone number is required').max(40),
    organizationName: z.string().trim().max(150).optional(),
    serviceSlug: z.string().trim().min(1),
    title: z.string().trim().min(3, 'Project title is required').max(200),
    description: z.string().trim().min(15, 'Please provide project details (15+ chars)').max(5000),
    estimatedBudget: z.string().trim().max(120).optional(),
    desiredCompletionDate: z.string().trim().max(50).optional(),
    securityAuthorizationConfirmed: z.boolean().optional(),
    attachmentNames: z.array(z.string().max(150)).max(5).optional(),
    clientUserId: z.string().optional(),
  });

  app.post('/api/public/quote-requests', publicFormLimiter, validateBody(quoteSchema), (req, res) => {
    const db = getDb();
    const referenceNumber = generateReferenceNumber('REQ');

    if (
      req.body.serviceSlug === 'cybersecurity-solutions' &&
      !req.body.securityAuthorizationConfirmed
    ) {
      return res.status(400).json({
        error: 'System or network owner authorization confirmation is required for cybersecurity assessments.',
      });
    }

    const authHeader = req.headers.authorization;
    const verifiedSession =
      authHeader && authHeader.startsWith('Bearer ')
        ? verifySessionToken(authHeader.slice(7))
        : null;

    const record = {
      id: generateEntityId('req'),
      referenceNumber,
      clientUserId: verifiedSession ? verifiedSession.userId : undefined,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      organizationName: req.body.organizationName,
      serviceSlug: req.body.serviceSlug,
      title: req.body.title,
      description: req.body.description,
      estimatedBudget: req.body.estimatedBudget,
      desiredCompletionDate: req.body.desiredCompletionDate,
      securityAuthorizationConfirmed: Boolean(req.body.securityAuthorizationConfirmed),
      attachmentNames: req.body.attachmentNames || [],
      status: 'SUBMITTED' as ProjectStatus,
      createdAt: new Date().toISOString(),
    };

    db.serviceRequests.unshift(record);
    appendAuditLog(db, {
      actorName: req.body.fullName,
      action: 'QUOTE_REQUEST_SUBMITTED',
      entityType: 'ServiceRequest',
      entityId: record.id,
      summary: `${referenceNumber} submitted for ${req.body.serviceSlug}`,
    });
    saveDb(db);

    res.status(201).json({
      referenceNumber,
      request: record,
    });
  });

  const inquirySchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(40).optional(),
    organizationName: z.string().trim().max(150).optional(),
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(10).max(4000),
  });

  app.post('/api/public/inquiries', publicFormLimiter, validateBody(inquirySchema), (req, res) => {
    const db = getDb();
    const referenceNumber = generateReferenceNumber('INQ');
    const inquiry = {
      id: generateEntityId('inq'),
      referenceNumber,
      ...req.body,
      status: 'NEW' as const,
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(inquiry);
    appendAuditLog(db, {
      actorName: req.body.fullName,
      action: 'INQUIRY_CREATED',
      entityType: 'Inquiry',
      entityId: inquiry.id,
      summary: `${referenceNumber}: ${req.body.subject}`,
    });
    saveDb(db);
    res.status(201).json({ referenceNumber, inquiry });
  });

  const consultationSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().min(6).max(40),
    organizationName: z.string().trim().max(150).optional(),
    preferredDate: z.string().min(4).max(60),
    timezone: z.string().max(80).default('Africa/Addis_Ababa'),
    meetingMode: z.enum(['ONLINE', 'IN_PERSON', 'PHONE']),
    topic: z.string().trim().min(3).max(200),
    notes: z.string().trim().max(2000).optional(),
  });

  app.post('/api/public/consultations', publicFormLimiter, validateBody(consultationSchema), (req, res) => {
    const db = getDb();
    const referenceNumber = generateReferenceNumber('CON');
    const consultation = {
      id: generateEntityId('con'),
      referenceNumber,
      ...req.body,
      status: 'REQUESTED' as const,
      createdAt: new Date().toISOString(),
    };
    db.consultations.unshift(consultation);
    appendAuditLog(db, {
      actorName: req.body.fullName,
      action: 'CONSULTATION_REQUESTED',
      entityType: 'Consultation',
      entityId: consultation.id,
      summary: `${referenceNumber}: ${req.body.topic}`,
    });
    saveDb(db);
    res.status(201).json({ referenceNumber, consultation });
  });

  // ==========================================
  // AUTHENTICATION (CLIENT + FIRST-RUN ADMIN)
  // ==========================================

  app.get('/api/auth/admin-status', (_req, res) => {
    const db = getDb();
    const envPasscodeActive = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
    res.json({
      claimed: Boolean(db.adminClaim),
      envPasscodeActive,
      claimedEmailHint: db.adminClaim ? db.adminClaim.email : undefined,
    });
  });

  app.post(
    '/api/auth/admin-claim',
    authLimiter,
    validateBody(
      z.object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(160),
        password: z.string().min(8, 'Password must be at least 8 characters').max(128),
      })
    ),
    (req, res) => {
      const db = getDb();
      const envPasscode = process.env.ADMIN_PASSCODE?.trim();
      if (envPasscode) {
        return res.status(409).json({
          error: 'Administrator passcode is already configured via environment secrets.',
        });
      }
      if (db.adminClaim) {
        return res.status(409).json({
          error: 'Administrator account has already been claimed.',
        });
      }

      const email = req.body.email.toLowerCase();
      db.adminClaim = {
        email,
        fullName: req.body.fullName,
        passwordHash: hashPassword(req.body.password),
        claimedAt: new Date().toISOString(),
      };
      appendAuditLog(db, {
        actorName: req.body.fullName,
        action: 'ADMIN_ACCOUNT_CLAIMED',
        entityType: 'AdminConfig',
        entityId: 'super-admin',
        summary: `Initial Super Administrator claimed for ${email}`,
      });
      saveDb(db);

      const roles = ['SUPER_ADMIN'];
      const token = signSessionToken({
        userId: 'super-admin',
        email,
        fullName: req.body.fullName,
        roles,
        permissions: resolvePermissions(roles),
      });

      res.status(201).json({
        token,
        user: {
          id: 'super-admin',
          email,
          fullName: req.body.fullName,
          roles,
        },
      });
    }
  );

  app.post(
    '/api/auth/admin-login',
    authLimiter,
    validateBody(
      z.object({
        email: z.string().trim().email().optional(),
        password: z.string().min(1),
      })
    ),
    (req, res) => {
      const db = getDb();
      const envPasscode = process.env.ADMIN_PASSCODE?.trim();

      if (envPasscode) {
        if (!verifyPlainPasscodeConstantTime(req.body.password, envPasscode)) {
          return res.status(401).json({ error: 'Invalid administrator passcode' });
        }
        const email = req.body.email?.toLowerCase() || db.settings.primaryEmail;
        const roles = ['SUPER_ADMIN'];
        appendAuditLog(db, {
          actorName: 'AFRINOVERA Administrator',
          action: 'ADMIN_LOGIN',
          entityType: 'AdminConfig',
          entityId: 'super-admin',
          summary: `Administrator signed in (${email})`,
        });
        saveDb(db);
        const token = signSessionToken({
          userId: 'super-admin',
          email,
          fullName: 'AFRINOVERA Administrator',
          roles,
          permissions: resolvePermissions(roles),
        });
        return res.json({
          token,
          user: { id: 'super-admin', email, fullName: 'AFRINOVERA Administrator', roles },
        });
      }

      if (!db.adminClaim) {
        return res.status(403).json({
          error: 'No administrator configured yet. Complete first-run setup first.',
        });
      }

      const inputEmail = req.body.email?.toLowerCase();
      if (inputEmail && inputEmail !== db.adminClaim.email) {
        return res.status(401).json({ error: 'Invalid administrator credentials' });
      }
      if (!verifyPassword(req.body.password, db.adminClaim.passwordHash)) {
        return res.status(401).json({ error: 'Invalid administrator credentials' });
      }

      const roles = ['SUPER_ADMIN'];
      appendAuditLog(db, {
        actorName: db.adminClaim.fullName,
        action: 'ADMIN_LOGIN',
        entityType: 'AdminConfig',
        entityId: 'super-admin',
        summary: `Administrator signed in (${db.adminClaim.email})`,
      });
      saveDb(db);
      const token = signSessionToken({
        userId: 'super-admin',
        email: db.adminClaim.email,
        fullName: db.adminClaim.fullName,
        roles,
        permissions: resolvePermissions(roles),
      });

      res.json({
        token,
        user: {
          id: 'super-admin',
          email: db.adminClaim.email,
          fullName: db.adminClaim.fullName,
          roles,
        },
      });
    }
  );

  app.post(
    '/api/auth/register',
    authLimiter,
    validateBody(
      z.object({
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(160),
        phone: z.string().trim().max(40).optional(),
        organizationName: z.string().trim().max(150).optional(),
        password: z.string().min(8, 'Password must be at least 8 characters').max(128),
      })
    ),
    (req, res) => {
      const db = getDb();
      const email = req.body.email.toLowerCase();
      if (db.users.some((u) => u.email === email)) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const user = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email,
        fullName: req.body.fullName,
        phone: req.body.phone,
        organizationName: req.body.organizationName,
        passwordHash: hashPassword(req.body.password),
        roles: ['CLIENT'],
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
      };

      db.users.push(user);
      // Link any previous guest quote requests with matching email
      for (const sr of db.serviceRequests) {
        if (!sr.clientUserId && sr.email.toLowerCase() === email) {
          sr.clientUserId = user.id;
        }
      }

      appendAuditLog(db, {
        actorName: user.fullName,
        action: 'CLIENT_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        summary: `Client registered: ${email}`,
      });
      saveDb(db);

      const token = signSessionToken({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        permissions: resolvePermissions(user.roles),
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          organizationName: user.organizationName,
          roles: user.roles,
        },
      });
    }
  );

  app.post(
    '/api/auth/login',
    authLimiter,
    validateBody(
      z.object({
        email: z.string().trim().email(),
        password: z.string().min(1),
      })
    ),
    (req, res) => {
      const db = getDb();
      const email = req.body.email.toLowerCase();
      const user = db.users.find((u) => u.email === email);

      if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Account suspended. Contact AFRINOVERA support.' });
      }

      appendAuditLog(db, {
        actorName: user.fullName,
        action: 'CLIENT_LOGIN',
        entityType: 'User',
        entityId: user.id,
        summary: `Client signed in (${email})`,
      });
      saveDb(db);

      const token = signSessionToken({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        permissions: resolvePermissions(user.roles),
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          organizationName: user.organizationName,
          roles: user.roles,
        },
      });
    }
  );

  app.get('/api/auth/me', authenticate, (req, res) => {
    const db = getDb();
    const userRecord = db.users.find((u) => u.id === req.auth!.userId);
    res.json({
      user: {
        id: req.auth!.userId,
        email: req.auth!.email,
        fullName: req.auth!.fullName,
        phone: userRecord?.phone,
        organizationName: userRecord?.organizationName,
        roles: req.auth!.roles,
        permissions: req.auth!.permissions,
      },
    });
  });

  // ==========================================
  // CLIENT PORTAL API (SCOPED TO req.auth.userId)
  // ==========================================

  app.get('/api/portal/dashboard', authenticate, (req, res) => {
    const db = getDb();
    const uid = req.auth!.userId;
    const email = req.auth!.email.toLowerCase();

    const requests = db.serviceRequests.filter(
      (r) => r.clientUserId === uid || r.email.toLowerCase() === email
    );
    const quotations = db.quotations.filter(
      (q) =>
        (q.clientUserId === uid || q.clientEmail?.toLowerCase() === email) &&
        q.status !== 'DRAFT'
    );
    const projects = db.projects.filter((p) => p.clientUserId === uid);
    const tickets = db.supportTickets
      .filter((t) => t.clientUserId === uid)
      .map((t) => ({
        ...t,
        messages: t.messages.filter((m) => !m.isInternalNote),
      }));

    res.json({ requests, quotations, projects, tickets });
  });

  app.patch('/api/portal/profile', authenticate, validateBody(
    z.object({
      fullName: z.string().trim().min(2).max(120),
      phone: z.string().trim().max(40).optional(),
      organizationName: z.string().trim().max(150).optional(),
    })
  ), (req, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.auth!.userId);
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    user.fullName = req.body.fullName;
    user.phone = req.body.phone;
    user.organizationName = req.body.organizationName;
    appendAuditLog(db, {
      actorName: user.fullName,
      action: 'CLIENT_PROFILE_UPDATED',
      entityType: 'User',
      entityId: user.id,
      summary: `Profile updated for ${user.email}`,
    });
    saveDb(db);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        organizationName: user.organizationName,
        roles: user.roles,
      },
    });
  });

  app.patch('/api/portal/requests/:id/cancel', authenticate, (req, res) => {
    const db = getDb();
    const sr = db.serviceRequests.find((r) => r.id === req.params.id);
    if (!sr) return res.status(404).json({ error: 'Service request not found' });
    if (sr.clientUserId !== req.auth!.userId && sr.email.toLowerCase() !== req.auth!.email.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!['SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_SENT'].includes(sr.status)) {
      return res.status(400).json({ error: 'Only pre-production requests can be cancelled' });
    }
    sr.status = 'CANCELLED';
    appendAuditLog(db, {
      actorName: req.auth!.fullName,
      action: 'REQUEST_CANCELLED_BY_CLIENT',
      entityType: 'ServiceRequest',
      entityId: sr.id,
      summary: `${sr.referenceNumber} cancelled by client`,
    });
    saveDb(db);
    res.json({ request: sr });
  });

  app.post(
    '/api/portal/quotations/:id/respond',
    authenticate,
    validateBody(z.object({ decision: z.enum(['APPROVED', 'REVISION_REQUESTED']) })),
    (req, res) => {
      const db = getDb();
      const quote = db.quotations.find((q) => q.id === req.params.id);
      if (!quote) return res.status(404).json({ error: 'Quotation not found' });
      if (
        quote.clientUserId !== req.auth!.userId &&
        quote.clientEmail?.toLowerCase() !== req.auth!.email.toLowerCase()
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      quote.status = req.body.decision;
      if (req.body.decision === 'APPROVED') {
        const linkedReq = db.serviceRequests.find((r) => r.id === quote.serviceRequestId);
        if (linkedReq) linkedReq.status = 'APPROVED';

        const existingProj = db.projects.find((p) => p.clientUserId === req.auth!.userId && p.title.en === quote.title);
        if (!existingProj) {
          const prjRef = generateReferenceNumber('PRJ');
          db.projects.unshift({
            id: generateEntityId('prj'),
            referenceNumber: prjRef,
            clientUserId: req.auth!.userId,
            clientName: req.auth!.fullName,
            slug: `${quote.referenceNumber.toLowerCase()}-${Date.now()}`,
            title: { en: quote.title },
            summary: { en: linkedReq?.description || quote.notes || 'Approved client engagement.' },
            category: linkedReq?.serviceSlug || 'software-solutions',
            technologies: ['Custom Delivery'],
            status: 'APPROVED',
            progressPercent: 15,
            isPublicPortfolio: false,
            clientDisplayConsent: false,
            isFeatured: false,
            updates: [
              {
                id: generateEntityId('upd'),
                authorName: 'AFRINOVERA PM',
                title: 'Quotation Approved',
                message: `Project ${prjRef} initialized following approval of ${quote.referenceNumber}.`,
                createdAt: new Date().toISOString(),
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: `QUOTATION_${req.body.decision}`,
        entityType: 'Quotation',
        entityId: quote.id,
        summary: `${quote.referenceNumber} marked ${req.body.decision}`,
      });
      saveDb(db);
      res.json({ quotation: quote });
    }
  );

  app.post(
    '/api/portal/support-tickets',
    authenticate,
    validateBody(
      z.object({
        category: z.enum(['GENERAL', 'TECHNICAL_ISSUE', 'BILLING_QUOTATION', 'SECURITY_INCIDENT', 'FEATURE_REQUEST']),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
        subject: z.string().min(4).max(200),
        message: z.string().min(10).max(4000),
      })
    ),
    (req, res) => {
      const db = getDb();
      const referenceNumber = generateReferenceNumber('TKT');
      const now = new Date().toISOString();
      const ticket = {
        id: generateEntityId('tkt'),
        referenceNumber,
        clientUserId: req.auth!.userId,
        clientName: req.auth!.fullName,
        category: req.body.category,
        priority: req.body.priority,
        subject: req.body.subject,
        status: 'OPEN' as const,
        messages: [
          {
            id: generateEntityId('msg'),
            senderName: req.auth!.fullName,
            senderRole: 'CLIENT',
            body: req.body.message,
            isInternalNote: false,
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      db.supportTickets.unshift(ticket);
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'SUPPORT_TICKET_OPENED',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        summary: `${referenceNumber}: ${req.body.subject}`,
      });
      saveDb(db);
      res.status(201).json({ ticket });
    }
  );

  app.post(
    '/api/portal/support-tickets/:id/messages',
    authenticate,
    validateBody(z.object({ body: z.string().min(2).max(4000) })),
    (req, res) => {
      const db = getDb();
      const ticket = db.supportTickets.find((t) => t.id === req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      if (ticket.clientUserId !== req.auth!.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      ticket.messages.push({
        id: generateEntityId('msg'),
        senderName: req.auth!.fullName,
        senderRole: 'CLIENT',
        body: req.body.body,
        isInternalNote: false,
        createdAt: new Date().toISOString(),
      });
      ticket.status = 'OPEN';
      ticket.updatedAt = new Date().toISOString();
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'SUPPORT_TICKET_CLIENT_REPLIED',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        summary: `${ticket.referenceNumber} client reply posted`,
      });
      saveDb(db);
      res.json({ ticket });
    }
  );

  // ==========================================
  // ADMIN OPERATIONS & CMS API (RBAC PROTECTED)
  // ==========================================

  app.get('/api/admin/overview', authenticate, requirePermission('projects:read_all'), (_req, res) => {
    const db = getDb();
    res.json({
      stats: {
        totalClients: db.users.filter((u) => u.roles.includes('CLIENT')).length,
        totalInquiries: db.inquiries.length + db.consultations.length,
        newQuoteRequests: db.serviceRequests.filter((r) => r.status === 'SUBMITTED').length,
        activeProjects: db.projects.filter((p) =>
          ['APPROVED', 'IN_PROGRESS', 'TESTING'].includes(p.status)
        ).length,
        completedProjects: db.projects.filter((p) => p.status === 'COMPLETED').length,
        openTickets: db.supportTickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
      },
      requests: db.serviceRequests,
      inquiries: db.inquiries,
      consultations: db.consultations,
      quotations: db.quotations,
      projects: db.projects,
      tickets: db.supportTickets,
      clients: db.users.map(({ passwordHash: _ph, ...safe }) => safe),
      blogPosts: db.blogPosts,
      settings: db.settings,
      recentLogs: db.activityLogs.slice(0, 50),
    });
  });

  app.patch(
    '/api/admin/requests/:id/status',
    authenticate,
    requirePermission('requests:manage'),
    validateBody(
      z.object({
        status: z.enum([
          'SUBMITTED',
          'UNDER_REVIEW',
          'QUOTATION_SENT',
          'AWAITING_APPROVAL',
          'APPROVED',
          'IN_PROGRESS',
          'TESTING',
          'COMPLETED',
          'CANCELLED',
        ]),
        assignedStaffName: z.string().max(120).optional(),
      })
    ),
    (req, res) => {
      const db = getDb();
      const sr = db.serviceRequests.find((r) => r.id === req.params.id);
      if (!sr) return res.status(404).json({ error: 'Service request not found' });
      sr.status = req.body.status;
      if (req.body.assignedStaffName !== undefined) {
        sr.assignedStaffName = req.body.assignedStaffName;
      }
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'REQUEST_STATUS_UPDATED',
        entityType: 'ServiceRequest',
        entityId: sr.id,
        summary: `${sr.referenceNumber} moved to ${req.body.status}`,
      });
      saveDb(db);
      res.json({ request: sr });
    }
  );

  app.patch(
    '/api/admin/inquiries/:id/status',
    authenticate,
    requirePermission('inquiries:manage'),
    validateBody(z.object({ status: z.enum(['NEW', 'REVIEWED', 'CONVERTED', 'ARCHIVED']) })),
    (req, res) => {
      const db = getDb();
      const inq = db.inquiries.find((i) => i.id === req.params.id);
      if (!inq) return res.status(404).json({ error: 'Inquiry not found' });
      inq.status = req.body.status;
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'INQUIRY_STATUS_UPDATED',
        entityType: 'Inquiry',
        entityId: inq.id,
        summary: `${inq.referenceNumber} marked ${req.body.status}`,
      });
      saveDb(db);
      res.json({ inquiry: inq });
    }
  );

  app.post(
    '/api/admin/quotations',
    authenticate,
    requirePermission('quotations:manage'),
    validateBody(
      z.object({
        serviceRequestId: z.string().optional(),
        clientEmail: z.string().email().optional(),
        title: z.string().min(3).max(200),
        currency: z.enum(['USD', 'ETB', 'EUR']).default('USD'),
        taxAmount: z.number().min(0).default(0),
        discountAmount: z.number().min(0).default(0),
        validUntil: z.string().optional(),
        notes: z.string().max(3000).optional(),
        sendImmediately: z.boolean().default(true),
        items: z
          .array(
            z.object({
              description: z.string().min(2).max(200),
              quantity: z.number().int().positive(),
              unitPrice: z.number().nonnegative(),
            })
          )
          .min(1),
      })
    ),
    (req, res) => {
      const db = getDb();
      const items = req.body.items.map((it: { description: string; quantity: number; unitPrice: number }) => ({
        ...it,
        lineTotal: it.quantity * it.unitPrice,
      }));
      const subtotal = items.reduce((s: number, it: { lineTotal: number }) => s + it.lineTotal, 0);
      const totalAmount = Math.max(0, subtotal + req.body.taxAmount - req.body.discountAmount);
      const referenceNumber = generateReferenceNumber('QT');

      const linkedRequest = req.body.serviceRequestId
        ? db.serviceRequests.find((r) => r.id === req.body.serviceRequestId)
        : undefined;

      const clientEmail = req.body.clientEmail || linkedRequest?.email;
      const clientUser = clientEmail
        ? db.users.find((u) => u.email === clientEmail.toLowerCase())
        : undefined;

      const quotation = {
        id: generateEntityId('qt'),
        referenceNumber,
        clientUserId: linkedRequest?.clientUserId || clientUser?.id,
        clientEmail,
        serviceRequestId: linkedRequest?.id,
        title: req.body.title,
        currency: req.body.currency,
        items,
        subtotal,
        taxAmount: req.body.taxAmount,
        discountAmount: req.body.discountAmount,
        totalAmount,
        validUntil: req.body.validUntil,
        notes: req.body.notes,
        status: req.body.sendImmediately ? ('SENT' as const) : ('DRAFT' as const),
        createdAt: new Date().toISOString(),
      };

      db.quotations.unshift(quotation);
      if (linkedRequest && req.body.sendImmediately) {
        linkedRequest.status = 'QUOTATION_SENT';
      }

      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'QUOTATION_CREATED',
        entityType: 'Quotation',
        entityId: quotation.id,
        summary: `${referenceNumber} (${quotation.currency} ${totalAmount.toFixed(2)})`,
      });
      saveDb(db);
      res.status(201).json({ quotation });
    }
  );

  app.patch(
    '/api/admin/projects/:id/status',
    authenticate,
    requirePermission('projects:manage'),
    validateBody(
      z.object({
        status: z.enum([
          'SUBMITTED',
          'UNDER_REVIEW',
          'QUOTATION_SENT',
          'AWAITING_APPROVAL',
          'APPROVED',
          'IN_PROGRESS',
          'TESTING',
          'COMPLETED',
          'CANCELLED',
        ]),
        progressPercent: z.number().int().min(0).max(100),
        updateMessage: z.string().max(1000).optional(),
      })
    ),
    (req, res) => {
      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      project.status = req.body.status;
      project.progressPercent = req.body.progressPercent;
      project.updatedAt = new Date().toISOString();

      if (req.body.updateMessage?.trim()) {
        project.updates.unshift({
          id: generateEntityId('upd'),
          authorName: req.auth!.fullName,
          title: `Stage: ${req.body.status.replace(/_/g, ' ')}`,
          message: req.body.updateMessage.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'PROJECT_STATUS_UPDATED',
        entityType: 'Project',
        entityId: project.id,
        summary: `${project.referenceNumber} -> ${req.body.status} (${req.body.progressPercent}%)`,
      });
      saveDb(db);
      res.json({ project });
    }
  );

  app.patch(
    '/api/admin/projects/:id/portfolio',
    authenticate,
    requirePermission('portfolio:manage'),
    validateBody(
      z.object({
        isPublicPortfolio: z.boolean(),
        clientDisplayConsent: z.boolean(),
        isFeatured: z.boolean().optional(),
      })
    ),
    (req, res) => {
      const db = getDb();
      const project = db.projects.find((p) => p.id === req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      if (req.body.isPublicPortfolio && !req.body.clientDisplayConsent) {
        return res.status(400).json({
          error: 'Explicit clientDisplayConsent is required before publishing to the public portfolio.',
        });
      }

      project.isPublicPortfolio = req.body.isPublicPortfolio;
      project.clientDisplayConsent = req.body.clientDisplayConsent;
      if (req.body.isFeatured !== undefined) {
        project.isFeatured = req.body.isFeatured;
      }
      project.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'PORTFOLIO_VISIBILITY_UPDATED',
        entityType: 'Project',
        entityId: project.id,
        summary: `${project.referenceNumber} public=${project.isPublicPortfolio}`,
      });
      saveDb(db);
      res.json({ project });
    }
  );

  app.post(
    '/api/admin/support/:id/reply',
    authenticate,
    requirePermission('support:manage'),
    validateBody(
      z.object({
        body: z.string().min(2).max(4000),
        isInternalNote: z.boolean().default(false),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'RESOLVED', 'CLOSED']).optional(),
      })
    ),
    (req, res) => {
      const db = getDb();
      const ticket = db.supportTickets.find((t) => t.id === req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      ticket.messages.push({
        id: generateEntityId('msg'),
        senderName: req.auth!.fullName,
        senderRole: req.auth!.roles[0] || 'SUPPORT',
        body: req.body.body,
        isInternalNote: req.body.isInternalNote,
        createdAt: new Date().toISOString(),
      });
      if (req.body.status) ticket.status = req.body.status;
      ticket.updatedAt = new Date().toISOString();

      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'SUPPORT_TICKET_REPLIED',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        summary: `${ticket.referenceNumber} (${req.body.isInternalNote ? 'Internal note' : 'Client reply'})`,
      });
      saveDb(db);
      res.json({ ticket });
    }
  );

  app.post(
    '/api/admin/cms/blog-posts',
    authenticate,
    requirePermission('cms:manage'),
    validateBody(
      z.object({
        slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
        categorySlug: z.string().min(2),
        titleEn: z.string().min(4).max(200),
        excerptEn: z.string().min(10).max(500),
        contentEn: z.string().min(20).max(20000),
        tags: z.array(z.string()).default(['Technology']),
      })
    ),
    (req, res) => {
      const db = getDb();
      if (db.blogPosts.some((p) => p.slug === req.body.slug)) {
        return res.status(409).json({ error: 'An article with this slug already exists' });
      }
      const post = {
        id: generateEntityId('post'),
        slug: req.body.slug,
        categorySlug: req.body.categorySlug,
        categoryName: { en: req.body.categorySlug.replace(/-/g, ' ') },
        authorName: req.auth!.fullName,
        title: { en: req.body.titleEn },
        excerpt: { en: req.body.excerptEn },
        content: { en: req.body.contentEn },
        tags: req.body.tags,
        coverImageUrl: '/src/assets/images/insight_cybersecurity_1795542910195.jpg',
        readTime: '4 min read',
        isPublished: true,
        publishedAt: new Date().toISOString(),
      };
      db.blogPosts.unshift(post);
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'BLOG_POST_PUBLISHED',
        entityType: 'BlogPost',
        entityId: post.id,
        summary: `Published "${req.body.titleEn}"`,
      });
      saveDb(db);
      res.status(201).json({ post });
    }
  );

  app.patch(
    '/api/admin/settings',
    authenticate,
    requirePermission('settings:manage'),
    validateBody(
      z.object({
        primaryEmail: z.string().email().optional(),
        supportEmail: z.string().email().optional(),
        quotesEmail: z.string().email().optional(),
        phone: z.string().max(40).optional(),
        officeAddress: z.string().max(200).optional(),
        showStatsOnHome: z.boolean().optional(),
        showOfficeMap: z.boolean().optional(),
      })
    ),
    (req, res) => {
      const db = getDb();
      db.settings = { ...db.settings, ...req.body };
      appendAuditLog(db, {
        actorName: req.auth!.fullName,
        action: 'COMPANY_SETTINGS_UPDATED',
        entityType: 'CompanySettings',
        entityId: '1',
        summary: 'Updated corporate contact and visibility settings',
      });
      saveDb(db);
      res.json({ settings: db.settings });
    }
  );

  // Return JSON 404 for unknown /api routes instead of falling through to SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Global JSON error handler (catches malformed JSON payloads and unexpected errors)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON request payload' });
    }
    if (req.path.startsWith('/api')) {
      console.error('Unhandled API error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(err);
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / PRODUCTION STATIC
  // ==========================================

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`AFRINOVERA platform running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
