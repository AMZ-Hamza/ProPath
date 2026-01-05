import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  BookOpen,
  UserX,
  ClipboardList,
} from "lucide-react";
import "./App.css";

// استيراد المكونات التي أنشأناها أعلاه (افترض أنها في نفس الملف أو مستوردة)
import { Dashboard, Schedule, Resources, Absence, Grades } from "./Components";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2 style={{ color: "#2563eb" }}>ProPath</h2>
        <p style={{ color: "#666" }}>فضاء المتدرب</p>
      </div>

      <nav>
        <Link to="/" className={isActive("/")} onClick={toggleSidebar}>
          <LayoutDashboard size={20} /> لوحة القيادة
        </Link>
        <Link
          to="/schedule"
          className={isActive("/schedule")}
          onClick={toggleSidebar}
        >
          <Calendar size={20} /> الجدول الزمني
        </Link>
        <Link
          to="/resources"
          className={isActive("/resources")}
          onClick={toggleSidebar}
        >
          <BookOpen size={20} /> الموارد البيداغوجية
        </Link>
        <Link
          to="/absence"
          className={isActive("/absence")}
          onClick={toggleSidebar}
        >
          <UserX size={20} /> سجل الغياب
        </Link>
        <Link
          to="/grades"
          className={isActive("/grades")}
          onClick={toggleSidebar}
        >
          <ClipboardList size={20} /> كشف النقط
        </Link>
      </nav>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div className="app-container">
        {/* زر القائمة - يظهر دائماً */}
        <div className="menu-icon" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* القائمة الجانبية */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* المحتوى الرئيسي */}
        <div
          className="main-content"
          onClick={() => isSidebarOpen && setSidebarOpen(false)}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/absence" element={<Absence />} />
            <Route path="/grades" element={<Grades />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
