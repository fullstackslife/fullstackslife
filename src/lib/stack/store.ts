import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { JOBS, type StationId } from "./catalog";

export type Booking = {
  id: string;
  name: string;
  note: string;
  kind: string;
  at: string;
};

export type ThreadMessage = {
  id: string;
  from: "them" | "me";
  body: string;
  at: string;
};

export type Thread = {
  id: string;
  from: string;
  subject: string;
  status: "open" | "waiting" | "closed";
  messages: ThreadMessage[];
};

export type Task = {
  id: string;
  title: string;
  column: "backlog" | "now" | "done";
};

export type Note = {
  id: string;
  title: string;
  body: string;
};

export type Script = {
  id: string;
  title: string;
  body: string;
};

export type Audit = {
  id: string;
  url: string;
  title: string;
  meta: string;
  h1: string;
  body: string;
  keyword: string;
  passed: number;
  total: number;
};

export type Take = {
  id: string;
  title: string;
  audience: string;
  script: string;
  seconds: number;
};

export type Shot = {
  id: string;
  prompt: string;
  camera: string;
  seconds: number;
};

export type Tear = {
  id: string;
  name: string;
  price: string;
  job: string;
  station: StationId;
};

export type Client = {
  id: string;
  name: string;
  seats: number;
  jobs: StationId[];
  discount: number;
};

type DeskData = {
  clients: Client[];
  activeId: string;
  bookings: Booking[];
  threads: Thread[];
  tasks: Task[];
  notes: Note[];
  scripts: Script[];
  audits: Audit[];
  takes: Take[];
  shots: Shot[];
  tears: Tear[];
};

