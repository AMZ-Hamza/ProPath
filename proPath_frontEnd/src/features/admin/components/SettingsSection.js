import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import dataService from "../../../dataService";
import { APP_NAME } from "../../../constants";
import { LoadingBlock } from "../../../shared";
import { SectionHeader } from "./AdminPrimitives";

export default function SettingsSection({ workspace, onRefresh, onFeedback }) {
  const [form, setForm] = useState(() => ({
    appName: workspace.settings?.appName || APP_NAME,
    instituteName: workspace.settings?.instituteName || "",
    supportEmail: workspace.settings?.supportEmail || "",
    attendanceHoursPerSession: workspace.settings?.attendanceHoursPerSession || 2.5,
    timeSlots: workspace.settings?.timeSlots || [],
  }));

  useEffect(() => {
    if (!workspace.settings) return;
    setForm({
      appName: workspace.settings.appName || APP_NAME,
      instituteName: workspace.settings.instituteName || "",
      supportEmail: workspace.settings.supportEmail || "",
      attendanceHoursPerSession: workspace.settings.attendanceHoursPerSession || 2.5,
      timeSlots: workspace.settings.timeSlots || [],
    });
  }, [workspace.settings]);

  const updateSlot = (index, key, value) => {
    setForm((previous) => ({
      ...previous,
      timeSlots: previous.timeSlots.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [key]: value } : slot,
      ),
    }));
  };

  const addSlot = () => {
    setForm((previous) => ({
      ...previous,
      timeSlots: [
        ...previous.timeSlots,
        { id: `slot-${previous.timeSlots.length + 1}`, name: "", startTime: "", endTime: "" },
      ],
    }));
  };

  const removeSlot = (index) => {
    setForm((previous) => ({
      ...previous,
      timeSlots: previous.timeSlots.filter((_, slotIndex) => slotIndex !== index),
    }));
  };

  const handleSave = async () => {
    try {
      await dataService.updateSettings(form);
      onFeedback({ type: "success", message: "تم تحديث الإعدادات." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  if (!workspace.settings) {
    return <LoadingBlock label="جاري تحميل الإعدادات..." />;
  }

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="إعدادات المنصة"
        description="إدارة البيانات العامة والخصائص التشغيلية."
      />

      <div className="panel-card">
        <div className="form-grid">
          <label className="field">
            <span>اسم المنصة</span>
            <input value={form.appName} onChange={(event) => setForm((previous) => ({ ...previous, appName: event.target.value }))} />
          </label>
          <label className="field">
            <span>اسم المؤسسة</span>
            <input value={form.instituteName} onChange={(event) => setForm((previous) => ({ ...previous, instituteName: event.target.value }))} />
          </label>
          <label className="field">
            <span>بريد الدعم</span>
            <input type="email" value={form.supportEmail} onChange={(event) => setForm((previous) => ({ ...previous, supportEmail: event.target.value }))} />
          </label>
          <label className="field">
            <span>عدد ساعات الغياب لكل حصة</span>
            <input type="number" min="0.5" step="0.5" value={form.attendanceHoursPerSession} onChange={(event) => setForm((previous) => ({ ...previous, attendanceHoursPerSession: event.target.value }))} />
          </label>
        </div>

        <div className="settings-slots">
          <div className="page-subheader">
            <h3>الحصص الزمنية</h3>
            <button type="button" className="button button--ghost" onClick={addSlot}>
              <Plus size={16} />
              إضافة حصة
            </button>
          </div>
          {form.timeSlots.map((slot, index) => (
            <div key={slot.id || index} className="slot-row">
              <input value={slot.name} onChange={(event) => updateSlot(index, "name", event.target.value)} placeholder="اسم الحصة" />
              <input type="time" value={slot.startTime} onChange={(event) => updateSlot(index, "startTime", event.target.value)} />
              <input type="time" value={slot.endTime} onChange={(event) => updateSlot(index, "endTime", event.target.value)} />
              <button type="button" className="button button--ghost button--danger" onClick={() => removeSlot(index)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="button button--primary" onClick={handleSave}>
          <Save size={16} />
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}
