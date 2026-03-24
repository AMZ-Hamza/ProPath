import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Newspaper,
  UserX,
} from "lucide-react";
import dataService from "./dataService";

const DEFAULT_SLOTS = [
  { id: "s1", label: "08:30 - 11:00" },
  { id: "s2", label: "11:00 - 13:30" },
  { id: "s3", label: "13:30 - 16:00" },
  { id: "s4", label: "16:00 - 18:30" },
];

function formatDisplayDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getLessonFileUrl(lesson) {
  if (lesson.file?.data) return lesson.file.data;
  if (lesson.file?.url) return lesson.file.url;
  if (lesson.resources?.[0]?.url) return lesson.resources[0].url;
  return "";
}

function getLessonFileName(lesson) {
  return lesson.file?.name || lesson.resources?.[0]?.name || `${lesson.title}.pdf`;
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          background: "#dbeafe",
          color: "#1d4ed8",
        }}
      >
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: "0.9rem", color: "#64748b" }}>{label}</div>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );
}

export function Dashboard({ user }) {
  const [news, setNews] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [newsItems, studentRecord] = await Promise.all([
          dataService.fetchNewsForAudience("students"),
          dataService.getStudentRecordForUser(user),
        ]);
        setNews(newsItems.slice(0, 5));
        setStudent(studentRecord);
      } catch (loadError) {
        console.error(loadError);
        setError("تعذر تحميل لوحة المتدرب");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">لوحة القيادة</h2>

      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard icon={Calendar} label="الفوج" value={student?.group || "-"} />
        <StatCard icon={FileText} label="المواد المسجلة" value={(student?.enrolled_subjects || []).length} />
        <StatCard icon={Newspaper} label="الإعلانات الحديثة" value={news.length} />
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ marginBottom: "12px", color: "#1e3a8a" }}>آخر الأخبار</h3>
        {news.length === 0 ? (
          <p style={{ color: "#64748b" }}>لا توجد إعلانات موجهة للمتدربين حالياً.</p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "12px",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <h4 style={{ margin: 0, color: "#1d4ed8" }}>{item.title}</h4>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>{formatDisplayDate(item.date)}</span>
              </div>
              <p style={{ margin: "10px 0 0", color: "#334155" }}>{item.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Schedule({ user }) {
  const [student, setStudent] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const studentRecord = await dataService.getStudentRecordForUser(user);
        setStudent(studentRecord);

        if (!studentRecord?.group) {
          setTimetable(null);
          return;
        }

        const timetables = await dataService.fetchTimetables();
        const latest = timetables.find(
          (item) => item.type === "student" && String(item.targetId) === String(studentRecord.group),
        );
        setTimetable(latest || null);
      } catch (loadError) {
        console.error(loadError);
        setError("تعذر تحميل الجدول الزمني");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [user]);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div className="card schedule-container">
      <h2 className="page-title">الجدول الزمني</h2>
      <p style={{ color: "#64748b", marginBottom: "16px" }}>
        {student?.group ? `الفوج الحالي: ${student.group}` : "لم يتم ربط المتدرب بفوج بعد."}
      </p>

      {!timetable ? (
        <div style={{ padding: "30px", border: "1px dashed #cbd5e1", borderRadius: "12px", color: "#64748b" }}>
          لا توجد صورة جدول مرفوعة لهذا الفوج حالياً.
        </div>
      ) : (
        <>
          <img
            className="schedule-img"
            src={timetable.fileData}
            alt={`جدول ${student?.group || ""}`}
          />
          <div style={{ color: "#64748b", marginTop: "10px" }}>
            آخر تحديث: {formatDisplayDate(timetable.uploadedAt)}
          </div>
          <div style={{ marginTop: "16px" }}>
            <a className="btn-primary" href={timetable.fileData} download={timetable.fileName || "schedule-image"}>
              <Download size={18} />
              تحميل الصورة
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export function Resources({ user }) {
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const [studentRecord, allLessons, allSubjects] = await Promise.all([
          dataService.getStudentRecordForUser(user),
          dataService.fetchLessons(),
          dataService.fetchSubjects(),
        ]);

        setStudent(studentRecord);
        setSubjects(allSubjects || []);

        const groupLessons = (allLessons || []).filter(
          (lesson) => String(lesson.groupId) === String(studentRecord?.group),
        );
        setLessons(groupLessons);
      } catch (loadError) {
        console.error(loadError);
        setError("تعذر تحميل الدروس");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [user]);

  const subjectMap = useMemo(
    () =>
      Object.fromEntries(
        (subjects || []).map((subject) => [String(subject.id), subject.name]),
      ),
    [subjects],
  );

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">الدروس والملفات</h2>
      <p style={{ color: "#64748b", marginBottom: "16px" }}>
        يتم عرض ملفات PDF الخاصة بفوجك: {student?.group || "-"}
      </p>

      {lessons.length === 0 ? (
        <p style={{ color: "#64748b" }}>لا توجد ملفات PDF مرفوعة لهذا الفوج حالياً.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {lessons.map((lesson) => {
            const fileUrl = getLessonFileUrl(lesson);
            const fileName = getLessonFileName(lesson);

            return (
              <div
                key={lesson.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0f172a" }}>{lesson.title}</h3>
                    <div style={{ color: "#64748b", marginTop: "6px", fontSize: "0.95rem" }}>
                      {subjectMap[String(lesson.subjectId)] || "بدون مادة"} | {formatDisplayDate(lesson.date)}
                    </div>
                  </div>
                  <span
                    style={{
                      alignSelf: "flex-start",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    PDF
                  </span>
                </div>

                {lesson.notes ? (
                  <p style={{ margin: "12px 0", color: "#334155" }}>{lesson.notes}</p>
                ) : null}

                {fileUrl ? (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a className="btn-primary" href={fileUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={18} />
                      فتح الملف
                    </a>
                    <a
                      href={fileUrl}
                      download={fileName}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        color: "#0f172a",
                        textDecoration: "none",
                      }}
                    >
                      <Download size={18} />
                      تحميل الملف
                    </a>
                  </div>
                ) : (
                  <p style={{ color: "#dc2626" }}>هذا الدرس لا يحتوي على ملف قابل للعرض.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Absence({ user }) {
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [timeSlots, setTimeSlots] = useState(DEFAULT_SLOTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAbsences = async () => {
      try {
        setLoading(true);
        const [studentRecord, attendance, slots] = await Promise.all([
          dataService.getStudentRecordForUser(user),
          dataService.fetchAttendances(),
          dataService.fetchTimeSlots(),
        ]);

        setStudent(studentRecord);
        setTimeSlots((slots || []).length > 0 ? slots : DEFAULT_SLOTS);
        const studentRecords = (attendance || [])
          .filter((item) => String(item.studentId) === String(studentRecord?.id))
          .sort((left, right) => new Date(right.date) - new Date(left.date));
        setRecords(studentRecords);
      } catch (loadError) {
        console.error(loadError);
        setError("تعذر تحميل سجل الغياب");
      } finally {
        setLoading(false);
      }
    };

    loadAbsences();
  }, [user]);

  const tableRows = useMemo(() => {
    const grouped = new Map();

    records.forEach((record) => {
      const dayKey = record.date || "unknown";
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, { date: dayKey, sessions: {} });
      }
      grouped.get(dayKey).sessions[record.session] = record.status;
    });

    return [...grouped.values()].sort((left, right) => new Date(right.date) - new Date(left.date));
  }, [records]);

  const absentCount = records.filter((record) => record.status === "absent").length;

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">سجل الغياب</h2>

      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "20px" }}>
        <StatCard icon={UserX} label="عدد الغيابات" value={absentCount} />
        <StatCard icon={Calendar} label="عدد الأيام المسجلة" value={tableRows.length} />
      </div>

      <div style={{ marginBottom: "16px", padding: "12px 14px", borderRadius: "10px", background: "#eff6ff", color: "#1e40af" }}>
        <AlertCircle size={16} style={{ verticalAlign: "middle", marginLeft: "8px" }} />
        الخانات الحمراء تمثل حالات الغياب داخل الفترات الزمنية المحددة.
      </div>

      {student?.group ? (
        <p style={{ color: "#64748b", marginBottom: "14px" }}>الفوج: {student.group}</p>
      ) : null}

      {tableRows.length === 0 ? (
        <p style={{ color: "#64748b" }}>لا توجد بيانات غياب مسجلة لهذا المتدرب.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                {timeSlots.map((slot) => (
                  <th key={slot.id}>{slot.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.date}>
                  <td>{formatDisplayDate(row.date)}</td>
                  {timeSlots.map((slot) => {
                    const status = row.sessions[slot.id];
                    const isAbsent = status === "absent";

                    return (
                      <td key={`${row.date}-${slot.id}`} className={isAbsent ? "absent-cell" : ""}>
                        {status === "present" ? "حاضر" : isAbsent ? "غائب" : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Grades({ user }) {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        const [studentRecord, subjectsData] = await Promise.all([
          dataService.getStudentRecordForUser(user),
          dataService.fetchSubjects(),
        ]);
        setStudent(studentRecord);
        setSubjects(subjectsData || []);
      } catch (loadError) {
        console.error(loadError);
        setError("تعذر تحميل كشف النقط");
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [user]);

  const rows = useMemo(() => {
    const gradeMap = student?.grades || {};
    const subjectIds = student?.enrolled_subjects?.length
      ? student.enrolled_subjects
      : Object.keys(gradeMap);

    return subjectIds.map((subjectId) => {
      const subject = subjects.find((item) => String(item.id) === String(subjectId));
      const normalized = dataService.normalizeGradeRecord(gradeMap[subjectId] || {});

      return {
        id: subjectId,
        subjectName: subject?.name || subjectId,
        ...normalized,
      };
    });
  }, [student, subjects]);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">كشف النقط</h2>
      <p style={{ color: "#64748b", marginBottom: "16px" }}>
        يتم احتساب النقطة النهائية تلقائياً وفق الصيغة: (EFM × 0.75) + 0.25 × ((C1 + C2 + C3) / 3)
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan="2">المادة</th>
            <th colSpan="3">المراقبة المستمرة</th>
            <th rowSpan="2">EFM</th>
            <th rowSpan="2">المعدل النهائي</th>
          </tr>
          <tr>
            <th>C1</th>
            <th>C2</th>
            <th>C3</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ color: "#64748b" }}>
                لا توجد نقط متاحة حالياً.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td style={{ textAlign: "right" }}>{row.subjectName}</td>
                <td>{row.cc1 === "" ? "-" : row.cc1}</td>
                <td>{row.cc2 === "" ? "-" : row.cc2}</td>
                <td>{row.cc3 === "" ? "-" : row.cc3}</td>
                <td>{row.efm === "" ? "-" : row.efm}</td>
                <td>{row.final == null ? "-" : row.final}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
