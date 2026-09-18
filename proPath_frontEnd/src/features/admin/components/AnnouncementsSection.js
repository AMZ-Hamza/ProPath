import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import dataService from "../../../dataService";
import { formatDate } from "../../../appUtils";
import { AUDIENCE_OPTIONS } from "../../../constants";
import { EmptyState, Modal } from "../../../shared";
import { ActionIcon, SectionHeader } from "./AdminPrimitives";

export default function AnnouncementsSection({ workspace, user, onRefresh, onFeedback }) {

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "all",
  });

  const openModal = (item = null) => {
    setEditingItem(item);
    setForm(
      item
        ? {
            title: item.title,
            content: item.content,
            audience: item.audience || "all",
          }
        : {
            title: "",
            content: "",
            audience: "all",
          },
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, authorId: user?.id };
      if (editingItem) {
        await dataService.updateNews(editingItem.id, payload);
        onFeedback({ type: "success", message: "تم تحديث الإعلان." });
      } else {
        await dataService.createNews(payload);
        onFeedback({ type: "success", message: "تم نشر الإعلان." });
      }
      setModalOpen(false);
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`حذف الإعلان ${item.title}؟`)) return;
    try {
      await dataService.deleteNews(item.id);
      onFeedback({ type: "success", message: "تم حذف الإعلان." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="الإعلانات"
        description="إرسال الأخبار والتنبيهات حسب الجمهور المستهدف."
        action={
          <button type="button" className="button button--primary" onClick={() => openModal()}>
            <Plus size={16} />
            إعلان جديد
          </button>
        }
      />

      {workspace.news.length === 0 ? (
        <EmptyState title="لا توجد إعلانات" description="ابدأ بنشر أول إعلان للمستخدمين." />
      ) : (
        <div className="stack-list">
          {workspace.news.map((item) => (
            <div key={item.id} className="announcement-card">
              <div className="announcement-card__row">
                <div>
                  <strong>{item.title}</strong>
                  <small>{AUDIENCE_OPTIONS.find((option) => option.value === item.audience)?.label || "الجميع"}</small>
                </div>
                <div className="actions-cell">
                  <span>{formatDate(item.publishedAt)}</span>
                  <ActionIcon title="تعديل" onClick={() => openModal(item)} />
                  <ActionIcon title="حذف" danger onClick={() => handleDelete(item)} />
                </div>
              </div>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <Modal title={editingItem ? "تعديل الإعلان" : "إعلان جديد"} onClose={() => setModalOpen(false)}>
          <div className="form-grid">
            <label className="field field--full">
              <span>العنوان</span>
              <input value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} />
            </label>
            <label className="field">
              <span>الجمهور</span>
              <select value={form.audience} onChange={(event) => setForm((previous) => ({ ...previous, audience: event.target.value }))}>
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>المحتوى</span>
              <textarea value={form.content} onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))} rows={5} />
            </label>
          </div>
          <div className="modal-card__actions">
            <button type="button" className="button button--primary" onClick={handleSave}>
              <Save size={16} />
              حفظ الإعلان
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
