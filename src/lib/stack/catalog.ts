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
  upstream: string | null;
  href: string | null;
  stars: string | null;
  price: number;
  line: string;
  host: string;
};

export const STATIONS: Station[] = [
  {
    id: "floor",
    index: "00",
    name: "Floor",
    replaces: "The suite",
    upstream: null,
    href: "https://github.com/fullstackslife/fullstackslife",
    stars: null,
    price: 0,
    line: "One ledger. The nine jobs share it.",
    host: "This desk",
  },
  {
    id: "book",
    index: "01",
    name: "Book",
    replaces: "Calendly",
    upstream: "calcom/cal.com",
    href: "https://github.com/calcom/cal.com",
    stars: "about 49k",
    price: 12,
    line: "People pick a time. It lands on the same desk as the work.",
    host: "Self-hosted scheduling. Cal.com is the full upstream.",
  },
  {
    id: "inbox",
    index: "02",
    name: "Inbox",
    replaces: "Intercom",
    upstream: "chatwoot/chatwoot",
    href: "https://github.com/chatwoot/chatwoot",
    stars: "about 38k",
    price: 74,
    line: "One thread, one status, a reply that stays with the person.",
    host: "Shared inbox. Chatwoot is the full upstream.",
  },
  {
    id: "board",
    index: "03",
    name: "Board",
    replaces: "Asana",
    upstream: "opf/openproject",
    href: "https://github.com/opf/openproject",
    stars: "about 16k",
    price: 11,
    line: "Work in three columns. Nothing billed per seat.",
    host: "Projects and work packages. OpenProject is the full upstream.",
  },
  {
    id: "library",
    index: "04",
    name: "Library",
    replaces: "Notion AI",
    upstream: "Tencent/WeKnora",
    href: "https://github.com/Tencent/WeKnora",
    stars: "about 35k",
    price: 10,
    line: "Notes you can search. Ask is retrieval on this desk, not a rented model.",
    host: "Knowledge base. WeKnora is the full upstream.",
  },
  {
    id: "dictate",
    index: "05",
    name: "Dictate",
    replaces: "Wispr Flow",
    upstream: "OpenWhispr/openwhispr",
    href: "https://github.com/OpenWhispr/openwhispr",
    stars: "about 10k",
    price: 12,
    line: "Talk, then file the words as a note or a task.",
    host: "Desktop dictation, local when you want it. OpenWhispr is the full upstream.",
  },
  {
    id: "studio",
    index: "06",
    name: "Studio",
    replaces: "ElevenLabs",
    upstream: "debpalash/VoiceStudio",
    href: "https://github.com/debpalash/VoiceStudio",
    stars: "about 80k",
    price: 22,
    line: "Read a script in a voice this device already has.",
    host: "Local voice studio. VoiceStudio is the full upstream.",
  },
  {
    id: "lens",
    index: "07",
    name: "Lens",
    replaces: "Semrush",
    upstream: "every-app/open-seo",
    href: "https://github.com/every-app/open-seo",
    stars: "about 25k",
    price: 140,
    line: "Score the page you paste. No crawl, no data meter.",
    host: "OpenSEO is the full toolkit. Self-hosting it still calls a paid data API.",
  },
  {
    id: "stage",
    index: "08",
    name: "Stage",
    replaces: "Loom",
    upstream: "CapSoftware/Cap",
    href: "https://github.com/CapSoftware/Cap",
    stars: "about 23k",
    price: 15,
    line: "A take with a script. Record if the browser allows.",
    host: "Open screen capture. Cap is the full upstream.",
  },
  {
    id: "reel",
    index: "09",
    name: "Reel",
    replaces: "Higgsfield",
    upstream: "wide-trace/open-higgsfield",
    href: "https://github.com/wide-trace/open-higgsfield",
    stars: "about 5k",
    price: 29,
    line: "Shots in order: prompt, camera, length. Copy the pack.",
    host: "Open generation studio. OpenHiggsfield is the full upstream, and it still needs your own key.",
  },
  {
    id: "lab",
    index: "10",
    name: "Lab",
    replaces: "A closed product",
    upstream: "morluto/rea",
    href: "https://github.com/morluto/rea",
    stars: "about 350k",
    price: 0,
    line: "Name a paid tool. The desk points at the station that already does the job.",
    host: "Bonus. REA reverse-engineers apps on your machine. This lab only maps the job.",
  },
];

export const JOBS = STATIONS.filter((s) => s.price > 0);

export const MONTHLY = JOBS.reduce((sum, s) => sum + s.price, 0);

export function stationById(id: StationId): Station {
  const found = STATIONS.find((s) => s.id === id);
  return found ?? STATIONS[0];
}

export function isStationId(value: unknown): value is StationId {
  return typeof value === "string" && (STATION_IDS as readonly string[]).includes(value);
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
  { words: ["reverse", "binary", "decompil", "disassembl"], station: "lab" },
];

export function guessStation(text: string): StationId {
  const hay = text.toLowerCase();
  for (const hint of HINTS) {
    if (hint.words.some((word) => hay.includes(word))) return hint.station;
  }
  return "library";
}
