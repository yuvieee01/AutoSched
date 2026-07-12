"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, SchedulePlan, Toast as ToastType } from "@/lib/types";
import { loadTasks, saveTasks } from "@/lib/storage";
import { runScheduler } from "@/lib/scheduler";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import ScheduleView from "@/components/ScheduleView";

type TabId = "tasks" | "schedule";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("tasks");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [schedule, setSchedule] = useState<SchedulePlan | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    setTasks(loadTasks());
    // Load theme preference
    const savedTheme = localStorage.getItem("autosched_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setMounted(true);
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (mounted) {
      saveTasks(tasks);
    }
  }, [tasks, mounted]);

  const addToast = useCallback((message: string, type: ToastType["type"]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("autosched_theme", newTheme);
  };

  const handleAddTask = (task: Task) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      addToast(`"${task.title}" updated successfully`, "success");
    } else {
      setTasks((prev) => [...prev, task]);
      addToast(`"${task.title}" added to your tasks`, "success");
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (task) {
      addToast(`"${task.title}" deleted`, "info");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleGenerateSchedule = () => {
    const pendingTasks = tasks.filter((t) => t.status !== "done");
    if (pendingTasks.length === 0) {
      addToast("No pending tasks to schedule", "error");
      return;
    }
    const plan = runScheduler(tasks);
    setSchedule(plan);
    setActiveTab("schedule");
    addToast(
      `Schedule generated: ${plan.schedule.length} tasks planned`,
      "success"
    );
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1117" }} />
    );
  }

  const pendingCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">AutoSched</span>
            <span className="logo-badge">AI</span>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-knob">
                {theme === "light" ? "☀️" : "🌙"}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          📋 Tasks {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={`tab ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          📅 Schedule
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === "tasks" && (
          <>
            <div className="section-header">
              <div>
                <div className="section-title">Your Tasks</div>
                <div className="section-subtitle">
                  {tasks.length} total · {pendingCount} pending
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {!showForm && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setShowForm(true);
                    }}
                  >
                    ➕ Add Task
                  </button>
                )}
                {pendingCount > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleGenerateSchedule}
                  >
                    ⚡ Generate Schedule
                  </button>
                )}
              </div>
            </div>

            {showForm && (
              <TaskForm
                onSubmit={handleAddTask}
                onCancel={handleCancelForm}
                initialTask={editingTask}
              />
            )}

            <TaskList
              tasks={tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </>
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            plan={schedule}
            onGenerate={handleGenerateSchedule}
            taskCount={pendingCount}
          />
        )}
      </main>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
