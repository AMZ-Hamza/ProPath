import React, { useState } from "react";
import { Download, FileText, AlertCircle } from "lucide-react";

// --- 1. صفحة لوحة القيادة ---
export const Dashboard = () => {
  const news = [
    {
      id: 1,
      title: "انطلاق الامتحانات الجهوية",
      date: "2024-05-20",
      content: "تعلن الإدارة أن الامتحانات الجهوية ستبدأ يوم الاثنين القادم...",
    },
    {
      id: 2,
      title: "عطلة عيد الأضحى",
      date: "2024-06-10",
      content: "بمناسبة عيد الأضحى المبارك، ستتوقف الدراسة لمدة أسبوع...",
    },
  ];

  return (
    <div className="card">
      <h2 className="page-title">لوحة القيادة - آخر الأخبار</h2>
      {news.map((item) => (
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
      ))}
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
  // محاكاة جدول حصص، true تعني غائب
  const schedule = [
    { day: "الاثنين", t8_10: false, t10_12: true, t2_4: false, t4_6: false },
    { day: "الثلاثاء", t8_10: false, t10_12: false, t2_4: false, t4_6: false },
    { day: "الأربعاء", t8_10: false, t10_12: false, t2_4: true, t4_6: true },
    { day: "الخميس", t8_10: false, t10_12: false, t2_4: false, t4_6: false },
    { day: "الجمعة", t8_10: false, t10_12: false, t2_4: false, t4_6: false },
  ];

  const Cell = ({ absent }) => (
    <td className={absent ? "absent-cell" : ""}>{absent ? "غائب" : "حاضر"}</td>
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
            <th>اليوم / التوقيت</th>
            <th>08:30 - 11:00</th>
            <th>11:00 - 13:30</th>
            <th>13:30 - 16:00</th>
            <th>16:00 - 18:30</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: "bold" }}>{row.day}</td>
              <Cell absent={row.t8_10} />
              <Cell absent={row.t10_12} />
              <Cell absent={row.t2_4} />
              <Cell absent={row.t4_6} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 5. صفحة كشف النقط ---
export const Grades = () => {
  const subjects = [
    {
      name: "تطوير الواجهات (Front-end)",
      cc1: 14,
      cc2: 15,
      cc3: 16,
      efm: null,
    },
    {
      name: "قواعد البيانات (Databases)",
      cc1: 12,
      cc2: 13,
      cc3: 11,
      efm: null,
    },
    { name: "اللغة الإنجليزية", cc1: 18, cc2: 17, cc3: 18, efm: 16 },
    { name: "agile ", cc1: 18, cc2: 17, cc3: 14, efm: 16 },
  ];

  return (
    <div className="card">
      <h2 className="page-title">كشف النقط</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan="2">المادة</th>
            <th colSpan="3">المراقبة المستمرة</th>
            <th rowSpan="2">الامتحان النهائي (EFM)</th>
          </tr>
          <tr>
            <th>الفرض 1</th>
            <th>الفرض 2</th>
            <th>الفرض 3</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj, idx) => (
            <tr key={idx}>
              <td style={{ textAlign: "right" }}>{subj.name}</td>
              <td>{subj.cc1}</td>
              <td>{subj.cc2}</td>
              <td>{subj.cc3}</td>
              <td>{subj.efm ? subj.efm : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
