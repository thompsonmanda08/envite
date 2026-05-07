import { RsvpStatus } from "@/types";

export const AUTH_SESSION = "__envite-auth-session";
export const USER_SESSION = "__envite-user-session";
export const PERMISSIONS_SESSION = "__envite-permissions-session";
export const SCREEN_LOCK_SESSION = "__envite-screen-lock-session";

export const AUTH_TOKEN = AUTH_SESSION;

export const QUERY_KEYS = {
  CONFIGS: "configs",
  EVENTS: "events",
  INVITATIONS: "invitations",
  GUESTS: "guests",
  USER_PROFILE: "user-profile",
};

export const getRsvpStatusColor = (status: RsvpStatus) => {
  switch (status) {
    case "pending":
      return "text-yellow-800 bg-yellow-100 border-yellow-200";
    case "confirmed":
      return "text-green-800 bg-green-100 border-green-200";
    case "declined":
      return "text-red-800 bg-red-100 border-red-200";
    default:
      return "text-gray-800 bg-gray-100 border-gray-200";
  }
};

export const rsvpStatusOptions: {
  value: RsvpStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
    color: "text-yellow-800 bg-yellow-100 border-yellow-200",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "text-green-800 bg-green-100 border-green-200",
  },
  {
    value: "declined",
    label: "Declined",
    color: "text-red-800 bg-red-100 border-red-200",
  },
];
