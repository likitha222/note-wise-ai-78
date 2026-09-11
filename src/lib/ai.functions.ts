import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Analysis, Question } from "./types";

const MODEL = "openai/gpt-6-astra";

async function callAI(input: unknown, schemaName: string, schema: unknown): Promise<any> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI_UNAVAILABLE");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      text: {
        format: { type: "json_schema", name: schemaName, strict: true, schema },
      },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`AI_ERROR_${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const evt = JSON.parse(raw);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        }
      } catch {
        /* ignore partial events */
      }
    }
  }

  if (!text.trim()) throw new Error("AI_EMPTY");
  return JSON.parse(text);
}

const node3 = {
  type: "object",
  additionalProperties: false,
  properties: { name: { type: "string" } },
  required: ["name"],
};
const node2 = {
  type: "object",
  additionalProperties: false,
  properties: { name: { type: "string" }, children: { type: "array", items: node3 } },
  required: ["name", "children"],
};
const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    topics: { type: "array", items: { type: "string" } },
    mindmap: {
      type: "object",
      additionalProperties: false,
      properties: { name: { type: "string" }, children: { type: "array", items: node2 } },
      required: ["name", "children"],
    },
    quiz_topics: { type: "array", items: { type: "string" } },
  },
  required: ["title", "summary", "topics", "mindmap", "quiz_topics"],
};

const quizSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "integer" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          topic: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["question", "options", "answer", "difficulty", "topic", "explanation"],
      },
    },
  },
  required: ["questions"],
};

export const analyzeNotes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        fileName: z.string(),
        mimeType: z.string(),
        dataUrl: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<Analysis> => {
    const isPdf = data.mimeType === "application/pdf";
    const content: any[] = [
      {
        type: "input_text",
        text: "These are a student's study notes. Extract the key information and respond as JSON with: a short title, a concise summary (max 120 words), 3-6 key topics, a mindmap tree (root = title, 3-5 branches, each with 2-4 leaf children), and 4-8 quiz_topics. Use only content present in the notes. If the notes are unreadable, set title to 'UNREADABLE'.",
      },
      isPdf
        ? { type: "input_file", filename: data.fileName, file_data: data.dataUrl }
        : { type: "input_image", image_url: data.dataUrl },
    ];

    const out = await callAI([{ role: "user", content }], "notes_analysis", analysisSchema);
    if (!out?.title || out.title === "UNREADABLE" || !out.summary) throw new Error("UNREADABLE");
    return out as Analysis;
  });

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string(),
        summary: z.string(),
        topics: z.array(z.string()),
        focusTopic: z.string().optional(),
        count: z.number().min(1).max(10).default(10),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<Question[]> => {
    const focus = data.focusTopic
      ? `Focus every question on the topic "${data.focusTopic}".`
      : `Spread the questions across these topics: ${data.topics.join(", ")}.`;

    const prompt = `Study notes titled "${data.title}".
Notes summary: ${data.summary}
Topics: ${data.topics.join(", ")}

Write exactly ${data.count} multiple-choice questions based ONLY on this material. ${focus}
Each question needs exactly 4 options, the index of the correct option (0-3), a difficulty of easy, medium or hard (mix them), the topic, and a one-sentence explanation.`;

    const out = await callAI(
      [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      "quiz",
      quizSchema,
    );
    const questions = (out?.questions ?? []) as Question[];
    if (!questions.length) throw new Error("AI_EMPTY");
    return questions.slice(0, data.count);
  });
