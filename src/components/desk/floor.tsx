import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { JOBS, offer } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";
import { Btn } from "./ui";

function dollars(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function Floor() {
  const clients = useDesk((s) => s.clients);
  const activeId = useDesk((s) => s.activeId);
  const patchClient = useDesk((s) => s.patchClient);
  const addClient = useDesk((s) => s.addClient);
  const client = clients.find((item) => item.id === activeId) ?? clients[0];
  const [company, setCompany] = useState("");
  const [spend, setSpend] = useState("");
  const [copied, setCopied] = useState(false);

  if (!client) return null;
  const deal = offer(client.spend);
  const proposal = deal.sell
    ? [
        client.name,
        `You pay about ${dollars(deal.spend)} a month for scheduling, inbox, projects, and notes.`,
        `We replace them and run them.`,
        `${dollars(deal.setup)} to set up.`,
        `${dollars(deal.retainer)} a month after that.`,
        `You save ${dollars(deal.save)} a month. The setup earns back in ${deal.payback} months if you stay.`,
      ].join("\n")
    : [
        client.name,
        `They pay ${dollars(deal.spend)} a month.`,
        `The retainer is ${dollars(deal.retainer)}. Do not sell this.`,
      ].join("\n");

  return (
    <div>
      <section className="rounded-lg bg-paper px-4 py-5 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <p className="text-sm">{deal.sell ? "Sell this" : "Do not sell this"}</p>
        <p className="mt-1 font-display text-5xl leading-none tabular-nums">{dollars(deal.retainer)}</p>
        <p className="mt-2 text-sm">a month to run it, after {dollars(deal.setup)} to set it up</p>
        <div className="mt-5 border-t border-ink/15 pt-3">
          <p className="flex justify-between gap-3 text-sm tabular-nums">
            <span>They pay now</span>
            <span>{dollars(deal.spend)}</span>
          </p>
          <p className="mt-1 flex justify-between gap-3 text-sm font-medium tabular-nums">
            <span>{deal.sell ? "They save" : "They would pay more"}</span>
            <span>{deal.sell ? dollars(deal.save) : dollars(Math.abs(deal.save))}</span>
          </p>
          {deal.sell ? (
            <p className="mt-3 text-sm">Setup earns back in {deal.payback} months, if they stay.</p>
          ) : (
            <p className="mt-3 text-sm">Walk away. They already pay less than the retainer.</p>
          )}
        </div>
        <label className="mt-5 block">
          <span className="text-sm">What they pay now, a month</span>
          <input
            inputMode="numeric"
            value={String(client.spend)}
            onChange={(event) => {
              const next = Number(event.target.value.replace(/[^0-9]/g, ""));
              patchClient(client.id, { spend: Number.isFinite(next) ? next : 0 });
            }}
            className="mt-1 h-11 w-full rounded-md border border-ink/20 bg-transparent px-3 text-ink outline-none"
          />
        </label>
        <button
          type="button"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-medium underline decoration-ink/30 underline-offset-4"
          onClick={() => {
            void navigator.clipboard?.writeText(proposal).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "Copied" : "Copy the proposal"}
        </button>
      </section>

      <p className="mt-6 text-sm leading-relaxed text-mute">
        The paid thing is the setup and the retainer. Scheduling, the inbox, the board, and the notes come with it.
        They are not products on their own.
      </p>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {JOBS.map((station) => {
          const on = client.done.includes(station.id);
          return (
            <li key={station.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  patchClient(client.id, {
                    done: on ? client.done.filter((id) => id !== station.id) : [...client.done, station.id],
                  })
                }
                className={`min-h-11 min-w-16 text-left text-sm ${on ? "text-brass" : "text-mute"}`}
              >
                {on ? "Done" : "To do"}
              </button>
              <Link to="/" search={{ station: station.id }} className="flex min-h-11 flex-1 items-center text-paper">
                {station.name}
                <span className="ml-2 text-sm text-mute">for {station.replaces}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <form
        className="mt-6 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const nextName = company.trim();
          const nextSpend = Number(spend.replace(/[^0-9]/g, ""));
          if (!nextName || !Number.isFinite(nextSpend)) return;
          addClient(nextName, nextSpend);
          setCompany("");
          setSpend("");
        }}
      >
        <input
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Company"
          className="h-11 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-mute"
        />
        <input
          inputMode="numeric"
          value={spend}
          onChange={(event) => setSpend(event.target.value)}
          placeholder="What they pay now, a month"
          className="h-11 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-mute"
        />
        <Btn type="submit" disabled={!company.trim() || !spend.trim()}>
          Open a job
        </Btn>
      </form>
    </div>
  );
}
