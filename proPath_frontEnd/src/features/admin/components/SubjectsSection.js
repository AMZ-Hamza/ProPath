import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import dataService from "../../../dataService";
import { EmptyState, Modal } from "../../../shared";
import { ActionIcon, SectionHeader } from "./AdminPrimitives";

export default function SubjectsSection({ workspace, onRefresh, onFeedback }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    coefficient: "1",
    trainerId: "",
    groupIds: [],
    description: "",
  });

  const trainers = (workspace.users || []).filter((user) => user.role === "trainer");

  const openModal = (subject = null) => {
    setEditingSubject(subject);
    setForm(
      subject
        ? {
            name: subject.name,
            code: subject.code || "",
            coefficient: String(subject.coefficient ?? 1),
            trainerId: subject.trainerId || "",
            groupIds: subject.groupIds || [],
            description: subject.description || "",
          }
        : {
            name: "",
            code: "",
            coefficient: "1",
            trainerId: trainers[0]?.id || "",
            groupIds: [],
            description: "",
          },
    );
    setModalOpen(true);
  };

  const toggleGroupSelection = (groupId) => {
    setForm((previous) => ({
      ...previous,
      groupIds: previous.groupIds.includes(groupId)
        ? previous.groupIds.filter((item) => item !== groupId)
        : [...previous.groupIds, groupId],
    }));
  };

  const handleSave = async () => {
    try {
      if (editingSubject) {
        await dataService.updateSubject(editingSubject.id, form);
        onFeedback({ type: "success", message: "تم تحديث المادة." });
      } else {
        await dataService.createSubject(form);
        onFeedback({ type: "success", message: "تم إنشاء المادة." });
      }
      setModalOpen(false);
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`حذف المادة ${subject.name}؟`)) return;
    try {
      await dataService.deleteSubject(subject.id);
      onFeedback({ type: "success", message: "تم حذف المادة." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="إدارة المواد"
        description="ربط المواد بالمكوّنين والأفواج بشكل مركزي."
        action={
          <button type="button" className="button button--primary" onClick={() => openModal()}>
            <Plus size={16} />
            مادة جديدة
          </button>
        }
      />

      <div className="table-card">
        {workspace.subjects.length === 0 ? (
          <EmptyState
            title="لا توجد مواد"
            description="أضف المواد وحدد المكوّن والأفواج المستهدفة."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>المادة</th>
                <th>المكوّن</th>
                <th>الأفواج</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {workspace.subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <strong>{subject.name}</strong>
                    <small>{subject.code || "بدون رمز"}</small>
                  </td>
                  <td>{subject.trainerName || "غير مخصص"}</td>
                  <td>{subject.groupNames?.join("، ") || "غير مرتبطة"}</td>
                  <td className="actions-cell">
                    <ActionIcon title="تعديل" onClick={() => openModal(subject)} />
                    <ActionIcon title="حذف" danger onClick={() => handleDelete(subject)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen ? (
        <Modal title={editingSubject ? "تعديل المادة" : "مادة جديدة"} onClose={() => setModalOpen(false)}>
          <div className="form-grid">
            <label className="field">
              <span>اسم المادة</span>
              <input value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} />
            </label>
            <label className="field">
              <span>الرمز</span>
              <input value={form.code} onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))} />
            </label>
            <label className="field">
              <span>Coefficient</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.coefficient}
                onChange={(event) => setForm((previous) => ({ ...previous, coefficient: event.target.value }))}
              />
            </label>
            <label className="field field--full">
              <span>المكوّن المسؤول</span>
              <select value={form.trainerId} onChange={(event) => setForm((previous) => ({ ...previous, trainerId: event.target.value }))}>
                <option value="">بدون مكوّن</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>الوصف</span>
              <textarea value={form.description} onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))} rows={4} />
            </label>
            <div className="field field--full">
              <span>الأفواج المستهدفة</span>
              <div className="checkbox-grid">
                {workspace.groups.map((group) => (
                  <label key={group.id} className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={form.groupIds.includes(group.id)}
                      onChange={() => toggleGroupSelection(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-card__actions">
            <button type="button" className="button button--primary" onClick={handleSave}>
              <Save size={16} />
              حفظ المادة
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
