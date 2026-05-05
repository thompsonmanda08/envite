// Legacy aggregator — superseded by per-resource hooks:
//   - use-events-queries
//   - use-guests-queries
//   - use-invitations-queries
//   - use-auth-mutations
// Kept as a re-export shim so any older imports keep compiling.
export * from "./use-events-queries";
export * from "./use-guests-queries";
export * from "./use-invitations-queries";
export * from "./use-auth-mutations";
