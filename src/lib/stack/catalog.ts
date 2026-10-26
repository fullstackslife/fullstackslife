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
    why: "Included in the retainer. Not sold alone.",
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
    why: "Included in the retainer. Not sold alone.",
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
    why: "Included in the retainer. Not sold alone.",
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
    why: "Included in the retainer. Not sold alone.",
  },
];

export const JOBS = STATIONS.filter((station) => station.own);

export function stationById(id: StationId): Station {
  return STATIONS.find((station) => station.id === id) ?? STATIONS[0];
}

export function isStationId(value: unknown): value is StationId {
  return typeof value === "string" && (STATION_IDS as readonly string[]).includes(value);
}

export const SETUP = 4000;
export const RETAINER = 500;

export function offer(spend: number): {
  setup: number;
  retainer: number;
  spend: number;
  save: number;
  sell: boolean;
  payback: number | null;
} {
  const save = spend - RETAINER;
  return {
    setup: SETUP,
    retainer: RETAINER,
    spend,
    save,
    sell: save > 0,
    payback: save > 0 ? Math.ceil(SETUP / save) : null,
  };
}

