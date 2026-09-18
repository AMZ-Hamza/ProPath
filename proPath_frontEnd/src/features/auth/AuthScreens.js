import React, { useState } from "react";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "../../constants";

function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1>{APP_NAME}</h1>
            <p>{title}</p>
          </div>
        </div>

        <div className="auth-copy">
          <h2>{description}</h2>
        </div>

        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function LoginScreen({ settings, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onLogin(form);
    } catch (loginError) {
      setError(loginError.message || "تعذر تسجيل الدخول حالياً.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={`بوابة ${settings?.appName || APP_NAME}`}
      description="تسجيل دخول موحّد لجميع الأدوار مع إدارة مركزية للبيانات."
      footer="إذا لم يتم إعداد النظام بعد، أنشئ الحساب الإداري الأول من شاشة الإعداد."
    >
      <form onSubmit={handleSubmit}>
        {error ? <div className="auth-error">{error}</div> : null}

        <div className="auth-field">
          <label htmlFor="login-username">اسم المستخدم</label>
          <input
            id="login-username"
            type="text"
            value={form.username}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                username: event.target.value,
              }))
            }
            placeholder="أدخل اسم المستخدم"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">كلمة المرور</label>
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
            placeholder="أدخل كلمة المرور"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "جاري التحقق..." : "الدخول إلى المنصة"}
        </button>
      </form>
    </AuthLayout>
  );
}

export function SetupScreen({ settings, onSetup }) {
  const [form, setForm] = useState({
    appName: settings?.appName || APP_NAME,
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setSubmitting(true);

    try {
      await onSetup(form);
    } catch (setupError) {
      setError(setupError.message || "تعذر إكمال إعداد المنصة.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="الإعداد الأولي"
      description="أنشئ الحساب الإداري الأول واضبط اسم المنصة قبل بدء الاستخدام."
      footer="لن يتم إنشاء أي بيانات تجريبية. يبدأ النظام بحالة نظيفة وجاهزة للإدخال الفعلي."
    >
      <form onSubmit={handleSubmit}>
        {error ? <div className="auth-error">{error}</div> : null}

        <div className="auth-field">
          <label htmlFor="setup-app-name">اسم المنصة</label>
          <input
            id="setup-app-name"
            type="text"
            value={form.appName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                appName: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="setup-name">اسم المسؤول</label>
          <input
            id="setup-name"
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="setup-username">اسم المستخدم</label>
            <input
              id="setup-username"
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  username: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="setup-email">البريد الإلكتروني</label>
            <input
              id="setup-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="setup-password">كلمة المرور</label>
            <input
              id="setup-password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="setup-confirm">تأكيد كلمة المرور</label>
            <input
              id="setup-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  confirmPassword: event.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "جاري إنشاء الحساب..." : "إتمام الإعداد"}
        </button>
      </form>
    </AuthLayout>
  );
}
