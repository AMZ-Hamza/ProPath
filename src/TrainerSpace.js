import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckSquare,
  FileText,
  Home,
  Save,
  Upload,
  Users,
} from "lucide-react";
import dataService from "./dataService.js";
import "./TrainerSpace.css";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TABS = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "grades", label: "رصد النقط", icon: FileText },
  { id: "attendance", label: "الحضور", icon: CheckSquare },
  { id: "lessons", label: "رفع الدروس", icon: Upload },
];

const ALL_SESSIONS_VALUE = "all";

export default function TrainerSpace({ user }) {
  const [activeTab, setActiveTab] = useState("home");
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [news, setNews] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSession, setSelectedSession] = useState(ALL_SESSIONS_VALUE);
  const [selectedDate, setSelectedDate] = useState(dataService.getTodayIsoDate());
  const [attendanceStatus, setAttendanceStatus] = useState({});

  const [lessonForm, setLessonForm] = useState({
    title: "",
    notes: "",
    subjectId: "",
    groupId: "",
    fileName: "",
    fileData: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        subjectsData,
        groupsData,
        studentsData,
        newsData,
        timetablesData,
        lessonsData,
        attendancesData,
        slotsData,
      ] = await Promise.all([
        dataService.fetchSubjects().catch(() => []),
        dataService.fetchGroups().catch(() => []),
        dataService.fetchStudents().catch(() => []),
        dataService.fetchNewsForAudience("trainers").catch(() => []),
        dataService.fetchTimetables().catch(() => []),
        dataService.fetchLessons().catch(() => []),
        dataService.fetchAttendances().catch(() => []),
        dataService.fetchTimeSlots().catch(() => []),
      ]);

      setSubjects(subjectsData || []);
      setGroups(groupsData || []);
      setStudents(studentsData || []);
      setNews(newsData || []);
      setTimetables(timetablesData || []);
      setLessons(lessonsData || []);
      setAttendances(attendancesData || []);
      setTimeSlots(slotsData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const trainerSubjects = useMemo(
    () => subjects.filter((subject) => String(subject.teacherId) === String(user?.id)),
    [subjects, user],
  );

  const assignedGroupsBySubject = useMemo(() => {
    const result = {};
    trainerSubjects.forEach((subject) => {
      const groupIds = new Set(
        students
          .filter((student) =>
            (student.enrolled_subjects || []).some(
              (subjectId) => String(subjectId) === String(subject.id),
            ),
          )
          .map((student) => String(student.group)),
      );
      result[subject.id] = [...groupIds];
    });
    return result;
  }, [trainerSubjects, students]);

  const availableGroups = useMemo(() => {
    const groupIds = new Set(Object.values(assignedGroupsBySubject).flat());
    return groups.filter((group) => groupIds.has(String(group.id)));
  }, [assignedGroupsBySubject, groups]);

  const groupStudents = useMemo(
    () => students.filter((student) => String(student.group) === String(selectedGroup)),
    [students, selectedGroup],
  );

  const subjectsForSelectedGroup = useMemo(
    () =>
      trainerSubjects.filter((subject) =>
        (assignedGroupsBySubject[subject.id] || []).includes(String(selectedGroup)),
      ),
    [assignedGroupsBySubject, selectedGroup, trainerSubjects],
  );

  const canEnterGrades = useMemo(
    () =>
      Boolean(
        selectedSubject &&
          selectedGroup &&
          (assignedGroupsBySubject[selectedSubject] || []).includes(String(selectedGroup)),
      ),
    [assignedGroupsBySubject, selectedGroup, selectedSubject],
  );

  const timeSlotOptions = useMemo(
    () =>
      timeSlots.length > 0
        ? timeSlots
        : [
            { id: "s1", label: "الحصة الأولى (08:30 - 11:00)" },
            { id: "s2", label: "الحصة الثانية (11:00 - 13:30)" },
            { id: "s3", label: "الحصة الثالثة (13:30 - 16:00)" },
            { id: "s4", label: "الحصة الرابعة (16:00 - 18:30)" },
          ],
    [timeSlots],
  );

  useEffect(() => {
    if (!availableGroups.some((group) => String(group.id) === String(selectedGroup))) {
      setSelectedGroup(availableGroups[0]?.id || "");
    }
  }, [availableGroups, selectedGroup]);

  useEffect(() => {
    if (!subjectsForSelectedGroup.some((subject) => String(subject.id) === String(selectedSubject))) {
      setSelectedSubject(subjectsForSelectedGroup[0]?.id || "");
    }
  }, [selectedSubject, subjectsForSelectedGroup]);

  useEffect(() => {
    setLessonForm((prev) => {
      const nextSubjectId = prev.subjectId && trainerSubjects.some((subject) => String(subject.id) === String(prev.subjectId))
        ? prev.subjectId
        : trainerSubjects[0]?.id || "";

      const lessonGroups = nextSubjectId
        ? availableGroups.filter((group) =>
            (assignedGroupsBySubject[nextSubjectId] || []).includes(String(group.id)),
          )
        : availableGroups;

      const nextGroupId = lessonGroups.some((group) => String(group.id) === String(prev.groupId))
        ? prev.groupId
        : lessonGroups[0]?.id || "";

      return { ...prev, subjectId: nextSubjectId, groupId: nextGroupId };
    });
  }, [assignedGroupsBySubject, availableGroups, trainerSubjects]);

  useEffect(() => {
    const initialStatus = {};
    groupStudents.forEach((student) => {
      const matchingRecords = attendances.filter(
        (record) =>
          String(record.studentId) === String(student.id) &&
          String(record.group) === String(selectedGroup) &&
          String(record.date) === String(selectedDate),
      );

      if (selectedSession === ALL_SESSIONS_VALUE) {
        const relevantSlots = timeSlotOptions.map((slot) => String(slot.id));
        const selectedRecords = matchingRecords.filter((record) =>
          relevantSlots.includes(String(record.session)),
        );
        initialStatus[student.id] =
          selectedRecords.length > 0 &&
          selectedRecords.every((record) => record.status === "absent")
            ? "absent"
            : "present";
        return;
      }

      const existing = matchingRecords.find(
        (record) => String(record.session) === String(selectedSession),
      );
      initialStatus[student.id] = existing?.status || "present";
    });
    setAttendanceStatus(initialStatus);
  }, [attendances, groupStudents, selectedDate, selectedGroup, selectedSession, timeSlotOptions]);

  const personalTimetable = timetables.find(
    (item) => item.type === "teacher" && String(item.targetId) === String(user?.id),
  );

  const trainerLessons = lessons.filter((lesson) => String(lesson.trainerId) === String(user?.id));

  const updateGrade = (studentId, field, value) => {
    setStudents((previous) =>
      previous.map((student) => {
        if (String(student.id) !== String(studentId)) return student;

        const currentGrades = student.grades?.[selectedSubject] || {};
        const nextGrades = {
          ...currentGrades,
          [field]: value,
        };

        return {
          ...student,
          grades: {
            ...(student.grades || {}),
            [selectedSubject]: {
              ...nextGrades,
              final: dataService.calculateFinalGrade(nextGrades),
            },
          },
        };
      }),
    );
  };

  const saveGrades = async () => {
    if (!canEnterGrades) return;
    const currentGroupStudents = students.filter(
      (student) => String(student.group) === String(selectedGroup),
    );
    await dataService.saveStudents(currentGroupStudents);
    alert("تم حفظ النقط بنجاح");
    loadData();
  };

  const saveAttendance = async () => {
    if (!selectedGroup || !selectedSession) {
      alert("يرجى اختيار الفوج والحصة");
      return;
    }

    const sessionsToSave =
      selectedSession === ALL_SESSIONS_VALUE
        ? timeSlotOptions.map((slot) => slot.id)
        : [selectedSession];

    const records = groupStudents.flatMap((student) =>
      sessionsToSave.map((sessionId) => ({
        studentId: student.id,
        group: selectedGroup,
        date: selectedDate,
        session: sessionId,
        status: attendanceStatus[student.id] || "present",
      })),
    );

    await dataService.saveAttendances(records);
    alert("تم حفظ الحضور");
    loadData();
  };

  const handleLessonFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLessonForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileData: "",
    }));
    const fileData = await readFileAsDataUrl(file);
    setLessonForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileData,
    }));
  };

  const saveLesson = async () => {
    const allowedGroups = assignedGroupsBySubject[lessonForm.subjectId] || [];

    if (
      !lessonForm.title.trim() ||
      !lessonForm.subjectId ||
      !lessonForm.groupId ||
      !lessonForm.fileData
    ) {
      alert("يرجى إدخال عنوان الدرس والمادة والفوج وملف PDF");
      return;
    }

    if (!allowedGroups.includes(String(lessonForm.groupId))) {
      alert("لا يمكن رفع درس لفوج غير مرتبط بالمادة المختارة");
      return;
    }

    await dataService.addLesson({
      title: lessonForm.title.trim(),
      notes: lessonForm.notes.trim(),
      subjectId: lessonForm.subjectId,
      groupId: lessonForm.groupId,
      trainerId: user.id,
      file: {
        name: lessonForm.fileName || `${lessonForm.title.trim()}.pdf`,
        data: lessonForm.fileData,
      },
      date: dataService.getTodayIsoDate(),
    });

    setLessonForm((prev) => ({
      ...prev,
      title: "",
      notes: "",
      fileName: "",
      fileData: "",
    }));
    alert("تم رفع الدرس");
    loadData();
  };

  const renderHome = () => (
    <div className="trainer-grid">
      <div className="card">
        <h2 className="section-title">ملخص سريع</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <Users size={20} />
            <div>
              <strong>{availableGroups.length}</strong>
              <span>أفواج مسندة</span>
            </div>
          </div>
          <div className="summary-card">
            <BookOpen size={20} />
            <div>
              <strong>{trainerSubjects.length}</strong>
              <span>مواد مسندة</span>
            </div>
          </div>
          <div className="summary-card">
            <FileText size={20} />
            <div>
              <strong>{trainerLessons.length}</strong>
              <span>دروس مرفوعة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">آخر الأخبار</h2>
        {news.length === 0 ? (
          <p style={{ color: "#64748b" }}>لا توجد إعلانات موجهة للمكونين حالياً.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {news.slice(0, 5).map((item) => (
              <div key={item.id} className="news-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <strong>{item.title}</strong>
                  <span style={{ color: "#64748b" }}>{formatDate(item.date)}</span>
                </div>
                <p style={{ margin: "8px 0 0", color: "#334155" }}>{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">جدولي الشخصي</h2>
        {!personalTimetable ? (
          <p style={{ color: "#64748b" }}>لم يتم رفع جدول خاص بك بعد من طرف الإدارة.</p>
        ) : (
          <div className="timetable-box">
            <img src={personalTimetable.fileData} alt="teacher timetable" className="trainer-timetable-image" />
            <div style={{ color: "#64748b", marginTop: "12px" }}>
              آخر تحديث: {formatDate(personalTimetable.uploadedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="card">
      <h2 className="section-title">رصد النقط</h2>
      <div className="toolbar-grid">
        <div className="form-group">
          <label className="label">الفوج</label>
          <select className="select-input" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
            <option value="">-- اختر الفوج --</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">المادة</label>
          <select className="select-input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            <option value="">-- اختر المادة --</option>
            {subjectsForSelectedGroup.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedGroup ? (
        <p className="empty-state">اختر فوجاً لبدء إدخال النقط.</p>
      ) : !canEnterGrades ? (
        <div className="warning-box">
          لا يمكن إدخال النقط إلا إذا كان الفوج مسنداً إلى المادة المختارة.
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>المتدرب</th>
                <th>C1</th>
                <th>C2</th>
                <th>C3</th>
                <th>EFM</th>
                <th>المعدل النهائي</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.map((student) => {
                const grades = dataService.normalizeGradeRecord(student.grades?.[selectedSubject] || {});
                return (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td><input type="number" className="grade-input" value={grades.cc1} onChange={(event) => updateGrade(student.id, "cc1", event.target.value)} /></td>
                    <td><input type="number" className="grade-input" value={grades.cc2} onChange={(event) => updateGrade(student.id, "cc2", event.target.value)} /></td>
                    <td><input type="number" className="grade-input" value={grades.cc3} onChange={(event) => updateGrade(student.id, "cc3", event.target.value)} /></td>
                    <td><input type="number" className="grade-input" value={grades.efm} onChange={(event) => updateGrade(student.id, "efm", event.target.value)} /></td>
                    <td>{grades.final == null ? "-" : grades.final}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="btn btn-success" onClick={saveGrades}>
            <Save size={18} />
            حفظ النقط
          </button>
        </>
      )}
    </div>
  );

  const renderAttendance = () => (
    <div className="card">
      <h2 className="section-title">تسجيل الحضور</h2>
      <div className="toolbar-grid">
        <div className="form-group">
          <label className="label">الفوج</label>
          <select className="select-input" value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
            <option value="">-- اختر الفوج --</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">التاريخ</label>
          <input type="date" className="select-input" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">الحصة</label>
          <select className="select-input" value={selectedSession} onChange={(event) => setSelectedSession(event.target.value)}>
            <option value={ALL_SESSIONS_VALUE}>جميع الحصص</option>
            {timeSlotOptions.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedGroup ? (
        <p className="empty-state">اختر فوجاً لعرض لائحة الحضور.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>المتدرب</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.map((student) => {
                const isAbsent = attendanceStatus[student.id] === "absent";
                return (
                  <tr key={student.id} style={{ background: isAbsent ? "#fef2f2" : "transparent" }}>
                    <td>{student.name}</td>
                    <td style={{ color: isAbsent ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                      {isAbsent ? "غائب" : "حاضر"}
                    </td>
                    <td>
                      <button
                        className={`btn ${isAbsent ? "btn-success" : "btn-primary"}`}
                        onClick={() =>
                          setAttendanceStatus((prev) => ({
                            ...prev,
                            [student.id]: prev[student.id] === "absent" ? "present" : "absent",
                          }))
                        }
                      >
                        {isAbsent ? "إلغاء الغياب" : "تسجيل غياب"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="btn btn-success" onClick={saveAttendance}>
            <Save size={18} />
            حفظ الحضور
          </button>
        </>
      )}
    </div>
  );

  const lessonGroups = lessonForm.subjectId
    ? availableGroups.filter((group) =>
        (assignedGroupsBySubject[lessonForm.subjectId] || []).includes(String(group.id)),
      )
    : availableGroups;

  const renderLessons = () => (
    <div className="trainer-grid">
      <div className="card">
        <h2 className="section-title">رفع درس PDF</h2>
        <div className="form-group">
          <label className="label">عنوان الدرس</label>
          <input className="select-input" value={lessonForm.title} onChange={(event) => setLessonForm((prev) => ({ ...prev, title: event.target.value }))} />
        </div>
        <div className="form-group">
          <label className="label">المادة</label>
          <select className="select-input" value={lessonForm.subjectId} onChange={(event) => setLessonForm((prev) => ({ ...prev, subjectId: event.target.value }))}>
            <option value="">-- اختر المادة --</option>
            {trainerSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">الفوج المستهدف</label>
          <select className="select-input" value={lessonForm.groupId} onChange={(event) => setLessonForm((prev) => ({ ...prev, groupId: event.target.value }))}>
            <option value="">-- اختر الفوج --</option>
            {lessonGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">ملاحظات</label>
          <textarea className="select-input" rows="4" value={lessonForm.notes} onChange={(event) => setLessonForm((prev) => ({ ...prev, notes: event.target.value }))} />
        </div>
        <div className="form-group">
          <label className="label">ملف PDF</label>
          <input type="file" accept="application/pdf" className="select-input" onChange={handleLessonFile} />
        </div>
        <button className="btn btn-primary" onClick={saveLesson}>
          <Upload size={18} />
          رفع الدرس
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">آخر الدروس المرفوعة</h2>
        {trainerLessons.length === 0 ? (
          <p style={{ color: "#64748b" }}>لم يتم رفع أي درس بعد.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {trainerLessons.slice(0, 6).map((lesson) => (
              <div key={lesson.id} className="news-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <strong>{lesson.title}</strong>
                  <span style={{ color: "#64748b" }}>{formatDate(lesson.date)}</span>
                </div>
                <div style={{ marginTop: "8px", color: "#64748b" }}>
                  الفوج: {groups.find((group) => String(group.id) === String(lesson.groupId))?.name || lesson.groupId}
                </div>
                {lesson.notes ? <p style={{ margin: "8px 0 0", color: "#334155" }}>{lesson.notes}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="trainer-container"><div className="card">جاري تحميل بيانات المكون...</div></div>;
  }

  return (
    <div className="trainer-container">
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={32} color="#3498db" />
          <div>
            <h1>فضاء المكون</h1>
            <span style={{ fontSize: "0.9rem", color: "#777" }}>{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="tab-row">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "home" ? renderHome() : null}
      {activeTab === "grades" ? renderGrades() : null}
      {activeTab === "attendance" ? renderAttendance() : null}
      {activeTab === "lessons" ? renderLessons() : null}
    </div>
  );
}
