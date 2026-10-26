import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { planById, STATIONS, type StationId } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { Floor } from "./floor";
import { Library } from "./library";
import { Setup } from "./setup";
import { Board, Book, Inbox } from "./work";

export function Desk({ station }: { station: StationId }) {
  const workspace = useDesk((s) => s.workspace);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve(useDesk.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);

  if (!hydrated) return <div className="min-h-dvh bg-ink" />;
  if (!workspace) return <Setup />;

  const plan = planById(workspace.plan);
  const dock = STATIONS.filter((item) => item.id === "floor" || workspace.jobs.includes(item.id));

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl md:flex-row">
        <aside className="hidden w-56 shrink-0 border-r border-line px-5 py-8 md:block">
          <p className="font-display text-2xl leading-none">
            {workspace.name}
          </p>
          <p className="mt-3 text-sm text-mute">
            {plan.name} · ${plan.price}/mo
          </p>
          <nav className="mt-8 flex flex-col">
            {dock.map((item) => (
              <Link
                key={item.id}
                to="/"
                search={{ station: item.id }}
                className={`flex min-h-11 items-center text-sm ${item.id === station ? "text-brass" : "text-mute"}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur md:hidden">
            <p className="truncate font-display text-2xl">{workspace.name}</p>
            <p className="text-xs text-mute">
              {plan.name} · ${plan.price}/mo
            </p>
          </header>
          <main className="flex-1 px-4 py-5 pb-28 md:px-10 md:py-8 md:pb-8">
            {station === "floor" || !workspace.jobs.includes(station) ? <Floor /> : null}
            {station === "book" && workspace.jobs.includes("book") ? <Book /> : null}
            {station === "inbox" && workspace.jobs.includes("inbox") ? <Inbox /> : null}
            {station === "board" && workspace.jobs.includes("board") ? <Board /> : null}
            {station === "library" && workspace.jobs.includes("library") ? <Library /> : null}
          </main>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] md:hidden">
        <div
          className="mx-auto grid max-w-lg"
          style={{ gridTemplateColumns: `repeat(${dock.length}, minmax(0, 1fr))` }}
        >
          {dock.map((item) => (
            <Link
              key={item.id}
              to="/"
              search={{ station: item.id }}
              className={`flex min-h-16 items-center justify-center text-xs ${
                item.id === station ? "text-brass" : "text-mute"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
