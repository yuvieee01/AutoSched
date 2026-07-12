"use client";

import { useState } from "react";
import type { UserPreferences } from "@/lib/types";

interface PreferencesModalProps {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export default function PreferencesModal({ preferences, onSave, onClose }: PreferencesModalProps) {
  const [formData, setFormData] = useState<UserPreferences>({ ...preferences });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="form-card-title">
          <span>⚙️</span> Work Preferences
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Work Start Time</label>
              <input
                className="form-input"
                type="time"
                value={formData.work_start}
                onChange={(e) => setFormData((p) => ({ ...p, work_start: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Work End Time</label>
              <input
                className="form-input"
                type="time"
                value={formData.work_end}
                onChange={(e) => setFormData((p) => ({ ...p, work_end: e.target.value }))}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Daily Capacity (Hours)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="24"
                step="1"
                value={formData.daily_capacity_hours}
                onChange={(e) => setFormData((p) => ({ ...p, daily_capacity_hours: Number(e.target.value) }))}
                required
              />
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Maximum hours you want to spend working each day.
              </span>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Estimation Bias (Multiplier)</label>
              <input
                className="form-input"
                type="number"
                min="0.5"
                max="2.0"
                step="0.01"
                value={formData.estimation_bias}
                onChange={(e) => setFormData((p) => ({ ...p, estimation_bias: Number(e.target.value) }))}
                required
              />
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Multiplier for task estimates. e.g. 1.2 means tasks take 20% longer than estimated.
              </span>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
