const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const LOCAL_DB_KEY = "propath_local_db_v2";
const LOCAL_ASSET_DB_NAME = "propath_local_assets_v1";
const LOCAL_ASSET_STORE_NAME = "assets";
const LARGE_STORAGE_THRESHOLD = 150 * 1024;
const DEFAULT_TIME_SLOTS = [
  { id: "s1", label: "الحصة الأولى (08:30 - 11:00)" },
  { id: "s2", label: "الحصة الثانية (11:00 - 13:30)" },
  { id: "s3", label: "الحصة الثالثة (13:30 - 16:00)" },
  { id: "s4", label: "الحصة الرابعة (16:00 - 18:30)" },
];

let localDbPromise = null;
let forceLocalMode = false;
let localAssetDbPromise = null;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function wrapRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function openLocalAssetDb() {
  if (!hasIndexedDb()) return Promise.resolve(null);
  if (localAssetDbPromise) return localAssetDbPromise;

  localAssetDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(LOCAL_ASSET_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LOCAL_ASSET_STORE_NAME)) {
        db.createObjectStore(LOCAL_ASSET_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    console.warn("Failed to open local asset database.", error);
    localAssetDbPromise = Promise.resolve(null);
    return null;
  });

  return localAssetDbPromise;
}

function isLocalAssetRef(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.__localAssetRef === true &&
      typeof value.assetId === "string",
  );
}

function shouldOffloadString(value) {
  return typeof value === "string" && value.length >= LARGE_STORAGE_THRESHOLD;
}

async function saveAssetValue(value, existingAssetId) {
  if (!shouldOffloadString(value)) return value;

  const db = await openLocalAssetDb();
  if (!db) return value;

  const assetId = existingAssetId || generateId("asset");
  const transaction = db.transaction(LOCAL_ASSET_STORE_NAME, "readwrite");
  transaction.objectStore(LOCAL_ASSET_STORE_NAME).put({
    id: assetId,
    value,
    updatedAt: new Date().toISOString(),
  });
  await waitForTransaction(transaction);
  return { __localAssetRef: true, assetId };
}

async function loadAssetValue(ref) {
  if (!isLocalAssetRef(ref)) return ref;

  const db = await openLocalAssetDb();
  if (!db) return "";

  try {
    const transaction = db.transaction(LOCAL_ASSET_STORE_NAME, "readonly");
    const entry = await wrapRequest(transaction.objectStore(LOCAL_ASSET_STORE_NAME).get(ref.assetId));
    return entry?.value || "";
  } catch (error) {
    console.warn("Failed to load local asset payload.", error);
    return "";
  }
}

async function compactLargeValues(value, previousValue) {
  if (Array.isArray(value)) {
    const nextItems = await Promise.all(
      value.map((item, index) => compactLargeValues(item, previousValue?.[index])),
    );
    return nextItems;
  }

  if (shouldOffloadString(value)) {
    const existingAssetId = isLocalAssetRef(previousValue) ? previousValue.assetId : undefined;
    return saveAssetValue(value, existingAssetId);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (isLocalAssetRef(value)) {
    return value;
  }

  const entries = await Promise.all(
    Object.entries(value).map(async ([key, nestedValue]) => [
      key,
      await compactLargeValues(nestedValue, previousValue?.[key]),
    ]),
  );

  return Object.fromEntries(entries);
}

async function hydrateLargeValues(value) {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => hydrateLargeValues(item)));
  }

  if (isLocalAssetRef(value)) {
    return loadAssetValue(value);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const entries = await Promise.all(
    Object.entries(value).map(async ([key, nestedValue]) => [key, await hydrateLargeValues(nestedValue)]),
  );

  return Object.fromEntries(entries);
}

function createDefaultDb() {
  return {
    settings: {},
    users: [],
    subjects: [],
    groups: [],
    students: [],
    news: [],
    lessons: [],
    exercises: [],
    files: [],
    attendances: [],
    timetables: [],
    time_slots: DEFAULT_TIME_SLOTS,
  };
}

function ensureCollections(db) {
  const nextDb = { ...createDefaultDb(), ...(db || {}) };
  [
    "users",
    "subjects",
    "groups",
    "students",
    "news",
    "lessons",
    "exercises",
    "files",
    "attendances",
    "timetables",
    "time_slots",
  ].forEach((key) => {
    if (!Array.isArray(nextDb[key])) nextDb[key] = [];
  });
  return nextDb;
}

function readLocalDbFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return createDefaultDb();
  }

  const raw = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) return null;

  try {
    return ensureCollections(JSON.parse(raw));
  } catch (error) {
    console.warn("Failed to parse local ProPath DB, resetting cache.", error);
    window.localStorage.removeItem(LOCAL_DB_KEY);
    return null;
  }
}

function hasStoredLocalDb() {
  return typeof window !== "undefined" && Boolean(window.localStorage?.getItem(LOCAL_DB_KEY));
}

function writeLocalDbToStorage(db) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
    } catch (error) {
      if (error?.name === "QuotaExceededError") {
        console.warn("Local DB storage quota exceeded after asset compaction.", error);
      }
      throw error;
    }
  }
  return db;
}

async function loadLocalDb() {
  if (localDbPromise) return localDbPromise;

  localDbPromise = (async () => {
    const existingDb = readLocalDbFromStorage();
    if (existingDb) {
      const compactedDb = await compactLargeValues(existingDb);
      if (JSON.stringify(compactedDb) !== JSON.stringify(existingDb)) {
        writeLocalDbToStorage(compactedDb);
      }
      return compactedDb;
    }

    try {
      const response = await fetch("/db.json");
      if (!response.ok) throw new Error(`db.json fetch failed (${response.status})`);
      const seededDb = ensureCollections(await response.json());
      const compactedDb = await compactLargeValues(seededDb);
      writeLocalDbToStorage(compactedDb);
      return compactedDb;
    } catch (error) {
      console.warn("Falling back to empty local DB.", error);
      const emptyDb = createDefaultDb();
      writeLocalDbToStorage(emptyDb);
      return emptyDb;
    }
  })();

  return localDbPromise;
}

async function updateLocalDb(mutator) {
  const currentDb = ensureCollections(await loadLocalDb());
  const nextDb = ensureCollections(await mutator(clone(currentDb)));
  const compactedDb = ensureCollections(await compactLargeValues(nextDb, currentDb));
  localDbPromise = Promise.resolve(compactedDb);
  writeLocalDbToStorage(compactedDb);
  return clone(compactedDb);
}

function parsePath(path) {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const [resourcePath, queryPart = ""] = clean.split("?");
  const segments = resourcePath.split("/").filter(Boolean);
  const params = new URLSearchParams(queryPart);
  return { segments, params };
}

function filterAndSortList(list, params) {
  let result = [...list];

  const filters = [...params.entries()].filter(([key]) => !key.startsWith("_"));
  if (filters.length > 0) {
    result = result.filter((item) =>
      filters.every(([key, value]) => String(item?.[key]) === String(value)),
    );
  }

  const sortKey = params.get("_sort");
  if (sortKey) {
    const order = (params.get("_order") || "asc").toLowerCase();
    result.sort((left, right) => {
      const leftValue = left?.[sortKey];
      const rightValue = right?.[sortKey];
      if (leftValue === rightValue) return 0;
      const comparison = leftValue > rightValue ? 1 : -1;
      return order === "desc" ? comparison * -1 : comparison;
    });
  }

  return result;
}

async function localFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : undefined;
  const { segments, params } = parsePath(path);
  const [resource, id] = segments;

  if (!resource) return clone(await loadLocalDb());

  if (method === "GET") {
    const db = ensureCollections(await loadLocalDb());
    const list = Array.isArray(db[resource]) ? db[resource] : [];
    if (!id) return clone(await hydrateLargeValues(filterAndSortList(list, params)));
    return clone(await hydrateLargeValues(list.find((item) => String(item.id) === String(id)) || null));
  }

  const nextDb = await updateLocalDb((db) => {
    const list = Array.isArray(db[resource]) ? [...db[resource]] : [];

    if (method === "POST") {
      const payload = {
        ...(body || {}),
        id: body?.id || generateId(resource),
      };
      db[resource] = [...list, payload];
      return db;
    }

    const itemIndex = list.findIndex((item) => String(item.id) === String(id));

    if (method === "PATCH") {
      if (itemIndex === -1) return db;
      list[itemIndex] = { ...list[itemIndex], ...(body || {}) };
      db[resource] = list;
      return db;
    }

    if (method === "PUT") {
      if (itemIndex === -1) {
        db[resource] = [...list, { ...(body || {}), id: body?.id || id || generateId(resource) }];
        return db;
      }
      list[itemIndex] = { ...(body || {}), id: id || body?.id || list[itemIndex].id };
      db[resource] = list;
      return db;
    }

    if (method === "DELETE") {
      if (itemIndex === -1) return db;
      list.splice(itemIndex, 1);
      db[resource] = list;
      return db;
    }

    return db;
  });

  const savedList = Array.isArray(nextDb[resource]) ? nextDb[resource] : [];
  if (method === "POST") return clone(await hydrateLargeValues(savedList[savedList.length - 1] || null));
  if (method === "DELETE") return null;
  return clone(await hydrateLargeValues(savedList.find((item) => String(item.id) === String(id)) || null));
}

