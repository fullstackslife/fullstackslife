import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { askLibrary } from "@/lib/stack/score";
import { useDesk } from "@/lib/stack/store";
import { Area, Btn, Field, Panel, StationHead } from "./ui";

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function recognition(): Rec | null {
  if (typeof window === "undefined") return null;
  const host = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function Library() {
  const notes = useDesk((s) => s.notes);
  const addNote = useDesk((s) => s.addNote);
  const removeNote = useDesk((s) => s.removeNote);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(notes[0]?.id ?? "");
  const hits = askLibrary(query, notes);
  const shown = query.trim().length > 2 ? hits.map((hit) => hit.note) : notes;
  const note = shown.find((item) => item.id === open) ?? shown[0];

  return (
    <div>
      <StationHead id="library" />
      <Field label="Ask the library" value={query} onChange={setQuery} placeholder="A word you already wrote" />
      <p className="mt-2 text-sm text-mute">
        {query.trim().length > 2
          ? hits.length === 0
            ? "Nothing on the desk matches. This is search, not a model guessing."
            : `${hits.length} ${hits.length === 1 ? "note" : "notes"} on the desk.`
          : "Three letters before it searches."}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,200px)_1fr]">
        <ul className="space-y-1">
          {shown.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpen(item.id)}
                className={`min-h-11 w-full rounded-md px-3 text-left text-sm ${
                  note?.id === item.id ? "bg-panel text-paper" : "text-mute"
                }`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
        {note ? (
          <Panel>
            <h2 className="font-display text-2xl text-paper">{note.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-paper">{note.body}</p>
            <Btn kind="quiet" onClick={() => removeNote(note.id)}>
              Remove note
            </Btn>
          </Panel>
        ) : (
          <Panel>
            <p className="text-paper">No notes yet.</p>
          </Panel>
        )}
      </div>
      <Panel className="mt-4 grid gap-3">
        <h2 className="font-display text-xl text-paper">New note</h2>
        <Field label="Title" value={title} onChange={setTitle} />
        <Area label="Body" value={body} onChange={setBody} />
        <Btn
          disabled={!title.trim() || !body.trim()}
          onClick={() => {
            const id = addNote({ title: title.trim(), body: body.trim() });
            setOpen(id);
            setTitle("");
            setBody("");
          }}
        >
          Keep on the desk
        </Btn>
      </Panel>
    </div>
  );
}

export function Dictate() {
  const addNote = useDesk((s) => s.addNote);
  const addTask = useDesk((s) => s.addTask);
  const [text, setText] = useState("");
  const [hearing, setHearing] = useState(false);
  const [blocked, setBlocked] = useState("");

  function listen() {
    const rec = recognition();
    if (!rec) {
      setBlocked("This browser has no speech recognition. Type, then file it.");
      return;
    }
    setBlocked("");
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const said = Array.from(event.results)
        .map((row) => row[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) setText((current) => (current ? `${current} ${said}` : said));
    };
    rec.onerror = () => {
      setHearing(false);
      setBlocked("The microphone did not start. You can still type.");
    };
    rec.onend = () => setHearing(false);
    setHearing(true);
    rec.start();
  }

  return (
    <div>
      <StationHead id="dictate" />
      <Area label="Words" value={text} onChange={setText} rows={8} />
      {blocked ? <p className="mt-2 text-sm text-mute">{blocked}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn onClick={listen} disabled={hearing}>
          {hearing ? "Listening" : "Listen"}
        </Btn>
        <Btn
          kind="ghost"
          disabled={!text.trim()}
          onClick={() => {
            addNote({ title: text.trim().slice(0, 48), body: text.trim() });
            setText("");
          }}
        >
          File as a note
        </Btn>
        <Btn
          kind="ghost"
          disabled={!text.trim()}
          onClick={() => {
            addTask(text.trim().slice(0, 80), "now");
            setText("");
          }}
        >
          File as a task
        </Btn>
      </div>
    </div>
  );
}

export function Studio() {
  const scripts = useDesk((s) => s.scripts);
  const addScript = useDesk((s) => s.addScript);
  const removeScript = useDesk((s) => s.removeScript);
  const addTake = useDesk((s) => s.addTake);
  const navigate = useNavigate();
  const [title, setTitle] = useState("Desk briefing");
  const [body, setBody] = useState(scripts[0]?.body ?? "");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const next = window.speechSynthesis.getVoices();
      setVoices(next);
      setVoiceUri((current) => current || next[0]?.voiceURI || "");
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis || !body.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(body.trim());
    const voice = voices.find((item) => item.voiceURI === voiceUri);
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div>
      <StationHead id="studio" />
      <div className="grid gap-3">
        <Field label="Title" value={title} onChange={setTitle} />
        <Area label="Script" value={body} onChange={setBody} rows={6} />
        <label className="block">
          <span className="mb-1 block text-sm text-mute">Voice on this device</span>
          <select
            value={voiceUri}
            onChange={(event) => setVoiceUri(event.target.value)}
            className="h-11 w-full rounded-md border border-line bg-ink px-3 text-paper"
          >
            {voices.length === 0 ? <option value="">No device voices yet</option> : null}
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn onClick={speak} disabled={!body.trim() || speaking}>
          {speaking ? "Speaking" : "Speak"}
        </Btn>
        <Btn
          kind="ghost"
          disabled={!title.trim() || !body.trim()}
          onClick={() => addScript({ title: title.trim(), body: body.trim() })}
        >
          Keep script
        </Btn>
        <Btn
          kind="ghost"
          disabled={!title.trim() || !body.trim()}
          onClick={() => {
            const words = body.trim().split(/\s+/).length;
            addTake({
              title: title.trim(),
              audience: "From Studio",
              script: body.trim(),
              seconds: Math.max(15, Math.round(words / 2.4)),
            });
            void navigate({ to: "/", search: { station: "stage" } });
          }}
        >
          Send to Stage
        </Btn>
        {speaking ? (
          <Btn
            kind="quiet"
            onClick={() => {
              window.speechSynthesis.cancel();
              setSpeaking(false);
            }}
          >
            Stop
          </Btn>
        ) : null}
      </div>
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {scripts.map((script) => (
          <li key={script.id} className="flex items-start justify-between gap-3 py-4">
            <button type="button" className="min-h-11 text-left" onClick={() => {
              setTitle(script.title);
              setBody(script.body);
            }}>
              <span className="block text-paper">{script.title}</span>
              <span className="block text-sm text-mute">{script.body.slice(0, 90)}</span>
            </button>
            <Btn kind="quiet" onClick={() => removeScript(script.id)}>
              Drop
            </Btn>
          </li>
        ))}
      </ul>
    </div>
  );
}
