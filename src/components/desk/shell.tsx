import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MONTHLY, STATIONS, type StationId } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { Floor } from "./floor";
import { Lens, Lab, Reel, Stage } from "./reach";
import { Library, Dictate, Studio } from "./voice";
import { Board, Book, Inbox } from "./work";

export function Desk({ station }: { station: StationId }) {
  const seats = useDesk((s) => s.seats);

  useEffect(() => {
    void useDesk.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col md:flex-row">
        <aside className="border-b border-line px-4 py-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r md:px-5 md:py-8">
          <Link to="/" search={{ station: "floor" }} className="block">
            <p className="font-display text-2xl leading-none text-paper">
              Full Stacks
              <span className="block italic text-brass">Life</span>
            </p>
          </Link>
          <p className="mt-3 hidden text-sm tabular-nums text-mute md:block">
            ${MONTHLY * seats}/mo kept
          </p>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:mt-8 md:flex-col md:gap-0 md:overflow-visible">
            {STATIONS.map((item) => {
              const active = item.id === station;
              return (
                <Link
                  key={item.id}
                  to="/"
                  search={{ station: item.id }}
                  className={`flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm md:px-0 ${
                    active ? "text-brass" : "text-mute"
                  }`}
                >
                  <span className="w-6 tabular-nums">{item.index}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <a
            href="https://github.com/fullstackslife/fullstackslife"
            target="_blank"
            rel="noreferrer"
            className="mt-6 hidden min-h-11 items-center text-sm text-mute md:inline-flex"
          >
            fullstackslife
          </a>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
          {station === "floor" ? <Floor /> : null}
          {station === "book" ? <Book /> : null}
          {station === "inbox" ? <Inbox /> : null}
          {station === "board" ? <Board /> : null}
          {station === "library" ? <Library /> : null}
          {station === "dictate" ? <Dictate /> : null}
          {station === "studio" ? <Studio /> : null}
          {station === "lens" ? <Lens /> : null}
          {station === "stage" ? <Stage /> : null}
          {station === "reel" ? <Reel /> : null}
          {station === "lab" ? <Lab /> : null}
        </main>
      </div>
    </div>
  );
}
