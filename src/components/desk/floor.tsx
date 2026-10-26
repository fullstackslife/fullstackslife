import { Link } from "@tanstack/react-router";
import { JOBS, MONTHLY, STATIONS } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { when } from "@/lib/stack/time";
import { Btn, Panel } from "./ui";

export function Floor() {
  const seats = useDesk((s) => s.seats);
  const setSeats = useDesk((s) => s.setSeats);
  const bookings = useDesk((s) => s.bookings);
  const threads = useDesk((s) => s.threads);
  const tasks = useDesk((s) => s.tasks);
  const notes = useDesk((s) => s.notes);
  const kept = MONTHLY * seats;
  const open = threads.filter((thread) => thread.status === "open").length;
  const now = tasks.filter((task) => task.column === "now");
  const next = [...bookings].sort((a, b) => +new Date(a.at) - +new Date(b.at))[0];

  return (
    <div>
      <header className="max-w-2xl">
        <p className="text-sm tracking-wide text-brass">Full Stacks Life</p>
        <h1 className="mt-3 font-display text-5xl leading-none text-paper md:text-6xl">
          Nine jobs.
          <span className="block italic text-brass">One desk.</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-mute">
          Scheduling, support, projects, memory, dictation, voice, search, capture, and motion share one
          ledger. The open-source projects stay upstream. This desk is the layer they have in common.
        </p>
      </header>

      <Panel className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mute">Illustrated list price, not a quote</p>
          <p className="font-display text-5xl tabular-nums text-paper">
            ${kept.toLocaleString()}
            <span className="ml-2 text-xl text-mute">/ mo</span>
          </p>
          <p className="mt-1 text-sm text-mute">
            ${MONTHLY} across the nine, times {seats} {seats === 1 ? "seat" : "seats"} you are not renting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn kind="ghost" onClick={() => setSeats(seats - 1)} disabled={seats <= 1}>
            Fewer
          </Btn>
          <Btn kind="ghost" onClick={() => setSeats(seats + 1)} disabled={seats >= 24}>
            More seats
          </Btn>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm text-mute">Next time</p>
          {next ? (
            <>
              <p className="mt-2 font-display text-2xl text-paper">{next.name}</p>
              <p className="mt-1 text-sm text-mute">{when(next.at)}</p>
              <p className="mt-2 text-sm text-paper">{next.kind}</p>
            </>
          ) : (
            <p className="mt-2 text-paper">Nothing booked.</p>
          )}
          <Link to="/" search={{ station: "book" }} className="mt-4 inline-flex min-h-11 items-center text-sm text-brass">
            Open Book
          </Link>
        </Panel>
        <Panel>
          <p className="text-sm text-mute">Open threads</p>
          <p className="mt-2 font-display text-4xl tabular-nums text-paper">{open}</p>
          <p className="mt-1 text-sm text-mute">{threads.length} in the inbox</p>
          <Link to="/" search={{ station: "inbox" }} className="mt-4 inline-flex min-h-11 items-center text-sm text-brass">
            Open Inbox
          </Link>
        </Panel>
        <Panel>
          <p className="text-sm text-mute">On the board now</p>
          <ul className="mt-2 space-y-2">
            {now.length === 0 ? <li className="text-paper">Nothing in motion.</li> : null}
            {now.map((task) => (
              <li key={task.id} className="text-sm text-paper">
                {task.title}
              </li>
            ))}
          </ul>
          <Link to="/" search={{ station: "board" }} className="mt-4 inline-flex min-h-11 items-center text-sm text-brass">
            Open Board
          </Link>
        </Panel>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-paper">The nine</h2>
          <p className="text-sm text-mute">{notes.length} notes already on the desk</p>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {JOBS.map((station) => (
            <li key={station.id}>
              <Link
                to="/"
                search={{ station: station.id }}
                className="flex min-h-14 items-center gap-4 py-3"
              >
                <span className="w-8 font-display text-brass tabular-nums">{station.index}</span>
                <span className="w-24 font-medium text-paper">{station.name}</span>
                <span className="hidden flex-1 text-sm text-mute sm:block">for {station.replaces}</span>
                <span className="ml-auto text-sm tabular-nums text-mute">${station.price}</span>
              </Link>
            </li>
          ))}
          {STATIONS.filter((station) => station.id === "lab").map((station) => (
            <li key={station.id}>
              <Link to="/" search={{ station: "lab" }} className="flex min-h-14 items-center gap-4 py-3">
                <span className="w-8 font-display text-brass tabular-nums">{station.index}</span>
                <span className="w-24 font-medium text-paper">Lab</span>
                <span className="hidden flex-1 text-sm text-mute sm:block">bonus · Reverse Engineer Anything</span>
                <span className="ml-auto text-sm text-mute">upstream</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">
          Star counts move. Prices are round illustrations of published entry seats — Calendly, Intercom,
          Asana, Notion AI, Wispr Flow, ElevenLabs, Semrush, Loom, Higgsfield — not invoices. Lens does not
          call Semrush. Studio does not clone a voice. Reel does not spend a generation key.
        </p>
      </div>
    </div>
  );
}
