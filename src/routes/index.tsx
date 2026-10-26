import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/desk/shell";
import { isStationId } from "@/lib/stack/catalog";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    station: isStationId(search.station) ? search.station : "floor",
  }),
  component: Home,
});

function Home() {
  const { station } = Route.useSearch();
  return <Desk station={station} />;
}
