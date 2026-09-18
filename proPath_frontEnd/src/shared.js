import React from "react";
import { AlertCircle, LoaderCircle, X } from "lucide-react";

export function LoadingBlock({ label = "جاري التحميل..." }) {
  return (
    <div className="state-card state-card--loading">
      <LoaderCircle size={18} className="spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBlock({ message, actionLabel, onAction }) {
  return (
    <div className="state-card state-card--error">
      <AlertCircle size={18} />
      <div>
        <strong>حدث خطأ</strong>
        <p>{message}</p>
      </div>
      {onAction ? (
        <button type="button" className="button button--ghost" onClick={onAction}>
          {actionLabel || "إعادة المحاولة"}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {action || null}
    </div>
  );
}

export function FeedbackMessage({ feedback, onClose }) {
  if (!feedback?.message) return null;

  return (
    <div
      className={`feedback-banner ${
        feedback.type === "error" ? "feedback-banner--error" : "feedback-banner--success"
      }`}
    >
      <span>{feedback.message}</span>
      <button type="button" onClick={onClose} aria-label="إغلاق الرسالة">
        <X size={16} />
      </button>
    </div>
  );
}

export function Modal({ title, children, onClose, width = "720px" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-card__header">
          <h3>{title}</h3>
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
          >
            <X size={16} />
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ title, value, hint, accent = "blue", icon: Icon }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon">
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div>
        <strong>{value}</strong>
        <span>{title}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
    </div>
  );
}