async function tryJsonFetch(path, options = {}) {
  if (forceLocalMode || hasStoredLocalDb()) {
    forceLocalMode = true;
    return localFetch(path, options);
  }

  if (!forceLocalMode) {
    try {
      const response = await fetch(`${API_BASE}${path}`, options);
      if (!response.ok) throw new Error(`Request failed ${response.status}`);
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      forceLocalMode = true;
      console.warn("API unavailable, switching to local storage mode.", error);
    }
  }

  return localFetch(path, options);
}

function safeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function calculateFinalGrade(grades = {}) {
  const cc1 = safeNumber(grades.cc1);
  const cc2 = safeNumber(grades.cc2);
  const cc3 = safeNumber(grades.cc3);
  const efm = safeNumber(grades.efm);

  if ([cc1, cc2, cc3, efm].some((value) => value == null)) {
    return null;
  }

  const finalGrade = efm * 0.75 + 0.25 * ((cc1 + cc2 + cc3) / 3);
  return Number(finalGrade.toFixed(2));
}

function normalizeGradeRecord(grades = {}) {
  return {
    cc1: grades.cc1 ?? "",
    cc2: grades.cc2 ?? "",
    cc3: grades.cc3 ?? "",
    efm: grades.efm ?? "",
    final: calculateFinalGrade(grades),
  };
}

function normalizeTimeSlots(slots = []) {
  const slotsById = new Map(
    (Array.isArray(slots) ? slots : [])
      .filter((slot) => slot && slot.id)
      .map((slot) => [String(slot.id), slot]),
  );

  return DEFAULT_TIME_SLOTS.map((defaultSlot) => {
    const existingSlot = slotsById.get(String(defaultSlot.id));
    return existingSlot
      ? { ...existingSlot, label: defaultSlot.label }
      : { ...defaultSlot };
  });
}

function matchStudentToUser(student, user) {
  if (!student || !user) return false;
  return (
    String(student.userId || "") === String(user.id || "") ||
    String(student.id || "") === String(user.studentId || "") ||
    String(student.username || "").toLowerCase() === String(user.username || "").toLowerCase() ||
    String(student.email || "").toLowerCase() === String(user.email || "").toLowerCase() ||
    String(student.name || "") === String(user.name || "")
  );
}

