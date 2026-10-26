export const STATION_IDS = ["floor", "book", "inbox", "board", "library"] as const;

export type StationId = (typeof STATION_IDS)[number];

export type Station = {
  id: StationId;
  index: string;
  name: string;
  replaces: string;
  /** What the closed product lists, per seat, per month. */
  price: number;
  /** What this desk charges, per seat, per month. */
  ask: number;
  /** What it costs you to run the job for a month, not per seat. */
  cost: number;
  /** True when the code on the invoice is ours, not an upstream repo. */
  own: boolean;
  line: string;
  why: string;
};

export const STATIONS: Station[] = [
  {
    id: "floor",
    index: "00",
    name: "Floor",
    replaces: "The invoice",
    price: 0,
    ask: 0,
    cost: 0,
    own: false,
    line: "The job you are selling.",
    why: "",
  },
  {
    id: "book",
    index: "01",
    name: "Book",
    replaces: "Calendly",
    price: 0,
    ask: 0,
    cost: 0,
    own: true,
    line: "Their scheduling page, on their domain.",
    why: "",
  },
  {
    id: "inbox",
    index: "02",
    name: "Inbox",
    replaces: "Intercom",
    price: 0,
    ask: 0,
    cost: 0,
    own: true,
    line: "Their shared inbox.",
    why: "",
  },
  {
    id: "board",
    index: "03",
    name: "Board",
    replaces: "Asana",
    price: 0,
    ask: 0,
    cost: 0,
    own: true,
    line: "Their board.",
    why: "",
  },
  {
    id: "library",
    index: "04",
    name: "Library",
    replaces: "Notion",
    price: 0,
    ask: 0,
    cost: 0,
    own: true,
    line: "Their notes.",
    why: "",
  },
];

export const JOBS = STATIONS.filter((station) => station.own);

export function stationById(id: StationId): Station {
  return STATIONS.find((station) => station.id === id) ?? STATIONS[0];
}

export function isStationId(value: unknown): value is StationId {
  return typeof value === "string" && (STATION_IDS as readonly string[]).includes(value);
}

export const PLANS = [
  { id: "desk", name: "Desk", price: 49, seats: 3, line: "Book, inbox, board, and library." },
  { id: "plus", name: "Plus", price: 99, seats: 10, line: "The same four, for a larger team." },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export function planById(id: PlanId) {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}


