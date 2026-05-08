"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MoreHorizontal,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { EventStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCancelEventMutation,
  useCompleteEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
} from "@/hooks/use-events-queries";

export function EventActions({
  id,
  status,
}: {
  id: string;
  status: EventStatus;
}) {
  const router = useRouter();
  const cancelM = useCancelEventMutation();
  const deleteM = useDeleteEventMutation();
  const publishM = usePublishEventMutation();
  const completeM = useCompleteEventMutation();

  async function onPublish() {
    const res = await publishM.mutateAsync(id);
    if (res.success) {
      toast.success("Event published.");
      router.refresh();
    } else toast.error(res.message);
  }

  async function onComplete() {
    if (!confirm("Mark this event as complete?")) return;
    const res = await completeM.mutateAsync(id);
    if (res.success) {
      toast.success("Event marked complete.");
      router.refresh();
    } else toast.error(res.message);
  }

  async function onCancel() {
    if (!confirm("Cancel this event? Guests will see it as cancelled."))
      return;
    const res = await cancelM.mutateAsync(id);
    if (res.success) {
      toast.success("Event cancelled.");
      router.refresh();
    } else toast.error(res.message);
  }

  async function onDelete() {
    if (!confirm("Delete this event permanently? This cannot be undone."))
      return;
    const res = await deleteM.mutateAsync(id);
    if (res.success) {
      toast.success("Event deleted.");
      router.push("/dashboard/events");
    } else toast.error(res.message);
  }

  return (
    <div className="flex items-center gap-2">
      {status === "draft" && (
        <Button
          onClick={onPublish}
          disabled={publishM.isPending}
          className="rounded-full"
        >
          <Send className="size-4" />
          Publish
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-full" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {status === "published" && (
            <DropdownMenuItem onSelect={onComplete}>
              <CheckCircle2 className="mr-2 size-4" /> Mark complete
            </DropdownMenuItem>
          )}
          {status !== "cancelled" && (
            <DropdownMenuItem onSelect={onCancel}>
              <XCircle className="mr-2 size-4" /> Cancel event
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-destructive">
            <Trash2 className="mr-2 size-4" /> Delete forever
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
