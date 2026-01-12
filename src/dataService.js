// Data Service - use json-server backend when available (default http://localhost:4000)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function tryJsonFetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Request failed ${res.status}`);
        // for DELETE responses may be empty
        const text = await res.text();
        try { return text ? JSON.parse(text) : null; } catch { return text; }
    } catch (err) {
        console.warn("JSON API fetch failed:", url, err);
        throw err;
    }
}

const dataService = {
    // Users
    fetchUsers: async () => {
        return await tryJsonFetch("/users");
    },
    addUser: async (user) => {
        return await tryJsonFetch("/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) });
    },
    updateUser: async (id, updates) => {
        return await tryJsonFetch(`/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    },
    deleteUser: async (id) => {
        return await tryJsonFetch(`/users/${id}`, { method: "DELETE" });
    },

    // Students
    fetchStudents: async () => {
        return await tryJsonFetch("/students");
    },
    saveStudents: async (students) => {
        // save each student by PUT (json-server expects full resource replacement for PUT)
        await Promise.all(students.map(async (s) => {
            if (s.id) {
                await tryJsonFetch(`/students/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
            } else {
                await tryJsonFetch(`/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
            }
        }));
    },

    // Subjects / groups
    fetchSubjects: async () => {
        return await tryJsonFetch("/subjects");
    },
    fetchGroups: async () => {
        return await tryJsonFetch("/groups");
    },
    addGroup: async (group) => {
        const payload = { ...group, id: Date.now().toString() };
        return await tryJsonFetch("/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    updateGroup: async (id, updates) => {
        return await tryJsonFetch(`/groups/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    },
    deleteGroup: async (id) => {
        return await tryJsonFetch(`/groups/${id}`, { method: "DELETE" });
    },

    // News
    fetchNews: async () => {
        // sort by id desc (json-server supports _sort and _order)
        try {
            return await tryJsonFetch(`/news?_sort=id&_order=desc`);
        } catch (err) {
            return [];
        }
    },
    addNews: async (newsItem) => {
        const payload = { ...newsItem, date: new Date().toLocaleDateString("ar-MA") };
        return await tryJsonFetch(`/news`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    updateNews: async (id, updates) => {
        return await tryJsonFetch(`/news/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    },
    deleteNews: async (id) => {
        return await tryJsonFetch(`/news/${id}`, { method: "DELETE" });
    },

    // Attendances
    fetchAttendances: async () => {
        return await tryJsonFetch(`/attendances`);
    },
    addAttendances: async (records) => {
        await Promise.all(records.map((r) => tryJsonFetch(`/attendances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) })));
    },

    // Files
    fetchFiles: async () => {
        return await tryJsonFetch(`/files`);
    },
    addFile: async (file) => {
        const payload = { name: file.name, data: file.data, date: new Date().toLocaleDateString("ar-MA"), group: file.group };
        return await tryJsonFetch(`/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },

    // Lessons
    fetchLessons: async () => {
        return await tryJsonFetch("/lessons");
    },
    getLessonsForSubjectAndGroup: async (subjectId, groupId) => {
        return await tryJsonFetch(`/lessons?subjectId=${subjectId}&groupId=${groupId}`);
    },

    // Exercises
    fetchExercises: async () => {
        return await tryJsonFetch("/exercises");
    },
    getExercisesForSubjectAndGroup: async (subjectId, groupId) => {
        return await tryJsonFetch(`/exercises?subjectId=${subjectId}&groupId=${groupId}`);
    },

    // Student helpers
    getStudentById: async (id) => {
        return await tryJsonFetch(`/students/${id}`);
    },

    // Group helpers
    getStudentsInGroup: async (groupId) => {
        return await tryJsonFetch(`/students?group=${groupId}`);
    },
};

export default dataService;
