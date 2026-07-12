"use client";

import type { SchedulePlan } from "@/lib/types";
import { formatScheduleTime } from "@/lib/scheduler";

interface ScheduleViewProps {
  plan: SchedulePlan | null;
  onGenerate: () => void;
  taskCount: number;
}

export default function ScheduleView({ plan, onGenerate, taskCount }: ScheduleViewProps) {
  if (!plan) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <div className="empty-state-title">No schedule generated</div>
        <div className="empty-state-desc">
          {taskCount > 0
            ? "Click the button below to let the AI scheduler plan your day."
            : "Add some tasks first, then generate your optimal daily schedule."}
        </div>
        {taskCount > 0 && (
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            style={{ marginTop: "20px" }}
          >
            ⚡ Generate Schedule
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Summary Cards */}
      <div className="schedule-summary">
        <div className="summary-card">
          <div className="summary-card-value">{plan.schedule.length}</div>
          <div className="summary-card-label">Tasks Scheduled</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-value">{plan.scheduled_minutes}</div>
          <div className="summary-card-label">Minutes Planned</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-value">{plan.remaining_minutes}</div>
          <div className="summary-card-label">Minutes Free</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-value">{plan.postponed.length}</div>
          <div className="summary-card-label">Postponed</div>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="section-header">
        <div>
          <div className="section-title">Today&apos;s Timeline</div>
          <div className="section-subtitle">
            Work window: {formatScheduleTime(plan.work_window.start)} →{" "}
            {formatScheduleTime(plan.work_window.end)}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onGenerate}>
          🔄 Regenerate
        </button>
      </div>

      {plan.schedule.length > 0 ? (
        <div className="schedule-container">
          {plan.schedule.map((block, index) => (
            <div
              key={block.task_id}
              className="schedule-block"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="schedule-time">
                {formatScheduleTime(block.start)} → {formatScheduleTime(block.end)}
              </div>
              <div className="schedule-task-title">{block.title}</div>
              <div className="schedule-duration">{block.est_minutes} min</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "40px" }}>
          <div className="empty-state-desc">No tasks fit in today&apos;s schedule.</div>
        </div>
      )}

      {/* Postponed Tasks */}
      {plan.postponed.length > 0 && (
        <div className="postponed-section">
          <div className="postponed-title">
            <span>⏸️</span> Postponed Tasks ({plan.postponed.length})
          </div>
          {plan.postponed.map((task) => (
            <div key={task.id} className="postponed-item">
              <span>{task.title}</span>
              <span style={{ marginLeft: "auto", fontSize: "12px" }}>
                {task.est_minutes} min · Priority: {task.priority_score}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Planner Rationale */}
      <div className="rationale-card">
        <div className="rationale-label">🧠 AI Planner Rationale</div>
        <div className="rationale-text">{plan.planner_rationale}</div>
      </div>
    </div>
  );
}
