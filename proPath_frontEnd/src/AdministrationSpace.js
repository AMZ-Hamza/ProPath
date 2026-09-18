import React, { useState } from "react";
import {
  BarChart3,
  Bell,
  BookCopy,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react";
import { useAdminWorkspace } from "./features/admin/useAdminWorkspace";
import DashboardSection from "./features/admin/components/DashboardSection";
import UsersSection from "./features/admin/components/UsersSection";
import StructureSection from "./features/admin/components/StructureSection";
import SubjectsSection from "./features/admin/components/SubjectsSection";
import AbsenceMonitoringSection from "./features/admin/components/AbsenceMonitoringSection";
import GradesSection from "./features/admin/components/GradesSection";
import AnnouncementsSection from "./features/admin/components/AnnouncementsSection";
import TimetablesSection from "./features/admin/components/TimetablesSection";
import SettingsSection from "./features/admin/components/SettingsSection";
import { ErrorBlock, FeedbackMessage, LoadingBlock } from "./shared";
import "./AdministrationSpace.css";

const ADMIN_SECTIONS = [
  { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "structure", label: "الشعب والأفواج", icon: Building2 },
  { id: "subjects", label: "المواد", icon: BookCopy },
  { id: "absences", label: "متابعة الغيابات", icon: BarChart3 },
  { id: "grades", label: "متابعة النقط", icon: ClipboardList },
  { id: "announcements", label: "الإعلانات", icon: Bell },
  { id: "timetables", label: "الجداول", icon: CalendarDays },
  { id: "settings", label: "الإعدادات", icon: Settings2 },
];

export default function AdministrationSpace({ user, settings }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [feedback, setFeedback] = useState(null);
  const { error, loading, reloadWorkspace, workspace } = useAdminWorkspace(activeSection, settings);

  const setMessage = (nextFeedback) => setFeedback(nextFeedback);

  if (loading) {
    return (
      <div className="admin-container">
        <main className="admin-main-content">
          <LoadingBlock label="جاري تحميل فضاء الإدارة..." />
        </main>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="admin-container">
        <main className="admin-main-content">
          <ErrorBlock message={error || "تعذر تحميل البيانات."} onAction={reloadWorkspace} />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="sidebar2">
        <div className="sidebar-header">
          <h1>{workspace.appName}</h1>
          <p>{user?.name}</p>
        </div>
        <nav className="sidebar-nav">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                className={`nav-btn ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="admin-main-content">
        <FeedbackMessage feedback={feedback} onClose={() => setFeedback(null)} />
        {activeSection === "dashboard" ? <DashboardSection /> : null}
        {activeSection === "users" ? (
          <UsersSection
            workspace={workspace}
            currentUser={user}
            onRefresh={reloadWorkspace}
            onFeedback={setMessage}
          />
        ) : null}
        {activeSection === "structure" ? (
          <StructureSection workspace={workspace} onRefresh={reloadWorkspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "subjects" ? (
          <SubjectsSection workspace={workspace} onRefresh={reloadWorkspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "absences" ? (
          <AbsenceMonitoringSection workspace={workspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "grades" ? (
          <GradesSection workspace={workspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "announcements" ? (
          <AnnouncementsSection workspace={workspace} user={user} onRefresh={reloadWorkspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "timetables" ? (
          <TimetablesSection workspace={workspace} onRefresh={reloadWorkspace} onFeedback={setMessage} />
        ) : null}
        {activeSection === "settings" ? (
          <SettingsSection workspace={workspace} onRefresh={reloadWorkspace} onFeedback={setMessage} />
        ) : null}
      </main>
    </div>
  );
}
