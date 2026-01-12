import React, { useState, useEffect } from "react";
import AdministrationSpace from "./AdministrationSpace.js";
import StagiereSpace from "./stagiereSpace.js";
import TrainerSpace from "./TrainerSpace.js";
import dataService from "./dataService.js";
import { Dashboard, Schedule, Resources, Absence, Grades } from "./Components";
import { ToastContainer, useToast } from "./Toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";


// 1. مكون صفحة تسجيل الدخول
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const usersList = await dataService.fetchUsers();
      const user = usersList.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        // حفظ بيانات المستخدم في localStorage للحفاظ على الجلسة
        localStorage.setItem("propath_user", JSON.stringify(user));
        onLogin(user);
        // التوجيه بناءً على الدور
        if (user.role === "مدير") navigate("/admin");
        else if (user.role === "مدرب") navigate("/trainer");
        else if (user.role === "متدرب") navigate("/stagiere");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <form onSubmit={handleLogin} style={styles.loginBox}>
        <h2 style={{ textAlign: "center", color: "#1e293b", fontSize: "1.8rem", marginBottom: "10px" }}>
          🎓 ProPath
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "25px" }}>منصة التعليم الإلكترونية المتكاملة</p>
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.inputGroup}>
          <label>اسم المستخدم:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            placeholder="أدخل اسم المستخدم"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label>كلمة السر:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="أدخل كلمة السر"
            required
          />
        </div>

        <button type="submit" style={styles.loginBtn} disabled={loading}>
          {loading ? "جاري التحميل..." : "دخول"}
        </button>

        <div style={styles.hint}>
          <p style={{ margin: "15px 0 10px 0", fontWeight: "bold", color: "#1e293b" }}>بيانات التجربة:</p>
          <div style={{ background: "#f0f9ff", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", lineHeight: "1.6" }}>
            <div>👤 <strong>مدير:</strong> admin / 123</div>
            <div>👨‍🏫 <strong>مدرب:</strong> trainer1 / 456</div>
            <div>👨‍🎓 <strong>متدرب:</strong> student1 / pass1</div>
          </div>
        </div>
      </form>
    </div>
  );
};

// 2. مكون رأس الصفحة مع معلومات المستخدم
const Header = ({ user, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleLabel = (role) => {
    const roles = {
      "مدير": "👤 مدير النظام",
      "مدرب": "👨‍🏫 المدرب",
      "متدرب": "👨‍🎓 المتدرب",
    };
    return roles[role] || role;
  };

  return (
    <div style={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <h1 style={{ margin: 0, color: "#2563eb", fontSize: "1.5rem" }}>🎓 ProPath</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#1e293b", fontWeight: "500" }}>{user?.name}</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{getRoleLabel(user?.role)}</div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={styles.userMenuBtn}
            title="القائمة"
          >
            <UserIcon size={20} />
          </button>
          {showMenu && (
            <div style={styles.userDropdown}>
              <button
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
                style={styles.logoutBtn}
              >
                <LogOut size={16} /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. المكون الرئيسي للتطبيق
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // التحقق من وجود مستخدم في localStorage عند تحميل التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem("propath_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error loading user from localStorage:", err);
        localStorage.removeItem("propath_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("propath_user");
    setUser(null);
  };

  if (loading) {
    return <div style={styles.loadingContainer}>جاري التحميل...</div>;
  }

  return (
    <Router>
      {user && <Header user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} />} />

        {/* حماية المسارات (Routes Protection) */}
        <Route
          path="/admin"
          element={
            user?.role === "مدير" ? (
              <AdministrationSpace user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/trainer"
          element={
            user?.role === "مدرب" ? (
              <TrainerSpace user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/stagiere/*"
          element={
            user?.role === "متدرب" ? (
              <StagiereSpace user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* مسار افتراضي */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// 3. تنسيقات بسيطة
const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.2rem",
    color: "#2563eb",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    direction: "rtl",
  },
  userMenuBtn: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    transition: "all 0.2s",
  },
  userDropdown: {
    position: "absolute",
    top: "50px",
    left: 0,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    minWidth: "180px",
  },
  logoutBtn: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    textAlign: "right",
    transition: "all 0.2s",
  },
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f1f5f9",
    direction: "rtl",
  },
  loginBox: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "10px",
    transition: "all 0.2s",
  },
  error: {
    color: "#dc2626",
    fontSize: "0.85rem",
    textAlign: "center",
    marginBottom: "1rem",
    padding: "10px",
    background: "#fee2e2",
    borderRadius: "6px",
  },
  hint: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "4px",
    fontSize: "0.8rem",
    color: "#64748b",
    borderLeft: "4px solid #2563eb",
  },
};
