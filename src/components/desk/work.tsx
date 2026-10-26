import { useMemo, useState } from "react";
import { useDesk, type Task, type Thread } from "@/lib/stack/store";
import { dayLabel, slotIso, utcMidnight, when } from "@/lib/stack/time";
import { Btn, Field, Panel, StationHead } from "./ui";

const KINDS = ["Intro · 25 min", "Working · 50 min"];
const SLOTS = [
  { h: 9, m: 0, label: "9:00" },
  { h: 10, m: 30, label: "10:30" },
  { h: 13, m: 0, label: "1:00" },
  { h: 15, m: 30, label: "3:30" },
];

function comingDays(count: number): Date[] {
  return Array.from({ length: count }, (_, index) => utcMidnight(index));
}

export function Book() {
  const bookings = useDesk((s) => s.bookings);
  const addBooking = useDesk((s) => s.addBooking);
  const removeBooking = useDesk((s) => s.removeBooking);
  const days = useMemo(() => comingDays(5), []);
  const [dayIndex, setDayIndex] = useState(1);
  const [kind, setKind] = useState(KINDS[0]);
  const [picked, setPicked] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const day = days[dayIndex] ?? days[0];

  return (
    <div>
      <StationHead id="book" />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((item, index) => (
          <button
            key={item.toISOString()}
            type="button"
            onClick={() => {
              setDayIndex(index);
              setPicked(null);
            }}
            className={`min-h-11 shrink-0 rounded-md border px-3 text-sm ${
              index === dayIndex ? "border-brass bg-brass text-ink" : "border-line text-paper"
            }`}
          >
            {dayLabel(item)}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOTS.map((slot) => {
          const iso = day ? slotIso(day, slot.h, slot.m) : "";
          const taken = bookings.some((booking) => booking.at === iso);
          return (
            <button
              key={slot.label}
              type="button"
              disabled={taken}
              onClick={() => setPicked(iso)}
              className={`min-h-11 rounded-md border px-3 text-sm tabular-nums ${
                picked === iso ? "border-brass text-brass" : "border-line text-paper"
              } disabled:text-mute`}
            >
              {taken ? "Held" : slot.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        {KINDS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            className={`min-h-11 rounded-md px-3 text-sm ${kind === item ? "bg-panel text-brass" : "text-mute"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {picked ? (
        <Panel className="mt-4 grid gap-3">
          <Field label="Name" value={name} onChange={setName} placeholder="Who is this for?" />
          <Field label="Note" value={note} onChange={setNote} placeholder="What is the hour for?" />
          <Btn
            disabled={name.trim().length === 0}
            onClick={() => {
              addBooking({ name: name.trim(), note: note.trim(), kind, at: picked });
              setName("");
              setNote("");
              setPicked(null);
            }}
          >
            Hold this time
          </Btn>
        </Panel>
      ) : null}
      {bookings.length === 0 ? <p className="mt-8 text-sm text-mute">Nothing held yet.</p> : null}
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {[...bookings]
          .sort((a, b) => +new Date(a.at) - +new Date(b.at))
          .map((booking) => (
            <li key={booking.id} className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="text-paper">{booking.name}</p>
                <p className="text-sm text-mute">
                  {when(booking.at)} · {booking.kind}
                </p>
                {booking.note ? <p className="mt-1 text-sm text-paper">{booking.note}</p> : null}
              </div>
              <Btn kind="quiet" onClick={() => removeBooking(booking.id)}>
                Release
              </Btn>
            </li>
          ))}
      </ul>
    </div>
  );
}

const STATUSES: Thread["status"][] = ["open", "waiting", "closed"];

export function Inbox() {
  const threads = useDesk((s) => s.threads);
  const addMessage = useDesk((s) => s.addMessage);
  const setThreadStatus = useDesk((s) => s.setThreadStatus);
  const addThread = useDesk((s) => s.addThread);
  const [active, setActive] = useState(threads[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const thread = threads.find((item) => item.id === active) ?? threads[0];

  return (
    <div>
      <StationHead id="inbox" />
      <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr]">
        <ul className="flex gap-2 overflow-x-auto md:block md:space-y-1">
          {threads.map((item) => (
            <li key={item.id} className="shrink-0 md:shrink">
              <button
                type="button"
                onClick={() => setActive(item.id)}
                className={`min-h-11 w-full rounded-md px-3 text-left text-sm ${
                  thread?.id === item.id ? "bg-panel text-paper" : "text-mute"
                }`}
              >
                <span className="block font-medium">{item.from}</span>
                <span className="block">{item.status}</span>
              </button>
            </li>
          ))}
        </ul>
        {thread ? (
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-paper">{thread.subject}</h2>
                <p className="text-sm text-mute">{thread.from}</p>
              </div>
              <div className="flex gap-1">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setThreadStatus(thread.id, status)}
                    className={`min-h-11 rounded-md px-3 text-sm capitalize ${
                      thread.status === status ? "bg-brass text-ink" : "text-mute"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {thread.messages.map((message) => (
                <li
                  key={message.id}
                  className={`max-w-prose rounded-md px-3 py-3 text-sm leading-relaxed ${
                    message.from === "me" ? "ml-6 bg-ink text-paper" : "mr-6 bg-ink/40 text-paper"
                  }`}
                >
                  {message.body}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3">
              <Field label="Reply" value={reply} onChange={setReply} placeholder="Write back on the desk" />
              <Btn
                disabled={reply.trim().length === 0}
                onClick={() => {
                  addMessage(thread.id, reply.trim());
                  setReply("");
                }}
              >
                Send reply
              </Btn>
            </div>
          </Panel>
        ) : (
          <Panel>
            <p className="text-paper">The inbox is empty.</p>
          </Panel>
        )}
      </div>
      <Panel className="mt-4 grid gap-3">
        <h2 className="font-display text-xl text-paper">New thread</h2>
        <Field label="From" value={from} onChange={setFrom} placeholder="Name" />
        <Field label="Subject" value={subject} onChange={setSubject} placeholder="What they need" />
        <Field label="First message" value={body} onChange={setBody} placeholder="Their words" />
        <Btn
          kind="ghost"
          disabled={!from.trim() || !subject.trim() || !body.trim()}
          onClick={() => {
            addThread({ from: from.trim(), subject: subject.trim(), body: body.trim() });
            setFrom("");
            setSubject("");
            setBody("");
          }}
        >
          File the thread
        </Btn>
      </Panel>
    </div>
  );
}

const COLUMNS: { id: Task["column"]; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "now", label: "Now" },
  { id: "done", label: "Done" },
];

export function Board() {
  const tasks = useDesk((s) => s.tasks);
  const addTask = useDesk((s) => s.addTask);
  const moveTask = useDesk((s) => s.moveTask);
  const removeTask = useDesk((s) => s.removeTask);
  const [title, setTitle] = useState("");

  return (
    <div>
      <StationHead id="board" />
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          addTask(title.trim(), "backlog");
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A piece of work"
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-mute"
        />
        <Btn type="submit" disabled={!title.trim()}>
          Add to backlog
        </Btn>
      </form>
      <div className="grid gap-3 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Panel key={column.id}>
            <h2 className="font-display text-xl text-paper">{column.label}</h2>
            <ul className="mt-3 space-y-3">
              {tasks.filter((task) => task.column === column.id).map((task) => (
                <li key={task.id} className="rounded-md border border-line bg-ink p-3">
                  <p className="text-sm text-paper">{task.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {COLUMNS.filter((item) => item.id !== task.column).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => moveTask(task.id, item.id)}
                        className="min-h-11 rounded-md px-2 text-sm text-brass"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button type="button" onClick={() => removeTask(task.id)} className="min-h-11 px-2 text-sm text-mute">
                      Drop
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
