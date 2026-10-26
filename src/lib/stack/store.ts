import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PlanId, StationId } from "./catalog";

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

export type Workspace = {
  name: string;
  jobs: StationId[];
  plan: PlanId;
};

type DeskData = {
  workspace: Workspace | null;
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
  completeSetup: (workspace: Workspace) => void;
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
  return {
    workspace: null,
    bookings: [],
    threads: [],
    tasks: [],
    notes: [],
    scripts: [],
    audits: [],
    takes: [],
    shots: [],
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
      completeSetup: (workspace) => set({ workspace }),
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
      name: "fsl-desk-v4",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (state) => ({
        workspace: state.workspace,
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
        if (!next.workspace || typeof next.workspace.name !== "string") next.workspace = null;
        return next;
      },
    },
  ),
);

