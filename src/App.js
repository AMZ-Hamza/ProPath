import React, { useState } from "react";
import AdministrationSpace from "./AdministrationSpace.js";
import StagiereSpace from "./stagiereSpace.js";
import TrainerSpace from "./TrainerSpace.js";
import dataService from "./dataService.js";
import { Dashboard, Schedule, Resources, Absence, Grades } from "./Components";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";


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
        onLogin(user); // حفظ بيانات المستخدم في الحالة العامة
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
        <h2 style={{ textAlign: "center", color: "#1e293b" }}>
          Propath - تسجيل الدخول
        </h2>
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.inputGroup}>
          <label>اسم المستخدم:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
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
            required
          />
        </div>

        <button type="submit" style={styles.loginBtn} disabled={loading}>
          {loading ? "جاري التحميل..." : "دخول"}
        </button>

        <div style={styles.hint}>
          <p>بيانات التجربة من db.json:</p>
          <small>
            admin / 123 (مدير) | trainer1 / 456 (مدرب) | student1 / pass1 (متدرب)
          </small>
        </div>
      </form>
    </div>
  );
};

// 2. المكون الرئيسي للتطبيق
export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} />} />

        {/* حماية المسارات (Routes Protection) */}
        <Route
          path="/admin"
          element={
            user?.role === "مدير" ? (
              <AdministrationSpace />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/trainer"
          element={
            user?.role === "مدرب" ? <TrainerSpace /> : <Navigate to="/" />
          }
        />
        <Route
          path="/stagiere/*"
          // element={
          //   user?.role === "متدرب" ? <StagiereSpace /> : <Navigate to="/" />
          // }
          element={<StagiereSpace />}
        />
      

        {/* مسار افتراضي */}
        <Route path="*" element={<Navigate to="/?e=1" />} />
      </Routes>
    </Router>
    
  );
}

// 3. تنسيقات بسيطة لصفحة الدخول
const styles = {
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
  },
  error: {
    color: "#dc2626",
    fontSize: "0.85rem",
    textAlign: "center",
    marginBottom: "1rem",
  },
  hint: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f8fafc",
    borderRadius: "4px",
    fontSize: "0.75rem",
    color: "#64748b",
  },
};
