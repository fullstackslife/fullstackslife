export type PageDraft = {
  url: string;
  title: string;
  meta: string;
  h1: string;
  body: string;
  keyword: string;
};

export type Check = {
  id: string;
  label: string;
  pass: boolean;
  note: string;
};

export function scorePage(input: PageDraft): { checks: Check[]; passed: number; total: number; words: number } {
  const title = input.title.trim();
  const meta = input.meta.trim();
  const h1 = input.h1.trim();
  const body = input.body.trim();
  const keyword = input.keyword.trim().toLowerCase();
  const words = body ? body.split(/\s+/).filter(Boolean).length : 0;

  const checks: Check[] = [
    {
      id: "title",
      label: "Title length",
      pass: title.length >= 45 && title.length <= 65,
      note: `${title.length} characters. Aim for 45–65.`,
    },
    {
      id: "meta",
      label: "Description length",
      pass: meta.length >= 120 && meta.length <= 165,
      note: `${meta.length} characters. Aim for 120–165.`,
    },
    {
      id: "h1",
      label: "One clear H1",
      pass: h1.length > 0 && h1.length < 80,
      note: h1 ? h1 : "Missing.",
    },
    {
      id: "kw-title",
      label: "Keyword in the title",
      pass: keyword.length > 0 && title.toLowerCase().includes(keyword),
      note: keyword ? `Looking for “${input.keyword.trim()}”.` : "Add a keyword first.",
    },
    {
      id: "kw-h1",
      label: "Keyword in the H1",
      pass: keyword.length > 0 && h1.toLowerCase().includes(keyword),
      note: keyword ? `Looking for “${input.keyword.trim()}”.` : "Add a keyword first.",
    },
    {
      id: "body",
      label: "Body has substance",
      pass: words >= 80,
      note: `${words} words. Eighty is a floor for a page you paste here, not a ranking promise.`,
    },
  ];

  return { checks, passed: checks.filter((check) => check.pass).length, total: checks.length, words };
}

export function askLibrary(query: string, notes: { id: string; title: string; body: string }[]) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
  if (terms.length === 0) return [];
  return notes
    .map((note) => {
      const hay = `${note.title} ${note.body}`.toLowerCase();
      const hits = terms.filter((term) => hay.includes(term)).length;
      return { note, hits };
    })
    .filter((row) => row.hits > 0)
    .sort((a, b) => b.hits - a.hits);
}
