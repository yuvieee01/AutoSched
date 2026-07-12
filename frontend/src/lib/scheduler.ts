/* ============================================================
   AutoSched — Scheduling Engine (TypeScript)
   Port of the Python backend logic for client-side execution
   ============================================================ */

import type { Task, AnalyzedTask, ScheduleBlock, SchedulePlan, UserPreferences } from "./types";

// ----------- Default Preferences -----------

const DEFAULT_PREFERENCES: UserPreferences = {
  work_start: "09:00",
  work_end: "17:00",
  daily_capacity_hours: 8,
  estimation_bias: 1.0,
};

// ----------- Task Analyzer -----------

export function analyzeTasks(
  tasks: Task[],
  estimationBias: number = 1.0
): AnalyzedTask[] {
  return tasks
    .filter((t) => t.status !== "done")
    .map((task) => {
      let estMinutes: number;

      if (task.estimated_minutes !== null && task.estimated_minutes > 0) {
        estMinutes = task.estimated_minutes;
      } else {
        // Heuristic: word count * 1.5, adjusted by importance
        const wordCount = Math.max(1, task.description.split(/\s+/).length);
        const baseEstimate = wordCount * 1.5;
        estMinutes = Math.round(baseEstimate * (1 + (task.importance - 3) * 0.15));
      }

      // Apply estimation bias
      estMinutes = Math.round(estMinutes * estimationBias);

      // Clamp between 10 min and 8 hours
      estMinutes = Math.max(10, Math.min(estMinutes, 480));

      return {
        ...task,
        est_minutes: estMinutes,
        priority_score: 0,
        days_until_deadline: null,
      };
    });
}

// ----------- Priority Engine -----------

function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  return (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

export function scoreTasks(tasks: AnalyzedTask[]): AnalyzedTask[] {
  const scored = tasks.map((task) => {
    const importanceScore = task.importance / 5.0;

    const daysLeft = daysUntilDeadline(task.deadline);
    let urgencyScore: number;
    if (daysLeft === null) {
      urgencyScore = 0.2;
    } else if (daysLeft <= 0) {
      urgencyScore = 1.0;
    } else {
      urgencyScore = 1 / (1 + daysLeft);
    }

    const sizePenalty = Math.min(0.3, Math.log1p(task.est_minutes) / 10);

    const priorityScore =
      0.6 * importanceScore + 0.5 * urgencyScore - 0.3 * sizePenalty;

    return {
      ...task,
      priority_score: Math.round(priorityScore * 10000) / 10000,
      days_until_deadline: daysLeft !== null ? Math.round(daysLeft * 10) / 10 : null,
    };
  });

  scored.sort((a, b) => b.priority_score - a.priority_score);
  return scored;
}

// ----------- Schedule Planner -----------

function parseTime(timeStr: string): [number, number] {
  const [h, m] = timeStr.split(":").map(Number);
  return [h, m];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function planSchedule(
  scoredTasks: AnalyzedTask[],
  preferences: UserPreferences = DEFAULT_PREFERENCES
): SchedulePlan {
  const now = new Date();
  const [startH, startM] = parseTime(preferences.work_start);
  const [endH, endM] = parseTime(preferences.work_end);

  const workStart = new Date(now);
  workStart.setHours(startH, startM, 0, 0);

  const workEnd = new Date(now);
  workEnd.setHours(endH, endM, 0, 0);

  if (workEnd <= workStart) {
    workEnd.setDate(workEnd.getDate() + 1);
  }

  const totalAvailableMinutes = (workEnd.getTime() - workStart.getTime()) / (1000 * 60);
  const dailyCapacityMinutes = preferences.daily_capacity_hours * 60;
  const availableMinutes = Math.min(totalAvailableMinutes, dailyCapacityMinutes);

  const schedule: ScheduleBlock[] = [];
  const postponed: AnalyzedTask[] = [];
  let currentTime = new Date(workStart);
  let remainingMinutes = availableMinutes;

  for (const task of scoredTasks) {
    if (task.est_minutes <= remainingMinutes) {
      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + task.est_minutes * 60 * 1000);

      schedule.push({
        task_id: task.id,
        title: task.title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        est_minutes: task.est_minutes,
        importance: task.importance,
      });

      currentTime = endTime;
      remainingMinutes -= task.est_minutes;
    } else {
      postponed.push(task);
    }
  }

  const overload = postponed.length > 0;

  // Generate rationale
  let rationale = "Tasks with highest importance and closest deadlines were scheduled first.";
  if (overload) {
    rationale +=
      " Some tasks were postponed because total estimated effort exceeded daily capacity.";
    rationale += " Consider splitting large tasks or adjusting your work window.";
  }

  return {
    date: now.toISOString(),
    work_window: {
      start: workStart.toISOString(),
      end: workEnd.toISOString(),
    },
    available_minutes: availableMinutes,
    scheduled_minutes: availableMinutes - remainingMinutes,
    remaining_minutes: remainingMinutes,
    schedule,
    postponed,
    overload,
    planner_rationale: rationale,
  };
}

// ----------- Full Pipeline -----------

export function runScheduler(
  tasks: Task[],
  preferences: UserPreferences = DEFAULT_PREFERENCES
): SchedulePlan {
  const analyzed = analyzeTasks(tasks, preferences.estimation_bias);
  const scored = scoreTasks(analyzed);
  return planSchedule(scored, preferences);
}

// ----------- Utility -----------

export function formatScheduleTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateId(): string {
  return "T" + Date.now().toString(36).toUpperCase();
}
