/**
 * Page-level loading skeletons used by `loading.tsx` files.
 * Keep these server-safe (no client-only hooks or imports) so they can
 * render during the Next.js streaming boundary.
 */
import { Skeleton } from "@/components/ui/skeleton";

// ── Primitives ──────────────────────────────────────────────────────────────

export function PageHeaderSkeleton({
  withAction = true,
  subtitle = true,
}: {
  withAction?: boolean;
  subtitle?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        {subtitle && <Skeleton className="h-4 w-64" />}
      </div>
      {withAction && <Skeleton className="h-10 w-32" />}
    </div>
  );
}

export function FilterBarSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-40" />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-md border">
      <div
        className="grid gap-4 p-4 border-b bg-muted/20"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 p-4 border-b last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className={c === 0 ? "h-5 w-full" : "h-4 w-3/4"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-3 ${colClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  const colClass =
    count === 2
      ? "sm:grid-cols-2"
      : count === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-3";
  return (
    <div className={`grid gap-4 ${colClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function DetailPaneSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Composite page layouts ─────────────────────────────────────────────────

/** Generic "list page" skeleton: header + filters + data table. */
export function ListPageSkeleton({
  filterCount = 3,
  rows = 8,
  columns = 5,
}: {
  filterCount?: number;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FilterBarSkeleton count={filterCount} />
      <TableSkeleton rows={rows} columns={columns} />
    </div>
  );
}

/** Card-grid variant: header + filters + grid of cards. */
export function CardListPageSkeleton({
  filterCount = 2,
  cardCount = 6,
}: {
  filterCount?: number;
  cardCount?: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FilterBarSkeleton count={filterCount} />
      <CardGridSkeleton count={cardCount} />
    </div>
  );
}

/** Stat-heavy page (fees, results, analytics): header + stats + table. */
export function StatsPageSkeleton({
  statCount = 3,
  rows = 6,
  columns = 5,
}: {
  statCount?: number;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={statCount} />
      <TableSkeleton rows={rows} columns={columns} />
    </div>
  );
}

/** Form-driven page (marks entry, attendance, settings): header + filters + large form area. */
export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="rounded-lg border p-6 space-y-4">
        <FilterBarSkeleton count={3} />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
