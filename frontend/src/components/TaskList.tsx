"use client";

import type { Task } from "@/lib/types";
import { IMPORTANCE_LABELS } from "@/lib/types";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function getDeadlineInfo(deadline: string | null): { text: string; className: string } | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return { text: "Overdue", className: "overdue" };
  } else if (diffDays < 1) {
    const hours = Math.round(diffDays * 24);
    return { text: `${hours}h left`, className: "urgent" };
  } else if (diffDays < 3) {
    return { text: `${Math.round(diffDays)}d left`, className: "urgent" };
  } else if (diffDays < 7) {
    return { text: `${Math.round(diffDays)}d left`, className: "normal" };
  } else {
    return { text: `${Math.round(diffDays)}d left`, className: "relaxed" };
  }
}

function getPriorityBadge(importance: number): { text: string; className: string } {
  if (importance === 5) return { text: "Critical", className: "critical" };
  if (importance === 4) return { text: "High", className: "high" };
  if (importance === 3) return { text: "Medium", className: "medium" };
  return { text: "Low", className: "low" };
}

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No tasks yet</div>
        <div className="empty-state-desc">
          Click &ldquo;Add Task&rdquo; to create your first task and let the AI scheduler plan your day.
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => {
        const deadlineInfo = getDeadlineInfo(task.deadline);
        const priorityBadge = getPriorityBadge(task.importance);

        return (
          <div
            key={task.id}
            className="task-card"
            data-importance={task.importance}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="task-card-header">
              <div>
                <div className="task-title">{task.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`priority-badge ${priorityBadge.className}`}>
                  {priorityBadge.text}
                </span>
                <span className={`status-badge ${task.status}`}>
                  {task.status === "in-progress" ? "In Progress" : task.status}
                </span>
                <div className="task-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => onEdit(task)}
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onDelete(task.id)}
                    title="Delete task"
                    style={{ color: "var(--danger)" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {task.description && (
              <div className="task-description">{task.description}</div>
            )}

            <div className="task-meta">
              {task.estimated_minutes && (
                <div className="task-meta-item">
                  <span className="task-meta-icon">⏱️</span>
                  {task.estimated_minutes} min
                </div>
              )}

              {deadlineInfo && (
                <div className="task-meta-item">
                  <span className={`deadline-countdown ${deadlineInfo.className}`}>
                    📅 {deadlineInfo.text}
                  </span>
                </div>
              )}

              <div className="task-meta-item">
                <span className="task-meta-icon">★</span>
                {IMPORTANCE_LABELS[task.importance]}
              </div>

              {task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map((tag) => (
                    <span key={tag} className={`task-tag ${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
