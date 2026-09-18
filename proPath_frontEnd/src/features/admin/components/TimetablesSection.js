import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, ImagePlus } from "lucide-react";
import dataService from "../../../dataService";
import { downloadFile, formatDate, readFileAsDataUrl } from "../../../appUtils";
import { TIMETABLE_TARGET_OPTIONS } from "../../../constants";
import { EmptyState, LoadingBlock } from "../../../shared";
import { ActionIcon, SectionHeader } from "./AdminPrimitives";

export default function TimetablesSection({ workspace, onRefresh, onFeedback }) {
  const [targetType, setTargetType] = useState("group");
  const [targetId, setTargetId] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageData, setImageData] = useState("");

  const targets = useMemo(
    () =>
      targetType === "group"
        ? workspace.groups
        : (workspace.users || []).filter((user) => user.role === "trainer"),
    [targetType, workspace.groups, workspace.users],
  );

  useEffect(() => {
    setTargetId(targets[0]?.id || "");
  }, [targets]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFileName(file.name);
      setImageData(dataUrl);
    } catch {
      onFeedback({ type: "error", message: "تعذر قراءة الملف المرفوع." });
    }
  };

  const handleSave = async () => {
    try {
      await dataService.createTimetable({
        targetType,
        targetId,
        image: { name: fileName || "timetable.png", data: imageData },
      });
      onFeedback({ type: "success", message: "تم نشر الجدول." });
      setImageData("");
      setFileName("");
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("هل تريد حذف هذا الجدول؟")) return;
    try {
      await dataService.deleteTimetable(item.id);
      onFeedback({ type: "success", message: "تم حذف الجدول." });
      await onRefresh();
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    }
  };

  const getTargetName = (item) => {
    if (!workspace.groups || !workspace.users) return "جاري التحميل...";
    const collection =
      item.targetType === "group"
        ? workspace.groups
        : (workspace.users || []).filter((user) => user.role === "trainer");
    return collection.find((entry) => String(entry.id) === String(item.targetId))?.name || "غير معروف";
  };

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="الجداول"
        description="رفع الجداول الرسمية للأفواج أو للمكوّنين."
      />

      <div className="admin-grid admin-grid--two">
        <div className="panel-card">
          <div className="form-grid">
            <label className="field">
              <span>نوع الجدول</span>
              <select value={targetType} onChange={(event) => setTargetType(event.target.value)}>
                {TIMETABLE_TARGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>الجهة المستهدفة</span>
              <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                <option value="">اختر جهة</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>صورة الجدول</span>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {imageData ? (
            <div className="image-preview">
              <img src={imageData} alt="preview" />
            </div>
          ) : null}

          <button type="button" className="button button--primary" onClick={handleSave}>
            <ImagePlus size={16} />
            حفظ الجدول
          </button>
        </div>

        <div className="panel-card">
          <h3>الجداول المنشورة</h3>
          {!workspace.timetables ? (
            <LoadingBlock label="جاري تحميل الجداول..." />
          ) : workspace.timetables.length === 0 ? (
            <EmptyState title="لا توجد جداول" description="ارفع أول جدول لبدء النشر." />
          ) : (
            <div className="timetable-grid">
              {workspace.timetables.map((item) => (
                <div key={item.id} className="timetable-card">
                  <img src={item.image?.data} alt={getTargetName(item)} className="timetable-image" />
                  <div className="timetable-card__meta">
                    <strong>{getTargetName(item)}</strong>
                    <span>{formatDate(item.uploadedAt)}</span>
                  </div>
                  <div className="timetable-actions" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
                    <a className="button button--ghost" href={item.image?.data} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                      <BookOpen size={16} />
                      عرض
                    </a>
                    <button type="button" className="button button--primary" onClick={() => downloadFile(item.image?.downloadUrl || item.image?.data, item.image?.name || "timetable.png")} style={{ flex: 1 }}>
                      <Download size={16} />
                      تحميل
                    </button>
                  </div>
                  <div className="actions-cell">
                    <span className="status-pill status-pill--muted">
                      {item.targetType === "group" ? "فوج" : "مكوّن"}
                    </span>
                    <ActionIcon title="حذف" danger onClick={() => handleDelete(item)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
