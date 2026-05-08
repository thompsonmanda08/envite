import { getEventTypes } from "@/app/_actions/event-types";
import EventTypesList from "./_components/event-types-list";

export const dynamic = "force-dynamic";

export default async function EventTypesPage() {
  const res = await getEventTypes();
  return <EventTypesList initialData={res.success ? (res.data ?? []) : []} />;
}
