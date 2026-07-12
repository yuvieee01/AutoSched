"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { AVAILABLE_TAGS, IMPORTANCE_LABELS, DEFAULT_TASK } from "@/lib/types";
import { generateId } from "@/lib/scheduler";

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  initialTask?: Task | null;
}

export default function TaskForm({ onSubmit, onCancel, initialTask }: TaskFormProps) {
  const isEditing = !!initialTask;
  const [formData, setFormData] = useState<Omit<Task, "id">>({
    title: initialTask?.title ?? DEFAULT_TASK.title,
    description: initialTask?.description ?? DEFAULT_TASK.description,
    estimated_minutes: initialTask?.estimated_minutes ?? DEFAULT_TASK.estimated_minutes,
    deadline: initialTask?.deadline ?? DEFAULT_TASK.deadline,
    importance: initialTask?.importance ?? DEFAULT_TASK.importance,
    tags: initialTask?.tags ?? [...DEFAULT_TASK.tags],
    status: initialTask?.status ?? DEFAULT_TASK.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const task: Task = {
      id: initialTask?.id ?? generateId(),
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };
    onSubmit(task);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="form-card animate-in">
      <div className="form-card-title">
        <span>{isEditing ? "✏️" : "➕"}</span>
        {isEditing ? "Edit Task" : "Create New Task"}
      </div>

      <div className="form-grid">
        {/* Title */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="task-title">Task Title</label>
          <input
            id="task-title"
            className="form-input"
            type="text"
            placeholder="e.g., Prepare XOR MLP README"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="form-textarea"
            placeholder="Describe what needs to be done... (e.g., Write comprehensive docs with usage examples, architecture diagrams, and benchmark results)"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
          />
        </div>

        {/* Estimated Minutes */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-est">Estimated Time (minutes)</label>
          <input
            id="task-est"
            className="form-input"
            type="number"
            min="5"
            max="480"
            placeholder="e.g., 90"
            value={formData.estimated_minutes ?? ""}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                estimated_minutes: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-deadline">Deadline</label>
          <input
            id="task-deadline"
            className="form-input"
            type="datetime-local"
            value={formData.deadline ?? ""}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                deadline: e.target.value || null,
              }))
            }
          />
        </div>

        {/* Importance */}
        <div className="form-group">
          <label className="form-label">Importance</label>
          <div className="importance-selector">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                className={`star-btn ${formData.importance >= level ? "active" : ""}`}
                onClick={() => setFormData((p) => ({ ...p, importance: level }))}
                title={IMPORTANCE_LABELS[level]}
              >
                ★
              </button>
            ))}
            <span className="importance-label">
              {IMPORTANCE_LABELS[formData.importance]}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-status">Status</label>
          <select
            id="task-status"
            className="form-select"
            value={formData.status}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                status: e.target.value as Task["status"],
              }))
            }
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Tags */}
        <div className="form-group full-width">
          <label className="form-label">Tags</label>
          <div className="tags-container">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-chip ${formData.tags.includes(tag) ? "selected" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditing ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </form>
  );
}
