import { buildQueryString, requestJson, unwrap } from "./apiClient";
import {
  getTodayIsoDate,
  normalizeAttendance,
  normalizeExercise,
  normalizeGradeRecord,
  normalizeGroup,
  normalizeLesson,
  normalizeStudent,
  normalizeSubject,
  normalizeTimetable,
  sanitizeGradesByStudent,
  sortByDateDesc,
} from "./normalizers";

const SESSION_STORAGE_KEY = "propath.session.v3";

async function uploadAssetFromDataUrl({ entityType, category, entityId, file }) {
  if (!file?.data) return null;

  const payload = await requestJson("/assets", {
    method: "POST",
    body: JSON.stringify({
      entityType,
      category,
      entityId,
      file,
    }),
  });

  return unwrap(payload);
}

async function fetchSettings() {
  return unwrap(await requestJson("/settings"));
}

async function updateSettings(updates) {
  return unwrap(await requestJson("/settings", {
    method: "PATCH",
    body: JSON.stringify(updates),
  }));
}

async function fetchUsers(filters = {}) {
  return unwrap(await requestJson(`/users${buildQueryString(filters)}`));
}

async function fetchTrainers() {
  return unwrap(await requestJson("/trainers"));
}

async function fetchStudents(filters = {}) {
  const students = unwrap(await requestJson(`/students${buildQueryString(filters)}`));
  return (Array.isArray(students) ? students : []).map(normalizeStudent);
}

async function fetchBranches() {
  return unwrap(await requestJson("/branches"));
}

async function fetchGroups(filters = {}) {
  const groups = unwrap(await requestJson(`/groups${buildQueryString(filters)}`));
  return (Array.isArray(groups) ? groups : []).map(normalizeGroup);
}

async function fetchSubjects(filters = {}) {
  const subjects = unwrap(await requestJson(`/subjects${buildQueryString(filters)}`));
  return (Array.isArray(subjects) ? subjects : []).map(normalizeSubject);
}

async function fetchLessons(filters = {}) {
  const lessons = unwrap(await requestJson(`/lessons${buildQueryString(filters)}`));
  return sortByDateDesc((Array.isArray(lessons) ? lessons : []).map(normalizeLesson), "publishedAt");
}

async function fetchExercises(filters = {}) {
  const exercises = unwrap(await requestJson(`/exercises${buildQueryString(filters)}`));
  return (Array.isArray(exercises) ? exercises : [])
    .map(normalizeExercise)
    .sort(
      (left, right) =>
        new Date(left.dueDate || left.createdAt || 0).getTime() -
        new Date(right.dueDate || right.createdAt || 0).getTime(),
    );
}

async function fetchAttendance(filters = {}) {
  const records = unwrap(await requestJson(`/attendance${buildQueryString(filters)}`));
  return (Array.isArray(records) ? records : []).map(normalizeAttendance);
}

async function fetchNews(filters = {}) {
  const news = unwrap(await requestJson(`/news${buildQueryString(filters)}`));
  return sortByDateDesc(Array.isArray(news) ? news : [], "publishedAt");
}

async function fetchNewsForAudience(audience) {
  if (!audience || audience === "all") return fetchNews();
  const news = unwrap(await requestJson(`/news/audience/${audience}`));
  return sortByDateDesc(Array.isArray(news) ? news : [], "publishedAt");
}

async function fetchTimetables(filters = {}) {
  const timetables = unwrap(await requestJson(`/timetables${buildQueryString(filters)}`));
  return sortByDateDesc((Array.isArray(timetables) ? timetables : []).map(normalizeTimetable), "uploadedAt");
}

async function bootstrapAdmin(profile) {
  const payload = await requestJson("/setup", {
    method: "POST",
    body: JSON.stringify({
      ...profile,
      password_confirmation: profile.confirmPassword,
    }),
  });

  return {
    ...payload.data.user,
    token: payload.data.token,
  };
}

async function authenticate({ username, password }) {
  const payload = await requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  return {
    ...payload.data.user,
    token: payload.data.token,
  };
}

