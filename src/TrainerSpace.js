import React, { useState } from "react";
import {
  Users,
  FileText,
  CheckSquare,
  Upload,
  ArrowRight,
  Save,
  Clock,
  BookOpen,
} from "lucide-react";
import "./TrainerSpace.css";

// --- الثوابت والبيانات (Constants & Data) ---

// 1. حصص اليوم
const TIME_SLOTS = [
  { id: "s1", label: "الحصة الأولى (08:30 - 11:00)" },
  { id: "s2", label: "الحصة الثانية (11:00 - 13:30)" },
  { id: "s3", label: "الحصة الثالثة (13:30 - 16:00)" },
  { id: "s4", label: "الحصة الرابعة (16:00 - 18:30)" },
];

// 2. المواد الدراسية (Modules)
const SUBJECTS = [
  { id: "m1", name: "M101: الخوارزميات (Algorithms)" },
  { id: "m2", name: "M102: تطوير الواجهات (Front-end)" },
  { id: "m3", name: "M103: قواعد البيانات (Databases)" },
  { id: "m4", name: "M104: اللغة الإنجليزية" },
];

const GROUPS_DATA = {
  1: [
    { id: "dev101", name: "تطوير رقمي 101" },
    { id: "inf101", name: "بنية تحتية 101" },
  ],
  2: [
    { id: "dev201", name: "تطوير رقمي 201" },
    { id: "inf201", name: "بنية تحتية 201" },
  ],
};

// تحديث هيكل بيانات الطلاب لدعم تعدد المواد
const INITIAL_STUDENTS = [
  {
    id: 1,
    name: "أحمد محمد",
    grades: {
      m1: { cc1: 15, cc2: 14, efm: "" },
      m2: { cc1: 10, cc2: 12, efm: "" },
    },
    absent: false,
  },
  {
    id: 2,
    name: "سارة علي",
    grades: {
      m1: { cc1: 18, cc2: 19, efm: "" },
      m2: { cc1: 17, cc2: 18, efm: "" },
    },
    absent: false,
  },
  {
    id: 3,
    name: "كريم يوسف",
    grades: {},
    absent: false,
  },
];

