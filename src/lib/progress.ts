export type TopicStat = { correct: number; total: number };
export type Progress = { correct: number; total: number; topics: Record<string, TopicStat> };

const KEY = "notewise-progress";

export function loadProgress(): Progress {
  if (typeof window === "undefined") return { correct: 0, total: 0, topics: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* ignore */
  }
  return { correct: 0, total: 0, topics: {} };
}

export function saveAttempt(results: { topic: string; correct: boolean }[]): Progress {
  const p = loadProgress();
  for (const r of results) {
    p.total += 1;
    if (r.correct) p.correct += 1;
    const t = p.topics[r.topic] ?? { correct: 0, total: 0 };
    t.total += 1;
    if (r.correct) t.correct += 1;
    p.topics[r.topic] = t;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
  return p;
}
