import { useState } from "react";
import { askLibrary } from "@/lib/stack/score";
import { useDesk } from "@/lib/stack/store";
import { Area, Btn, Field, Panel, StationHead } from "./ui";

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
      <Field label="Find a note" value={query} onChange={setQuery} placeholder="A word you already wrote" />
      <p className="mt-2 text-sm text-mute">
        {query.trim().length > 2
          ? hits.length === 0
            ? "Nothing matches."
            : `${hits.length} ${hits.length === 1 ? "note" : "notes"}.`
          : "Three letters, then it searches."}
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
          Save
        </Btn>
      </Panel>
    </div>
  );
}
