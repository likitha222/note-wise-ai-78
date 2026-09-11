import type { Analysis, Question } from "./types";

export const demoAnalysis: Analysis = {
  title: "Operating Systems",
  summary:
    "An operating system manages hardware and software resources for the computer. Key areas include process management (creating, scheduling and terminating processes using the Process Control Block and process states), CPU scheduling algorithms such as FCFS, SJF and Round Robin, and memory management with paging, segmentation and virtual memory. Deadlocks occur when processes hold and wait for resources in a circular chain.",
  topics: ["Process Management", "CPU Scheduling", "Memory Management", "Deadlocks"],
  mindmap: {
    name: "Operating Systems",
    children: [
      {
        name: "Process Management",
        children: [{ name: "Process" }, { name: "PCB" }, { name: "Process States" }],
      },
      {
        name: "CPU Scheduling",
        children: [{ name: "FCFS" }, { name: "SJF" }, { name: "Round Robin" }],
      },
      {
        name: "Memory Management",
        children: [{ name: "Paging" }, { name: "Segmentation" }, { name: "Virtual Memory" }],
      },
      {
        name: "Deadlocks",
        children: [{ name: "Conditions" }, { name: "Prevention" }],
      },
    ],
  },
  quiz_topics: ["Process", "PCB", "Process States", "CPU Scheduling", "Paging", "Deadlocks"],
};

export const demoQuestions: Question[] = [
  {
    question: "What is a process?",
    options: [
      "A program in execution",
      "A memory location",
      "A hardware device",
      "A programming language",
    ],
    answer: 0,
    difficulty: "easy",
    topic: "Process Management",
    explanation: "A process is a program currently in execution.",
  },
  {
    question: "What does PCB stand for?",
    options: [
      "Program Control Block",
      "Process Control Block",
      "Primary Cache Buffer",
      "Process Cache Block",
    ],
    answer: 1,
    difficulty: "easy",
    topic: "Process Management",
    explanation: "The PCB (Process Control Block) stores all information about a process.",
  },
  {
    question: "Which is NOT a process state?",
    options: ["Ready", "Running", "Compiled", "Waiting"],
    answer: 2,
    difficulty: "easy",
    topic: "Process Management",
    explanation: "Process states are new, ready, running, waiting and terminated.",
  },
  {
    question: "Which scheduling algorithm gives each process a fixed time slice?",
    options: ["FCFS", "SJF", "Round Robin", "Priority"],
    answer: 2,
    difficulty: "medium",
    topic: "CPU Scheduling",
    explanation: "Round Robin assigns each process a fixed time quantum in turn.",
  },
  {
    question: "Which algorithm can cause starvation of long processes?",
    options: ["FCFS", "Shortest Job First", "Round Robin", "None"],
    answer: 1,
    difficulty: "medium",
    topic: "CPU Scheduling",
    explanation: "SJF can starve long jobs because short jobs keep arriving.",
  },
  {
    question: "FCFS scheduling is best described as:",
    options: [
      "Preemptive and priority based",
      "Non-preemptive, in arrival order",
      "Based on remaining time",
      "Random selection",
    ],
    answer: 1,
    difficulty: "hard",
    topic: "CPU Scheduling",
    explanation: "First Come First Served runs processes in the order they arrive, without preemption.",
  },
  {
    question: "Paging divides memory into:",
    options: ["Variable segments", "Fixed-size frames and pages", "Registers", "Files"],
    answer: 1,
    difficulty: "medium",
    topic: "Memory Management",
    explanation: "Paging splits physical memory into frames and logical memory into equal-sized pages.",
  },
  {
    question: "Virtual memory allows a program to:",
    options: [
      "Run even if it is larger than physical memory",
      "Run without a CPU",
      "Avoid using the disk",
      "Skip the operating system",
    ],
    answer: 0,
    difficulty: "hard",
    topic: "Memory Management",
    explanation: "Virtual memory uses disk space so programs larger than RAM can run.",
  },
  {
    question: "Which is one of the four necessary conditions for deadlock?",
    options: ["Circular wait", "Paging", "Compilation", "Time slicing"],
    answer: 0,
    difficulty: "medium",
    topic: "Deadlocks",
    explanation: "Mutual exclusion, hold and wait, no preemption and circular wait cause deadlock.",
  },
  {
    question: "Deadlock prevention works by:",
    options: [
      "Ensuring at least one deadlock condition never holds",
      "Restarting the computer",
      "Increasing CPU speed",
      "Using more registers",
    ],
    answer: 0,
    difficulty: "hard",
    topic: "Deadlocks",
    explanation: "Prevention removes one of the four necessary conditions for deadlock.",
  },
];
