export type Locale = 'en' | 'om' | 'am';

export interface LocalizedText {
  en: string;
  om?: string;
  am?: string;
}

export interface LocalizedList {
  en: string[];
  om?: string[];
  am?: string[];
}

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

export interface ServiceItem {
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
}

export interface ProjectItem {
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

export interface BlogPostItem {
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
  publishedAt: string;
}

export interface ServiceRequestItem {
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
  attachmentNames: string[];
  status: ProjectStatus;
  assignedStaffName?: string;
  createdAt: string;
}

export interface QuotationItem {
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

export interface SupportTicketItem {
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

export interface InquiryItem {
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

export interface ConsultationItem {
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

export interface CompanySettings {
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

export interface ActivityLogItem {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}
