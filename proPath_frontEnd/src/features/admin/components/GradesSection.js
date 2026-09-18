import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "../../../shared";
import { SectionHeader } from "./AdminPrimitives";

const EMPTY_ARRAY = [];

export default function GradesSection({ workspace, onFeedback }) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const subjects = workspace?.subjects ?? EMPTY_ARRAY;
  const students = workspace?.students ?? EMPTY_ARRAY;

  const availableSubjects = useMemo(() => {
    if (!selectedGroupId) return [];
    return subjects.filter((subject) =>
      (subject.groupIds || []).map(String).includes(String(selectedGroupId))
    );
  }, [subjects, selectedGroupId]);

  const groupStudents = useMemo(() => {
    if (!selectedGroupId) return [];
    return students.filter(
      (student) => String(student.groupId) === String(selectedGroupId)
    );
  }, [students, selectedGroupId]);

  // Reset subject filter if it's no longer available when group changes
  useEffect(() => {
    if (selectedGroupId) {
      if (availableSubjects.length > 0) {
        const isStillAvailable = availableSubjects.some(
          (subject) => String(subject.id) === String(selectedSubjectId)
        );
        if (!isStillAvailable) {
          setSelectedSubjectId(availableSubjects[0].id);
        }
      } else {
        setSelectedSubjectId("");
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [selectedGroupId, availableSubjects, selectedSubjectId]);

  const filteredStudents = useMemo(() => {
    return groupStudents.filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [groupStudents, search]);

  const hasAnyGrades = useMemo(() => {
    if (!selectedSubjectId) return false;
    return groupStudents.some(
      (student) => {
        const grade = student.grades?.[selectedSubjectId];
        return grade && (
          (grade.cc1 !== null && grade.cc1 !== "") ||
          (grade.cc2 !== null && grade.cc2 !== "") ||
          (grade.cc3 !== null && grade.cc3 !== "") ||
          (grade.efm !== null && grade.efm !== "")
        );
      }
    );
  }, [groupStudents, selectedSubjectId]);

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="متابعة النقط"
        description="الاطلاع على كشوف النقط والمعدلات السنوية للمتدربين حسب الفوج والمادة."
      />

      <div className="toolbar-card" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="filter-group" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: "1" }}>
          <label className="field" style={{ flex: "1", minWidth: "200px" }}>
            <span>الفوج (القسم)</span>
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

          <label className="field" style={{ flex: "1", minWidth: "200px" }}>
            <span>المادة</span>
            <select
              value={selectedSubjectId}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              disabled={!selectedGroupId}
            >
              <option value="">اختر مادة...</option>
              {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {subject.coefficient ? `(معامل ${subject.coefficient})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="search-field" style={{ minWidth: "240px" }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="البحث عن متدرب بالاسم..."
            disabled={!selectedGroupId}
          />
        </div>
      </div>

      <div className="info-banner" style={{
        background: "var(--app-bg-muted, #f8fafc)",
        border: "1px solid var(--app-border, #e2e8f0)",
        borderRadius: "var(--radius-card, 12px)",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            background: "#e0f2fe",
            color: "#0369a1",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.85rem",
            fontWeight: "bold"
          }}>
            وضع الاطلاع فقط
          </span>
          <span style={{ color: "var(--app-muted, #64748b)", fontSize: "0.9rem" }}>
            تم غلق الصلاحية التعديلية للإدارة؛ إدخال النقط وتعديلها متاح للمكوّنين فقط.
          </span>
        </div>
      </div>

      <div className="table-card">
        {!selectedGroupId ? (
          <EmptyState
            title="اختر فوجاً"
            description="يرجى اختيار الفوج والمادة من القائمة أعلاه لعرض النقط."
          />
        ) : availableSubjects.length === 0 ? (
          <EmptyState
            title="لا توجد مواد مسندة"
            description="هذا الفوج لا يحتوي على أي مادة مسندة حالياً."
          />
        ) : !selectedSubjectId ? (
          <EmptyState
            title="اختر مادة"
            description="يرجى اختيار مادة لعرض نقط المتدربين الخاصة بها."
          />
        ) : groupStudents.length === 0 ? (
          <EmptyState
            title="لا يوجد متدربون"
            description="لا يوجد أي متدرب مسجل في هذا الفوج حالياً."
          />
        ) : (
          <>
            {!hasAnyGrades && (
              <div style={{
                background: "#fef3c7",
                color: "#92400e",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                ⚠️ لم يتم تسجيل أي نقطة لهذه المادة بعد في هذا الفوج. يتم عرض قائمة المتدربين بنقط فارغة.
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم المتدرب</th>
                  <th style={{ textAlign: "center" }}>مراقبة مستمرة 1 (C1)</th>
                  <th style={{ textAlign: "center" }}>مراقبة مستمرة 2 (C2)</th>
                  <th style={{ textAlign: "center" }}>مراقبة مستمرة 3 (C3)</th>
                  <th style={{ textAlign: "center" }}>الامتحان النهائي (EFM)</th>
                  <th style={{ textAlign: "center" }}>معدل المادة</th>
                  <th style={{ textAlign: "center" }}>المعدل السنوي العام</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--app-muted)" }}>
                      لا توجد نتائج تطابق بحثك.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const subjectGrades = student.grades?.[selectedSubjectId] || {};
                    const gradeSummary = student.gradeSummary || {};

                    const formatGrade = (val) => {
                      if (val === null || val === undefined || val === "") return "-";
                      return val;
                    };

                    const finalGrade = formatGrade(subjectGrades.final);
                    const yearAvg = formatGrade(gradeSummary.yearFinalGrade);

                    return (
                      <tr key={student.id}>
                        <td>
                          <strong>{student.name}</strong>
                          {student.enrollmentNumber && (
                            <small style={{ display: "block", color: "var(--app-muted)", marginTop: "2px" }}>
                              رقم التسجيل: {student.enrollmentNumber}
                            </small>
                          )}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                          {formatGrade(subjectGrades.cc1)}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                          {formatGrade(subjectGrades.cc2)}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                          {formatGrade(subjectGrades.cc3)}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                          {formatGrade(subjectGrades.efm)}
                        </td>
                        <td style={{ 
                          textAlign: "center", 
                          fontWeight: "bold",
                          color: subjectGrades.final >= 10 ? "#15803d" : subjectGrades.final !== null && subjectGrades.final !== "" ? "#b91c1c" : "inherit"
                        }}>
                          {finalGrade}
                        </td>
                        <td style={{ 
                          textAlign: "center", 
                          fontWeight: "bold",
                          background: "var(--app-bg-muted, #f8fafc)",
                          color: gradeSummary.yearFinalGrade >= 10 ? "#15803d" : gradeSummary.yearFinalGrade !== null && gradeSummary.yearFinalGrade !== "" ? "#b91c1c" : "inherit"
                        }}>
                          {yearAvg}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
