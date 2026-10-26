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
    line: "Whose desk is open, what they pay, what you keep.",
    why: "",
  },
  {
    id: "book",
    index: "01",
    name: "Book",
    replaces: "Calendly",
    price: 12,
    ask: 8,
    cost: 4,
    own: true,
    line: "A link, a week, a confirmation.",
    why: "Small enough to write ourselves. We bill our scheduler, not Cal.com.",
  },
  {
    id: "inbox",
    index: "02",
    name: "Inbox",
    replaces: "Intercom",
    price: 74,
    ask: 29,
    cost: 12,
    own: true,
    line: "A thread and a reply.",
    why: "We write the inbox. Chatwoot's paid half is not ours to resell.",
  },
  {
    id: "board",
    index: "03",
    name: "Board",
    replaces: "Asana",
    price: 11,
    ask: 8,
    cost: 6,
    own: true,
    line: "Three columns on the same desk.",
    why: "Already ours. Worth money only because it sits on the invoice with the rest.",
  },
  {
    id: "library",
    index: "04",
    name: "Library",
    replaces: "Notion AI",
    price: 10,
    ask: 6,
    cost: 4,
    own: true,
    line: "Notes and search.",
    why: "The notes are ours. An AI answer is a model bill, not this line.",
  },
];

export const JOBS = STATIONS.filter((station) => station.own);

export function stationById(id: StationId): Station {
  return STATIONS.find((station) => station.id === id) ?? STATIONS[0];
}

export function isStationId(value: unknown): value is StationId {
  return typeof value === "string" && (STATION_IDS as readonly string[]).includes(value);
}

export type QuoteInput = {
  seats: number;
  jobs: StationId[];
  discount: number;
};

export type Quote = {
  closed: number;
  ask: number;
  charge: number;
  cost: number;
  margin: number;
  on: Station[];
};

export function quote(input: QuoteInput): Quote {
  const on = JOBS.filter((station) => input.jobs.includes(station.id));
  const seats = input.seats;
  const closed = on.reduce((sum, station) => sum + station.price, 0) * seats;
  const ask = on.reduce((sum, station) => sum + station.ask, 0) * seats;
  const charge = Math.round(ask * (1 - input.discount));
  const cost = on.reduce((sum, station) => sum + station.cost, 0);
  return { closed, ask, charge, cost, margin: charge - cost, on };
}

export function moneyLine(station: Station): string {
  if (station.ask <= 0) return station.line;
  const run =
    station.cost > 0
      ? `Costs you $${station.cost} a month to run, however many seats.`
      : "Costs you nothing while it stays on this device.";
  return `$${station.ask} a seat. Theirs lists near $${station.price}. ${run}`;
}
