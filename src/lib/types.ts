export type MindNode = { name: string; children?: MindNode[] };

export type Analysis = {
  title: string;
  summary: string;
  topics: string[];
  mindmap: MindNode;
  quiz_topics: string[];
};

export type Question = {
  question: string;
  options: string[];
  answer: number;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  explanation: string;
};
