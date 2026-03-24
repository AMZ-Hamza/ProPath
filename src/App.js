import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import AdministrationSpace from "./AdministrationSpace.js";
import StagiereSpace from "./stagiereSpace.js";
import TrainerSpace from "./TrainerSpace.js";
import dataService from "./dataService.js";
import "./App.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const usersList = await dataService.fetchUsers();
      const user = (usersList || []).find(
        (item) => item.username === username && item.password === password,
      );

      if (!user) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        return;
      }

      localStorage.setItem("propath_user", JSON.stringify(user));
      onLogin(user);

      if (user.role === "مدير") navigate("/admin");
      else if (user.role === "مدرب") navigate("/trainer");
      else navigate("/stagiere");
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("حدث خطأ أثناء التحقق من الحساب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__orb auth-screen__orb--one"></div>
      <div className="auth-screen__orb auth-screen__orb--two"></div>

      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1>ProPath</h1>
            <p>منصة تعليمية أنيقة لإدارة التكوين والمواكبة اليومية</p>
          </div>
        </div>

        {error ? <div className="auth-error">{error}</div> : null}

        <div className="auth-field">
          <label>اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="أدخل اسم المستخدم"
            required
          />
        </div>

        <div className="auth-field">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="أدخل كلمة المرور"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "جاري تسجيل الدخول..." : "دخول إلى المنصة"}
        </button>
      </form>
    </div>
  );
}

function Header({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleLabel = (role) => {
    const labels = {
      مدير: "إدارة المنصة",
      مدرب: "فضاء المكون",
      متدرب: "فضاء المتدرب",
    };
    return labels[role] || role;
  };

  return (
    <header className="app-shell__header">
      <div className="app-shell__brand">
        <div className="app-shell__logo">
          <GraduationCap size={20} />
        </div>
        <div>
          <h1>ProPath</h1>
          <p>{getRoleLabel(user?.role)}</p>
        </div>
      </div>

      <div className="app-shell__user">
        <div className="app-shell__user-meta">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>

        <div className="app-shell__user-menu">
          <button
            type="button"
            className="app-shell__avatar-btn"
            title="القائمة"
            onClick={() => setShowMenu((value) => !value)}
          >
            <UserIcon size={18} />
          </button>

          {showMenu ? (
            <div className="app-shell__dropdown">
              <button
                type="button"
                className="app-shell__logout"
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("propath_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
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
    return <div className="app-loading">جاري تحميل المنصة...</div>;
  }

  return (
    <Router>
      {user ? <Header user={user} onLogout={handleLogout} /> : null}
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} />} />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
