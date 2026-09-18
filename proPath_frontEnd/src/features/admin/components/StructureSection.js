import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import dataService from "../../../dataService";
import { EmptyState, Modal } from "../../../shared";
import { ActionIcon, SectionHeader } from "./AdminPrimitives";

export default function StructureSection({ workspace, onRefresh, onFeedback }) {
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: "", code: "", description: "" });
  const [groupForm, setGroupForm] = useState({
    name: "",
    branchId: "",
    year: "",
    capacity: "",
    description: "",
  });

  const openBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setBranchForm(
      branch
        ? { name: branch.name, code: branch.code || "", description: branch.description || "" }
        : { name: "", code: "", description: "" },
    );
    setBranchModalOpen(true);
  };

  const openGroupModal = (group = null) => {
    setEditingGroup(group);
    setGroupForm(
      group
        ? {
            name: group.name,
            branchId: group.branchId || "",
            year: group.year || "",
            capacity: group.capacity || "",
            description: group.description || "",
          }
        : {
            name: "",
            branchId: workspace.branches?.[0]?.id || "",
            year: "",
            capacity: "",
            description: "",
          },
    );
    setGroupModalOpen(true);
  };

  const submitBranch = async () => {
    try {
      if (editingBranch) {
        await dataService.updateBranch(editingBranch.id, branchForm);
        onFeedback({ type: "success", message: "تم تحديث الشعبة." });
      } else {
        await dataService.createBranch(branchForm);
        onFeedback({ type: "success", message: "تم إنشاء الشعبة." });
      }
      setBranchModalOpen(false);
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const submitGroup = async () => {
    try {
      if (editingGroup) {
        await dataService.updateGroup(editingGroup.id, groupForm);
        onFeedback({ type: "success", message: "تم تحديث الفوج." });
      } else {
        await dataService.createGroup(groupForm);
        onFeedback({ type: "success", message: "تم إنشاء الفوج." });
      }
      setGroupModalOpen(false);
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const deleteBranch = async (branch) => {
    if (!window.confirm(`حذف الشعبة ${branch.name}؟`)) return;
    try {
      await dataService.deleteBranch(branch.id);
      onFeedback({ type: "success", message: "تم حذف الشعبة." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const deleteGroup = async (group) => {
    if (!window.confirm(`حذف الفوج ${group.name}؟`)) return;
    try {
      await dataService.deleteGroup(group.id);
      onFeedback({ type: "success", message: "تم حذف الفوج." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="الشعب والأفواج"
        description="تنظيم الهيكلة الأكاديمية وربط المتدربين بالأفواج الفعلية."
        action={
          <div className="button-row">
            <button type="button" className="button button--ghost" onClick={() => openBranchModal()}>
              <Plus size={16} />
              شعبة
            </button>
            <button type="button" className="button button--primary" onClick={() => openGroupModal()}>
              <Plus size={16} />
              فوج
            </button>
          </div>
        }
      />

      <div className="admin-grid admin-grid--two">
        <div className="table-card">
          <h3>الشعب</h3>
          {(workspace.branches || []).length === 0 ? (
            <EmptyState title="لا توجد شعب" description="أضف أول شعبة تنظيمية للمنصة." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>الشعبة</th>
                  <th>الرمز</th>
                  <th>الوصف</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(workspace.branches || []).map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.name}</td>
                    <td>{branch.code || "-"}</td>
                    <td>{branch.description || "-"}</td>
                    <td className="actions-cell">
                      <ActionIcon title="تعديل" onClick={() => openBranchModal(branch)} />
                      <ActionIcon title="حذف" danger onClick={() => deleteBranch(branch)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-card">
          <h3>الأفواج</h3>
          {(workspace.groups || []).length === 0 ? (
            <EmptyState title="لا توجد أفواج" description="أنشئ الأفواج لتوزيع المتدربين والمواد." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>الفوج</th>
                  <th>الشعبة</th>
                  <th>المتدربون</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(workspace.groups || []).map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.branchName || "-"}</td>
                    <td>{group.studentCount}</td>
                    <td className="actions-cell">
                      <ActionIcon title="تعديل" onClick={() => openGroupModal(group)} />
                      <ActionIcon title="حذف" danger onClick={() => deleteGroup(group)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {branchModalOpen ? (
        <Modal title={editingBranch ? "تعديل الشعبة" : "شعبة جديدة"} onClose={() => setBranchModalOpen(false)}>
          <div className="form-grid">
            <label className="field">
              <span>اسم الشعبة</span>
              <input value={branchForm.name} onChange={(event) => setBranchForm((previous) => ({ ...previous, name: event.target.value }))} />
            </label>
            <label className="field">
              <span>الرمز</span>
              <input value={branchForm.code} onChange={(event) => setBranchForm((previous) => ({ ...previous, code: event.target.value }))} />
            </label>
            <label className="field field--full">
              <span>الوصف</span>
              <textarea value={branchForm.description} onChange={(event) => setBranchForm((previous) => ({ ...previous, description: event.target.value }))} rows={4} />
            </label>
          </div>
          <div className="modal-card__actions">
            <button type="button" className="button button--primary" onClick={submitBranch}>
              <Save size={16} />
              حفظ الشعبة
            </button>
          </div>
        </Modal>
      ) : null}

      {groupModalOpen ? (
        <Modal title={editingGroup ? "تعديل الفوج" : "فوج جديد"} onClose={() => setGroupModalOpen(false)}>
          <div className="form-grid">
            <label className="field">
              <span>اسم الفوج</span>
              <input value={groupForm.name} onChange={(event) => setGroupForm((previous) => ({ ...previous, name: event.target.value }))} />
            </label>
            <label className="field">
              <span>الشعبة</span>
              <select value={groupForm.branchId} onChange={(event) => setGroupForm((previous) => ({ ...previous, branchId: event.target.value }))}>
                <option value="">اختر شعبة</option>
                {(workspace.branches || []).map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>السنة</span>
              <input type="number" value={groupForm.year} onChange={(event) => setGroupForm((previous) => ({ ...previous, year: event.target.value }))} />
            </label>
            <label className="field">
              <span>السعة</span>
              <input type="number" value={groupForm.capacity} onChange={(event) => setGroupForm((previous) => ({ ...previous, capacity: event.target.value }))} />
            </label>
            <label className="field field--full">
              <span>الوصف</span>
              <textarea value={groupForm.description} onChange={(event) => setGroupForm((previous) => ({ ...previous, description: event.target.value }))} rows={4} />
            </label>
          </div>
          <div className="modal-card__actions">
            <button type="button" className="button button--primary" onClick={submitGroup}>
              <Save size={16} />
              حفظ الفوج
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
