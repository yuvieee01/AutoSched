/* ============================================================
   AutoSched — Local Storage Persistence
   Stores tasks and preferences in browser localStorage
   ============================================================ */

import type { Task, UserPreferences } from "./types";

const TASKS_KEY = "autosched_tasks";
const PREFS_KEY = "autosched_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  work_start: "09:00",
  work_end: "17:00",
  daily_capacity_hours: 8,
  estimation_bias: 1.0,
};

// Sample tasks for first-time users
const SAMPLE_TASKS: Task[] = [
  {
    id: "T1",
    title: "Prepare XOR MLP README",
    description:
      "Write README for the MLP XOR project with usage, diagrams, and training results.",
    estimated_minutes: 90,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    importance: 4,
    tags: ["writing", "project"],
    status: "pending",
  },
  {
    id: "T2",
    title: "Fix C++ second-largest bug",
    description:
      "Debug and add tests for the second-largest element program.",
    estimated_minutes: 45,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    importance: 5,
    tags: ["coding", "bugfix"],
    status: "pending",
  },
  {
    id: "T3",
    title: "Plan machine learning study block",
    description:
      "Plan syllabus and create flashcards for upcoming ML exam topics.",
    estimated_minutes: 120,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    importance: 3,
    tags: ["study"],
    status: "pending",
  },
  {
    id: "T4",
    title: "Weekly groceries",
    description: "Buy groceries for the week. Quick run to the market.",
    estimated_minutes: 60,
    deadline: null,
    importance: 1,
    tags: ["life"],
    status: "pending",
  },
  {
    id: "T5",
    title: "Refactor schedule planner",
    description:
      "Refactor schedule planner to make planning deterministic and add unit tests.",
    estimated_minutes: 180,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    importance: 3,
    tags: ["coding", "refactor"],
    status: "pending",
  },
];

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return SAMPLE_TASKS;
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) {
      saveTasks(SAMPLE_TASKS);
      return SAMPLE_TASKS;
    }
    return JSON.parse(stored);
  } catch {
    return SAMPLE_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
