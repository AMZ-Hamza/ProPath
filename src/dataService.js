// Data Service - Fetch all data from db.json
const API_URL = "/db.json";

export const dataService = {
    // Fetch all data
    fetchAllData: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Failed to fetch data");
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    },

    // Fetch specific data sections
    fetchUsers: async () => {
        const data = await dataService.fetchAllData();
        return data.users;
    },

    fetchStudents: async () => {
        const data = await dataService.fetchAllData();
        return data.students;
    },

    fetchSubjects: async () => {
        const data = await dataService.fetchAllData();
        return data.subjects;
    },

    fetchGroups: async () => {
        const data = await dataService.fetchAllData();
        return data.groups;
    },

    fetchNews: async () => {
        const data = await dataService.fetchAllData();
        return data.news;
    },

    fetchLessons: async () => {
        const data = await dataService.fetchAllData();
        return data.lessons;
    },

    fetchExercises: async () => {
        const data = await dataService.fetchAllData();
        return data.exercises;
    },

    fetchAttendances: async () => {
        const data = await dataService.fetchAllData();
        return data.attendances;
    },

    fetchSettings: async () => {
        const data = await dataService.fetchAllData();
        return data.settings;
    },

    // Get user by id
    getUserById: async (id) => {
        const users = await dataService.fetchUsers();
        return users.find((u) => u.id === id);
    },

    // Get student by id
    getStudentById: async (id) => {
        const students = await dataService.fetchStudents();
        return students.find((s) => s.id === id);
    },

    // Get subjects for a group
    getSubjectsForGroup: async (groupId) => {
        const data = await dataService.fetchAllData();
        return data.subjects;
    },

    // Get students in a group
    getStudentsInGroup: async (groupId) => {
        const students = await dataService.fetchStudents();
        return students.filter((s) => s.group === groupId);
    },

    // Get lessons for a subject and group
    getLessonsForSubjectAndGroup: async (subjectId, groupId) => {
        const lessons = await dataService.fetchLessons();
        return lessons.filter(
            (l) => l.subjectId === subjectId && l.groupId === groupId
        );
    },

    // Get exercises for a subject and group
    getExercisesForSubjectAndGroup: async (subjectId, groupId) => {
        const exercises = await dataService.fetchExercises();
        return exercises.filter(
            (e) => e.subjectId === subjectId && e.groupId === groupId
        );
    },
};

export default dataService;
