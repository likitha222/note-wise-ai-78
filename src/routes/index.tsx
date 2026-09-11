import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Upload, FileText, X, Sparkles, CheckCircle2, BrainCircuit } from "lucide-react";
import { MindMap } from "@/components/MindMap";
import { Quiz, type QuizResult } from "@/components/Quiz";
import { analyzeNotes, generateQuiz } from "@/lib/ai.functions";
import { demoAnalysis, demoQuestions } from "@/lib/demo-data";
import { loadProgress, saveAttempt, type Progress } from "@/lib/progress";
import type { Analysis, Question } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoteWise AI — Turn Notes Into Practice Questions" },
      {
        name: "description",
        content:
          "Upload handwritten or typed study notes and get an AI summary, mind map and an adaptive MCQ quiz.",
      },
      { property: "og:title", content: "NoteWise AI — Turn Notes Into Practice Questions" },
      {
        property: "og:description",
        content: "AI summaries, mind maps and adaptive quizzes generated from your study notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

type Stage = "upload" | "results" | "quiz" | "score";

function App() {
  const analyze = useServerFn(analyzeNotes);
  const makeQuiz = useServerFn(generateQuiz);

  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [demo, setDemo] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [progress, setProgress] = useState<Progress>({ correct: 0, total: 0, topics: {} });

  useEffect(() => setProgress(loadProgress()), []);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("Please upload a PDF, JPG, PNG, or JPEG file.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const runAnalysis = async () => {
    if (!file) return;
    setBusy("Analyzing your notes...");
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      const out = await analyze({ data: { fileName: file.name, mimeType: file.type, dataUrl } });
      setAnalysis(out);
      setDemo(false);
      setStage("results");
    } catch (e) {
      const msg = String((e as Error)?.message ?? "");
      setError(
        msg.includes("UNREADABLE")
          ? "Sorry, we couldn't read these notes. Please upload a clearer image or PDF."
          : "Something went wrong while analyzing your notes. Please try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  const startDemo = () => {
    setAnalysis(demoAnalysis);
    setDemo(true);
    setError(null);
    setStage("results");
  };

  const startQuiz = async (focusTopic?: string) => {
    if (!analysis) return;
    const count = focusTopic ? 5 : 10;
    if (demo) {
      const pool = focusTopic
        ? demoQuestions.filter((q) => q.topic === focusTopic)
        : demoQuestions;
      setQuestions((pool.length ? pool : demoQuestions).slice(0, count));
      setStage("quiz");
      return;
    }
    setBusy(focusTopic ? `Creating practice on ${focusTopic}...` : "Creating your quiz...");
    setError(null);
    try {
      const qs = await makeQuiz({
        data: {
          title: analysis.title,
          summary: analysis.summary,
          topics: analysis.topics,
          focusTopic,
          count,
        },
      });
      setQuestions(qs);
      setStage("quiz");
    } catch {
      setError("Something went wrong while creating your quiz. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const finishQuiz = (res: QuizResult[]) => {
    setResults(res);
    setProgress(saveAttempt(res.map((r) => ({ topic: r.topic, correct: r.correct }))));
    setStage("score");
  };

  const score = results.filter((r) => r.correct).length;
  const pct = results.length ? Math.round((score / results.length) * 100) : 0;

  const byTopic: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    const t = byTopic[r.topic] ?? { correct: 0, total: 0 };
    t.total += 1;
    if (r.correct) t.correct += 1;
    byTopic[r.topic] = t;
  }
  const strong = Object.entries(byTopic).filter(([, s]) => s.correct / s.total >= 0.6);
  const weak = Object.entries(byTopic).filter(([, s]) => s.correct / s.total < 0.6);
  const weakest = weak.sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">NoteWise AI</h1>
            <p className="text-xs text-muted-foreground">
              Turn your notes into personalized practice.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {busy && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            {busy}
          </div>
        )}

        {stage === "upload" && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Upload Your Notes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload handwritten or typed study notes.
            </p>

            {!file ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-primary bg-accent" : "border-border bg-background"
                }`}
              >
                <Upload className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">Drop your files here</p>
                <p className="text-xs text-muted-foreground">or</p>
                <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
                  Browse Files
                </span>
                <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG or JPEG</p>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={runAnalysis}
                disabled={!file || !!busy}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                Analyze Notes
              </button>
              <button
                onClick={startDemo}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium"
              >
                Try Demo
              </button>
            </div>
          </section>
        )}

        {stage === "results" && analysis && (
          <>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> Notes analyzed
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold">AI Summary</h2>
              <p className="mt-1 text-xs text-muted-foreground">{analysis.title}</p>
              <p className="mt-3 text-sm leading-relaxed">{analysis.summary}</p>

              <h3 className="mt-6 text-sm font-semibold">Key Topics</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Mind Map</h2>
              <MindMap root={analysis.mindmap} />
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <h2 className="text-base font-semibold">Ready to practice?</h2>
              <button
                onClick={() => startQuiz()}
                disabled={!!busy}
                className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                Start Adaptive Quiz
              </button>
              <div>
                <button
                  onClick={() => {
                    setStage("upload");
                    setFile(null);
                  }}
                  className="mt-3 text-xs text-muted-foreground underline"
                >
                  Upload different notes
                </button>
              </div>
            </section>
          </>
        )}

        {stage === "quiz" && questions.length > 0 && (
          <Quiz questions={questions} onFinish={finishQuiz} />
        )}

        {stage === "score" && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Quiz Complete!</h2>
            <p className="mt-2 text-3xl font-bold text-primary">
              {score} / {results.length}
            </p>
            <p className="text-sm text-muted-foreground">{pct}%</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Strong Topics</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {strong.length ? (
                    strong.map(([t]) => <li key={t}>{t}</li>)
                  ) : (
                    <li>Keep practicing!</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Needs Practice</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {weak.length ? weak.map(([t]) => <li key={t}>{t}</li>) : <li>None — great job!</li>}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
              <span className="font-medium">AI Recommendation: </span>
              {weakest
                ? `Practice 3–5 more questions on ${weakest[0]}.`
                : "Great work — try a new set of notes to keep going."}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {weakest && (
                <button
                  onClick={() => startQuiz(weakest[0])}
                  disabled={!!busy}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
                >
                  Try Weak Topic Again
                </button>
              )}
              <button
                onClick={() => setStage("results")}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium"
              >
                Back to Notes
              </button>
            </div>
          </section>
        )}

        {progress.total > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overall quiz accuracy:{" "}
              <span className="font-semibold text-foreground">
                {Math.round((progress.correct / progress.total) * 100)}%
              </span>{" "}
              ({progress.correct}/{progress.total})
            </p>
            <div className="mt-4 space-y-3">
              {Object.entries(progress.topics).map(([topic, s]) => {
                const p = Math.round((s.correct / s.total) * 100);
                return (
                  <div key={topic}>
                    <div className="flex justify-between text-xs">
                      <span>{topic}</span>
                      <span className="text-muted-foreground">{p}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
