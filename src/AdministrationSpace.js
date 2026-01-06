import  { useState } from "react";
import {
  Users,
  Layers,
  Bell,
  BarChart2,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import "./AdministrationSpace.css"; // استيراد ملف التنسيق

export default function AdministrationSpace () {
  // الحالة لتحديد الصفحة النشطة
  const [activeTab, setActiveTab] = useState("users");

  // --- بيانات تجريبية (Mock Data) ---
  const [users] = useState([
    {
      id: 1,
      name: "أحمد العلوي",
      role: "مكون",
      email: "ahmed@propath.com",
      status: "نشط",
    },
    {
      id: 2,
      name: "سارة المنصوري",
      role: "متدرب",
      email: "sara@student.com",
      status: "نشط",
    },
    {
      id: 3,
      name: "كريم بناني",
      role: "إداري",
      email: "karim@admin.com",
      status: "موقوف",
    },
    {
      id: 4,
      name: "ليلى العمري",
      role: "متدرب",
      email: "laila@student.com",
      status: "نشط",
    },
  ]);

  const [departments] = useState([
    { id: 1, name: "تطوير الرقمي (Dev Digital)", modules: 5, totalHours: 120 },
    { id: 2, name: "البنية التحتية للشبكات", modules: 4, totalHours: 100 },
    { id: 3, name: "الذكاء الاصطناعي", modules: 6, totalHours: 140 },
  ]);

  // --- المكونات الفرعية (Sub-components) ---

  // 1. قسم إدارة الحسابات
  const UserManagement = () => (
    <div className="fade-in">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>إدارة الحسابات والصلاحيات</h2>
        <button className="btn-primary">
          <Plus size={18} />
          <span>إضافة مستخدم</span>
        </button>
      </div>

      <div className="table-container">
        <div className="search-bar">
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              className="search-input"
              placeholder="بحث عن مستخدم..."
              style={{ width: "100%" }}
            />
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "10px",
                top: "10px",
                color: "#94a3b8",
              }}
            />
          </div>
          <select className="form-control" style={{ width: "150px" }}>
            <option>الكل</option>
            <option>مكون</option>
            <option>متدرب</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>الدور (Role)</th>
              <th>البريد الإلكتروني</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.name}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "مكون"
                        ? "badge-purple"
                        : user.role === "متدرب"
                        ? "badge-green"
                        : "badge-gray"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={{ color: "#64748b" }}>{user.email}</td>
                <td>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: user.status === "نشط" ? "#16a34a" : "#dc2626",
                      fontSize: "0.9rem",
                    }}
                  >
                    {user.status === "نشط" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {user.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#2563eb",
                        cursor: "pointer",
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 2. قسم الهيكلة
  const StructureManagement = () => (
    <div className="fade-in">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>هيكلة الشعب والوحدات</h2>
        <button className="btn-primary" style={{ backgroundColor: "#4f46e5" }}>
          <Plus size={18} />
          <span>إضافة شعبة</span>
        </button>
      </div>

      <div className="grid-container">
        {departments.map((dept) => (
          <div key={dept.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  background: "#e0e7ff",
                  borderRadius: "8px",
                  color: "#4f46e5",
                }}
              >
                <Layers size={24} />
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <Edit size={18} />
              </button>
            </div>

            <h3 className="card-title">{dept.name}</h3>

            <div className="card-stats">
              <span>عدد الوحدات:</span>
              <span style={{ fontWeight: "bold", color: "#1e293b" }}>
                {dept.modules}
              </span>
            </div>
            <div className="card-stats">
              <span>الحجم الساعي:</span>
              <span style={{ fontWeight: "bold", color: "#1e293b" }}>
                {dept.totalHours} ساعة
              </span>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "8px" }}>
              <button
                className="form-control"
                style={{
                  textAlign: "center",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                عرض الوحدات
              </button>
              <button
                className="form-control"
                style={{
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  border: "none",
                  fontSize: "0.9rem",
                }}
              >
                الخريطة
              </button>
            </div>
          </div>
        ))}

        {/* بطاقة إضافة سريعة */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderStyle: "dashed",
            cursor: "pointer",
            minHeight: "200px",
          }}
        >
          <Plus size={40} color="#94a3b8" />
          <span style={{ color: "#94a3b8", marginTop: "10px" }}>
            إنشاء وحدة جديدة
          </span>
        </div>
      </div>
    </div>
  );

  // 3. قسم الإشعارات
  const Announcements = () => (
    <div className="fade-in">
      <h2 style={{ marginBottom: "1.5rem", color: "#1e293b" }}>
        نشر الإشعارات والأخبار
      </h2>

      <div className="grid-container" style={{ alignItems: "start" }}>
        {/* نموذج النشر */}
        <div className="form-card" style={{ gridColumn: "span 2" }}>
          <h3
            className="card-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Edit size={20} color="#f97316" />
            إنشاء إعلان جديد
          </h3>

          <div className="form-group">
            <label>عنوان الإعلان</label>
            <input
              type="text"
              className="form-control"
              placeholder="مثال: موعد امتحانات الدورة الأولى"
            />
          </div>

          <div className="form-group">
            <label>الفئة المستهدفة</label>
            <select className="form-control">
              <option>جميع المستخدمين</option>
              <option>المكونين فقط</option>
              <option>المتدربين</option>
            </select>
          </div>

          <div className="form-group">
            <label>نص الإعلان</label>
            <textarea
              rows="5"
              className="form-control"
              placeholder="اكتب التفاصيل هنا..."
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-primary"
              style={{ backgroundColor: "#f97316" }}
            >
              نشر الإعلان
            </button>
          </div>
        </div>

        {/* أرشيف الإعلانات */}
        <div className="card" style={{ background: "#f8fafc" }}>
          <h3
            className="card-title"
            style={{ fontSize: "1rem", display: "flex", gap: "8px" }}
          >
            <Bell size={18} />
            آخر الإعلانات
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  borderRight: "4px solid #f97316",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginBottom: "4px",
                  }}
                >
                  05 يناير 2026
                </p>
                <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#1e293b" }}>
                  تذكير بتسليم المشاريع
                </h4>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  يرجى من جميع المتدربين رفع المشاريع...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 4. قسم التقارير
  const Reports = () => (
    <div className="fade-in">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>التقارير والإحصائيات</h2>
        <button
          className="form-control"
          style={{
            width: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <Download size={18} />
          <span>تصدير PDF</span>
        </button>
      </div>

      <div className="stats-grid">
        {[
          { title: "إجمالي المتدربين", val: "1,240", color: "#3b82f6" },
          { title: "نسبة الحضور", val: "92%", color: "#22c55e" },
          { title: "المكونين", val: "45", color: "#a855f7" },
          { title: "الوحدات", val: "18", color: "#f97316" },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div
              className="stat-indicator"
              style={{ backgroundColor: stat.color }}
            ></div>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                {stat.title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {stat.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-container">
        {/* رسم بياني بسيط (محاكاة) */}
        <div className="card">
          <h3 className="card-title" style={{ display: "flex", gap: "8px" }}>
            <BarChart2 size={20} color="#2563eb" />
            إحصائيات النجاح
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "1rem",
              height: "200px",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "10px",
            }}
          >
            {/* أعمدة الرسم البياني */}
            {[80, 60, 90, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  backgroundColor: i % 2 === 0 ? "#93c5fd" : "#3b82f6",
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                }}
              ></div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            <span>تطوير</span>
            <span>شبكات</span>
            <span>ذكاء</span>
            <span>تصميم</span>
          </div>
        </div>

        {/* قائمة التقارير */}
        <div className="card">
          <h3 className="card-title">تقارير جاهزة</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            {["تقرير الغياب - يناير", "نتائج الامتحانات", "الخريجين 2025"].map(
              (report, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: "1px solid transparent",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "#cbd5e1")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <FileText size={18} color="#94a3b8" />
                    <span style={{ fontSize: "0.9rem", color: "#334155" }}>
                      {report}
                    </span>
                  </div>
                  <Download size={16} color="#64748b" />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="admin-container">
      {/* القائمة الجانبية Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Propath</h1>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>فضاء الإدارة</p>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab("users")}
            className={`nav-btn ${activeTab === "users" ? "active users" : ""}`}
          >
            <Users size={20} />
            <span>إدارة الحسابات</span>
          </button>

          <button
            onClick={() => setActiveTab("structure")}
            className={`nav-btn ${
              activeTab === "structure" ? "active structure" : ""
            }`}
          >
            <Layers size={20} />
            <span>الهيكلة والوحدات</span>
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`nav-btn ${
              activeTab === "announcements" ? "active announcements" : ""
            }`}
          >
            <Bell size={20} />
            <span>الإشعارات العامة</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`nav-btn ${
              activeTab === "reports" ? "active reports" : ""
            }`}
          >
            <BarChart2 size={20} />
            <span>التقارير والإحصاء</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              A
            </div>
            <div>
              <p style={{ margin: 0, color: "white", fontSize: "0.9rem" }}>
                Admin User
              </p>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem" }}>
                مسؤول النظام
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي Main Content */}
      <main className="main-content">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "structure" && <StructureManagement />}
        {activeTab === "announcements" && <Announcements />}
        {activeTab === "reports" && <Reports />}
      </main>
    </div>
  );
};

