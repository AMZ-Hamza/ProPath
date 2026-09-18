import { useCallback, useEffect, useMemo, useState } from "react";
import dataService from "../../dataService";
import { useDashboardData } from "../../hooks/useDashboardData";
import { readFileAsDataUrl } from "../../appUtils";

export function useTrainerWorkspace(user) {

  const [activeTab, setActiveTab] = useState("overview");
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const { data: summary, loading: summaryLoading } = useDashboardData("trainer");

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(dataService.getTodayIsoDate());
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [gradeDraft, setGradeDraft] = useState({});
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [lessonForm, setLessonForm] = useState({
    title: "",
    notes: "",
    subjectId: "",
    groupId: "",
    fileName: "",
    fileData: "",
  });
  const [exerciseForm, setExerciseForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    subjectId: "",
    groupId: "",
    fileName: "",
    fileData: "",
  });

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Prioritize news, subjects, groups and settings
      const results = await Promise.allSettled([
        dataService.getTrainerSubjects(),
        dataService.getTrainerGroups(),
        dataService.fetchNewsForAudience("trainers"),
        dataService.fetchSettings(),
      ]);

      const [subjectsRes, groupsRes, newsRes, settingsRes] = results;

      setWorkspace({
        subjects: subjectsRes.status === "fulfilled" ? subjectsRes.value : [],
        groups: groupsRes.status === "fulfilled" ? groupsRes.value : [],
        news: newsRes.status === "fulfilled" ? newsRes.value : [],
        settings: settingsRes.status === "fulfilled" ? settingsRes.value : { timeSlots: [] },
        students: null,
        timetables: null,
        lessons: null,
        exercises: null,
        attendance: null,
      });
    } catch (loadError) {
      setError(loadError.message || "تعذر تحميل فضاء المكوّن.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Lazy loading logic for other data
  useEffect(() => {
    if (!workspace) return;

    const fetchAdditionalData = async () => {
      try {
        if (activeTab === "overview") {
          const requests = [];
          if (workspace.timetables === null) requests.push(dataService.fetchTimetables({ targetType: "trainer" }));
          if (workspace.lessons === null) requests.push(dataService.fetchLessons({ trainerId: user.id }));
          if (workspace.exercises === null) requests.push(dataService.fetchExercises({ trainerId: user.id }));

          if (requests.length > 0) {
            const results = await Promise.all(requests);
            setWorkspace((prev) => {
              const updates = {};
              let resIdx = 0;
              if (prev.timetables === null) updates.timetables = results[resIdx++];
              if (prev.lessons === null) updates.lessons = results[resIdx++];
              if (prev.exercises === null) updates.exercises = results[resIdx++];
              return { ...prev, ...updates };
            });
          }
        } else if (activeTab === "grades" && workspace.students === null) {
          const students = await dataService.fetchStudents();
          setWorkspace((prev) => ({ ...prev, students }));
        } else if (activeTab === "attendance") {
          const requests = [];
          if (workspace.students === null) requests.push(dataService.fetchStudents());

          if (requests.length > 0) {
            const results = await Promise.all(requests);
            setWorkspace((prev) => {
              const updates = {};
              let resIdx = 0;
              if (prev.students === null) updates.students = results[resIdx++];
              return { ...prev, ...updates };
            });
          }
        } else if (activeTab === "lessons" && workspace.lessons === null) {
          const lessons = await dataService.fetchLessons({ trainerId: user.id });
          setWorkspace((prev) => ({ ...prev, lessons }));
        } else if (activeTab === "exercises" && workspace.exercises === null) {
          const exercises = await dataService.fetchExercises({ trainerId: user.id });
          setWorkspace((prev) => ({ ...prev, exercises }));
        }
      } catch (err) {
        console.error("Lazy loading failed:", err);
      }
    };

    fetchAdditionalData();
  }, [activeTab, workspace, user.id]);

  const groupStudents = useMemo(() => {
    if (!workspace) return [];
    return (workspace.students || []).filter(
      (student) => String(student.groupId) === String(selectedGroupId),
    );
  }, [workspace, selectedGroupId]);

  const availableSubjects = useMemo(() => {
    if (!workspace) return [];
    return workspace.subjects.filter((subject) =>
      (subject.groupIds || []).includes(String(selectedGroupId)),
    );
  }, [workspace, selectedGroupId]);

  const personalTimetable = useMemo(() => {
    if (!workspace) return null;
    return (workspace.timetables || []).find(
      (item) =>
        item.targetType === "trainer" && String(item.targetId) === String(user.id),
    );
  }, [workspace, user.id]);

  useEffect(() => {
    if (!workspace) return;

    if (!workspace.groups.some((group) => String(group.id) === String(selectedGroupId))) {
      setSelectedGroupId(workspace.groups[0]?.id || "");
    }
  }, [workspace, selectedGroupId]);

  useEffect(() => {
    if (!availableSubjects.some((subject) => String(subject.id) === String(selectedSubjectId))) {
      setSelectedSubjectId(availableSubjects[0]?.id || "");
    }
  }, [availableSubjects, selectedSubjectId]);

  useEffect(() => {
    if (!workspace) return;
    if (!selectedSessionId) {
      setSelectedSessionId(workspace.settings.timeSlots[0]?.id || "");
    }
  }, [workspace, selectedSessionId]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setGradeDraft({});
      return;
    }

    setGradeDraft(
      Object.fromEntries(
        groupStudents.map((student) => [
          student.id,
          dataService.normalizeGradeRecord(student.grades?.[selectedSubjectId] || {}),
        ]),
      ),
    );
  }, [groupStudents, selectedSubjectId]);

  // Fetch attendance records based on current filters
  useEffect(() => {
    if (activeTab !== "attendance" || !selectedGroupId || !selectedDate || !selectedSessionId) {
      return;
    }

    const fetchFilteredAttendance = async () => {
      try {
        const results = await dataService.fetchAttendance({
          groupId: selectedGroupId,
          date: selectedDate,
          sessionId: selectedSessionId,
        });

        setWorkspace((prev) => {
          if (!prev) return prev;
          // Merge new records with existing ones, replacing duplicates
          const otherRecords = (prev.attendance || []).filter(
            (r) =>
              !(
                String(r.groupId) === String(selectedGroupId) &&
                String(r.date) === String(selectedDate) &&
                String(r.sessionId) === String(selectedSessionId)
              ),
          );
          return { ...prev, attendance: [...otherRecords, ...results] };
        });
      } catch (err) {
        console.error("Failed to fetch filtered attendance:", err);
      }
    };

    fetchFilteredAttendance();
  }, [activeTab, selectedGroupId, selectedDate, selectedSessionId]);

  useEffect(() => {
    if (!workspace || !selectedGroupId || !selectedSessionId) {
      setAttendanceDraft({});
      return;
    }

    const nextDraft = {};
    groupStudents.forEach((student) => {
      const record = (workspace.attendance || []).find(
        (item) =>
          String(item.studentId) === String(student.id) &&
          String(item.groupId) === String(selectedGroupId) &&
          String(item.date) === String(selectedDate) &&
          String(item.sessionId) === String(selectedSessionId),
      );
      nextDraft[student.id] = record?.status || "present";
    });
    setAttendanceDraft(nextDraft);
  }, [groupStudents, selectedDate, selectedGroupId, selectedSessionId, workspace]);

  useEffect(() => {
    if (!workspace) return;
    setLessonForm((previous) => ({
      ...previous,
      groupId: previous.groupId || workspace.groups[0]?.id || "",
      subjectId: previous.subjectId || workspace.subjects[0]?.id || "",
    }));
    setExerciseForm((previous) => ({
      ...previous,
      groupId: previous.groupId || workspace.groups[0]?.id || "",
      subjectId: previous.subjectId || workspace.subjects[0]?.id || "",
    }));
  }, [workspace]);

  const saveGrades = async () => {
    try {
      await dataService.saveGrades({
        subjectId: selectedSubjectId,
        gradesByStudent: gradeDraft,
      });
      setFeedback({ type: "success", message: "تم حفظ النقط." });
      await loadWorkspace();
    } catch (saveError) {
      setFeedback({ type: "error", message: saveError.message });
    }
  };

  const saveAttendance = async () => {
    try {
      await dataService.saveAttendanceBatch({
        groupId: selectedGroupId,
        date: selectedDate,
        sessionId: selectedSessionId,
        statuses: attendanceDraft,
        subjectId: selectedSubjectId,
        recordedBy: user.id,
      });
      setFeedback({ type: "success", message: "تم حفظ الحضور." });
      await loadWorkspace();
    } catch (saveError) {
      setFeedback({ type: "error", message: saveError.message });
    }
  };

  const handleFileInput = async (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setter((previous) => ({
        ...previous,
        fileName: file.name,
        fileData: dataUrl,
      }));
    } catch {
      setFeedback({ type: "error", message: "تعذر قراءة الملف المحدد." });
    }
  };

  const publishLesson = async () => {
    try {
      await dataService.createLesson({
        title: lessonForm.title,
        notes: lessonForm.notes,
        subjectId: lessonForm.subjectId,
        groupId: lessonForm.groupId,
        trainerId: user.id,
        file: { name: lessonForm.fileName || "lesson.pdf", data: lessonForm.fileData },
      });
      setLessonForm((previous) => ({
        ...previous,
        title: "",
        notes: "",
        fileName: "",
        fileData: "",
      }));
      setFeedback({ type: "success", message: "تم نشر الدرس." });
      await loadWorkspace();
    } catch (publishError) {
      setFeedback({ type: "error", message: publishError.message });
    }
  };

  const publishExercise = async () => {
    try {
      await dataService.createExercise({
        title: exerciseForm.title,
        description: exerciseForm.description,
        dueDate: exerciseForm.dueDate,
        subjectId: exerciseForm.subjectId,
        groupId: exerciseForm.groupId,
        trainerId: user.id,
        attachment: exerciseForm.fileData
          ? { name: exerciseForm.fileName || "exercise.pdf", data: exerciseForm.fileData }
          : null,
      });
      setExerciseForm((previous) => ({
        ...previous,
        title: "",
        description: "",
        dueDate: "",
        fileName: "",
        fileData: "",
      }));
      setFeedback({ type: "success", message: "تم نشر التمرين." });
      await loadWorkspace();
    } catch (publishError) {
      setFeedback({ type: "error", message: publishError.message });
    }
  };

  const removeLesson = async (lesson) => {
    if (!window.confirm(`حذف الدرس ${lesson.title}؟`)) return;
    try {
      await dataService.deleteLesson(lesson.id);
      setFeedback({ type: "success", message: "تم حذف الدرس." });
      await loadWorkspace();
    } catch (deleteError) {
      setFeedback({ type: "error", message: deleteError.message });
    }
  };

  const removeExercise = async (exercise) => {
    if (!window.confirm(`حذف التمرين ${exercise.title}؟`)) return;
    try {
      await dataService.deleteExercise(exercise.id);
      setFeedback({ type: "success", message: "تم حذف التمرين." });
      await loadWorkspace();
    } catch (deleteError) {
      setFeedback({ type: "error", message: deleteError.message });
    }
  };

  return {
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
  };
}
