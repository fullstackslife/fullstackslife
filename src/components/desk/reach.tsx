import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { guessStation, quote, stationById, type StationId } from "@/lib/stack/catalog";
import { scorePage, type PageDraft } from "@/lib/stack/score";
import { useDesk } from "@/lib/stack/store";
import { Area, Btn, Field, Panel, StationHead } from "./ui";

const EMPTY: PageDraft = { url: "", title: "", meta: "", h1: "", body: "", keyword: "" };

export function Lens() {
  const audits = useDesk((s) => s.audits);
  const addAudit = useDesk((s) => s.addAudit);
  const removeAudit = useDesk((s) => s.removeAudit);
  const addNote = useDesk((s) => s.addNote);
  const [draft, setDraft] = useState<PageDraft>(EMPTY);
  const [result, setResult] = useState<ReturnType<typeof scorePage> | null>(null);

  function set<K extends keyof PageDraft>(key: K, value: PageDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <StationHead id="lens" />
      <div className="grid gap-3">
        <Field label="URL, for your notes" value={draft.url} onChange={(value) => set("url", value)} placeholder="https://" />
        <Field label="Title" value={draft.title} onChange={(value) => set("title", value)} />
        <Area label="Meta description" value={draft.meta} onChange={(value) => set("meta", value)} rows={3} />
        <Field label="H1" value={draft.h1} onChange={(value) => set("h1", value)} />
        <Field label="Keyword" value={draft.keyword} onChange={(value) => set("keyword", value)} />
        <Area label="Body" value={draft.body} onChange={(value) => set("body", value)} rows={6} />
        <Btn
          onClick={() => {
            const scored = scorePage(draft);
            setResult(scored);
            addAudit({ ...draft, passed: scored.passed, total: scored.total });
          }}
        >
          Score this page
        </Btn>
      </div>
      {result ? (
        <Panel className="mt-4">
          <p className="font-display text-3xl tabular-nums text-paper">
            {result.passed}/{result.total}
          </p>
          <ul className="mt-3 space-y-2">
            {result.checks.map((check) => (
              <li key={check.id} className="text-sm">
                <span className={check.pass ? "text-brass" : "text-mute"}>{check.pass ? "Holds" : "Fix"}</span>
                <span className="ml-2 text-paper">{check.label}</span>
                <span className="mt-1 block text-mute">{check.note}</span>
              </li>
            ))}
          </ul>
          <Btn
            kind="ghost"
            onClick={() =>
              addNote({
                title: draft.title.trim() || "Page score",
                body: result.checks.map((check) => `${check.pass ? "Holds" : "Fix"} — ${check.label}: ${check.note}`).join("\n"),
              })
            }
          >
            Save score as a note
          </Btn>
        </Panel>
      ) : null}
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {audits.map((audit) => (
          <li key={audit.id} className="flex items-start justify-between gap-3 py-4">
            <button
              type="button"
              className="min-h-11 text-left"
              onClick={() => {
                setDraft({
                  url: audit.url,
                  title: audit.title,
                  meta: audit.meta,
                  h1: audit.h1,
                  body: audit.body,
                  keyword: audit.keyword,
                });
                setResult(null);
              }}
            >
              <span className="block text-paper">{audit.title || audit.url || "Untitled page"}</span>
              <span className="block text-sm tabular-nums text-mute">
                {audit.passed}/{audit.total}
              </span>
            </button>
            <Btn kind="quiet" onClick={() => removeAudit(audit.id)}>
              Drop
            </Btn>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stage() {
  const takes = useDesk((s) => s.takes);
  const addTake = useDesk((s) => s.addTake);
  const removeTake = useDesk((s) => s.removeTake);
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [script, setScript] = useState("");
  const [notice, setNotice] = useState("");
  const [live, setLive] = useState(false);

  async function record() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setNotice("This browser will not share the screen. The script is still the take.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setLive(true);
      setNotice("Recording. Stop when the take is done. The file stays in this session.");
      const recorder = new MediaRecorder(stream);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setLive(false);
      };
      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 8000);
    } catch {
      setLive(false);
      setNotice("Capture was blocked. The script is saved as the take anyway.");
    }
  }

  return (
    <div>
      <StationHead id="stage" />
      <div className="grid gap-3">
        <Field label="Title" value={title} onChange={setTitle} />
        <Field label="Who it is for" value={audience} onChange={setAudience} />
        <Area label="Script" value={script} onChange={setScript} rows={5} />
        {notice ? <p className="text-sm text-mute">{notice}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Btn
            disabled={!title.trim() || !script.trim()}
            onClick={() => {
              const words = script.trim().split(/\s+/).length;
              addTake({
                title: title.trim(),
                audience: audience.trim() || "Unspecified",
                script: script.trim(),
                seconds: Math.max(15, Math.round(words / 2.4)),
              });
              setTitle("");
              setAudience("");
              setScript("");
            }}
          >
            Save the take
          </Btn>
          <Btn kind="ghost" disabled={live} onClick={() => void record()}>
            {live ? "Recording" : "Try a screen take"}
          </Btn>
        </div>
      </div>
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {takes.map((take) => (
          <li key={take.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-paper">{take.title}</p>
                <p className="text-sm tabular-nums text-mute">
                  {take.seconds}s · {take.audience}
                </p>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-paper">{take.script}</p>
              </div>
              <Btn kind="quiet" onClick={() => removeTake(take.id)}>
                Drop
              </Btn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CAMERAS = ["Static", "Push in", "Orbit", "Handheld", "Wide"];

export function Reel() {
  const shots = useDesk((s) => s.shots);
  const addShot = useDesk((s) => s.addShot);
  const moveShot = useDesk((s) => s.moveShot);
  const removeShot = useDesk((s) => s.removeShot);
  const addTake = useDesk((s) => s.addTake);
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [camera, setCamera] = useState(CAMERAS[0]);
  const [seconds, setSeconds] = useState("4");
  const [copied, setCopied] = useState(false);
  const total = shots.reduce((sum, shot) => sum + shot.seconds, 0);
  const pack = shots
    .map((shot, index) => `${index + 1}. ${shot.seconds}s · ${shot.camera} — ${shot.prompt}`)
    .join("\n");

  return (
    <div>
      <StationHead id="reel" />
      <p className="mb-4 text-sm tabular-nums text-mute">
        {shots.length} shots · {total}s
      </p>
      <ol className="space-y-3">
        {shots.map((shot, index) => (
          <li key={shot.id}>
            <Panel>
              <p className="font-display text-lg tabular-nums text-brass">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-paper">{shot.prompt}</p>
              <p className="mt-1 text-sm text-mute">
                {shot.camera} · {shot.seconds}s
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Btn kind="quiet" onClick={() => moveShot(shot.id, -1)}>
                  Earlier
                </Btn>
                <Btn kind="quiet" onClick={() => moveShot(shot.id, 1)}>
                  Later
                </Btn>
                <Btn kind="quiet" onClick={() => removeShot(shot.id)}>
                  Drop
                </Btn>
              </div>
            </Panel>
          </li>
        ))}
      </ol>
      <Panel className="mt-4 grid gap-3">
        <Area label="Prompt" value={prompt} onChange={setPrompt} rows={3} />
        <label className="block">
          <span className="mb-1 block text-sm text-mute">Camera</span>
          <select
            value={camera}
            onChange={(event) => setCamera(event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-ink px-3 text-paper"
          >
            {CAMERAS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <Field label="Seconds" value={seconds} onChange={setSeconds} />
        <Btn
          disabled={!prompt.trim()}
          onClick={() => {
            const length = Math.min(15, Math.max(2, Number(seconds) || 4));
            addShot({ prompt: prompt.trim(), camera, seconds: length });
            setPrompt("");
          }}
        >
          Add shot
        </Btn>
      </Panel>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn
          kind="ghost"
          disabled={shots.length === 0}
          onClick={() => {
            void navigator.clipboard?.writeText(pack).then(
              () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              },
              () => setCopied(false),
            );
          }}
        >
          {copied ? "Copied" : "Copy the pack"}
        </Btn>
        <Btn
          kind="ghost"
          disabled={shots.length === 0}
          onClick={() => {
            addTake({
              title: "Reel pack",
              audience: "From Reel",
              script: pack,
              seconds: Math.max(15, total),
            });
            void navigate({ to: "/", search: { station: "stage" } });
          }}
        >
          Open as a take
        </Btn>
      </div>
    </div>
  );
}

export function Lab() {
  const tears = useDesk((s) => s.tears);
  const addTear = useDesk((s) => s.addTear);
  const removeTear = useDesk((s) => s.removeTear);
  const clients = useDesk((s) => s.clients);
  const activeId = useDesk((s) => s.activeId);
  const client = clients.find((item) => item.id === activeId) ?? clients[0];
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [job, setJob] = useState("");

  return (
    <div>
      <StationHead id="lab" />
      <Panel className="grid gap-3">
        <h2 className="font-display text-2xl text-paper">What are they renting?</h2>
        <p className="text-sm leading-relaxed text-mute">
          Name the product and the job it actually sells. The desk prices that job on a station you already
          bill{client ? `, for ${client.name}` : ""}.
        </p>
        <Field label="Product" value={name} onChange={setName} placeholder="The invoice in their stack" />
        <Field label="What it charges" value={price} onChange={setPrice} placeholder="$40 / month" />
        <Area label="The job" value={job} onChange={setJob} rows={3} />
        <Btn
          disabled={!name.trim() || !job.trim()}
          onClick={() => {
            addTear({
              name: name.trim(),
              price: price.trim() || "unpriced",
              job: job.trim(),
              station: guessStation(`${name} ${job}`),
            });
            setName("");
            setPrice("");
            setJob("");
          }}
        >
          Price it on the desk
        </Btn>
      </Panel>
      <ul className="mt-4 space-y-3">
        {tears.map((tear) => {
          const station = stationById(tear.station);
          const seats = client?.seats ?? 1;
          const onDesk = client ? quote({ ...client, jobs: [tear.station as StationId] }) : null;
          return (
            <li key={tear.id}>
              <Panel>
                <p className="text-paper">{tear.name}</p>
                <p className="text-sm text-mute">They pay {tear.price}</p>
                <p className="mt-2 text-sm leading-relaxed text-paper">{tear.job}</p>
                <p className="mt-3 text-sm text-brass">
                  Sell it as {station.name}
                  {station.ask > 0 ? ` · $${station.ask} a seat` : ""}
                  {onDesk && station.ask > 0
                    ? ` · ${dollars(onDesk.charge)} / mo on ${seats} ${seats === 1 ? "seat" : "seats"}`
                    : ""}
                </p>
                {onDesk && station.ask > 0 ? (
                  <p className="mt-1 text-sm text-mute">
                    You keep {dollars(onDesk.margin)} after {dollars(onDesk.cost)} to run it.
                  </p>
                ) : null}
                <Btn kind="quiet" onClick={() => removeTear(tear.id)}>
                  Drop
                </Btn>
              </Panel>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function dollars(value: number): string {
  return `$${value.toLocaleString()}`;
}
