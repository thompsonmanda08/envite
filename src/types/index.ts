// ─── Generic API contract ───────────────────────────────────────────────────
export type Pagination = {
  page?: number;
  pageSize?: number;
  page_size?: number;
  totalPages?: number;
  total_pages?: number;
  total?: number;
  totalCount?: number;
  hasNext?: boolean;
  has_next?: boolean;
  hasPrev?: boolean;
  has_prev?: boolean;
  limit?: number;
  [x: string]: unknown;
};

export type APIResponse<T = any> = {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: Pagination;
  status?: number;
  statusText?: string;
  [x: string]: unknown;
};

export type ErrorState = {
  status: boolean;
  message: string;
  type?: "error" | "success" | "info" | "warning";
  [x: string]: unknown;
};

// ─── Auth ───────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "host" | "guest" | "planner";
export type UserType = UserRole;

export type AuthUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  account_type?: string;
  organization_id?: string;
  isVerified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  [x: string]: any;
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  role?: UserType;
  user_id?: string;
  organization_id?: string;
  change_password?: boolean;
  mfa_required?: boolean;
  expiresAt?: Date | string;
  expiresIn?: number;
  user?: AuthUser;
  [x: string]: any;
};

// ─── Domain ─────────────────────────────────────────────────────────────────
export type EventStatus = "draft" | "scheduled" | "live" | "ended" | "archived";

export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  templateId?: string;
  startsAt: string;
  endsAt?: string;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  status: EventStatus;
  hostId: string;
  guestCount?: number;
  rsvpCount?: number;
  createdAt: string;
  updatedAt: string;
  [x: string]: any;
};

export type RsvpStatus = "pending" | "going" | "maybe" | "declined";

export type Guest = {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp: RsvpStatus;
  plusOnes?: number;
  group?: string;
  notes?: string;
  invitedAt?: string;
  respondedAt?: string;
  [x: string]: any;
};

export type EventType = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  price_per_invitation?: number;
  max_free_invitations?: number;
  created_at?: string;
  updated_at?: string;
};

export type EventSession = {
  id: string;
  event_id: string;
  session_name: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  venue?: string;
  venue_address?: string;
  dress_code?: string;
  max_attendees?: number;
  special_notes?: string;
  session_order: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Invitation = {
  id: string;
  eventId: string;
  guestId: string;
  channel: "email" | "sms" | "link";
  status: "queued" | "sent" | "delivered" | "opened" | "failed";
  sentAt?: string;
  openedAt?: string;
  shareUrl?: string;
  [x: string]: any;
};

// ─── Legacy shopify-ish (kept for existing components) ──────────────────────
export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  currency: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};
