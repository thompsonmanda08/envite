import { Order } from "@/types";

// ─── Cookie / session keys ──────────────────────────────────────────────────
export const AUTH_SESSION = "__envite-auth-session";
export const USER_SESSION = "__envite-user-session";
export const PERMISSIONS_SESSION = "__envite-permissions-session";
export const SCREEN_LOCK_SESSION = "__envite-screen-lock-session";

// Backward-compat
export const AUTH_TOKEN = AUTH_SESSION;

// ─── Query keys (legacy flat list — prefer per-resource hook KEYS objects) ──
export const QUERY_KEYS = {
  CONFIGS: "configs",
  EVENTS: "events",
  INVITATIONS: "invitations",
  GUESTS: "guests",
  USER_PROFILE: "user-profile",
};

// ─── Status helpers ─────────────────────────────────────────────────────────
export const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "PENDING":
      return "text-yellow-800 bg-yellow-100 border-yellow-200";
    case "PROCESSING":
      return "text-blue-800 bg-blue-100 border-blue-200";
    case "SHIPPED":
      return "text-indigo-800 bg-indigo-100 border-indigo-200";
    case "DELIVERED":
      return "text-green-800 bg-green-100 border-green-200";
    case "CANCELLED":
      return "text-red-800 bg-red-100 border-red-200";
    default:
      return "text-gray-800 bg-gray-100 border-gray-200";
  }
};

export const statusOptions: {
  value: Order["status"];
  label: string;
  color: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
    color: "text-yellow-800 bg-yellow-100 border-yellow-200",
  },
  {
    value: "PROCESSING",
    label: "Processing",
    color: "text-blue-800 bg-blue-100 border-blue-200",
  },
  {
    value: "SHIPPED",
    label: "Shipped",
    color: "text-indigo-800 bg-indigo-100 border-indigo-200",
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    color: "text-green-800 bg-green-100 border-green-200",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "text-red-800 bg-red-100 border-red-200",
  },
];
