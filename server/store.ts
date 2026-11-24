import fs from 'node:fs';
import path from 'node:path';

export type Locale = 'en' | 'om' | 'am';

export type LocalizedText = {
  en: string;
  om?: string;
  am?: string;
};

export type LocalizedList = {
  en: string[];
  om?: string[];
  am?: string[];
};

export type ProjectStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTATION_SENT'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'TESTING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  organizationName?: string;
  passwordHash: string;
  roles: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  overview: LocalizedText;
  icon: string;
  problemsAddressed: LocalizedList;
  solutionsOffered: LocalizedList;
  benefits: LocalizedList;
  deliveryProcess: Array<{ step: number; title: string; description: string }>;
  faqs: Array<{ id: string; question: LocalizedText; answer: LocalizedText }>;
  isPublished: boolean;
}

export interface ProjectRecord {
  id: string;
  referenceNumber: string;
  clientUserId?: string;
  clientName?: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  objectives?: LocalizedText;
  results?: LocalizedText;
  category: string;
  technologies: string[];
  liveUrl?: string;
  coverImageUrl?: string;
  status: ProjectStatus;
  progressPercent: number;
  isPublicPortfolio: boolean;
  clientDisplayConsent: boolean;
  isFeatured: boolean;
  updates: Array<{
    id: string;
    authorName: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestRecord {
  id: string;
  referenceNumber: string;
  clientUserId?: string;
  fullName: string;
  email: string;
  phone: string;
  organizationName?: string;
  serviceSlug: string;
  title: string;
  description: string;
  estimatedBudget?: string;
  desiredCompletionDate?: string;
  securityAuthorizationConfirmed?: boolean;
  attachmentNames: string[];
  status: ProjectStatus;
  assignedStaffName?: string;
  createdAt: string;
}

export interface QuotationRecord {
  id: string;
  referenceNumber: string;
  clientUserId?: string;
  clientEmail?: string;
  serviceRequestId?: string;
  title: string;
  currency: 'USD' | 'ETB' | 'EUR';
  items: Array<{ description: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  validUntil?: string;
  notes?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
  createdAt: string;
}

export interface InquiryRecord {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  organizationName?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REVIEWED' | 'CONVERTED' | 'ARCHIVED';
  createdAt: string;
}

export interface ConsultationRecord {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  organizationName?: string;
  preferredDate: string;
  timezone: string;
  meetingMode: 'ONLINE' | 'IN_PERSON' | 'PHONE';
  topic: string;
  notes?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface SupportTicketRecord {
  id: string;
  referenceNumber: string;
  clientUserId: string;
  clientName: string;
  category: 'GENERAL' | 'TECHNICAL_ISSUE' | 'BILLING_QUOTATION' | 'SECURITY_INCIDENT' | 'FEATURE_REQUEST';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'RESOLVED' | 'CLOSED';
  messages: Array<{
    id: string;
    senderName: string;
    senderRole: string;
    body: string;
    isInternalNote: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostRecord {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: LocalizedText;
  authorName: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  tags: string[];
  coverImageUrl?: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: string;
}

export interface ActivityLogRecord {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface CompanySettingsRecord {
  companyName: string;
  tagline: string;
  primaryEmail: string;
  supportEmail: string;
  quotesEmail: string;
  phone: string;
  officeAddress: string;
  businessHours: LocalizedText;
  showStatsOnHome: boolean;
  verifiedStats: Array<{ label: LocalizedText; value: string }>;
  showTestimonials: boolean;
  showOfficeMap: boolean;
}

export interface AppDatabase {
  adminClaim: {
    email: string;
    fullName: string;
    passwordHash: string;
    claimedAt: string;
  } | null;
  settings: CompanySettingsRecord;
  users: UserRecord[];
  services: ServiceRecord[];
  projects: ProjectRecord[];
  serviceRequests: ServiceRequestRecord[];
  quotations: QuotationRecord[];
  inquiries: InquiryRecord[];
  consultations: ConsultationRecord[];
  supportTickets: SupportTicketRecord[];
  blogPosts: BlogPostRecord[];
  activityLogs: ActivityLogRecord[];
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'cms:manage',
    'services:manage',
    'portfolio:manage',
    'clients:read',
    'clients:manage',
    'inquiries:read',
    'inquiries:manage',
    'requests:read',
    'requests:manage',
    'quotations:read',
    'quotations:manage',
    'projects:read_all',
    'projects:manage',
    'support:read',
    'support:manage',
    'settings:manage',
    'audit:read',
  ],
  PROJECT_MANAGER: ['requests:read', 'requests:manage', 'quotations:read', 'projects:read_all', 'projects:manage', 'support:read'],
  DEVELOPER: ['projects:read_assigned', 'support:read'],
  SUPPORT: ['inquiries:read', 'inquiries:manage', 'support:read', 'support:manage'],
  CLIENT: [],
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'afrinovera-store.json');

function createSeedDatabase(): AppDatabase {
  const now = new Date().toISOString();
  return {
    adminClaim: null,
    settings: {
      companyName: 'AFRINOVERA Technologies',
      tagline: 'Innovation Beyond Boundaries.',
      primaryEmail: 'info@afrinovera.com',
      supportEmail: 'support@afrinovera.com',
      quotesEmail: 'quotes@afrinovera.com',
      phone: '+251 911 000 000',
      officeAddress: 'Addis Ababa, Ethiopia (Digital Operations Hub)',
      businessHours: {
        en: 'Monday – Friday: 8:30 AM – 5:30 PM EAT | Saturday: 9:00 AM – 1:00 PM EAT',
        om: 'Wiixata – Jimaata: 8:30 AM – 5:30 PM EAT | Sanbata: 9:00 AM – 1:00 PM EAT',
        am: 'ሰኞ – አርብ: 2:30 – 11:30 | ቅዳሜ: 3:00 – 7:00',
      },
      showStatsOnHome: false,
      verifiedStats: [
        { label: { en: 'Core Service Disciplines', om: 'Damee Tajaajilaa', am: 'ዋና የአገልግሎት ዘርፎች' }, value: '6' },
        { label: { en: 'Structured Delivery Phases', om: 'Sadarkaalee Hojii', am: 'የአሰራር ደረጃዎች' }, value: '8' },
        { label: { en: 'Portal Lifecycle Stages', om: 'Sadarkaa Poortaalii', am: 'የፕሮጀክት መከታተያ ደረጃዎች' }, value: '9' },
      ],
      showTestimonials: false,
      showOfficeMap: false,
    },
    users: [],
    services: [
      {
        id: 'svc-web',
        slug: 'web-development-design',
        icon: 'Globe',
        title: {
          en: 'Web Development & Design',
          om: 'Misooma fi Dizaayinii Weebsaayitii',
          am: 'የድረ-ገጽ ልማት እና ዲዛይን',
        },
        summary: {
          en: 'Corporate websites, e-commerce platforms, custom web applications, and responsive UI/UX systems.',
          om: 'Weebsaayitoota dhaabbilee, daldala elektirooniksii, fi appilikeeshinii weebii ammayyaa.',
          am: 'ዘመናዊ የድርጅት ድረ-ገጾች፣ የኢ-ኮሜርስ መድረኮች እና የድር መተግበሪያዎች።',
        },
        overview: {
          en: 'We engineer fast, accessible, search-ready websites and full-stack web applications tailored to convert visitors and streamline online services.',
          om: 'Weebsaayitoota saffisaa, mijataa fi appilikeeshinii weebii guutuu hojjenna.',
          am: 'ፈጣን፣ ተደራሽ እና ለፍለጋ ሞተሮች የተመቻቹ ድረ-ገጾችንና የድር መተግበሪያዎችን እንገነባለን።',
        },
        problemsAddressed: {
          en: [
            'Slow, outdated websites that lose customer credibility on mobile phones',
            'Poor search engine visibility and disconnected inquiry workflows',
            'Rigid templates unable to integrate with client portals or internal databases',
          ],
        },
        solutionsOffered: {
          en: [
            'Corporate website and brand portal engineering',
            'E-commerce storefronts with secure order and catalog workflows',
            'Custom React & Node.js web applications and REST APIs',
            'Responsive UI/UX design systems and ongoing website maintenance',
          ],
        },
        benefits: {
          en: [
            'Accessible across smartphones, tablets, and large desktop displays (WCAG 2.2 AA)',
            'Structured metadata and semantic HTML built for international search discovery',
            'Modular architecture ready for future customer portals and integrations',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Discovery & Architecture', description: 'Define sitemap, user roles, and brand structure.' },
          { step: 2, title: 'UI/UX Wireframing', description: 'Craft responsive layouts and interactive user flows.' },
          { step: 3, title: 'Full-Stack Engineering', description: 'Build frontend views, APIs, and database integrity.' },
          { step: 4, title: 'QA, Launch & Care', description: 'Verify mobile speed, security headers, and ongoing updates.' },
        ],
        faqs: [
          {
            id: 'faq-web-1',
            question: { en: 'Can you support multiple languages like English, Afaan Oromoo, and Amharic?' },
            answer: { en: 'Yes. Every corporate platform we build supports clean multilingual switching and Ethiopic typography.' },
          },
          {
            id: 'faq-web-2',
            question: { en: 'Do you provide ongoing website maintenance after launch?' },
            answer: { en: 'Yes. You can manage updates through our Client Portal or subscribe to a scheduled maintenance plan.' },
          },
        ],
        isPublished: true,
      },
      {
        id: 'svc-soft',
        slug: 'software-solutions',
        icon: 'Cpu',
        title: {
          en: 'Software Solutions',
          om: 'Furmaata Sooftiweerii',
          am: 'የሶፍትዌር መፍትሄዎች',
        },
        summary: {
          en: 'Custom business, inventory, and school management systems, relational databases, mobile apps, and automation.',
          om: 'Sirna bulchiinsa daldalaa, kuusaa meeshaa, mana barumsaa fi appilikeeshinii moobaayilaa.',
          am: 'ብጁ የንግድ አስተዳደር ስርዓቶች፣ የእቃ ክምችት፣ የትምህርት ቤት ስርዓቶች እና የሞባይል መተግበሪያዎች።',
        },
        overview: {
          en: 'Replace fragmented spreadsheets with centralized, role-based software engineered around your organization’s exact operational rules.',
        },
        problemsAddressed: {
          en: [
            'Manual paper or spreadsheet tracking causing inventory losses and billing errors',
            'Departments working in silos without real-time executive reporting',
            'Generic software tools that force staff into awkward workarounds',
          ],
        },
        solutionsOffered: {
          en: [
            'Business & ERP operations management systems',
            'Real-time inventory, stock movement & supplier tracking platforms',
            'School management systems (admissions, grading, attendance, fees)',
            'Relational PostgreSQL database design, desktop & mobile apps',
          ],
        },
        benefits: {
          en: [
            'Strict role-based access control and full audit trails',
            'Automated reporting that eliminates hours of manual reconciliation',
            'Scalable codebase engineered for long-term product growth',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Workflow Mapping', description: 'Document operational rules and staff roles.' },
          { step: 2, title: 'Database Modeling', description: 'Design normalized relational schemas and permissions.' },
          { step: 3, title: 'Iterative Build', description: 'Deliver testable modules with live portal updates.' },
          { step: 4, title: 'Training & Handover', description: 'Train staff, migrate data, and maintain uptime.' },
        ],
        faqs: [
          {
            id: 'faq-soft-1',
            question: { en: 'Can we migrate our existing Excel or legacy records into the new system?' },
            answer: { en: 'Yes. We validate, clean, and import existing records into your relational database during onboarding.' },
          },
        ],
        isPublished: true,
      },
      {
        id: 'svc-cyber',
        slug: 'cybersecurity-solutions',
        icon: 'ShieldCheck',
        title: {
          en: 'Cybersecurity Solutions',
          om: 'Furmaata Nageenya Saayibarii',
          am: 'የሳይበር ደህንነት መፍትሄዎች',
        },
        summary: {
          en: 'Authorized website & application security assessments, network configuration, backup planning, and staff awareness training.',
          om: 'Sakatta’iinsa nageenya weebsaayitii, eegumsa daataa, karoora kuusaa fi leenjii hubannoo.',
          am: 'የተፈቀደ የድረ-ገጽ እና የመተግበሪያ ደህንነት ግምገማ፣ የኔትወርክ ጥበቃ እና የመረጃ ደህንነት ስልጠና።',
        },
        overview: {
          en: 'Protect customer data, web applications, and office networks with ethical, owner-authorized assessments and practical resilience planning.',
        },
        problemsAddressed: {
          en: [
            'Exposed web vulnerabilities, weak authentication, or misconfigured servers',
            'Absence of tested backup and disaster recovery plans',
            'Staff susceptibility to phishing and social engineering attacks',
          ],
        },
        solutionsOffered: {
          en: [
            'Authorized website & web application security assessments',
            'Network firewall, VPN, and router security configuration',
            'Data protection policies & automated backup/recovery architecture',
            'Practical cybersecurity awareness training for teams',
          ],
        },
        benefits: {
          en: [
            '100% ethical compliance—all testing requires explicit owner authorization',
            'Clear remediation priorities for developers and IT administrators',
            'Reduced risk of downtime, data leaks, and reputational harm',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Written Authorization', description: 'Verify system ownership and define safe testing scope.' },
          { step: 2, title: 'Authorized Assessment', description: 'Inspect application, configuration, and access controls.' },
          { step: 3, title: 'Remediation Report', description: 'Deliver prioritized findings and clear fix guidance.' },
          { step: 4, title: 'Hardening & Training', description: 'Verify fixes, configure backups, and train staff.' },
        ],
        faqs: [
          {
            id: 'faq-cyber-1',
            question: { en: 'What authorization is required before a security assessment?' },
            answer: { en: 'We require formal written confirmation from the verified system or network owner before performing any assessment.' },
          },
        ],
        isPublished: true,
      },
      {
        id: 'svc-repair',
        slug: 'computer-system-repair',
        icon: 'Wrench',
        title: {
          en: 'Computer & System Repair',
          om: 'Suphaa Kompiitaraa fi Sirnaa',
          am: 'የኮምፒውተር እና የሲስተም ጥገና',
        },
        summary: {
          en: 'Laptop & desktop hardware diagnostics, OS & driver setup, thermal servicing, component replacement, and optimization.',
          om: 'Qorannoo haardiweerii, fe’umsa sirna hojii, fooyya’iinsa saffisaa fi suphaa kompiitaraa.',
          am: 'የሃርድዌር ምርመራ፣ የኦፕሬቲንግ ሲስተም እና ሶፍትዌር ጭነት፣ እና የኮምፒውተር ፍጥነት ማሻሻያ።',
        },
        overview: {
          en: 'Keep laptops, desktops, and office workstations fast, stable, and properly configured through transparent diagnostics and hardware care.',
        },
        problemsAddressed: {
          en: [
            'Sluggish workstations slowing down daily team output',
            'Corrupted operating systems, missing drivers, or boot failures',
            'Overheating, battery degradation, or failing storage drives',
          ],
        },
        solutionsOffered: {
          en: [
            'Component-level laptop and desktop hardware diagnostics',
            'Clean OS installation, driver verification & licensed software setup',
            'SSD/NVMe, RAM, battery, and display replacements',
            'Preventive maintenance and system speed optimization',
          ],
        },
        benefits: {
          en: [
            'Clear diagnostic quote before any repair or part replacement',
            'Data-safe procedures prioritizing backup before OS work',
            'Extended hardware lifecycle for individuals and office fleets',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Intake & Diagnostics', description: 'Isolate hardware vs. software root causes.' },
          { step: 2, title: 'Transparent Estimate', description: 'Approve repair scope and part costs first.' },
          { step: 3, title: 'Repair & Configuration', description: 'Service hardware, install OS, drivers, and updates.' },
          { step: 4, title: 'Stress Test & Return', description: 'Verify thermals, stability, and data integrity.' },
        ],
        faqs: [
          {
            id: 'faq-repair-1',
            question: { en: 'Do you support business workstation maintenance contracts?' },
            answer: { en: 'Yes. Organizations can schedule recurring quarterly diagnostics and fleet optimization.' },
          },
        ],
        isPublished: true,
      },
      {
        id: 'svc-net',
        slug: 'it-infrastructure-networking',
        icon: 'Network',
        title: {
          en: 'IT Infrastructure & Networking',
          om: 'Bu’uuraalee IT fi Neetworkii',
          am: 'የአይቲ መሰረተ ልማት እና ኔትወርኪንግ',
        },
        summary: {
          en: 'Structured office LAN installation, enterprise Wi-Fi, router & server configuration, and dependable network support.',
          om: 'Ijaarsa neetworkii, Wi-Fi dhaabbilee, qindaa’ina raawutaraa fi deeggarsa sarvarii.',
          am: 'የቢሮ ኔትወርክ ዝርጋታ፣ የዋይፋይ እና ራውተር ውቅር፣ የሰርቨር አስተዳደር እና ቀጣይነት ያለው ድጋፍ።',
        },
        overview: {
          en: 'Design and maintain clean, segmented, high-availability office networks and server rooms that keep teams connected without bottlenecks.',
        },
        problemsAddressed: {
          en: [
            'Unstable office Wi-Fi, dead zones, and frequent connection drops',
            'Unorganized cabling and flat networks mixing guest and internal traffic',
            'Unmonitored local servers without structured backup routines',
          ],
        },
        solutionsOffered: {
          en: [
            'Structured Cat6/fiber cabling and rack termination',
            'Enterprise router, switch, and VLAN segmentation setup',
            'Multi-floor Wi-Fi coverage engineering',
            'On-premise & hybrid server setup and ongoing maintenance',
          ],
        },
        benefits: {
          en: [
            'Documented topology maps and labeled patch panels',
            'Reliable throughput for cloud tools, VoIP, and internal apps',
            'Isolated guest vs. corporate networks for stronger security',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Site Survey', description: 'Assess floor plan, signal coverage, and port needs.' },
          { step: 2, title: 'Topology Design', description: 'Plan VLANs, switching, routing, and rack layout.' },
          { step: 3, title: 'Installation & Config', description: 'Deploy cabling, access points, routers, and servers.' },
          { step: 4, title: 'Testing & Documentation', description: 'Certify throughput and deliver network diagrams.' },
        ],
        faqs: [
          {
            id: 'faq-net-1',
            question: { en: 'Can you troubleshoot and reorganize an existing messy office network?' },
            answer: { en: 'Yes. We audit existing cabling and router configurations, isolate faults, and reorganize cleanly.' },
          },
        ],
        isPublished: true,
      },
      {
        id: 'svc-consult',
        slug: 'technology-consulting-support',
        icon: 'Compass',
        title: {
          en: 'Technology Consulting & Support',
          om: 'Gorsa Teeknoloojii fi Deeggarsa',
          am: 'የቴክኖሎጂ አማካሪነት እና ድጋፍ',
        },
        summary: {
          en: 'IT consulting, digital transformation strategy, technology implementation, staff technical training, and ongoing IT care.',
          om: 'Karoora teeknoloojii, jijjiirama dijitaalaa, leenjii teeknikaa fi deeggarsa IT itti fufiinsa qabu.',
          am: 'የአይቲ ስትራቴጂክ ምክር፣ የዲጂታል ትራንስፎርሜሽን አማካሪነት፣ የቴክኒክ ስልጠና እና ቀጣይ ድጋፍ።',
        },
        overview: {
          en: 'Make confident technology decisions with vendor-neutral advisory, practical digital transformation roadmaps, and hands-on team training.',
        },
        problemsAddressed: {
          en: [
            'Expensive software purchases that teams fail to adopt effectively',
            'Unclear technical priorities when scaling a growing business',
            'Lack of dedicated IT leadership for architecture and vendor reviews',
          ],
        },
        solutionsOffered: {
          en: [
            'Digital transformation & IT modernization roadmaps',
            'Technology stack selection & vendor implementation oversight',
            'Hands-on staff technical training & documentation',
            'Retainer-based business IT support and advisory',
          ],
        },
        benefits: {
          en: [
            'Clear return-on-investment alignment before committing capital',
            'Trained internal staff capable of operating modern digital tools',
            'Single accountable partner for strategy through execution',
          ],
        },
        deliveryProcess: [
          { step: 1, title: 'Maturity Audit', description: 'Evaluate current tools, workflows, and bottlenecks.' },
          { step: 2, title: 'Roadmap Proposal', description: 'Prioritize phased initiatives with realistic budgets.' },
          { step: 3, title: 'Implementation Oversight', description: 'Coordinate engineering, security, and rollout.' },
          { step: 4, title: 'Team Enablement', description: 'Train staff and establish ongoing support SLAs.' },
        ],
        faqs: [
          {
            id: 'faq-cons-1',
            question: { en: 'Can we book a one-time consultation before committing to a full project?' },
            answer: { en: 'Yes. Use our Request a Consultation page to book a focused discovery session.' },
          },
        ],
        isPublished: true,
      },
    ],
    projects: [
      {
        id: 'prj-1',
        referenceNumber: 'AFR-PRJ-2026-104A2B',
        slug: 'horizon-inventory-erp',
        title: {
          en: 'Horizon Multi-Branch Inventory & Operations Platform',
          om: 'Sirna Bulchiinsa Kuusaa Horizon',
          am: 'የሆራይዘን የእቃ ክምችት እና የስራ አመራር ስርዓት',
        },
        summary: {
          en: 'Centralized web-based stock control, purchase approval, and branch reconciliation platform built for a regional wholesale distributor.',
        },
        objectives: {
          en: 'Eliminate manual spreadsheet stock errors across four regional warehouses and give leadership live margin visibility.',
        },
        results: {
          en: 'Cut monthly stock reconciliation time from 5 days to under 3 hours and reduced stockout incidents across branches.',
        },
        category: 'software-solutions',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'RBAC'],
        liveUrl: '',
        coverImageUrl: '/src/assets/images/portfolio_software_platform_1795542909258.jpg',
        status: 'COMPLETED',
        progressPercent: 100,
        isPublicPortfolio: true,
        clientDisplayConsent: true,
        isFeatured: true,
        updates: [
          {
            id: 'upd-1',
            authorName: 'Engineering Lead',
            title: 'Production Launch & Staff Training',
            message: 'All four warehouse teams onboarded and live inventory sync verified.',
            createdAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prj-2',
        referenceNumber: 'AFR-PRJ-2026-208C4D',
        slug: 'campus-network-redesign',
        title: {
          en: 'Segmented Campus LAN, Wi-Fi & Server Rack Modernization',
          om: 'Ijaarsa Neetworkii fi Sarvarii Ammayyaa',
          am: 'የካምፓስ ኔትወርክ እና የሰርቨር ማሻሻያ ፕሮጀክት',
        },
        summary: {
          en: 'End-to-end structured cabling, VLAN segmentation, high-density Wi-Fi deployment, and redundant server rack installation.',
        },
        objectives: {
          en: 'Isolate guest traffic from academic/administrative servers and eliminate recurring Wi-Fi dead zones across three floors.',
        },
        results: {
          en: 'Delivered continuous multi-floor roaming coverage, labeled patch architecture, and automated nightly local backups.',
        },
        category: 'it-infrastructure-networking',
        technologies: ['VLAN Segmentation', 'Fiber Uplinks', 'Enterprise Wi-Fi', 'Server Hardening'],
        liveUrl: '',
        coverImageUrl: '/src/assets/images/portfolio_network_infra_1795542909186.jpg',
        status: 'COMPLETED',
        progressPercent: 100,
        isPublicPortfolio: true,
        clientDisplayConsent: true,
        isFeatured: true,
        updates: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prj-3',
        referenceNumber: 'AFR-PRJ-2026-309E7F',
        slug: 'meridian-corporate-portal',
        title: {
          en: 'Meridian Export Portal & Multilingual Brand Website',
          om: 'Weebsaayitii fi Poortaalii Daldalaa Meridian',
          am: 'የሜሪዲያን የንግድ ድረ-ገጽ እና የደንበኛ ፖርታል',
        },
        summary: {
          en: 'Bilingual corporate web presence paired with an authenticated buyer inquiry and document exchange portal.',
        },
        objectives: {
          en: 'Present product specifications clearly to international buyers and route quote requests with unique tracking codes.',
        },
        results: {
          en: 'Unified buyer inquiries into a single staff dashboard with instant email acknowledgments and structured quotation tracking.',
        },
        category: 'web-development-design',
        technologies: ['React', 'Tailwind CSS', 'Express API', 'Document Workflow'],
        liveUrl: '',
        coverImageUrl: '/src/assets/images/hero_afrinovera_studio_1795542908967.jpg',
        status: 'COMPLETED',
        progressPercent: 100,
        isPublicPortfolio: true,
        clientDisplayConsent: true,
        isFeatured: true,
        updates: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    serviceRequests: [],
    quotations: [],
    inquiries: [],
    consultations: [],
    supportTickets: [],
    blogPosts: [
      {
        id: 'post-1',
        slug: 'authorized-web-security-checklist-2026',
        categorySlug: 'cybersecurity',
        categoryName: { en: 'Cybersecurity Awareness', om: 'Nageenya Saayibarii', am: 'የሳይበር ደህንነት' },
        authorName: 'AFRINOVERA Security Team',
        title: {
          en: 'Five Practical Controls Every Business Web Application Needs Before Launch',
          om: 'To’annoo Nageenyaa Shanan Appilikeeshiniin Weebii Hundi Qabaachuu Qabu',
          am: 'ማንኛውም የንግድ ድር መተግበሪያ ከመለቀቁ በፊት ሊኖሩት የሚገቡ አምስት የደህንነት መቆጣጠሪያዎች',
        },
        excerpt: {
          en: 'From server-side authorization checks to strict file upload rules and backup verification, here is a grounded launch checklist.',
        },
        content: {
          en: 'Launching a business web application without foundational security hygiene creates avoidable operational risk.\n\n1. Enforce server-side authorization on every API route—never rely solely on hiding buttons in the frontend UI.\n\n2. Hash user credentials using modern salted algorithms such as Argon2id or scrypt, and keep all private secrets strictly in server environment variables.\n\n3. Validate every incoming request payload with strict schemas and parameterize all database queries.\n\n4. Restrict uploaded files by MIME type, size limit, and isolated storage keys.\n\n5. Test your backup restore procedure regularly—a backup that has never been restored is only an assumption.',
        },
        tags: ['Cybersecurity', 'Web Architecture', 'Best Practices'],
        coverImageUrl: '/src/assets/images/insight_cybersecurity_1795542910195.jpg',
        readTime: '4 min read',
        isPublished: true,
        publishedAt: '2026-11-10T09:00:00.000Z',
      },
      {
        id: 'post-2',
        slug: 'replacing-spreadsheets-with-relational-systems',
        categorySlug: 'software-engineering',
        categoryName: { en: 'Software Development', om: 'Misooma Sooftiweerii', am: 'የሶፍትዌር ልማት' },
        authorName: 'AFRINOVERA Engineering',
        title: {
          en: 'When Growing Organizations Outgrow Spreadsheets: Designing Reliable Operations Software',
          om: 'Yoommuu Dhaabbileen Guddachaa Dhufan Sooftiweerii Ammayyaa Barbaadan',
          am: 'በማደግ ላይ ያሉ ድርጅቶች መቼ ከስፕሬድሺት ወደ ብጁ ሶፍትዌር መሸጋገር አለባቸው?',
        },
        excerpt: {
          en: 'How structured relational databases, role permissions, and audit logs eliminate costly inventory and billing discrepancies.',
        },
        content: {
          en: 'Spreadsheets are wonderful for early-stage planning, but once multiple staff members edit stock levels, invoices, or student records simultaneously, version conflicts and silent formula errors quickly appear.\n\nMoving to a centralized web application backed by a relational database ensures every transaction is validated, timestamped, and linked to an authenticated user role. Leaders gain real-time accuracy without chasing weekly file attachments.',
        },
        tags: ['Software Solutions', 'Databases', 'Digital Transformation'],
        coverImageUrl: '/src/assets/images/portfolio_software_platform_1795542909258.jpg',
        readTime: '5 min read',
        isPublished: true,
        publishedAt: '2026-11-02T09:00:00.000Z',
      },
      {
        id: 'post-3',
        slug: 'office-network-segmentation-guide',
        categorySlug: 'infrastructure',
        categoryName: { en: 'IT Infrastructure', om: 'Bu’uuraalee IT', am: 'የአይቲ መሰረተ ልማት' },
        authorName: 'AFRINOVERA Infrastructure Practice',
        title: {
          en: 'Why Separating Guest Wi-Fi from Corporate Servers Protects Your Entire Office Network',
          om: 'Maaliif Wi-Fi Keessummootaa fi Neetworkii Dhaabbataa Addaan Baasuun Barbaachisa?',
          am: 'የእንግዳ ዋይፋይን ከድርጅት ሰርቨሮች መለየት ለምን አስፈላጊ እንደሆነ',
        },
        excerpt: {
          en: 'A practical overview of VLAN segmentation, router rules, and structured cabling for dependable office connectivity.',
        },
        content: {
          en: 'Many growing offices connect visitor smartphones, accounting workstations, printers, and internal servers onto a single flat Wi-Fi network.\n\nBy configuring dedicated VLANs and firewall policies between guest access, staff workstations, and server infrastructure, you dramatically limit lateral exposure while improving traffic prioritization for business-critical tools.',
        },
        tags: ['Networking', 'Infrastructure', 'Security'],
        coverImageUrl: '/src/assets/images/portfolio_network_infra_1795542909186.jpg',
        readTime: '3 min read',
        isPublished: true,
        publishedAt: '2026-10-24T09:00:00.000Z',
      },
    ],
    activityLogs: [],
  };
}

let cachedDb: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (cachedDb) return cachedDb;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf8');
    cachedDb = seed;
    return cachedDb;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppDatabase>;
    const seed = createSeedDatabase();
    cachedDb = {
      adminClaim: parsed.adminClaim ?? null,
      settings: { ...seed.settings, ...(parsed.settings || {}) },
      users: Array.isArray(parsed.users) ? parsed.users : [],
      services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : seed.services,
      projects: Array.isArray(parsed.projects) ? parsed.projects : seed.projects,
      serviceRequests: Array.isArray(parsed.serviceRequests) ? parsed.serviceRequests : [],
      quotations: Array.isArray(parsed.quotations) ? parsed.quotations : [],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      consultations: Array.isArray(parsed.consultations) ? parsed.consultations : [],
      supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets : [],
      blogPosts: Array.isArray(parsed.blogPosts) ? parsed.blogPosts : seed.blogPosts,
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [],
    };
    return cachedDb;
  } catch {
    const seed = createSeedDatabase();
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf8');
    cachedDb = seed;
    return cachedDb;
  }
}

export function saveDb(db: AppDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  cachedDb = db;
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

export function appendAuditLog(
  db: AppDatabase,
  entry: Omit<ActivityLogRecord, 'id' | 'createdAt'>
): void {
  db.activityLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
}
