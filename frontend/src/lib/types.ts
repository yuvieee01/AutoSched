/* ============================================================
   AutoSched — Core Types
   Shared TypeScript interfaces for the scheduling engine
   ============================================================ */

export interface Task {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number | null;
  deadline: string | null;
  importance: number; // 1-5
  tags: string[];
  status: "pending" | "in-progress" | "done";
}

export interface AnalyzedTask extends Task {
  est_minutes: number;
  priority_score: number;
  days_until_deadline: number | null;
}

export interface ScheduleBlock {
  task_id: string;
  title: string;
  start: string;
  end: string;
  est_minutes: number;
  importance: number;
}

export interface SchedulePlan {
  date: string;
  work_window: { start: string; end: string };
  available_minutes: number;
  scheduled_minutes: number;
  remaining_minutes: number;
  schedule: ScheduleBlock[];
  postponed: AnalyzedTask[];
  overload: boolean;
  planner_rationale: string;
}

export interface UserPreferences {
  work_start: string;
  work_end: string;
  daily_capacity_hours: number;
  estimation_bias: number;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const AVAILABLE_TAGS = [
  "coding",
  "writing",
  "study",
  "life",
  "bugfix",
  "refactor",
  "project",
  "meeting",
  "design",
  "research",
] as const;

export const IMPORTANCE_LABELS: Record<number, string> = {
  1: "Low",
  2: "Below Average",
  3: "Medium",
  4: "High",
  5: "Critical",
};

export const DEFAULT_TASK: Omit<Task, "id"> = {
  title: "",
  description: "",
  estimated_minutes: null,
  deadline: null,
  importance: 3,
  tags: [],
  status: "pending",
};
