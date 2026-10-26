import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { JOBS, quote } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { when } from "@/lib/stack/time";
import { Panel } from "./ui";

const CUTS = [
  { label: "Full ask", value: 0 },
  { label: "10% off", value: 0.1 },
  { label: "20% off", value: 0.2 },
];

function Ledger({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <p className={`flex items-baseline justify-between gap-3 py-0.5 text-sm tabular-nums ${strong ? "font-medium" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </p>
  );
}

function dollars(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function Floor() {
  const clients = useDesk((s) => s.clients);
  const activeId = useDesk((s) => s.activeId);
  const patchClient = useDesk((s) => s.patchClient);
  const addClient = useDesk((s) => s.addClient);
  const bookings = useDesk((s) => s.bookings);
  const threads = useDesk((s) => s.threads);
  const client = clients.find((item) => item.id === activeId) ?? clients[0];
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  if (!client) return null;

  const bill = quote(client);
  const open = threads.filter((thread) => thread.status === "open").length;
  const next = [...bookings].sort((a, b) => +new Date(a.at) - +new Date(b.at))[0];
  const offer = [
    `${client.name}`,
    `${client.seats} ${client.seats === 1 ? "seat" : "seats"} · ${bill.on.map((station) => station.name).join(", ") || "no jobs on"}`,
    `${dollars(bill.charge)} invoice`,
    `Closed stack ${dollars(bill.closed)}. They save ${dollars(bill.closed - bill.charge)}.`,
    `Costs ${dollars(bill.cost)} to run, once. You keep ${dollars(bill.margin)}.`,
  ].join("\n");

  return (
    <div>
      <section className="rounded-lg bg-paper px-4 py-5 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <p className="text-sm">Invoice</p>
        <p className="mt-1 font-display text-5xl leading-none tabular-nums">{dollars(bill.charge)}</p>
        <p className="mt-2 text-sm">
          {client.seats} {client.seats === 1 ? "seat" : "seats"}
          {bill.on.length ? ` · ${bill.on.map((station) => station.name).join(", ")}` : " · nothing on"}
        </p>

        <div className="mt-5 border-t border-ink/15 pt-3">
          {bill.on.map((station) => (
            <p key={station.id} className="flex min-h-8 items-baseline justify-between gap-3 text-sm tabular-nums">
              <span>{station.name}</span>
              <span>
                ${station.ask} × {client.seats}
                <span className="ml-3 inline-block w-14 text-right">${station.ask * client.seats}</span>
              </span>
            </p>
          ))}
          {bill.on.length === 0 ? <p className="text-sm">No jobs on this desk.</p> : null}
          {client.discount > 0 ? (
            <p className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-2 text-sm tabular-nums">
              <span>{Math.round(client.discount * 100)}% off the ask</span>
              <span>−{dollars(bill.ask - bill.charge)}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-4 border-t border-ink/15 pt-3">
          <Ledger label="Closed stack" value={dollars(bill.closed)} />
          <Ledger label="This invoice" value={dollars(bill.charge)} />
          <Ledger label="They save" value={dollars(bill.closed - bill.charge)} strong />
        </div>
        <div className="mt-3 border-t border-ink/15 pt-3">
          <Ledger label="This invoice" value={dollars(bill.charge)} />
          <Ledger label="To run, once" value={`−${dollars(bill.cost)}`} />
          <Ledger label="You keep" value={dollars(bill.margin)} strong />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="min-h-11 rounded-md border border-ink/20 px-3 text-sm"
            onClick={() => patchClient(client.id, { seats: client.seats - 1 })}
            disabled={client.seats <= 1}
          >
            Fewer seats
          </button>
          <span className="min-w-16 text-center text-sm tabular-nums">
            {client.seats} {client.seats === 1 ? "seat" : "seats"}
          </span>
          <button
            type="button"
            className="min-h-11 rounded-md border border-ink/20 px-3 text-sm"
            onClick={() => patchClient(client.id, { seats: client.seats + 1 })}
            disabled={client.seats >= 24}
          >
            More seats
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CUTS.map((cut) => (
            <button
              key={cut.label}
              type="button"
              onClick={() => patchClient(client.id, { discount: cut.value })}
              className={`min-h-11 rounded-md px-3 text-sm ${
                client.discount === cut.value ? "bg-ink text-paper" : "border border-ink/20"
              }`}
            >
              {cut.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-medium underline decoration-ink/30 underline-offset-4"
          onClick={() => {
            void navigator.clipboard?.writeText(offer).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "Copied the offer" : "Copy the offer"}
        </button>
      </section>

      <h2 className="mt-6 font-display text-xl text-paper">On the invoice</h2>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {JOBS.map((station) => {
          const on = client.jobs.includes(station.id);
          return (
            <li key={station.id} className="flex items-center gap-2 py-1">
              <button
                type="button"
                onClick={() =>
                  patchClient(client.id, {
                    jobs: on ? client.jobs.filter((id) => id !== station.id) : [...client.jobs, station.id],
                  })
                }
                className={`min-h-11 min-w-14 rounded-md text-sm ${on ? "text-brass" : "text-mute"}`}
              >
                {on ? "On" : "Off"}
              </button>
              <Link
                to="/"
                search={{ station: station.id }}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3"
              >
                <span className="w-16 shrink-0 text-paper">{station.name}</span>
                <span className="hidden truncate text-sm text-mute sm:block">instead of {station.replaces}</span>
                <span className="ml-auto shrink-0 text-sm tabular-nums text-paper">
                  ${station.ask * client.seats}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Book, inbox, board, library. To run is once a month, not once per seat.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Panel>
          <p className="text-sm text-mute">Next on the book</p>
          {next ? (
            <>
              <p className="mt-2 font-display text-2xl text-paper">{next.name}</p>
              <p className="mt-1 text-sm text-mute">{when(next.at)}</p>
            </>
          ) : (
            <p className="mt-2 text-paper">Nothing booked.</p>
          )}
          <Link to="/" search={{ station: "book" }} className="mt-3 inline-flex min-h-11 items-center text-sm text-brass">
            Open Book
          </Link>
        </Panel>
        <Panel>
          <p className="text-sm text-mute">Waiting in the inbox</p>
          <p className="mt-2 font-display text-4xl tabular-nums text-paper">{open}</p>
          <Link to="/" search={{ station: "inbox" }} className="mt-3 inline-flex min-h-11 items-center text-sm text-brass">
            Open Inbox
          </Link>
        </Panel>
      </div>

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const nextName = name.trim();
          if (!nextName) return;
          addClient(nextName);
          setName("");
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="A new client"
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-mute"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-brass px-4 text-sm font-medium text-ink disabled:opacity-40"
        >
          Open a desk
        </button>
      </form>
    </div>
  );
}
