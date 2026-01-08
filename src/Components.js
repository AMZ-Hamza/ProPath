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
  const groupNumber = "DEV-101"; // رقم الفوج

  return (
    <div className="card schedule-container">
      <h2 className="page-title">الجدول الزمني</h2>
      <div
        style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "10px" }}
      >
        رقم الفوج: <span style={{ color: "#2563eb" }}>{groupNumber}</span>
      </div>

      {/* صورة وهمية للجدول */}
      <img
        src="https://via.placeholder.com/800x400.png?text=Weekly+Schedule+Image"
        alt="الجدول الزمني"
        className="schedule-img"
      />

      <div>
        <button
          className="btn-primary"
          onClick={() => alert("جاري تحميل الجدول...")}
        >
          <Download size={18} /> تحميل الجدول
        </button>
      </div>
    </div>
  );
};

// --- 3. صفحة الموارد ---
export const Resources = () => {
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  // بيانات وهمية للشعب والدروس
  const data = {
    dev: {
      name: "التطوير الرقمي",
      years: 2,
      content: ["الخوارزميات", "React JS", "قواعد البيانات"],
    },
    infra: {
      name: "البنية التحتية والشبكات",
      years: 2,
      content: ["Cisco", "Linux", "Security"],
    },
  };

  return (
    <div className="card">
      <h2 className="page-title">الموارد البيداغوجية</h2>

      <div className="filters">
        <select onChange={(e) => setMajor(e.target.value)} value={major}>
          <option value="">-- اختر الشعبة --</option>
          {Object.entries(data).map(([key, val]) => (
            <option key={key} value={key}>
              {val.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setYear(e.target.value)}
          value={year}
          disabled={!major}
        >
          <option value="">-- اختر السنة الدراسية --</option>
          {major &&
            Array.from({ length: data[major].years }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                السنة {i + 1}
              </option>
            ))}
        </select>
      </div>

      {major && year && (
        <div>
          <h3>
            دروس وتمارين: {data[major].name} - السنة {year}
          </h3>
          <ul style={{ listStyleType: "none", marginTop: "15px" }}>
            {data[major].content.map((lesson, idx) => (
              <li
                key={idx}
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
                <FileText size={16} color="#2563eb" /> {lesson}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- 4. صفحة سجل الغياب ---
export const Absence = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const attendanceData = await dataService.fetchAttendances();
        setAttendance(attendanceData);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("فشل في جلب بيانات الحضور");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) return <div className="card"><p>جاري التحميل...</p></div>;
  if (error) return <div className="card"><p style={{ color: "red" }}>{error}</p></div>;

  const Cell = ({ status }) => (
    <td className={status === "absent" ? "absent-cell" : ""}>
      {status === "present" ? "حاضر" : "غائب"}
    </td>
  );

  return (
    <div className="card">
      <h2 className="page-title">سجل الغياب</h2>
      <div style={{ marginBottom: "10px", color: "#666" }}>
        <AlertCircle size={14} style={{ display: "inline" }} /> الخلايا الحمراء
        تشير إلى حصص الغياب
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الحصة</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr><td colSpan="3">لا توجد بيانات حضور</td></tr>
          ) : (
            attendance.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>{record.session}</td>
                <Cell status={record.status} />
              </tr>
            ))
          )}
        </tbody>
      </table>
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
