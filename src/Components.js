import React, { useState, useEffect } from "react";
import { Download, FileText, AlertCircle } from "lucide-react";
import dataService from "./dataService";

// --- 1. صفحة لوحة القيادة ---
export const Dashboard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await dataService.fetchNews();
        setNews(newsData);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("فشل في جلب الأخبار");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">لوحة القيادة - آخر الأخبار</h2>
      {news.length === 0 ? (
        <p>لا توجد أخبار حالياً</p>
      ) : (
        news.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: "20px",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
            }}
          >
            <h3 style={{ color: "#2563eb" }}>{item.title}</h3>
            <small style={{ color: "#6b7280" }}>{item.date}</small>
            <p style={{ marginTop: "5px" }}>{item.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

// --- 2. صفحة الجدول الزمني ---
export const Schedule = () => {
  const [lessons, setLessons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lessonsData, groupsData] = await Promise.all([
          dataService.fetchLessons(),
          dataService.fetchGroups(),
        ]);
        setLessons(lessonsData || []);
        setGroups(groupsData || []);
        if (groupsData && groupsData.length > 0) {
          setSelectedGroup(groupsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupLessons = lessons.filter((l) => l.groupId === selectedGroup) || [];

  const downloadSchedule = () => {
    try {
      const text = `الجدول الزمني - ${groups.find((g) => g.id === selectedGroup)?.name || "بدون اسم"}\n\n`;
      const csv = groupLessons.map((l) => `${l.date},${l.title}`).join("\n");
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text + csv));
      element.setAttribute("download", "schedule.csv");
      element.click();
    } catch (err) {
      alert("خطأ في تحميل الجدول");
    }
  };

  return (
    <div className="card schedule-container">
      <h2 className="page-title">الجدول الزمني</h2>

      <div className="form-group">
        <label>اختر الفوج:</label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">-- اختر الفوج --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : groupLessons.length === 0 ? (
        <p>لا توجد دروس لهذا الفوج</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>عنوان الدرس</th>
                <th>الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {groupLessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.date}</td>
                  <td>{lesson.title}</td>
                  <td>{lesson.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px" }}>
            <button className="btn-primary" onClick={downloadSchedule}>
              <Download size={18} /> تحميل الجدول
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// --- 3. صفحة الموارد ---
export const Resources = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [lessons, setLessons] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsData, lessonsData, exercisesData] = await Promise.all([
          dataService.fetchGroups(),
          dataService.fetchLessons(),
          dataService.fetchExercises(),
        ]);
        setGroups(groupsData || []);
        setLessons(lessonsData || []);
        setExercises(exercisesData || []);
        if (groupsData && groupsData.length > 0) {
          setSelectedGroup(groupsData[0].id);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupLessons = lessons.filter((l) => l.groupId === selectedGroup) || [];
  const groupExercises = exercises.filter((e) => e.groupId === selectedGroup) || [];

  return (
    <div className="card">
      <h2 className="page-title">الموارد البيداغوجية</h2>

      <div className="form-group">
        <label>اختر الفوج:</label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">-- اختر الفوج --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <>
          <h3 style={{ marginTop: "20px" }}>الدروس</h3>
          {groupLessons.length === 0 ? (
            <p>لا توجد دروس</p>
          ) : (
            <ul style={{ listStyleType: "none", margin: "15px 0", padding: 0 }}>
              {groupLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  style={{
                    padding: "10px",
                    background: "#f9fafb",
                    margin: "5px 0",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FileText size={16} color="#2563eb" /> {lesson.title} ({lesson.date})
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ marginTop: "20px" }}>التمارين</h3>
          {groupExercises.length === 0 ? (
            <p>لا توجد تمارين</p>
          ) : (
            <ul style={{ listStyleType: "none", margin: "15px 0", padding: 0 }}>
              {groupExercises.map((exercise) => (
                <li
                  key={exercise.id}
                  style={{
                    padding: "10px",
                    background: "#f9fafb",
                    margin: "5px 0",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={16} color="#2563eb" /> {exercise.title}
                  </div>
                  <small style={{ color: "#999" }}>الموعد النهائي: {exercise.due_date}</small>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

// --- 4. صفحة سجل الغياب ---
export const Absence = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const SESSIONS = [
    { id: "s1", label: "الحصة الأولى (08:30 - 11:00)" },
    { id: "s2", label: "الحصة الثانية (11:00 - 13:30)" },
    { id: "s3", label: "الحصة الثالثة (13:30 - 16:00)" },
    { id: "s4", label: "الحصة الرابعة (16:00 - 18:30)" },
  ];

  const DAYS = [
    { id: "2", label: "الثنين" },
    { id: "3", label: "الثلاثاء" },
    { id: "4", label: "الأربعاء" },
    { id: "5", label: "الخميس" },
    { id: "6", label: "الجمعة" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceData, studentsData] = await Promise.all([
          dataService.fetchAttendances(),
          dataService.fetchStudents(),
        ]);
        setAttendance(attendanceData || []);
        setStudents(studentsData || []);

        const today = new Date().toLocaleDateString("ar-MA");
        setSelectedDate(today);
        setSelectedSession("s1");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const buildAttendanceTable = () => {
    // Filter students: if user is a student, show only their data; if trainer/admin, show all
    let filteredStudents = students;
    if (user?.role === "متدرب" && user?.id) {
      filteredStudents = students.filter(s => s.userId === user.id || s.id === user.id);
    }

    const uniqueDates = [...new Set(attendance.map(a => a.date))];
    const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    // Get all unique days of week
    const dayHeaders = DAYS.map(day => day.label);
    const sessionHeaders = SESSIONS.map(s => s.label);

    // Build table: rows = students, columns = days + sessions
    const tableData = filteredStudents.map(student => {
      const studentAttendance = attendance.filter(a => a.studentId === student.id);
      return {
        student,
        attendance: studentAttendance,
      };
    });

    return { tableData, sessionHeaders, dayHeaders };
  };

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "red" }}>{error}</p></div>;

  const { tableData, sessionHeaders } = buildAttendanceTable();

  // Get unique dates grouped by session and day
  const uniqueDates = [...new Set(attendance.map(a => a.date))];
  const getDayName = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const dayNum = date.getDay().toString();
      return DAYS.find(d => d.id === dayNum)?.label || "غير معروف";
    } catch {
      return "غير معروف";
    }
  };

  const sessionSlots = [
    { id: "s1", time: "11:00 - 08:30" },
    { id: "s2", time: "13:30 - 11:00" },
    { id: "s3", time: "16:00 - 13:30" },
    { id: "s4", time: "18:30 - 16:00" },
  ];

  return (
    <div className="card">
      <h2 className="page-title">سجل الغياب</h2>
      <div style={{ marginBottom: "20px", padding: "10px", background: "#eff6ff", borderLeft: "4px solid #3b82f6", borderRadius: "4px" }}>
        <AlertCircle size={14} style={{ display: "inline", marginLeft: "8px" }} />
        الخلايا باللون الوردي تشير إلى حالات الغياب
      </div>

      {tableData.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>لا توجد بيانات طلاب</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            direction: "rtl",
          }}>
            <thead>
              <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #d1d5db" }}>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "#1e293b", borderLeft: "1px solid #e5e7eb" }}>الاسم / التوقيت</th>
                {sessionSlots.map(session => (
                  <th key={session.id} style={{
                    padding: "12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "0.8rem",
                    color: "#1e293b",
                    borderLeft: "1px solid #e5e7eb"
                  }}>
                    {session.time}
                  </th>
                ))}
              </tr>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px", textAlign: "right", fontSize: "0.75rem", color: "#6b7280", fontWeight: "500" }}></th>
                {sessionSlots.map(session => (
                  <th key={`label-${session.id}`} style={{
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}>
                    {SESSIONS.find(s => s.id === session.id)?.label.split("(")[0].trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={row.student.id} style={{
                  borderBottom: "1px solid #e5e7eb",
                  background: idx % 2 === 0 ? "#fff" : "#f9fafb"
                }}>
                  <td style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#1e293b",
                    borderLeft: "1px solid #e5e7eb",
                    minWidth: "150px"
                  }}>
                    {row.student.name}
                  </td>
                  {sessionSlots.map(session => {
                    // Find latest attendance for this session (any date)
                    const latestAttendance = row.attendance
                      .filter(a => a.session === session.id)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                    const isAbsent = latestAttendance?.status === "absent";

                    return (
                      <td key={`${row.student.id}-${session.id}`} style={{
                        padding: "12px",
                        textAlign: "center",
                        background: isAbsent ? "#fce7f3" : "transparent",
                        color: isAbsent ? "#be185d" : "#16a34a",
                        fontWeight: isAbsent ? "600" : "500",
                        fontSize: "0.9rem",
                        borderLeft: "1px solid #e5e7eb",
                      }}>
                        {isAbsent ? "غائب" : "حاضر"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "20px", padding: "15px", background: "#f0fdf4", borderRadius: "6px" }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#166534" }}>📊 إحصائيات الحضور</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {tableData.map(row => {
            const totalSessions = attendance.filter(a => a.studentId === row.student.id).length;
            const absentCount = attendance.filter(a => a.studentId === row.student.id && a.status === "absent").length;
            const percentage = totalSessions > 0 ? ((totalSessions - absentCount) / totalSessions * 100).toFixed(1) : 0;

            return (
              <div key={row.student.id} style={{
                padding: "10px",
                background: "#fff",
                borderRadius: "4px",
                borderRight: "4px solid " + (percentage >= 90 ? "#16a34a" : percentage >= 70 ? "#f59e0b" : "#dc2626"),
              }}>
                <div style={{ fontSize: "0.9rem", fontWeight: "500", color: "#1e293b" }}>{row.student.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                  نسبة الحضور: <strong style={{ color: percentage >= 90 ? "#16a34a" : percentage >= 70 ? "#f59e0b" : "#dc2626" }}>{percentage}%</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 5. صفحة كشف النقط ---
export const Grades = () => {
  const [subjects, setSubjects] = useState([]);
  const [studentGrades, setStudentGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGradesData = async () => {
      try {
        // Get the first student as example (you can make this dynamic)
        const students = await dataService.fetchStudents();
        const subjects = await dataService.fetchSubjects();

        if (students.length > 0) {
          setStudentGrades(students[0].grades || {});
        }
        setSubjects(subjects);
      } catch (err) {
        console.error("Error fetching grades:", err);
        setError("فشل في جلب النقط");
      } finally {
        setLoading(false);
      }
    };

    fetchGradesData();
  }, []);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="card">
      <h2 className="page-title">كشف النقط</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan="2">المادة</th>
            <th colSpan="3">المراقبة المستمرة</th>
            <th rowSpan="2">الامتحان النهائي (EFM)</th>
            <th rowSpan="2">النقطة النهائية</th>
          </tr>
          <tr>
            <th>CC1</th>
            <th>CC2</th>
            <th>CC3</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj) => {
            const grades = studentGrades[subj.id] || { cc1: "-", cc2: "-", cc3: "-", efm: "-", final: "-" };
            return (
              <tr key={subj.id}>
                <td style={{ textAlign: "right" }}>{subj.name}</td>
                <td>{grades.cc1 || "-"}</td>
                <td>{grades.cc2 || "-"}</td>
                <td>{grades.cc3 || "-"}</td>
                <td>{grades.efm || "-"}</td>
                <td>{grades.final || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
