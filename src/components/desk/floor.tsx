import { Link } from "@tanstack/react-router";
import { JOBS, planById } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { when } from "@/lib/stack/time";

export function Floor() {
  const workspace = useDesk((s) => s.workspace);
  const bookings = useDesk((s) => s.bookings);
  const threads = useDesk((s) => s.threads);
  const tasks = useDesk((s) => s.tasks);
  if (!workspace) return null;
  const plan = planById(workspace.plan);
  const next = [...bookings].sort((a, b) => +new Date(a.at) - +new Date(b.at))[0];
  const open = threads.filter((thread) => thread.status === "open").length;
  const now = tasks.filter((task) => task.column === "now");
  const on = JOBS.filter((station) => workspace.jobs.includes(station.id));

  return (
    <div>
      <p className="text-sm text-brass">{plan.name}</p>
      <h1 className="mt-2 font-display text-4xl leading-none text-paper">{workspace.name}</h1>
      <p className="mt-3 text-sm text-mute">
        ${plan.price}/mo · {plan.seats} seats · {on.map((station) => station.name).join(", ")}
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {on.map((station) => (
          <li key={station.id}>
            <Link to="/" search={{ station: station.id }} className="flex min-h-14 items-center justify-between gap-3">
              <span className="text-paper">{station.name}</span>
              <span className="text-sm text-mute">
                {station.id === "book"
                  ? next
                    ? when(next.at)
                    : "Nothing held"
                  : station.id === "inbox"
                    ? open === 0
                      ? "Empty"
                      : `${open} open`
                    : station.id === "board"
                      ? now.length === 0
                        ? "Nothing in now"
                        : `${now.length} in now`
                      : "Notes"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