const TrainerSpace = () => {
  // --- States ---
  const [step, setStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  // States جديدة للاختيارات الفرعية
  const [selectedSubject, setSelectedSubject] = useState(""); // للمادة
  const [selectedSession, setSelectedSession] = useState(""); // للحصة الزمنية

  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // --- Handlers ---
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedGroup("");
  };

  const handleGroupConfirm = () => {
    if (selectedYear && selectedGroup) {
      setStep(2);
    } else {
      alert("المرجو اختيار السنة والفوج");
    }
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    // تصفير الاختيارات الفرعية عند دخول صفحة جديدة
    setSelectedSubject("");
    setSelectedSession("");
    setStep(3);
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  // --- Render Functions ---

  // 1. اختيار الفوج (لم يتغير)
  const renderSelectionStep = () => (
    <div className="card">
      <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>
        إدارة الأفواج - اختيار الفوج
      </h2>
      <div className="form-group">
        <label className="label">السنة الدراسية</label>
        <select
          className="select-input"
          value={selectedYear}
          onChange={handleYearChange}
        >
          <option value="">-- اختر السنة --</option>
          <option value="1">السنة الأولى</option>
          <option value="2">السنة الثانية</option>
        </select>
      </div>
      <div className="form-group">
        <label className="label">الفوج</label>
        <select
          className="select-input"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          disabled={!selectedYear}
        >
          <option value="">-- اختر الفوج --</option>
          {selectedYear &&
            GROUPS_DATA[selectedYear].map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
        </select>
      </div>
      <button
        className="btn btn-primary"
        onClick={handleGroupConfirm}
        style={{ width: "100%", justifyContent: "center" }}
      >
        متابعة
      </button>
    </div>
  );

  // 2. قائمة العمليات (لم تتغير)
  const renderActionStep = () => (
    <div>
      <button className="btn btn-back" onClick={goBack}>
        <ArrowRight size={18} /> تغيير الفوج
      </button>
      <div className="card">
        <h2>
          إدارة الفوج:{" "}
          <span style={{ color: "#3498db" }}>
            {
              GROUPS_DATA[selectedYear].find((g) => g.id === selectedGroup)
                ?.name
            }
          </span>
        </h2>
        <div className="actions-grid">
          <div
            className="action-card"
            onClick={() => handleActionSelect("grades")}
          >
            <FileText size={40} className="action-icon" />
            <div className="action-title">رصد النقط</div>
          </div>
          <div
            className="action-card"
            onClick={() => handleActionSelect("absence")}
          >
            <CheckSquare size={40} className="action-icon" />
            <div className="action-title">تسجيل الحضور</div>
          </div>
          <div
            className="action-card"
            onClick={() => handleActionSelect("upload")}
          >
            <Upload size={40} className="action-icon" />
            <div className="action-title">رفع الدروس</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. واجهة رصد النقط (تم التحديث: إضافة اختيار المادة)
  const renderGradesView = () => {
    const handleGradeChange = (studentId, field, value) => {
      setStudents((prevStudents) =>
        prevStudents.map((std) => {
          if (std.id === studentId) {
            // نسخ النقط القديمة أو إنشاء كائن جديد إذا لم يكن موجوداً
            const currentSubjectGrades = std.grades[selectedSubject] || {
              cc1: "",
              cc2: "",
              efm: "",
            };
            return {
              ...std,
              grades: {
                ...std.grades,
                [selectedSubject]: { ...currentSubjectGrades, [field]: value },
              },
            };
          }
          return std;
        }),
      );
    };

    const saveGrades = () =>
      alert(
        `تم حفظ نقط مادة: ${
          SUBJECTS.find((s) => s.id === selectedSubject)?.name
        }`,
      );

    return (
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>رصد النقط</h3>
          {selectedSubject && (
            <button className="btn btn-success" onClick={saveGrades}>
              <Save size={18} /> حفظ
            </button>
          )}
        </div>

        {/* 1. قائمة اختيار المادة */}
        <div
          className="form-group"
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <label
            className="label"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <BookOpen size={18} /> اختر المادة (Module):
          </label>
          <select
            className="select-input"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- يرجى اختيار المادة أولاً --</option>
            {SUBJECTS.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. جدول النقط (يظهر فقط عند اختيار المادة) */}
        {selectedSubject ? (
          <div className="fade-in">
            <h4 style={{ marginTop: "20px", color: "#555" }}>
              إدخال نقط: {SUBJECTS.find((s) => s.id === selectedSubject)?.name}
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المتدرب</th>
                  <th>الفرض 1 (CC1)</th>
                  <th>الفرض 2 (CC2)</th>
                  <th>الفرض 3 (CC2)</th>
                  <th>الامتحان النهائي (EFM)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  // جلب نقط المادة المختارة، أو فراغ إذا لم توجد
                  const grades = student.grades[selectedSubject] || {
                    cc1: "",
                    cc2: "",
                    cc3: "",
                    efm: "",
                  };
                  return (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>
                        <input
                          type="number"
                          className="grade-input"
                          value={grades.cc1}
                          onChange={(e) =>
                            handleGradeChange(student.id, "cc1", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="grade-input"
                          value={grades.cc2}
                          onChange={(e) =>
                            handleGradeChange(student.id, "cc2", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="grade-input"
                          value={grades.cc3}
                          onChange={(e) =>
                            handleGradeChange(student.id, "cc2", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="grade-input"
                          placeholder="-"
                          value={grades.efm}
                          onChange={(e) =>
                            handleGradeChange(student.id, "efm", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <ArrowRight size={32} style={{ marginBottom: "10px" }} />
            <p>المرجو اختيار المادة من القائمة أعلاه لعرض الجدول</p>
          </div>
        )}
      </div>
    );
  };

  // 4. واجهة تسجيل الحضور (تم التحديث: إضافة اختيار الحصة)
  const renderAbsenceView = () => {
    const toggleAbsence = (id) => {
      setStudents(
        students.map((std) =>
          std.id === id ? { ...std, absent: !std.absent } : std,
        ),
      );
    };

    return (
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>تسجيل الحضور</h3>
          {selectedSession && (
            <button
              className="btn btn-success"
              onClick={() => alert("تم حفظ الغياب لهذه الحصة")}
            >
              تأكيد الحضور
            </button>
          )}
        </div>

        {/* 1. قائمة اختيار الحصة */}
        <div
          className="form-group"
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <label
            className="label"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Clock size={18} /> اختر الحصة الزمنية:
          </label>
          {/* ظظظظظظظظظظظظظظظظظظظ */}
          <select
            className="select-input"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">-- يرجى اختيار الحصة --</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
          {/* ظظظظظظظظظظظظظظظظظظظظظ */}
        </div>

        {/* 2. جدول الغياب (يظهر فقط عند اختيار الحصة) */}
        {selectedSession ? (
          <div className="fade-in">
            <h4 style={{ marginTop: "20px", color: "#555" }}>
              لائحة الحضور لـ:{" "}
              {TIME_SLOTS.find((s) => s.id === selectedSession)?.label}
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المتدرب</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    style={{
                      backgroundColor: student.absent
                        ? "#ffebee"
                        : "transparent",
                    }}
                  >
                    <td>{student.name}</td>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: student.absent ? "red" : "green",
                      }}
                    >
                      {student.absent ? "غائب" : "حاضر"}
                    </td>
                    <td>
                      <button
                        className={`btn ${
                          student.absent ? "btn-success" : "btn-primary"
                        }`}
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                        onClick={() => toggleAbsence(student.id)}
                      >
                        {student.absent ? "إلغاء الغياب" : "تسجيل غياب"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <Clock size={32} style={{ marginBottom: "10px" }} />
            <p>المرجو اختيار التوقيت (الحصة) من القائمة أعلاه</p>
          </div>
        )}
      </div>
    );
  };

  // 5. واجهة رفع الملفات (لم تتغير)
  const renderUploadView = () => {
    const handleFileUpload = (e) => {
      if (e.target.files[0]) {
        const newFile = {
          name: e.target.files[0].name,
          date: new Date().toLocaleDateString("ar-MA"),
        };
        setUploadedFiles([...uploadedFiles, newFile]);
      }
    };

    return (
      <div className="card">
        <h3>رفع الدروس والتمارين</h3>
        <div className="upload-area">
          <Upload size={48} color="#bdc3c7" />
          <p>اضغط هنا لرفع الملفات أو قم بسحبها وإفلاتها</p>
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ marginTop: "10px" }}
          />
        </div>
        <h4>الملفات المرفوعة:</h4>
        {uploadedFiles.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic" }}>
            لا توجد ملفات مرفوعة حالياً.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {uploadedFiles.map((file, idx) => (
              <li
                key={idx}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <FileText size={16} /> {file.name}
                </span>
                <span style={{ color: "#888", fontSize: "0.9rem" }}>
                  {file.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="trainer-container">
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={32} color="#3498db" />
          <div>
            <h1>فضاء المكون</h1>
            <span style={{ fontSize: "0.9rem", color: "#777" }}>
              ProPath Educational Platform
            </span>
          </div>
        </div>
      </header>

      <main>
        {step === 1 && renderSelectionStep()}

        {step === 2 && renderActionStep()}

        {step === 3 && (
          <div>
            <button className="btn btn-back" onClick={goBack}>
              <ArrowRight size={18} /> الرجوع للقائمة
            </button>
            {selectedAction === "grades" && renderGradesView()}
            {selectedAction === "absence" && renderAbsenceView()}
            {selectedAction === "upload" && renderUploadView()}
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainerSpace;
