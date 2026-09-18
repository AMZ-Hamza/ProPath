import React, { useMemo, useState } from "react";
import { Plus, Save, Search } from "lucide-react";
import dataService from "../../../dataService";
import { ROLE_LABELS, ROLE_OPTIONS } from "../../../constants";
import { EmptyState, LoadingBlock, Modal } from "../../../shared";
import { ActionIcon, SectionHeader } from "./AdminPrimitives";

export default function UsersSection({ workspace, currentUser, onRefresh, onFeedback }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    groupId: "",
    active: true,
  });
  const canManageAdminAccounts = currentUser?.role === "proAdmin";
  const isAdminAccountRole = (role) => ["admin", "proAdmin"].includes(role);
  const editableRoleOptions = canManageAdminAccounts
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((role) => !isAdminAccountRole(role.value));
  const canManageUser = (user) => canManageAdminAccounts || !isAdminAccountRole(user.role);

  const groupsById = useMemo(
    () => Object.fromEntries((workspace.groups || []).map((group) => [String(group.id), group])),
    [workspace.groups],
  );

  const filteredUsers = !(workspace.users) ? [] : workspace.users.filter((user) => {
    const haystack = `${user.name} ${user.username} ${user.email}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openModal = (user = null) => {
    if (user && !canManageUser(user)) {
      onFeedback({ type: "error", message: "Pro Admin فقط يمكنه تعديل حسابات الإدارة." });
      return;
    }

    setEditingUser(user);
    setForm(
      user
        ? {
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            password: "",
            role: user.role || "student",
            groupId: user.groupId || "",
            active: user.active !== false,
          }
        : {
            name: "",
            username: "",
            email: "",
            password: "",
            role: "student",
            groupId: "",
            active: true,
          },
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (
      !canManageAdminAccounts &&
      (isAdminAccountRole(form.role) || isAdminAccountRole(editingUser?.role))
    ) {
      onFeedback({ type: "error", message: "Pro Admin فقط يمكنه إنشاء أو تعديل حسابات الإدارة." });
      return;
    }

    const selectedGroup = groupsById[String(form.groupId)];
    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      role: form.role,
      active: form.active,
      groupId: form.role === "student" ? form.groupId : "",
      branchId: form.role === "student" ? selectedGroup?.branchId || "" : "",
    };

    if (form.password) payload.password = form.password;

    if (!editingUser && !form.password) {
      onFeedback({ type: "error", message: "كلمة المرور مطلوبة عند إنشاء مستخدم جديد." });
      return;
    }

    if (form.role === "student" && !form.groupId) {
      onFeedback({ type: "error", message: "يرجى اختيار الفوج الخاص بالمتدرب." });
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await dataService.updateUser(editingUser.id, payload);
        onFeedback({ type: "success", message: "تم تحديث المستخدم بنجاح." });
      } else {
        await dataService.createUser(payload);
        onFeedback({ type: "success", message: "تم إنشاء المستخدم بنجاح." });
      }
      setModalOpen(false);
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!canManageUser(user)) {
      onFeedback({ type: "error", message: "Pro Admin فقط يمكنه حذف حسابات الإدارة." });
      return;
    }

    if (!window.confirm(`هل تريد حذف المستخدم ${user.name}؟`)) return;
    try {
      await dataService.deleteUser(user.id);
      onFeedback({ type: "success", message: "تم حذف المستخدم." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="إدارة المستخدمين"
        description="إنشاء الحسابات وربط المتدربين بالأفواج وتحديد الأدوار."
        action={
          <button type="button" className="button button--primary" onClick={() => openModal()}>
            <Plus size={16} />
            مستخدم جديد
          </button>
        }
      />

      <div className="toolbar-card">
        <div className="search-field">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالاسم أو اسم المستخدم أو البريد..."
          />
        </div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">كل الأدوار</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        {!workspace.users ? (
          <LoadingBlock label="جاري تحميل قائمة المستخدمين..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="لا توجد نتائج"
            description="غيّر البحث أو أضف حسابات جديدة لعرضها هنا."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الدور</th>
                <th>اسم المستخدم</th>
                <th>الفوج</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.email || "بدون بريد"}</small>
                  </td>
                  <td>{ROLE_LABELS[user.role] || user.role}</td>
                  <td>{user.username}</td>
                  <td>{groupsById[String(user.groupId)]?.name || "غير مرتبط"}</td>
                  <td>
                    <span className={`status-pill ${user.active !== false ? "status-pill--success" : "status-pill--muted"}`}>
                      {user.active !== false ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <ActionIcon title="تعديل" onClick={() => openModal(user)} />
                    <ActionIcon
                      title="حذف"
                      danger
                      onClick={() => handleDelete(user)}
                    />
                    {String(currentUser?.id) === String(user.id) ? (
                      <small className="self-badge">الحساب الحالي</small>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen ? (
        <Modal
          title={editingUser ? "تعديل المستخدم" : "إنشاء مستخدم"}
          onClose={() => setModalOpen(false)}
          width="640px"
        >
          <div className="form-grid">
            <label className="field">
              <span>الاسم الكامل</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, name: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>اسم المستخدم</span>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, username: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>البريد الإلكتروني</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, email: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>{editingUser ? "كلمة مرور جديدة" : "كلمة المرور"}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, password: event.target.value }))
                }
                placeholder={editingUser ? "اتركه فارغاً للإبقاء على الحالية" : ""}
              />
            </label>

            <label className="field">
              <span>الدور</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    role: event.target.value,
                    groupId: event.target.value === "student" ? previous.groupId : "",
                  }))
                }
              >
                {editableRoleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>الفوج</span>
              <select
                value={form.groupId}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, groupId: event.target.value }))
                }
                disabled={form.role !== "student"}
              >
                <option value="">اختر فوجاً</option>
                {(workspace.groups || []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, active: event.target.checked }))
                }
              />
              <span>الحساب نشط</span>
            </label>
          </div>

          <div className="modal-card__actions">
            <button type="button" className="button button--primary" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