async function createUser(payload) {
  return unwrap(await requestJson("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

async function updateUser(userId, updates) {
  return unwrap(await requestJson(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  }));
}

async function deleteUser(userId) {
  await requestJson(`/users/${userId}`, { method: "DELETE" });
  return fetchUsers();
}

async function createBranch(payload) {
  return unwrap(await requestJson("/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

async function updateBranch(branchId, updates) {
  return unwrap(await requestJson(`/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  }));
}

async function deleteBranch(branchId) {
  await requestJson(`/branches/${branchId}`, { method: "DELETE" });
  return fetchBranches();
}

async function createGroup(payload) {
  return normalizeGroup(unwrap(await requestJson("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  })));
}

async function updateGroup(groupId, updates) {
  return normalizeGroup(unwrap(await requestJson(`/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })));
}

async function deleteGroup(groupId) {
  await requestJson(`/groups/${groupId}`, { method: "DELETE" });
  return fetchGroups();
}

async function createSubject(payload) {
  return normalizeSubject(unwrap(await requestJson("/subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  })));
}

async function updateSubject(subjectId, updates) {
  return normalizeSubject(unwrap(await requestJson(`/subjects/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })));
}

async function deleteSubject(subjectId) {
  await requestJson(`/subjects/${subjectId}`, { method: "DELETE" });
  return fetchSubjects();
}

async function createLesson(payload) {
  const asset = await uploadAssetFromDataUrl({
    entityType: "lesson",
    category: "lesson",
    file: payload.file,
  });

  const lesson = unwrap(await requestJson("/lessons", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      notes: payload.notes,
      subjectId: payload.subjectId,
      groupId: payload.groupId,
      assetId: asset?.id || null,
    }),
  }));

  return normalizeLesson(lesson);
}

async function updateLesson(lessonId, updates) {
  return normalizeLesson(unwrap(await requestJson(`/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })));
}

async function deleteLesson(lessonId) {
  await requestJson(`/lessons/${lessonId}`, { method: "DELETE" });
  return fetchLessons();
}

async function createExercise(payload) {
  const asset = payload.attachment?.data
    ? await uploadAssetFromDataUrl({
        entityType: "exercise",
        category: "exercise",
        file: payload.attachment,
      })
    : null;

  const exercise = unwrap(await requestJson("/exercises", {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      subjectId: payload.subjectId,
      groupId: payload.groupId,
      assetId: asset?.id || null,
    }),
  }));

  return normalizeExercise(exercise);
}

async function updateExercise(exerciseId, updates) {
  return normalizeExercise(unwrap(await requestJson(`/exercises/${exerciseId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })));
}

async function deleteExercise(exerciseId) {
  await requestJson(`/exercises/${exerciseId}`, { method: "DELETE" });
  return fetchExercises();
}

async function createNews(payload) {
  return unwrap(await requestJson("/news", {
    method: "POST",
    body: JSON.stringify(payload),
  }));
}

async function updateNews(newsId, updates) {
  return unwrap(await requestJson(`/news/${newsId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  }));
}

async function deleteNews(newsId) {
  await requestJson(`/news/${newsId}`, { method: "DELETE" });
  return fetchNews();
}

async function createTimetable(payload) {
  return normalizeTimetable(unwrap(await requestJson("/timetables", {
    method: "POST",
    body: JSON.stringify(payload),
  })));
}

async function deleteTimetable(timetableId) {
  await requestJson(`/timetables/${timetableId}`, { method: "DELETE" });
  return fetchTimetables();
}

async function saveAttendanceBatch({ groupId, date, sessionId, statuses, subjectId, recordedBy }) {
  const records = unwrap(await requestJson("/attendance/batch", {
    method: "POST",
    body: JSON.stringify({
      groupId,
      date,
      sessionId,
      statuses,
      subjectId,
      recordedBy,
    }),
  }));

  return (Array.isArray(records) ? records : []).map(normalizeAttendance);
}

async function saveGrades({ subjectId, gradesByStudent }) {
  const sanitizedGradesByStudent = sanitizeGradesByStudent(gradesByStudent);

  if (!subjectId) {
    throw new Error("Subject is required to save grades.");
  }

  if (Object.keys(sanitizedGradesByStudent).length === 0) {
    throw new Error("Enter at least one grade before saving.");
  }

  return unwrap(await requestJson("/students/grades", {
    method: "POST",
    body: JSON.stringify({
      subjectId,
      gradesByStudent: sanitizedGradesByStudent,
    }),
  }));
}

async function getStudentRecordForUser() {
  return normalizeStudent(unwrap(await requestJson("/students/me")));
}

async function getTrainerSubjects() {
  const subjects = unwrap(await requestJson("/trainers/me/subjects"));
  return (Array.isArray(subjects) ? subjects : []).map(normalizeSubject);
}

async function getTrainerGroups() {
  const groups = unwrap(await requestJson("/trainers/me/groups"));
  return (Array.isArray(groups) ? groups : []).map(normalizeGroup);
}

async function getStudentsByGroup(groupId) {
  return fetchStudents({ groupId });
}

async function fetchAdminDashboard() {
  return unwrap(await requestJson("/dashboard/admin"));
}

async function fetchTrainerDashboard() {
  return unwrap(await requestJson("/dashboard/trainer"));
}

async function fetchStudentDashboard() {
  return unwrap(await requestJson("/dashboard/student"));
}

async function fetchBootState() {
  const payload = await requestJson("/boot");
  return {
    settings: payload.data.settings,
    isConfigured: payload.data.isConfigured,
    user: payload.data.user,
  };
}

async function getAbsenceReport(groupId, filters = {}) {
  return unwrap(await requestJson(`/admin/absence-report/${groupId}${buildQueryString(filters)}`));
}

async function fetchTimeSlots() {
  return (await fetchSettings()).timeSlots || [];
}

async function saveAttendances(records) {
  const grouped = records.reduce((accumulator, record) => {
    const key = `${record.groupId || record.group}_${record.date}_${record.sessionId || record.session}`;
    if (!accumulator[key]) {
      accumulator[key] = {
        groupId: record.groupId || record.group,
        date: record.date,
        sessionId: record.sessionId || record.session,
        subjectId: record.subjectId || "",
        recordedBy: record.recordedBy || "",
        statuses: {},
      };
    }
    accumulator[key].statuses[record.studentId] = record.status;
    return accumulator;
  }, {});

  await Promise.all(Object.values(grouped).map((payload) => saveAttendanceBatch(payload)));
  return fetchAttendance();
}

async function saveStudents(students) {
  const gradeMap = {};
  students.forEach((student) => {
    Object.entries(student.grades || {}).forEach(([subjectId, grades]) => {
      if (!gradeMap[subjectId]) gradeMap[subjectId] = {};
      gradeMap[subjectId][student.id] = grades;
    });
  });

  await Promise.all(
    Object.entries(gradeMap).map(([subjectId, gradesByStudent]) =>
      saveGrades({ subjectId, gradesByStudent }),
    ),
  );
  return fetchStudents();
}

async function __unsafeReset() {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

const dataService = {
  getTodayIsoDate,
  normalizeGradeRecord,
  fetchBootState,
  fetchAdminDashboard,
  fetchTrainerDashboard,
  fetchStudentDashboard,
  bootstrapAdmin,
  authenticate,
  fetchSettings,
  updateSettings,
  fetchUsers,
  fetchTrainers,
  fetchStudents,
  fetchBranches,
  fetchGroups,
  fetchSubjects,
  fetchLessons,
  fetchExercises,
  fetchAttendance,
  fetchNews,
  fetchNewsForAudience,
  fetchTimetables,
  createUser,
  updateUser,
  deleteUser,
  createBranch,
  updateBranch,
  deleteBranch,
  createGroup,
  updateGroup,
  deleteGroup,
  createSubject,
  updateSubject,
  deleteSubject,
  createLesson,
  updateLesson,
  deleteLesson,
  createExercise,
  updateExercise,
  deleteExercise,
  createNews,
  updateNews,
  deleteNews,
  createTimetable,
  deleteTimetable,
  saveAttendanceBatch,
  saveGrades,
  getStudentRecordForUser,
  getTrainerSubjects,
  getTrainerGroups,
  getStudentsByGroup,
  getAbsenceReport,
  fetchTimeSlots,
  saveAttendances,
  saveStudents,
  __unsafeReset,
};

export default dataService;
