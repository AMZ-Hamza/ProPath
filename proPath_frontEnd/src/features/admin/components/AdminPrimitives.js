import React from "react";
import { Edit3, Trash2 } from "lucide-react";

export function SectionHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action || null}
    </div>
  );
}

export function ActionIcon({ title, onClick, danger = false }) {
  return (
    <button
      type="button"
      className={`action-icon ${danger ? "action-icon--danger" : ""}`}
      onClick={onClick}
      title={title}
    >
      {danger ? <Trash2 size={16} /> : <Edit3 size={16} />}
    </button>
  );
}
