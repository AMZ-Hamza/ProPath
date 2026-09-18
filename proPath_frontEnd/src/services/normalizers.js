export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function safeNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function normalizeGradeRecord(grades = {}) {
  return {
    cc1: grades.cc1 ?? "",
    cc2: grades.cc2 ?? "",
    cc3: grades.cc3 ?? "",
    efm: grades.efm ?? "",
    final: grades.final ?? grades.finalGrade ?? null,
  };
}

export function sanitizeGradesByStudent(gradesByStudent = {}) {
  const entries = Object.entries(gradesByStudent).map(([studentId, grades]) => [
    studentId,
    {
      cc1: safeNumber(grades?.cc1),
      cc2: safeNumber(grades?.cc2),
      cc3: safeNumber(grades?.cc3),
      efm: safeNumber(grades?.efm),
    },
  ]);

  return Object.fromEntries(
    entries.filter(([, grades]) =>
      Object.values(grades).some((value) => value != null),
    ),
  );
}

export function sortByDateDesc(list, fieldName) {
  return [...list].sort((left, right) => {
    const leftValue = new Date(left?.[fieldName] || 0).getTime();
    const rightValue = new Date(right?.[fieldName] || 0).getTime();
    return rightValue - leftValue;
  });
}

export function normalizeAsset(asset = null) {
  if (!asset) return null;

  return {
    id: asset.id || "",
    name: asset.fileName || asset.name || "file",
    mimeType: asset.mimeType || "",
    sizeBytes: asset.sizeBytes || 0,
    downloadUrl: asset.downloadUrl || "",
    storagePath: asset.storagePath || "",
    data: asset.data || "",
  };
}

export function normalizeStudent(student = {}) {
  return {
    id: String(student.id || ""),
    userId: String(student.userId || student.user?.id || ""),
    name: String(student.name || student.user?.name || "").trim(),
    email: String(student.email || student.user?.email || "").trim(),
    username: String(student.username || student.user?.username || "").trim(),
    enrollmentNumber: String(student.enrollmentNumber || "").trim(),
    branchId: String(student.branchId || ""),
    branchName: student.branchName || "",
    groupId: String(student.groupId || ""),
    groupName: student.groupName || "",
    notes: String(student.notes || "").trim(),
    grades: student.grades || {},
    gradeSummary: student.gradeSummary || null,
    absenceCount: Number(student.absenceCount || 0),
    createdAt: student.createdAt || "",
    updatedAt: student.updatedAt || student.createdAt || "",
  };
}

export function normalizeSubject(subject = {}) {
  return {
    id: String(subject.id || ""),
    name: String(subject.name || "").trim(),
    code: String(subject.code || "").trim(),
    description: String(subject.description || "").trim(),
    coefficient: safeNumber(subject.coefficient) ?? 1,
    trainerId: String(subject.trainerId || subject.trainerUserId || ""),
    trainerName: subject.trainerName || "",
    groupIds: Array.isArray(subject.groupIds)
      ? subject.groupIds.map(String)
      : Array.isArray(subject.groups)
        ? subject.groups.map((group) => String(typeof group === "object" ? group.id : group))
        : [],
    groupNames: subject.groupNames || [],
    createdAt: subject.createdAt || "",
  };
}

export function normalizeGroup(group = {}) {
  return {
    id: String(group.id || ""),
    name: String(group.name || "").trim(),
    branchId: String(group.branchId || ""),
    branchName: group.branchName || "",
    year: group.year || "",
    capacity: group.capacity || "",
    description: String(group.description || "").trim(),
    studentCount: Number(group.studentCount || 0),
    createdAt: group.createdAt || "",
  };
}

export function normalizeLesson(lesson = {}) {
  return {
    id: lesson.id || "",
    title: String(lesson.title || "").trim(),
    notes: String(lesson.notes || "").trim(),
    subjectId: String(lesson.subjectId || ""),
    subjectName: lesson.subjectName || "",
    groupId: String(lesson.groupId || ""),
    groupName: lesson.groupName || "",
    trainerId: String(lesson.trainerId || lesson.trainerUserId || ""),
    trainerName: lesson.trainerName || "",
    assetId: lesson.assetId || "",
    file: normalizeAsset(lesson.file || lesson.asset),
    publishedAt: lesson.publishedAt || "",
    updatedAt: lesson.updatedAt || lesson.publishedAt || "",
  };
}

export function normalizeExercise(exercise = {}) {
  return {
    id: exercise.id || "",
    title: String(exercise.title || "").trim(),
    description: String(exercise.description || "").trim(),
    dueDate: exercise.dueDate || "",
    subjectId: String(exercise.subjectId || ""),
    subjectName: exercise.subjectName || "",
    groupId: String(exercise.groupId || ""),
    groupName: exercise.groupName || "",
    trainerId: String(exercise.trainerId || exercise.trainerUserId || ""),
    trainerName: exercise.trainerName || "",
    assetId: exercise.assetId || "",
    attachment: normalizeAsset(exercise.attachment || exercise.asset),
    createdAt: exercise.createdAt || "",
    updatedAt: exercise.updatedAt || exercise.createdAt || "",
  };
}

export function normalizeTimetable(item = {}) {
  return {
    id: item.id || "",
    targetType: item.targetType || "group",
    targetId: String(item.targetId || item.targetGroupId || item.targetTrainerUserId || ""),
    targetGroupId: item.targetGroupId || null,
    targetTrainerUserId: item.targetTrainerUserId || null,
    groupName: item.groupName || "",
    image: normalizeAsset(item.image || item.asset),
    assetId: item.assetId || "",
    uploadedAt: item.uploadedAt || "",
    isActive: item.isActive !== false,
  };
}

export function normalizeAttendance(record = {}) {
  return {
    id: record.id || "",
    studentId: String(record.studentId || ""),
    studentName: record.studentName || "",
    groupId: String(record.groupId || ""),
    groupName: record.groupName || "",
    subjectId: String(record.subjectId || ""),
    subjectName: record.subjectName || "",
    date: record.attendanceDate || record.date || getTodayIsoDate(),
    sessionId: record.sessionSlotId || record.sessionId || "",
    status: record.status === "absent" ? "absent" : "present",
    recordedBy: record.recordedByUserId || record.recordedBy || "",
    createdAt: record.createdAt || "",
  };
}
