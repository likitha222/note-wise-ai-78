import { useMemo, useState } from "react";
import type { Question } from "@/lib/types";

type Difficulty = "easy" | "medium" | "hard";
const ORDER: Difficulty[] = ["easy", "medium", "hard"];

function step(current: Difficulty, correct: boolean): Difficulty {
  const i = ORDER.indexOf(current);
  const next = correct ? Math.min(i + 1, 2) : Math.max(i - 1, 0);
  return ORDER[next]!;
}

export type QuizResult = { topic: string; correct: boolean; difficulty: Difficulty };

export function Quiz({
  questions,
  onFinish,
}: {
  questions: Question[];
  onFinish: (results: QuizResult[]) => void;
}) {
  const [asked, setAsked] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);

  // Adaptive pick: prefer an unasked question at the current difficulty.
  const currentIndex = useMemo(() => {
    const remaining = questions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => !asked.includes(i));
    if (!remaining.length) return -1;
    const match = remaining.find(({ q }) => q.difficulty === difficulty);
    return (match ?? remaining[0]!).i;
  }, [questions, asked, difficulty]);

  if (currentIndex === -1) return null;
  const q = questions[currentIndex]!;
  const number = asked.length + 1;

  const next = () => {
    if (selected === null) return;
    const correct = selected === q.answer;
    const newResults = [...results, { topic: q.topic, correct, difficulty }];
    const newAsked = [...asked, currentIndex];
    setResults(newResults);
    setAsked(newAsked);
    setSelected(null);
    setDifficulty(step(difficulty, correct));
    if (newAsked.length >= questions.length) onFinish(newResults);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {number} of {questions.length}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">
          {difficulty}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold">{q.question}</h3>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              selected === i
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-background hover:bg-secondary"
            }`}
          >
            <span className="mr-2 font-medium">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={selected === null}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40 sm:w-auto sm:px-8"
      >
        {number === questions.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}
