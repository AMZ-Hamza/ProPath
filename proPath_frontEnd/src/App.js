import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Settings } from "lucide-react";
import AdministrationSpace from "./AdministrationSpace";
import TrainerSpace from "./TrainerSpace";
import StagiereSpace from "./stagiereSpace";
import dataService from "./dataService";
import { Header, ProtectedRoute } from "./features/app/AppShell";
import { LoginScreen, SetupScreen } from "./features/auth/AuthScreens";
import { clearSession, getHomeRoute, persistSession, readStoredSession } from "./features/auth/session";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bootState, setBootState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    const loadApp = async () => {
      setLoading(true);
      setBootError(null);

      try {
        const state = await dataService.fetchBootState();
        if (!state || !state.settings) {
          throw new Error("Invalid boot state received from server.");
        }
        setBootState(state);

        const storedUser = readStoredSession();
        if (storedUser && state.isConfigured) {
          setUser(storedUser);
        } else {
          clearSession();
        }
      } catch (err) {
        console.error("App boot failed:", err);
        setBootError(err.message || "An unknown error occurred during initialization.");
      } finally {
        setLoading(false);
      }
    };

    loadApp();
  }, []);

  const handleLogin = async (credentials) => {
    const authenticatedUser = await dataService.authenticate(credentials);
    persistSession(authenticatedUser);
    setUser(authenticatedUser);
    navigate(getHomeRoute(authenticatedUser.role), { replace: true });
  };

  const handleSetup = async (payload) => {
    const adminUser = await dataService.bootstrapAdmin(payload);
    const settings = await dataService.fetchSettings();
    persistSession(adminUser);
    setBootState({ settings, isConfigured: true });
    setUser(adminUser);
    navigate("/admin", { replace: true });
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const showHeader =
    Boolean(user) &&
    !location.pathname.startsWith("/login") &&
    !location.pathname.startsWith("/setup");

  if (loading) {
    return (
      <div className="app-loading">
        <Settings size={18} className="spin" />
        <span>جاري تهيئة المنصة...</span>
      </div>
    );
  }

  if (bootError || !bootState) {
    return (
      <div className="auth-screen">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-error" style={{ marginBottom: "24px" }}>
            {bootError || "تعذر تحميل إعدادات المنصة."}
          </div>
          <button 
            className="auth-submit" 
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showHeader ? (
        <Header user={user} settings={bootState.settings} onLogout={handleLogout} />
      ) : null}

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                user
                  ? getHomeRoute(user.role)
                  : bootState.isConfigured
                    ? "/login"
                    : "/setup"
              }
              replace
            />
          }
        />
        <Route
          path="/setup"
          element={
            bootState.isConfigured ? (
              <Navigate to={user ? getHomeRoute(user.role) : "/login"} replace />
            ) : (
              <SetupScreen settings={bootState.settings} onSetup={handleSetup} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !bootState.isConfigured ? (
              <Navigate to="/setup" replace />
            ) : user ? (
              <Navigate to={getHomeRoute(user.role)} replace />
            ) : (
              <LoginScreen settings={bootState.settings} onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} allowedRoles={["admin", "proAdmin"]}>
              <AdministrationSpace user={user} settings={bootState.settings} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/*"
          element={
            <ProtectedRoute user={user} allowedRoles={["trainer"]}>
              <TrainerSpace user={user} settings={bootState.settings} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stagiere/*"
          element={
            <ProtectedRoute user={user} allowedRoles={["student"]}>
              <StagiereSpace user={user} settings={bootState.settings} />
            </ProtectedRoute>
          }
        />
        <Route path="/student/*" element={<Navigate to="/stagiere" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
