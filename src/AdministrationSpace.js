import { useState, useEffect } from "react";
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
import dataService from "./dataService.js";
import "./AdministrationSpace.css"; // استيراد ملف التنسيق

export default function AdministrationSpace({ user, onLogout }) {
  // الحالة لتحديد الصفحة النشطة
  const [activeTab, setActiveTab] = useState("users");

  // --- حالات البيانات المجلوبة من API ---
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, subjectsData] = await Promise.all([
          dataService.fetchUsers(),
          dataService.fetchSubjects(),
        ]);
        setUsers(usersData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // بيانات افتراضية للأقسام (يمكن جلبها من API لاحقاً)
  const departments = [
    { id: 1, name: "تطوير الرقمي (Dev Digital)", modules: 5, totalHours: 120 },
    { id: 2, name: "البنية التحتية للشبكات", modules: 4, totalHours: 100 },
    { id: 3, name: "الذكاء الاصطناعي", modules: 6, totalHours: 140 },
  ];

  // --- المكونات الفرعية (Sub-components) ---

  // 1. قسم إدارة الحسابات
  const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showUserModal, setShowUserModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", username: "", password: "", role: "متدرب", email: "" });

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.includes(searchTerm) || user.username.includes(searchTerm);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    const handleAddUser = async () => {
      if (!formData.name || !formData.username || !formData.password) {
        alert("الرجاء ملء جميع الحقول المطلوبة");
        return;
      }
      try {
        await dataService.addUser(formData);
        const refreshed = await dataService.fetchUsers();
        setUsers(refreshed);
        setFormData({ name: "", username: "", password: "", role: "متدرب", email: "" });
        setShowUserModal(false);
        alert("تمت إضافة المستخدم بنجاح");
      } catch (err) {
        console.error(err);
        alert("خطأ أثناء إضافة المستخدم");
      }
    };

    return (
      <div className="fade-in">
        <div className="page-header">
          <h2 style={{ margin: 0 }}>إدارة الحسابات والصلاحيات</h2>
          <button className="btn-primary" onClick={() => setShowUserModal(true)}>
            <Plus size={18} />
            <span>إضافة مستخدم</span>
          </button>
        </div>

        {showUserModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div style={{
              background: "#fff", borderRadius: "8px", padding: "25px",
              width: "90%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ marginTop: 0, color: "#1e293b" }}>إضافة مستخدم جديد</h3>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "5px", color: "#475569" }}>الاسم الكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "5px", color: "#475569" }}>اسم الدخول</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="أدخل اسم الدخول"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "5px", color: "#475569" }}>كلمة المرور</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "5px", color: "#475569" }}>الدور</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                >
                  <option value="متدرب">متدرب</option>
                  <option value="مدرب">مدرب</option>
                  <option value="مدير">مدير</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "5px", color: "#475569" }}>البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowUserModal(false)}
                  style={{
                    padding: "10px 20px", border: "1px solid #cbd5e1",
                    borderRadius: "6px", background: "#f1f5f9", cursor: "pointer", fontSize: "0.9rem"
                  }}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddUser}
                  style={{
                    padding: "10px 20px", border: "none",
                    borderRadius: "6px", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: "0.9rem"
                  }}
                >
                  إضافة المستخدم
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <p>جاري تحميل البيانات...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <div className="search-bar" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="بحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", padding: "10px 35px 10px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ width: "150px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="all">الكل</option>
                <option value="مدير">مدير</option>
                <option value="مدرب">مدرب</option>
                <option value="متدرب">متدرب</option>
              </select>
            </div>

            <table>
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>الدور (Role)</th>
                  <th>البريد الإلكتروني</th>
                  <th>اسم الدخول</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>لا توجد نتائج</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 500 }}>{user.name}</td>
                      <td>
                        <span
                          className={`badge ${user.role === "مدرب"
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
                      <td style={{ color: "#64748b", fontSize: "0.9rem" }}>{user.username}</td>
                      <td>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#16a34a",
                            fontSize: "0.9rem",
                          }}
                        >
                          <CheckCircle size={14} />
                          نشط
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            title="تعديل المستخدم"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#2563eb",
                              cursor: "pointer",
                            }}
                            onClick={async () => {
                              const newName = prompt("الاسم الجديد:", user.name);
                              if (!newName) return;
                              const newEmail = prompt("البريد الإلكتروني:", user.email || "");
                              const newRole = prompt("الدور:", user.role || "متدرب");
                              try {
                                await dataService.updateUser(user.id, { name: newName, email: newEmail, role: newRole });
                                const refreshed = await dataService.fetchUsers();
                                setUsers(refreshed);
                                alert("تم تعديل المستخدم");
                              } catch (err) {
                                console.error(err);
                                alert("خطأ أثناء التعديل");
                              }
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            title="حذف المستخدم"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                            onClick={async () => {
                              if (!window.confirm(`حذف المستخدم ${user.name}؟`)) return;
                              try {
                                await dataService.deleteUser(user.id);
                                const refreshed = await dataService.fetchUsers();
                                setUsers(refreshed);
                              } catch (err) {
                                console.error(err);
                                alert("خطأ أثناء الحذف");
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    // 2. قسم الهيكلة
    const StructureManagement = () => {
      const [groups, setGroups] = useState([]);
      const [subjects, subjectsState] = useState([]);

      useEffect(() => {
        (async () => {
          try {
            const g = await dataService.fetchGroups();
            const s = await dataService.fetchSubjects();
            setGroups(g || []);
            subjectsState(s || []);
          } catch (err) {
            console.error(err);
          }
        })();
      }, []);

      const addGroup = async () => {
        const name = prompt("اسم الفوج:");
        if (!name) return;
        const year = prompt("السنة الدراسية (1 أو 2):", "1");
        try {
          await dataService.addGroup({ name, year: parseInt(year) || 1 });
          const g = await dataService.fetchGroups();
          setGroups(g || []);
        } catch (err) {
          console.error(err);
          alert("خطأ في إضافة الفوج");
        }
      };

      const deleteGroup = async (id) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا الفوج؟")) return;
        try {
          await dataService.deleteGroup(id);
          const g = await dataService.fetchGroups();
          setGroups(g || []);
        } catch (err) {
          console.error(err);
          alert("خطأ في حذف الفوج");
        }
      };

      return (
        <div className="fade-in">
          <div className="page-header">
            <h2 style={{ margin: 0 }}>هيكلة الشعب والوحدات</h2>
            <button className="btn-primary" style={{ backgroundColor: "#4f46e5" }} onClick={addGroup}>
              <Plus size={18} />
              <span>إضافة شعبة</span>
            </button>
          </div>

          <div className="grid-container">
            {groups.map((group) => (
              <div key={group.id} className="card">
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
                    onClick={() => deleteGroup(group.id)}
                    title="حذف الفوج"
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

                <h3 className="card-title">{group.name}</h3>

                <div className="card-stats">
                  <span>السنة الدراسية:</span>
                  <span style={{ fontWeight: "bold", color: "#1e293b" }}>
                    السنة {group.year || 1}
                  </span>
                </div>
                <div className="card-stats">
                  <span>عدد الطلاب:</span>
                  <span style={{ fontWeight: "bold", color: "#1e293b" }}>
                    {subjects.length} وحدة
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
                    عرض الطلاب
                  </button>
                </div>
              </div>
            ))}

            {/* بطاقة إضافة سريعة */}
            <div
              className="card"
              onClick={addGroup}
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
                إنشاء فوج جديد
              </span>
            </div>
          </div>
        </div>
      );
    };

    // 3. قسم الإشعارات
    const Announcements = () => {
      const [title, setTitle] = useState("");
      const [target, setTarget] = useState("all");
      const [content, setContent] = useState("");
      const [news, setNews] = useState([]);
      const [editingId, setEditingId] = useState(null);
      const [editTitle, setEditTitle] = useState("");
      const [editContent, setEditContent] = useState("");

      useEffect(() => {
        (async () => {
          const n = await dataService.fetchNews();
          setNews(n);
        })();
      }, []);

      const submit = async () => {
        if (!title || !content) return alert("المرجو ملء العنوان والنص");
        try {
          if (editingId) {
            // وضع التعديل
            await dataService.updateNews(editingId, { title, category: target, content });
            setEditingId(null);
          } else {
            // إضافة جديدة
            await dataService.addNews({ title, category: target, content });
          }
          const n = await dataService.fetchNews();
          setNews(n);
          setTitle("");
          setContent("");
          alert(editingId ? "تم تعديل الإعلان" : "تم نشر الإعلان");
        } catch (err) {
          console.error(err);
          alert("خطأ أثناء العملية");
        }
      };

      const startEdit = (item) => {
        setEditingId(item.id);
        setTitle(item.title);
        setContent(item.content);
        setTarget(item.category || "all");
      };

      const cancelEdit = () => {
        setEditingId(null);
        setTitle("");
        setContent("");
        setTarget("all");
      };

      return (
        <div className="fade-in">
          <h2 style={{ marginBottom: "1.5rem", color: "#1e293b" }}>
            نشر الإشعارات والأخبار
          </h2>

          <div className="grid-container" style={{ alignItems: "start" }}>
            {/* نموذج النشر */}
            <div className="form-card" style={{ gridColumn: "span 2" }}>
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit size={20} color="#f97316" />
                {editingId ? "تعديل الإعلان" : "إنشاء إعلان جديد"}
              </h3>

              <div className="form-group">
                <label>عنوان الإعلان</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: موعد امتحانات الدورة الأولى" />
              </div>

              <div className="form-group">
                <label>الفئة المستهدفة</label>
                <select className="form-control" value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="all">جميع المستخدمين</option>
                  <option value="trainers">المكونين فقط</option>
                  <option value="students">المتدربين</option>
                </select>
              </div>

              <div className="form-group">
                <label>نص الإعلان</label>
                <textarea rows="5" className="form-control" value={content} onChange={(e) => setContent(e.target.value)} placeholder="اكتب التفاصيل هنا..."></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button className="btn-primary" style={{ backgroundColor: "#f97316" }} onClick={submit}>
                  {editingId ? "حفظ التعديل" : "نشر الإعلان"}
                </button>
                {editingId && (
                  <button className="form-control" style={{ width: "auto", background: "#e2e8f0", color: "#1e293b" }} onClick={cancelEdit}>
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            {/* أرشيف الإعلانات */}
            <div className="card" style={{ background: "#f8fafc" }}>
              <h3 className="card-title" style={{ fontSize: "1rem", display: "flex", gap: "8px" }}>
                <Bell size={18} />
                آخر الإعلانات
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {news.length === 0 ? (
                  <div>لا توجد إعلانات</div>
                ) : (
                  news.map((item) => (
                    <div key={item.id} style={{ background: "white", padding: "12px", borderRadius: "8px", borderRight: "4px solid #f97316", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                      <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>{item.date}</p>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#1e293b" }}>{item.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>{item.content}</p>
                      <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                        <button onClick={() => startEdit(item)} className="form-control" style={{ width: "auto", background: "transparent", border: "none", color: "#2563eb" }}>تعديل</button>
                        <button onClick={async () => { if (window.confirm('حذف الإعلان؟')) { await dataService.deleteNews(item.id); setNews(await dataService.fetchNews()); } }} className="form-control" style={{ width: "auto", background: "transparent", border: "none", color: "#dc2626" }}>حذف</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

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
        <aside className="sidebar2">
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
              className={`nav-btn ${activeTab === "structure" ? "active structure" : ""
                }`}
            >
              <Layers size={20} />
              <span>الهيكلة والوحدات</span>
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`nav-btn ${activeTab === "announcements" ? "active announcements" : ""
                }`}
            >
              <Bell size={20} />
              <span>الإشعارات العامة</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`nav-btn ${activeTab === "reports" ? "active reports" : ""
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
};