const dataService = {
  getTodayIsoDate,
  calculateFinalGrade,
  normalizeGradeRecord,
  fetchUsers: async () => tryJsonFetch("/users"),
  addUser: async (user) =>
    tryJsonFetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }),
  updateUser: async (id, updates) =>
    tryJsonFetch(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteUser: async (id) => tryJsonFetch(`/users/${id}`, { method: "DELETE" }),
  fetchStudents: async () => tryJsonFetch("/students"),
  saveStudents: async (students) =>
    Promise.all(
      (students || []).map((student) =>
        tryJsonFetch(`/students/${student.id || generateId("student")}`, {
          method: student.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        }),
      ),
    ),
  updateStudent: async (id, updates) =>
    tryJsonFetch(`/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  fetchSubjects: async () => tryJsonFetch("/subjects"),
  fetchGroups: async () => tryJsonFetch("/groups"),
  addGroup: async (group) =>
    tryJsonFetch("/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...group,
        id: group.id || generateId("group"),
      }),
    }),
  updateGroup: async (id, updates) =>
    tryJsonFetch(`/groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteGroup: async (id) => tryJsonFetch(`/groups/${id}`, { method: "DELETE" }),
  fetchNews: async () => {
    const news = (await tryJsonFetch("/news")) || [];
    return [...news].sort((left, right) => {
      const rightDate = new Date(right.createdAt || right.date || 0).getTime();
      const leftDate = new Date(left.createdAt || left.date || 0).getTime();
      return rightDate - leftDate;
    });
  },
  fetchNewsForAudience: async (audience) => {
    const news = await dataService.fetchNews();
    return news.filter((item) => {
      const itemAudience = item.audience || item.category || "all";
      return itemAudience === "all" || itemAudience === audience;
    });
  },
  addNews: async (newsItem) =>
    tryJsonFetch("/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newsItem,
        id: newsItem.id || generateId("news"),
        audience: newsItem.audience || newsItem.category || "all",
        date: newsItem.date || getTodayIsoDate(),
        createdAt: newsItem.createdAt || new Date().toISOString(),
      }),
    }),
  updateNews: async (id, updates) =>
    tryJsonFetch(`/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteNews: async (id) => tryJsonFetch(`/news/${id}`, { method: "DELETE" }),
  fetchAttendances: async () => tryJsonFetch("/attendances"),
  saveAttendances: async (records) => {
    const existing = (await dataService.fetchAttendances()) || [];
    const updates = [];
    const inserts = [];

    (records || []).forEach((record) => {
      const current = existing.find(
        (item) =>
          String(item.studentId) === String(record.studentId) &&
          String(item.group) === String(record.group) &&
          String(item.date) === String(record.date) &&
          String(item.session) === String(record.session),
      );

      if (current) {
        updates.push(
          tryJsonFetch(`/attendances/${current.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...record }),
          }),
        );
      } else {
        inserts.push(
          tryJsonFetch("/attendances", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...record,
              id: record.id || generateId("attendance"),
            }),
          }),
        );
      }
    });

    return Promise.all([...updates, ...inserts]);
  },
  addAttendances: async (records) => dataService.saveAttendances(records),
  fetchFiles: async () => tryJsonFetch("/files"),
  addFile: async (file) =>
    tryJsonFetch("/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...file,
        id: file.id || generateId("file"),
        date: file.date || getTodayIsoDate(),
        uploadedAt: file.uploadedAt || new Date().toISOString(),
      }),
    }),
  fetchLessons: async () => {
    const lessons = (await tryJsonFetch("/lessons")) || [];
    return [...lessons].sort((left, right) => {
      const rightDate = new Date(right.uploadedAt || right.date || 0).getTime();
      const leftDate = new Date(left.uploadedAt || left.date || 0).getTime();
      return rightDate - leftDate;
    });
  },
  addLesson: async (lesson) =>
    tryJsonFetch("/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lesson,
        id: lesson.id || generateId("lesson"),
        date: lesson.date || getTodayIsoDate(),
        uploadedAt: lesson.uploadedAt || new Date().toISOString(),
      }),
    }),
  getLessonsForSubjectAndGroup: async (subjectId, groupId) =>
    tryJsonFetch(`/lessons?subjectId=${subjectId}&groupId=${groupId}`),
  fetchExercises: async () => tryJsonFetch("/exercises"),
  getExercisesForSubjectAndGroup: async (subjectId, groupId) =>
    tryJsonFetch(`/exercises?subjectId=${subjectId}&groupId=${groupId}`),
  fetchTimetables: async () => {
    const timetables = (await tryJsonFetch("/timetables")) || [];
    return [...timetables].sort((left, right) => {
      const rightDate = new Date(right.uploadedAt || 0).getTime();
      const leftDate = new Date(left.uploadedAt || 0).getTime();
      return rightDate - leftDate;
    });
  },
  addTimetable: async (timetable) =>
    tryJsonFetch("/timetables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...timetable,
        id: timetable.id || generateId("timetable"),
        uploadedAt: timetable.uploadedAt || new Date().toISOString(),
      }),
    }),
  fetchTimeSlots: async () => {
    const slots = (await tryJsonFetch("/time_slots")) || [];
    return normalizeTimeSlots(slots);
  },
  getStudentById: async (id) => tryJsonFetch(`/students/${id}`),
  getStudentsInGroup: async (groupId) => tryJsonFetch(`/students?group=${groupId}`),
  getStudentRecordForUser: async (user) => {
    const students = await dataService.fetchStudents();
    return students.find((student) => matchStudentToUser(student, user)) || null;
  },
  getTrainerSubjects: async (trainerId) => {
    const subjects = await dataService.fetchSubjects();
    return subjects.filter(
      (subject) => String(subject.teacherId) === String(trainerId),
    );
  },
  getTrainerGroups: async (trainerId) => {
    const [groups, students, trainerSubjects] = await Promise.all([
      dataService.fetchGroups(),
      dataService.fetchStudents(),
      dataService.getTrainerSubjects(trainerId),
    ]);

    const subjectIds = new Set(trainerSubjects.map((subject) => String(subject.id)));
    const groupIds = new Set(
      students
        .filter((student) =>
          (student.enrolled_subjects || []).some((subjectId) =>
            subjectIds.has(String(subjectId)),
          ),
        )
        .map((student) => String(student.group)),
    );

    return groups.filter((group) => groupIds.has(String(group.id)));
  },
};

export default dataService;