type DeskState = DeskData & {
  setActive: (id: string) => void;
  addClient: (name: string) => void;
  patchClient: (id: string, patch: Partial<Pick<Client, "name" | "seats" | "jobs" | "discount">>) => void;
  addBooking: (booking: Omit<Booking, "id">) => void;
  removeBooking: (id: string) => void;
  addThread: (thread: Omit<Thread, "id" | "messages" | "status"> & { body: string }) => void;
  addMessage: (threadId: string, body: string) => void;
  setThreadStatus: (threadId: string, status: Thread["status"]) => void;
  addTask: (title: string, column?: Task["column"]) => void;
  moveTask: (id: string, column: Task["column"]) => void;
  removeTask: (id: string) => void;
  addNote: (note: Omit<Note, "id">) => string;
  removeNote: (id: string) => void;
  addScript: (script: Omit<Script, "id">) => void;
  removeScript: (id: string) => void;
  addAudit: (audit: Omit<Audit, "id">) => void;
  removeAudit: (id: string) => void;
  addTake: (take: Omit<Take, "id">) => void;
  removeTake: (id: string) => void;
  addShot: (shot: Omit<Shot, "id">) => void;
  moveShot: (id: string, dir: -1 | 1) => void;
  removeShot: (id: string) => void;
  addTear: (tear: Omit<Tear, "id">) => void;
  removeTear: (id: string) => void;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function seed(): DeskData {
  const all = JOBS.map((station) => station.id);
  return {
    clients: [
      {
        id: "harbor",
        name: "Harbor Studio",
        seats: 4,
        jobs: all,
        discount: 0,
      },
      {
        id: "north",
        name: "Northwind Clinic",
        seats: 8,
        jobs: ["book", "inbox", "library"],
        discount: 0.1,
      },
    ],
    activeId: "harbor",
    bookings: [
      {
        id: "bk-priya",
        name: "Priya Shah",
        note: "Portfolio review, keep it to the work.",
        kind: "Intro · 25 min",
        at: "2026-10-26T14:30:00.000Z",
      },
      {
        id: "bk-sam",
        name: "Sam Okonkwo",
        note: "Working session on the launch page.",
        kind: "Working · 50 min",
        at: "2026-10-28T17:00:00.000Z",
      },
    ],
    threads: [
      {
        id: "th-jordan",
        from: "Jordan Hale",
        subject: "Where is the recording?",
        status: "open",
        messages: [
          {
            id: "m1",
            from: "them",
            body: "I can see the invite but not the take you mentioned. Can you drop it on the desk?",
            at: "2026-10-25T12:12:00.000Z",
          },
        ],
      },
      {
        id: "th-north",
        from: "Northwind Clinic",
        subject: "Can we move Thursday?",
        status: "waiting",
        messages: [
          {
            id: "m2",
            from: "them",
            body: "Thursday 1pm conflicts with a procedure. Friday morning still open?",
            at: "2026-10-24T20:40:00.000Z",
          },
          {
            id: "m3",
            from: "me",
            body: "Friday 10:30 is free. I moved the hold.",
            at: "2026-10-24T21:05:00.000Z",
          },
        ],
      },
      {
        id: "th-alex",
        from: "Alex Nguyen",
        subject: "Invoice received",
        status: "closed",
        messages: [
          {
            id: "m4",
            from: "them",
            body: "Got it. We'll pay on the 30th.",
            at: "2026-10-21T15:02:00.000Z",
          },
        ],
      },
    ],
    tasks: [
      { id: "tk-1", title: "Reply to Jordan with the take", column: "now" },
      { id: "tk-2", title: "Write the onboarding note", column: "now" },
      { id: "tk-3", title: "Cut the reel to four shots", column: "backlog" },
      { id: "tk-4", title: "Publish the scheduling page", column: "done" },
    ],
    notes: [
      {
        id: "nt-1",
        title: "Harbor onboarding",
        body: "Four seats. They book, they write, they record. One invoice on the first of the month. Do not send them nine logins.",
      },
      {
        id: "nt-2",
        title: "Northwind, Fridays",
        body: "Clinic desk is book, inbox, and library. Ten percent off the ask. They do not want voice or a reel.",
      },
      {
        id: "nt-3",
        title: "Page score rules",
        body: "Title 45 to 65 characters. Description 120 to 165. One H1 under 80 characters. Keyword in the title and the H1. Body of at least 300 words. Lens does not crawl the web and does not pretend to be Semrush.",
      },
    ],
    scripts: [
      {
        id: "sc-1",
        title: "Twenty-second intro",
        body: "This is your desk. Scheduling, the inbox, and the work are one invoice. Book a time, answer the thread, move the job.",
      },
    ],
    audits: [
      {
        id: "au-1",
        url: "https://example.com/desk",
        title: "Harbor Studio — one desk",
        meta: "Scheduling, inbox, and the work, on one monthly invoice. No second login for the notes.",
        h1: "One desk for the studio",
        body: "Harbor Studio books time, answers clients, and keeps the work on a single desk. The page says what the desk does and who it is for. It does not list other products. Title, description, and the heading agree. The body is long enough to say how a new client gets on, what a seat includes, and when the invoice goes out.",
        keyword: "desk",
        passed: 4,
        total: 6,
      },
    ],
    takes: [
      {
        id: "take-1",
        title: "How the desk is one system",
        audience: "Someone about to rent another seat",
        script: "Don't add a tool. Add the job to the desk. Time, people, work, memory, voice, reach.",
        seconds: 45,
      },
    ],
    shots: [
      { id: "sh-1", prompt: "A walnut desk at night, one brass lamp, an empty chair", camera: "Static", seconds: 3 },
      { id: "sh-2", prompt: "A hand closes nine invoices into a single folder", camera: "Push in", seconds: 4 },
      { id: "sh-3", prompt: "The lamp stays on. The chair is now occupied, writing", camera: "Handheld", seconds: 3 },
    ],
    tears: [],
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useDesk = create<DeskState>()(
  persist(
    (set) => ({
      ...seed(),
      setActive: (id) => set({ activeId: id }),
      addClient: (name) =>
        set((state) => {
          const id = uid();
          return {
            activeId: id,
            clients: [
              ...state.clients,
              { id, name, seats: 3, jobs: JOBS.map((station) => station.id), discount: 0 },
            ],
          };
        }),
      patchClient: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id !== id) return client;
            const seats = patch.seats === undefined ? client.seats : Math.min(24, Math.max(1, Math.round(patch.seats)));
            return { ...client, ...patch, seats };
          }),
        })),
      addBooking: (booking) => set((state) => ({ bookings: [{ ...booking, id: uid() }, ...state.bookings] })),
      removeBooking: (id) => set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) })),
      addThread: ({ from, subject, body }) =>
        set((state) => ({
          threads: [
            {
              id: uid(),
              from,
              subject,
              status: "open",
              messages: [{ id: uid(), from: "them", body, at: new Date().toISOString() }],
            },
            ...state.threads,
          ],
        })),
      addMessage: (threadId, body) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  status: "waiting",
                  messages: [
                    ...thread.messages,
                    { id: uid(), from: "me" as const, body, at: new Date().toISOString() },
                  ],
                }
              : thread,
          ),
        })),
      setThreadStatus: (threadId, status) =>
        set((state) => ({
          threads: state.threads.map((thread) => (thread.id === threadId ? { ...thread, status } : thread)),
        })),
      addTask: (title, column = "backlog") =>
        set((state) => ({ tasks: [{ id: uid(), title, column }, ...state.tasks] })),
      moveTask: (id, column) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, column } : task)),
        })),
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      addNote: (note) => {
        const id = uid();
        set((state) => ({ notes: [{ ...note, id }, ...state.notes] }));
        return id;
      },
      removeNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      addScript: (script) => set((state) => ({ scripts: [{ ...script, id: uid() }, ...state.scripts] })),
      removeScript: (id) => set((state) => ({ scripts: state.scripts.filter((script) => script.id !== id) })),
      addAudit: (audit) => set((state) => ({ audits: [{ ...audit, id: uid() }, ...state.audits] })),
      removeAudit: (id) => set((state) => ({ audits: state.audits.filter((audit) => audit.id !== id) })),
      addTake: (take) => set((state) => ({ takes: [{ ...take, id: uid() }, ...state.takes] })),
      removeTake: (id) => set((state) => ({ takes: state.takes.filter((take) => take.id !== id) })),
      addShot: (shot) => set((state) => ({ shots: [...state.shots, { ...shot, id: uid() }] })),
      moveShot: (id, dir) =>
        set((state) => {
          const shots = [...state.shots];
          const index = shots.findIndex((shot) => shot.id === id);
          const next = index + dir;
          if (index < 0 || next < 0 || next >= shots.length) return {};
          const current = shots[index];
          const swap = shots[next];
          if (!current || !swap) return {};
          shots[index] = swap;
          shots[next] = current;
          return { shots };
        }),
      removeShot: (id) => set((state) => ({ shots: state.shots.filter((shot) => shot.id !== id) })),
      addTear: (tear) => set((state) => ({ tears: [{ ...tear, id: uid() }, ...state.tears] })),
      removeTear: (id) => set((state) => ({ tears: state.tears.filter((tear) => tear.id !== id) })),
    }),
    {
      name: "fsl-desk-v2",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (state) => ({
        clients: state.clients,
        activeId: state.activeId,
        bookings: state.bookings,
        threads: state.threads,
        tasks: state.tasks,
        notes: state.notes,
        scripts: state.scripts,
        audits: state.audits,
        takes: state.takes,
        shots: state.shots,
        tears: state.tears,
      }),
      merge: (persisted, current) => {
        const next = { ...current, ...(persisted as Partial<DeskData>) };
        if (!next.clients?.length) {
          next.clients = seed().clients;
          next.activeId = seed().activeId;
        }
        if (!next.clients.some((client) => client.id === next.activeId)) {
          next.activeId = next.clients[0]?.id ?? seed().activeId;
        }
        return next;
      },
    },
  ),
);

