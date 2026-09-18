import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { APP_NAME, ROLE_LABELS } from "../../constants";
import { getHomeRoute } from "../auth/session";

export function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return children;
}

export function Header({ user, settings, onLogout }) {
  const location = useLocation();

  const currentArea = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return "لوحة الإدارة";
    if (location.pathname.startsWith("/trainer")) return "فضاء المكوّن";
    return "فضاء المتدرب";
  }, [location.pathname]);

  return (
    <header className="app-shell__header">
      <div className="app-shell__brand">
        <div className="app-shell__logo">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1>{settings?.appName || APP_NAME}</h1>
          <p>{currentArea}</p>
        </div>
      </div>

      <div className="app-shell__user">
        <div className="app-shell__user-meta">
          <strong>{user?.name}</strong>
          <span>{ROLE_LABELS[user?.role] || user?.role}</span>
        </div>

        <div className="app-shell__user-actions">
          <div className="app-shell__user-badge">
            <UserCircle2 size={18} />
            <span>{settings?.instituteName || "إدارة التكوين"}</span>
          </div>
          <button type="button" className="app-shell__logout" onClick={onLogout}>
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </header>
  );
}
