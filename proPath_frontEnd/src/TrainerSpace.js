import React from "react";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Download,
  FilePlus2,
  LayoutGrid,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import dataService from "./dataService";
import { useTrainerWorkspace } from "./features/trainer/useTrainerWorkspace";
import { downloadFile, formatDate, getDownloadUrl, getFileName, getFileUrl } from "./appUtils";
import { EmptyState, ErrorBlock, FeedbackMessage, LoadingBlock, StatCard } from "./shared";
import "./TrainerSpace.css";

const TABS = [
  { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
  { id: "grades", label: "النقط", icon: ClipboardList },
  { id: "attendance", label: "الحضور", icon: CheckSquare },
  { id: "lessons", label: "الدروس", icon: Upload },
  { id: "exercises", label: "التمارين", icon: FilePlus2 },
];

function TrainerSpace({ user }) {
  const {
    activeTab,
    setActiveTab,
    workspace,
    loading,
    error,
    feedback,
    setFeedback,
    summary,
    summaryLoading,
    selectedGroupId,
    setSelectedGroupId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedDate,
    setSelectedDate,
    selectedSessionId,
    setSelectedSessionId,
    gradeDraft,
    setGradeDraft,
    attendanceDraft,
    setAttendanceDraft,
    lessonForm,
    setLessonForm,
    exerciseForm,
    setExerciseForm,
    groupStudents,
    availableSubjects,
    personalTimetable,
    loadWorkspace,
    saveGrades,
    saveAttendance,
    handleFileInput,
    publishLesson,
    publishExercise,
    removeLesson,
    removeExercise,
  } = useTrainerWorkspace(user);

  if (loading) {
    return (
      <div className="trainer-container">
        <LoadingBlock label="جاري تحميل فضاء المكوّن..." />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="trainer-container">
        <ErrorBlock message={error || "تعذر تحميل البيانات."} onAction={loadWorkspace} />
      </div>
    );
  }

  return (
    <div className="trainer-container">
      <FeedbackMessage feedback={feedback} onClose={() => setFeedback(null)} />

      <header className="trainer-hero">
        <div>
          <h1>فضاء المكوّن</h1>
          <p>{user?.name}</p>
        </div>
        <div className="trainer-hero__stats">
          <span>{summary?.assignedSubjectsCount || (workspace.subjects || []).length} مادة</span>
          <span>{summary?.assignedGroupsCount || (workspace.groups || []).length} فوج</span>
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

      {activeTab === "overview" ? (
        <div className="trainer-grid">
          <div className="panel-card">
            <h2>الملخص</h2>
            {summaryLoading ? (
              <LoadingBlock label="جاري تحميل الملخص..." />
            ) : (
              <div className="stats-grid stats-grid-wide">
                <StatCard title="الأفواج المسندة" value={summary?.assignedGroupsCount ?? (workspace.groups || []).length} accent="blue" icon={CalendarDays} />
                <StatCard title="المواد المسندة" value={summary?.assignedSubjectsCount ?? (workspace.subjects || []).length} accent="teal" icon={BookOpen} />
                <StatCard title="الدروس المنشورة" value={summary?.lessonsPublishedCount ?? (workspace.lessons || []).length} accent="indigo" icon={Upload} />
                <StatCard title="التمارين المنشورة" value={summary?.exercisesPublishedCount ?? (workspace.exercises || []).length} accent="amber" icon={FilePlus2} />
              </div>
            )}
          </div>

          <div className="panel-card">
            <h2>إعلانات الإدارة</h2>
            {workspace.news.length === 0 ? (
              <EmptyState title="لا توجد إعلانات" description="سيظهر هنا كل جديد موجّه للمكوّنين." />
            ) : (
              <div className="stack-list">
                {workspace.news.slice(0, 5).map((item) => (
                  <div key={item.id} className="announcement-card">
                    <div className="announcement-card__row">
                      <strong>{item.title}</strong>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-card">
            <h2>جدولي الشخصي</h2>
            {!personalTimetable ? (
              <EmptyState title="لا يوجد جدول منشور" description="سيظهر الجدول هنا فور رفعه من فضاء الإدارة." />
            ) : (
              <div className="timetable-preview-container">
                <div className="image-preview image-preview--contained">
                  <img src={personalTimetable.image?.data} alt="Trainer timetable" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <a
                    className="button button--ghost"
                    href={personalTimetable.image?.data}
                    target="_blank" rel="noreferrer"
                  >
                    <BookOpen size={16} />
                    عرض
                  </a>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => downloadFile(personalTimetable.image?.downloadUrl || personalTimetable.image?.data, personalTimetable.image?.name || "timetable.png")}
                  >
                    <Download size={16} />
                    تحميل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "grades" ? (
        <div className="panel-card">
          <div className="toolbar-grid">
            <label className="field">
              <span>الفوج</span>
              <select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
                <option value="">اختر فوجاً</option>
                {workspace.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>المادة</span>
              <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)}>
                <option value="">اختر مادة</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!selectedGroupId || !selectedSubjectId ? (
            <EmptyState title="اختر فوجاً ومادة" description="بعد اختيار الفوج والمادة ستظهر لائحة المتدربين." />
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
                    <th>المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.map((student) => {
                    const grades = gradeDraft[student.id] || dataService.normalizeGradeRecord({});
                    return (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        {["cc1", "cc2", "cc3", "efm"].map((field) => (
                          <td key={field}>
                            <input
                              className="grade-input"
                              type="number"
                              min="0"
                              max={field === "efm" ? 40 : 20}
                              placeholder={field === "cc2" || field === "cc3" ? "اختياري" : ""}
                              value={grades[field]}
                              onChange={(event) =>
                                setGradeDraft((previous) => ({
                                  ...previous,
                                  [student.id]: dataService.normalizeGradeRecord({
                                    ...(previous[student.id] || {}),
                                    [field]: event.target.value,
                                  }),
                                }))
                              }
                            />
                          </td>
                        ))}
                        <td>{grades.final ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button type="button" className="button button--primary" onClick={saveGrades}>
                <Save size={16} />
                حفظ النقط
              </button>
            </>
          )}
        </div>
      ) : null}

      {activeTab === "attendance" ? (
        <div className="panel-card">
          <div className="toolbar-grid">
            <label className="field">
              <span>الفوج</span>
              <select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
                <option value="">اختر فوجاً</option>
                {workspace.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>الحصة</span>
              <select value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)}>
                {workspace.settings.timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name} ({slot.startTime} - {slot.endTime})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>التاريخ</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
          </div>

          {!selectedGroupId ? (
            <EmptyState title="اختر فوجاً" description="حدد الفوج أولاً لتسجيل الحضور." />
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المتدرب</th>
                    <th>الحالة</th>
                    <th>التبديل</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.map((student) => {
                    const isAbsent = attendanceDraft[student.id] === "absent";
                    return (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>
                          <span className={`status-pill ${isAbsent ? "status-pill--danger" : "status-pill--success"}`}>
                            {isAbsent ? "غائب" : "حاضر"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`button ${isAbsent ? "button--ghost" : "button--primary"}`}
                            onClick={() =>
                              setAttendanceDraft((previous) => ({
                                ...previous,
                                [student.id]: previous[student.id] === "absent" ? "present" : "absent",
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
              <button type="button" className="button button--primary" onClick={saveAttendance}>
                <Save size={16} />
                حفظ الحضور
              </button>
            </>
          )}
        </div>
      ) : null}

      {activeTab === "lessons" ? (
        <div className="trainer-grid">
          <div className="panel-card">
            <h2>نشر درس</h2>
            <div className="form-grid">
              <label className="field field--full">
                <span>العنوان</span>
                <input value={lessonForm.title} onChange={(event) => setLessonForm((previous) => ({ ...previous, title: event.target.value }))} />
              </label>
              <label className="field">
                <span>الفوج</span>
                <select value={lessonForm.groupId} onChange={(event) => setLessonForm((previous) => ({ ...previous, groupId: event.target.value }))}>
                  {workspace.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>المادة</span>
                <select value={lessonForm.subjectId} onChange={(event) => setLessonForm((previous) => ({ ...previous, subjectId: event.target.value }))}>
                  {workspace.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field--full">
                <span>ملاحظات</span>
                <textarea rows={4} value={lessonForm.notes} onChange={(event) => setLessonForm((previous) => ({ ...previous, notes: event.target.value }))} />
              </label>
              <label className="field field--full">
                <span>ملف PDF</span>
                <input type="file" accept="application/pdf" onChange={(event) => handleFileInput(event, setLessonForm)} />
              </label>
            </div>
            <button type="button" className="button button--primary" onClick={publishLesson}>
              <Upload size={16} />
              نشر الدرس
            </button>
          </div>

          <div className="panel-card">
            <h2>الدروس المنشورة</h2>
            {(workspace.lessons || []).length === 0 ? (
              <EmptyState title="لا توجد دروس" description="ارفع أول درس ليظهر هنا." />
            ) : (
              <div className="stack-list">
                {(workspace.lessons || []).map((lesson) => (
                  <div key={lesson.id} className="resource-card">
                    <div className="announcement-card__row">
                      <div>
                        <strong>{lesson.title}</strong>
                        <small>{lesson.subjectName} · {lesson.groupName}</small>
                      </div>
                      <div className="actions-cell">
                        <a
                          className="button button--ghost"
                          href={getFileUrl(lesson)}
                          target="_blank" rel="noreferrer"
                        >
                          <BookOpen size={16} />
                          عرض
                        </a>
                        <button
                          type="button"
                          className="button button--primary"
                          onClick={() => downloadFile(getDownloadUrl(lesson), getFileName(lesson, "lesson.pdf"))}
                        >
                          <Download size={16} />
                          تحميل
                        </button>
                        <button type="button" className="button button--ghost button--danger" onClick={() => removeLesson(lesson)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p>{lesson.notes || "بدون ملاحظات إضافية."}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "exercises" ? (
        <div className="trainer-grid">
          <div className="panel-card">
            <h2>نشر تمرين</h2>
            <div className="form-grid">
              <label className="field field--full">
                <span>العنوان</span>
                <input value={exerciseForm.title} onChange={(event) => setExerciseForm((previous) => ({ ...previous, title: event.target.value }))} />
              </label>
              <label className="field">
                <span>الفوج</span>
                <select value={exerciseForm.groupId} onChange={(event) => setExerciseForm((previous) => ({ ...previous, groupId: event.target.value }))}>
                  {workspace.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>المادة</span>
                <select value={exerciseForm.subjectId} onChange={(event) => setExerciseForm((previous) => ({ ...previous, subjectId: event.target.value }))}>
                  {workspace.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>آخر أجل</span>
                <input type="date" value={exerciseForm.dueDate} onChange={(event) => setExerciseForm((previous) => ({ ...previous, dueDate: event.target.value }))} />
              </label>
              <label className="field field--full">
                <span>الوصف</span>
                <textarea rows={4} value={exerciseForm.description} onChange={(event) => setExerciseForm((previous) => ({ ...previous, description: event.target.value }))} />
              </label>
              <label className="field field--full">
                <span>ملف مرفق</span>
                <input type="file" accept="application/pdf" onChange={(event) => handleFileInput(event, setExerciseForm)} />
              </label>
            </div>
            <button type="button" className="button button--primary" onClick={publishExercise}>
              <Upload size={16} />
              نشر التمرين
            </button>
          </div>

          <div className="panel-card">
            <h2>التمارين المنشورة</h2>
            {(workspace.exercises || []).length === 0 ? (
              <EmptyState title="لا توجد تمارين" description="انشر أول تمرين لطلابك." />
            ) : (
              <div className="stack-list">
                {(workspace.exercises || []).map((exercise) => (
                  <div key={exercise.id} className="resource-card">
                    <div className="announcement-card__row">
                      <div>
                        <strong>{exercise.title}</strong>
                        <small>
                          {exercise.subjectName} · {exercise.groupName}
                          {exercise.dueDate ? ` · ${formatDate(exercise.dueDate)}` : ""}
                        </small>
                      </div>
                      <div className="actions-cell">
                        {getFileUrl(exercise) ? (
                          <>
                            <a className="button button--ghost" href={getFileUrl(exercise)} target="_blank" rel="noreferrer">
                              <BookOpen size={16} />
                              عرض
                            </a>
                            <button type="button" className="button button--primary" onClick={() => downloadFile(getDownloadUrl(exercise), getFileName(exercise, "exercise.pdf"))}>
                              <Download size={16} />
                              تحميل
                            </button>
                          </>
                        ) : null}
                        <button type="button" className="button button--ghost button--danger" onClick={() => removeExercise(exercise)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p>{exercise.description || "بدون وصف إضافي."}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}


export default TrainerSpace;
