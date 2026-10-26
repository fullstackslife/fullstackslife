export const STATION_IDS = [
  "floor",
  "book",
  "inbox",
  "board",
  "library",
  "dictate",
  "studio",
  "lens",
  "stage",
  "reel",
  "lab",
] as const;

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
  line: string;
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
    line: "Whose desk is open, what they pay, what you keep.",
  },
  {
    id: "book",
    index: "01",
    name: "Book",
    replaces: "Calendly",
    price: 12,
    ask: 8,
    cost: 4,
    line: "They pick a time. The seat is on your invoice.",
  },
  {
    id: "inbox",
    index: "02",
    name: "Inbox",
    replaces: "Intercom",
    price: 74,
    ask: 29,
    cost: 12,
    line: "One thread, one reply, billed with the desk.",
  },
  {
    id: "board",
    index: "03",
    name: "Board",
    replaces: "Asana",
    price: 11,
    ask: 8,
    cost: 6,
    line: "The work, in three piles, on the same bill.",
  },
  {
    id: "library",
    index: "04",
    name: "Library",
    replaces: "Notion AI",
    price: 10,
    ask: 6,
    cost: 4,
    line: "Notes they can ask. Memory is a line item.",
  },
  {
    id: "dictate",
    index: "05",
    name: "Dictate",
    replaces: "Wispr Flow",
    price: 12,
    ask: 8,
    cost: 0,
    line: "They talk. You file it. The device does the listening.",
  },
  {
    id: "studio",
    index: "06",
    name: "Studio",
    replaces: "ElevenLabs",
    price: 22,
    ask: 12,
    cost: 0,
    line: "Read the script in a voice already on this device.",
  },
  {
    id: "lens",
    index: "07",
    name: "Lens",
    replaces: "Semrush",
    price: 140,
    ask: 49,
    cost: 11,
    line: "Score the page they hand you. Bill the seat, not a crawl.",
  },
  {
    id: "stage",
    index: "08",
    name: "Stage",
    replaces: "Loom",
    price: 15,
    ask: 9,
    cost: 3,
    line: "A take with a script. The recording sits on the desk.",
  },
  {
    id: "reel",
    index: "09",
    name: "Reel",
    replaces: "Higgsfield",
    price: 29,
    ask: 15,
    cost: 0,
    line: "Shots in order. You sell the pack, not a generation key.",
  },
  {
    id: "lab",
    index: "10",
    name: "Lab",
    replaces: "A closed product",
    price: 0,
    ask: 0,
    cost: 0,
    line: "Name what they pay for. Put that job on a station you already sell.",
  },
];

export const JOBS = STATIONS.filter((station) => station.ask > 0);

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

const HINTS: { words: string[]; station: StationId }[] = [
  { words: ["calendar", "schedule", "book", "meeting", "calendly"], station: "book" },
  { words: ["chat", "support", "inbox", "intercom", "helpdesk", "ticket"], station: "inbox" },
  { words: ["task", "project", "asana", "jira", "kanban", "board"], station: "board" },
  { words: ["note", "wiki", "notion", "docs", "knowledge", "second brain"], station: "library" },
  { words: ["dictat", "whisper", "speech to text", "wispr", "transcri"], station: "dictate" },
  { words: ["voice", "tts", "eleven", "clone", "dub", "audiobook"], station: "studio" },
  { words: ["seo", "keyword", "backlink", "semrush", "ahrefs", "rank"], station: "lens" },
  { words: ["loom", "screen record", "screen capture", "video message"], station: "stage" },
  { words: ["higgs", "storyboard", "video gen", "image gen", "text to video"], station: "reel" },
];

export function guessStation(text: string): StationId {
  const hay = text.toLowerCase();
  for (const hint of HINTS) {
    if (hint.words.some((word) => hay.includes(word))) return hint.station;
  }
  return "library";
}
