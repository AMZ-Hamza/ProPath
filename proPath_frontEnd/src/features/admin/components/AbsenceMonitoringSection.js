import React, { useCallback, useEffect, useState } from "react";
import dataService from "../../../dataService";
import { EmptyState, LoadingBlock } from "../../../shared";
import { SectionHeader } from "./AdminPrimitives";

export default function AbsenceMonitoringSection({ workspace, onFeedback }) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!selectedGroupId) {
      setReport([]);
      return;
    }
    setLoading(true);
    try {
      const data = await dataService.getAbsenceReport(selectedGroupId, {
        startDate,
        endDate,
      });
      setReport(data || []);
    } catch (error) {
      onFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId, startDate, endDate, onFeedback]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="متابعة الغيابات"
        description="عرض تقارير الغيابات المفصلة لكل فوج مع إمكانية التصفية حسب التاريخ."
      />

      <div className="toolbar-card">
        <div className="filter-group" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <label className="field" style={{ flex: "1", minWidth: "200px" }}>
            <span>الفوج</span>
            <select
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
            >
              <option value="">اختر فوجاً...</option>
              {workspace.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field" style={{ flex: "1", minWidth: "150px" }}>
            <span>من تاريخ</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="field" style={{ flex: "1", minWidth: "150px" }}>
            <span>إلى تاريخ</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <LoadingBlock />
        ) : !selectedGroupId ? (
          <EmptyState
            title="اختر فوجاً"
            description="يرجى اختيار فوج من القائمة أعلاه لعرض تقرير الغيابات."
          />
        ) : report.length === 0 ? (
          <EmptyState
            title="لا توجد غيابات"
            description="لم يتم تسجيل أي غياب لهذا الفوج في الفترة المحددة."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم المتدرب</th>
                <th>عدد الحصص الغائبة</th>
                <th>إجمالي الساعات (تقديري)</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.studentName}</strong>
                  </td>
                  <td>{item.absentCount} حصة</td>
                  <td>{(item.absentCount * 2.5).toFixed(1)} ساعة</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
