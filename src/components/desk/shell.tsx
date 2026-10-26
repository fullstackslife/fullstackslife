import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { offer, STATIONS, type StationId } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { Floor } from "./floor";
import { Library } from "./library";
import { Board, Book, Inbox } from "./work";

const DOCK: StationId[] = ["floor", "book", "inbox", "board", "library"];

export function Desk({ station }: { station: StationId }) {
  const clients = useDesk((s) => s.clients);
  const activeId = useDesk((s) => s.activeId);
  const setActive = useDesk((s) => s.setActive);
  const client = clients.find((item) => item.id === activeId) ?? clients[0];
  const deal = client ? offer(client.spend) : null;

  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl md:flex-row">
        <aside className="hidden w-56 shrink-0 border-r border-line px-5 py-8 md:block">
          <p className="font-display text-2xl leading-none">
            Full Stacks
            <span className="block italic text-brass">Life</span>
          </p>
          {client ? (
            <label className="mt-6 block">
              <span className="text-xs text-mute">On the desk</span>
              <select
                value={client.id}
                onChange={(event) => setActive(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-line bg-ink px-2 text-sm text-paper"
              >
                {clients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <p className="mt-3 font-display text-3xl tabular-nums text-brass">
                {deal?.sell ? "$500" : "Walk"}
              </p>
              <p className="text-xs text-mute">{deal?.sell ? "retainer / mo" : "do not sell"}</p>
            </label>
          ) : null}
          <nav className="mt-8 flex flex-col">
            {STATIONS.map((item) => (
              <Link
                key={item.id}
                to="/"
                search={{ station: item.id }}
                className={`flex min-h-11 items-center gap-3 text-sm ${item.id === station ? "text-brass" : "text-mute"}`}
              >
                <span className="w-6 tabular-nums">{item.index}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-end justify-between gap-3">
              <label className="min-w-0 flex-1">
                <span className="text-xs text-mute">On the desk</span>
                <select
                  value={client?.id ?? ""}
                  onChange={(event) => setActive(event.target.value)}
                  className="mt-1 h-11 w-full truncate bg-transparent font-display text-2xl text-paper outline-none"
                >
                  {clients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="pb-1 text-right">
                <p className="font-display text-2xl tabular-nums text-brass">{deal?.sell ? "$500" : "Walk"}</p>
                <p className="text-xs text-mute">{deal?.sell ? "a month" : "don't sell"}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 pb-28 md:px-10 md:py-8 md:pb-8">
            {station === "floor" ? <Floor /> : null}
            {station === "book" ? <Book /> : null}
            {station === "inbox" ? <Inbox /> : null}
            {station === "board" ? <Board /> : null}
            {station === "library" ? <Library /> : null}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {DOCK.map((id) => {
            const item = STATIONS.find((entry) => entry.id === id);
            if (!item) return null;
            return (
              <Link
                key={id}
                to="/"
                search={{ station: id }}
                className={`flex min-h-16 items-center justify-center text-xs ${
                  id === station ? "text-brass" : "text-mute"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
