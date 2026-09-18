import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Menu,
  NotebookPen,
  UserX,
  X,
} from "lucide-react";
import dataService from "./dataService";
import { Absence, Dashboard, Exercises, Grades, Resources, Schedule } from "./features/student/components";
import { useDashboardData } from "./hooks/useDashboardData";
import { ErrorBlock, LoadingBlock } from "./shared";
import "./stagiereSpace.css";

const NAV_ITEMS = [
  { path: "/stagiere", label: "الرئيسية", icon: LayoutDashboard },
  { path: "/stagiere/schedule", label: "الجدول", icon: CalendarDays },
  { path: "/stagiere/resources", label: "الدروس", icon: BookOpen },
  { path: "/stagiere/exercises", label: "التمارين", icon: NotebookPen },
  { path: "/stagiere/absence", label: "الغياب", icon: UserX },
  { path: "/stagiere/grades", label: "النقط", icon: ClipboardList },
];

function Sidebar({ open, onNavigate }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar__brand">
        <h2>فضاء المتدرب</h2>
        <p>وصول سريع إلى الدروس والتمارين والنتائج.</p>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={active ? "active" : ""}
              onClick={onNavigate}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function StagiereSpace({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: summary, loading: summaryLoading } = useDashboardData("student");

  const location = useLocation();

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      setError("");
      try {
        const student = await dataService.getStudentRecordForUser();
        const results = await Promise.allSettled([
          dataService.fetchNewsForAudience("students"),
          dataService.fetchSubjects(),
          dataService.fetchSettings(),
        ]);

        const [newsRes, subjectsRes, settingsRes] = results;
        const groupId = student?.groupId || "";

        setWorkspace({
          student,
          news: newsRes.status === "fulfilled" ? newsRes.value : [],
          subjects: (subjectsRes.status === "fulfilled" ? subjectsRes.value : []).filter(
            (subject) => (subject.groupIds || []).includes(String(groupId)),
          ),
          settings: settingsRes.status === "fulfilled" ? settingsRes.value : { timeSlots: [] },
          lessons: null,
          exercises: null,
          attendance: null,
          timetables: null,
        });
      } catch (loadError) {
        setError(loadError.message || "تعذر تحميل فضاء المتدرب.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [user]);

  // Lazy loading logic for student data
  useEffect(() => {
    if (!workspace || !workspace.student) return;

    const groupId = workspace.student.groupId;
    const fetchAdditionalData = async () => {
      try {
        if (location.pathname === "/stagiere") {
          const requests = [];
          if (workspace.lessons === null) requests.push(groupId ? dataService.fetchLessons({ groupId }) : Promise.resolve([]));
          if (workspace.exercises === null) requests.push(groupId ? dataService.fetchExercises({ groupId }) : Promise.resolve([]));
          if (workspace.timetables === null) requests.push(groupId ? dataService.fetchTimetables({ targetType: "group" }) : Promise.resolve([]));

          if (requests.length > 0) {
            const results = await Promise.all(requests);
            setWorkspace((prev) => {
              const updates = {};
              let resIdx = 0;
              if (prev.lessons === null) updates.lessons = results[resIdx++];
              if (prev.exercises === null) updates.exercises = results[resIdx++];
              if (prev.timetables === null) updates.timetables = results[resIdx++];
              return { ...prev, ...updates };
            });
          }
        } else if (location.pathname === "/stagiere/schedule" && workspace.timetables === null) {
          const timetables = groupId ? await dataService.fetchTimetables({ targetType: "group" }) : [];
          setWorkspace((prev) => ({ ...prev, timetables }));
        } else if (location.pathname === "/stagiere/resources" && workspace.lessons === null) {
          const lessons = groupId ? await dataService.fetchLessons({ groupId }) : [];
          setWorkspace((prev) => ({ ...prev, lessons }));
        } else if (location.pathname === "/stagiere/exercises" && workspace.exercises === null) {
          const exercises = groupId ? await dataService.fetchExercises({ groupId }) : [];
          setWorkspace((prev) => ({ ...prev, exercises }));
        } else if (location.pathname === "/stagiere/absence" && workspace.attendance === null) {
          const attendance = await dataService.fetchAttendance({ studentId: workspace.student.id });
          setWorkspace((prev) => ({ ...prev, attendance }));
        }
      } catch (err) {
        console.error("Lazy loading failed:", err);
      }
    };

    fetchAdditionalData();
  }, [location.pathname, workspace]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="stagiere-main-content">
          <LoadingBlock label="جاري تحميل فضاء المتدرب..." />
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="app-container">
        <div className="stagiere-main-content">
          <ErrorBlock message={error || "تعذر تحميل البيانات."} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button
        type="button"
        className="menu-icon"
        onClick={() => setSidebarOpen((value) => !value)}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <main
        className="stagiere-main-content"
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        <Routes>
          <Route path="/" element={<Dashboard workspace={workspace} summary={summary} loading={summaryLoading} />} />
          <Route path="/schedule" element={<Schedule workspace={workspace} />} />
          <Route path="/resources" element={<Resources workspace={workspace} />} />
          <Route path="/exercises" element={<Exercises workspace={workspace} />} />
          <Route path="/absence" element={<Absence workspace={workspace} summary={summary} />} />
          <Route path="/grades" element={<Grades workspace={workspace} />} />
        </Routes>
      </main>
    </div>
  );
}
