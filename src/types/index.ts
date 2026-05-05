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
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
  account_type?: string;
  organization_id?: string;
  is_verified?: boolean;
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
export type EventStatus = "draft" | "published" | "cancelled";

export type EventRecord = {
  id: string;
  event_type_id: string;
  user_id?: string;
  title: string;
  description?: string;
  theme?: string;
  dress_code?: string;
  venue?: string;
  venue_address?: string;
  venue_map_pin?: string;
  start_date: string;
  end_date?: string;
  rsvp_deadline?: string;
  max_attendees?: number;
  special_instructions?: string;
  dietary_restrictions_note?: string;
  parking_info?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  requires_rsvp?: boolean;
  is_multi_day?: boolean;
  duration_days?: number;
  banner_url?: string;
  status: EventStatus;
  created_at?: string;
  updated_at?: string;
  [x: string]: any;
};

export type RsvpStatus = "pending" | "going" | "maybe" | "declined";

export type Guest = {
  id: string;
  event_id: string;
  invitation_id?: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp: RsvpStatus;
  plus_ones?: number;
  group?: string;
  notes?: string;
  invited_at?: string;
  responded_at?: string;
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
  event_id: string;
  invitation_type: string;
  custom_image_url?: string;
  sessions: string[]; // session ids
  share_url?: string;
  status?: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
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
