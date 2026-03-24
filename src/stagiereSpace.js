import React, { useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Menu,
  UserX,
  X,
} from "lucide-react";
import "./stagiereSpace.css";
import { Absence, Dashboard, Grades, Resources, Schedule } from "./Components";

function Sidebar({ isOpen, onNavigate }) {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? "active" : "");

  const items = [
    { path: "/stagiere", label: "لوحة القيادة", icon: LayoutDashboard },
    { path: "/stagiere/schedule", label: "الجدول الزمني", icon: Calendar },
    { path: "/stagiere/resources", label: "الدروس", icon: BookOpen },
    { path: "/stagiere/absence", label: "سجل الغياب", icon: UserX },
    { path: "/stagiere/grades", label: "كشف النقط", icon: ClipboardList },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "#2563eb" }}>ProPath</h2>
        <p style={{ color: "#666" }}>فضاء المتدرب</p>
      </div>

      <nav>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={isActive(item.path)} onClick={onNavigate}>
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function StagiereSpace({ user }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <button type="button" className="menu-icon" onClick={() => setSidebarOpen((value) => !value)}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div className="stagiere-main-content" onClick={() => isSidebarOpen && setSidebarOpen(false)}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/schedule" element={<Schedule user={user} />} />
          <Route path="/resources" element={<Resources user={user} />} />
          <Route path="/absence" element={<Absence user={user} />} />
          <Route path="/grades" element={<Grades user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default StagiereSpace;
