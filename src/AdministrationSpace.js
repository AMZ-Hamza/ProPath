import React, { useEffect, useMemo, useState } from "react";
import { BarChart2, Bell, CalendarDays, Edit, Layers, Plus, Search, Trash2, Upload, Users } from "lucide-react";
import dataService from "./dataService.js";
import "./AdministrationSpace.css";

const AUDIENCES = [
  { value: "all", label: "الجميع" },
  { value: "students", label: "المتدربون" },
  { value: "trainers", label: "المكونون" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Modal({ title, children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="page-header" style={{ marginBottom: "16px" }}>
          <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
          <button className="form-control" style={{ width: "auto" }} onClick={onClose}>
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserManagement({ currentUser }) {
  const emptyForm = { name: "", username: "", password: "", role: "متدرب", email: "" };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingUserId, setEditingUserId] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setUsers((await dataService.fetchUsers().catch(() => [])) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((user) => {
    const matchesSearch = `${user.name || ""} ${user.username || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role === "all" || user.role === role;
    return matchesSearch && matchesRole;
  });

  const isProtectedAdmin = (user) =>
    user?.role === "مدير" && String(user.id) !== String(currentUser?.id);

  const saveUser = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      alert("الرجاء ملء الاسم واسم الدخول");
      return;
    }

    if (editingUserId) {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        role: form.role,
        email: form.email.trim(),
      };
      if (form.password.trim()) payload.password = form.password.trim();
      await dataService.updateUser(editingUserId, payload);
    } else {
      if (!form.password.trim()) {
        alert("الرجاء إدخال كلمة المرور");
        return;
      }
      await dataService.addUser({ ...form, id: Date.now().toString() });
    }

    setForm(emptyForm);
    setShowModal(false);
    setEditingUserId("");
    loadUsers();
  };

  const startEditUser = (user) => {
    if (isProtectedAdmin(user)) {
      alert("لا يمكن تعديل معلومات مدير آخر.");
      return;
    }

    setForm({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: user.role || "متدرب",
      email: user.email || "",
    });
    setEditingUserId(user.id);
    setShowModal(true);
  };

  const deleteUser = async (user) => {
    if (isProtectedAdmin(user)) {
      alert("لا يمكن حذف حساب مدير آخر.");
      return;
    }

    if (!window.confirm("هل تريد حذف هذا المستخدم؟")) return;
    await dataService.deleteUser(user.id);
    loadUsers();
  };

  return (
    <div>
      <div className="page-header">
        <h2>إدارة المستخدمين</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          إضافة مستخدم
        </button>
      </div>

      <div className="table-container">
        <div className="search-bar">
          <div style={{ position: "relative", flex: 1 }}>
            <input
              className="search-input"
              placeholder="بحث..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ paddingInlineStart: "40px" }}
            />
            <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>
          <select className="form-control" style={{ width: "180px" }} value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="all">الكل</option>
            <option value="مدير">مدير</option>
            <option value="مدرب">مدرب</option>
            <option value="متدرب">متدرب</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد</th>
              <th>اسم الدخول</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5">لا توجد نتائج</td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.username}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => startEditUser(user)}
                      style={{ border: "none", background: "transparent", color: "#2563eb", cursor: "pointer", marginLeft: "8px" }}
                      title={isProtectedAdmin(user) ? "لا يمكن تعديل مدير آخر" : "تعديل المستخدم"}
                      disabled={isProtectedAdmin(user)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(user)}
                      style={{ border: "none", background: "transparent", color: "#dc2626", cursor: "pointer" }}
                      title={isProtectedAdmin(user) ? "لا يمكن حذف مدير آخر" : "حذف المستخدم"}
                      disabled={isProtectedAdmin(user)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal ? (
        <Modal
          title={editingUserId ? "تعديل مستخدم" : "إضافة مستخدم"}
          onClose={() => {
            setShowModal(false);
            setEditingUserId("");
            setForm(emptyForm);
          }}
        >
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input className="form-control" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div className="form-group">
            <label>اسم الدخول</label>
            <input className="form-control" value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" className="form-control" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          </div>
          <div className="form-group">
            <label>الدور</label>
            <select className="form-control" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="متدرب">متدرب</option>
              <option value="مدرب">مدرب</option>
              <option value="مدير">مدير</option>
            </select>
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input className="form-control" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </div>
          <button className="btn-primary" onClick={saveUser}>{editingUserId ? "حفظ التعديل" : "حفظ المستخدم"}</button>
        </Modal>
      ) : null}
    </div>
  );
}

function StructureManagement() {
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([
      dataService.fetchSubjects().catch(() => []),
      dataService.fetchGroups().catch(() => []),
      dataService.fetchStudents().catch(() => []),
    ]).then(([subjectsData, groupsData, studentsData]) => {
      setSubjects(subjectsData || []);
      setGroups(groupsData || []);
      setStudents(studentsData || []);
    });
  }, []);

  const groupCounts = useMemo(
    () => Object.fromEntries(groups.map((group) => [group.id, students.filter((student) => String(student.group) === String(group.id)).length])),
    [groups, students],
  );

  return (
    <div>
      <div className="page-header">
        <h2>هيكلة الشعب والأفواج</h2>
      </div>
      <div className="grid-container">
        {subjects.map((subject) => {
          const subjectGroups = groups.filter((group) => String(group.subjectId) === String(subject.id));
          return (
            <div className="card" key={subject.id}>
              <div className="card-title">{subject.name}</div>
              <div className="card-stats">
                <span>عدد الأفواج</span>
                <strong>{subjectGroups.length}</strong>
              </div>
              <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
                {subjectGroups.length === 0 ? (
                  <div style={{ color: "#64748b" }}>لا توجد أفواج مرتبطة بهذه المادة.</div>
                ) : (
                  subjectGroups.map((group) => (
                    <div key={group.id} style={{ padding: "10px 12px", borderRadius: "10px", background: "#f8fafc" }}>
                      <div style={{ fontWeight: 600 }}>{group.name}</div>
                      <div style={{ color: "#64748b", marginTop: "4px" }}>عدد المتدربين: {groupCounts[group.id] || 0}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementManagement() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("students");

  const loadAnnouncements = async () => {
    setItems((await dataService.fetchNews().catch(() => [])) || []);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("الرجاء ملء العنوان والمحتوى");
      return;
    }
    await dataService.addNews({ title: title.trim(), content: content.trim(), audience });
    setTitle("");
    setContent("");
    setAudience("students");
    loadAnnouncements();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px" }}>
      <div className="form-card">
        <h2 className="card-title">إدارة الإعلانات</h2>
        <div className="form-group">
          <label>العنوان</label>
          <input className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="form-group">
          <label>إعلان موجّه إلى</label>
          <select className="form-control" value={audience} onChange={(event) => setAudience(event.target.value)}>
            {AUDIENCES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>المحتوى</label>
          <textarea className="form-control" rows="5" value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
        <button className="btn-primary" onClick={submit}>
          <Bell size={18} />
          نشر الإعلان
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">الإعلانات المنشورة</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {items.length === 0 ? (
            <p style={{ color: "#64748b" }}>لا توجد إعلانات حالياً.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="announcement-item">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.title}</div>
                    <div style={{ color: "#64748b", marginTop: "6px" }}>{formatDate(item.date)}</div>
                  </div>
                  <span className="badge badge-blue">
                    {AUDIENCES.find((option) => option.value === (item.audience || item.category || "all"))?.label || "الجميع"}
                  </span>
                </div>
                <p style={{ margin: "10px 0 0", color: "#334155" }}>{item.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TimetableManagement() {
  const [type, setType] = useState("student");
  const [targetId, setTargetId] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [groups, setGroups] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [items, setItems] = useState([]);

  const loadTimetables = async () => {
    const [groupsData, usersData, timetableData] = await Promise.all([
      dataService.fetchGroups().catch(() => []),
      dataService.fetchUsers().catch(() => []),
      dataService.fetchTimetables().catch(() => []),
    ]);
    setGroups(groupsData || []);
    setTrainers((usersData || []).filter((user) => user.role === "مدرب"));
    setItems(timetableData || []);
  };

  useEffect(() => {
    loadTimetables();
  }, []);

  useEffect(() => {
    const options = type === "student" ? groups : trainers;
    setTargetId(options[0]?.id || "");
  }, [groups, trainers, type]);

  const targets = type === "student" ? groups : trainers;

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPreview(await readFileAsDataUrl(file));
  };

  const upload = async () => {
    if (!targetId || !preview) {
      alert("يرجى اختيار الجهة ورفع صورة الجدول");
      return;
    }
    await dataService.addTimetable({
      type,
      targetId,
      fileData: preview,
      fileName,
    });
    setPreview("");
    setFileName("");
    loadTimetables();
  };

  const getTargetName = (item) => {
    const collection = item.type === "teacher" ? trainers : groups;
    return collection.find((entry) => String(entry.id) === String(item.targetId))?.name || item.targetId;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "24px" }}>
      <div className="form-card">
        <h2 className="card-title">رفع الجداول</h2>
        <div className="form-group">
          <label>نوع الجدول</label>
          <select className="form-control" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="student">جدول المتدربين حسب الفوج</option>
            <option value="teacher">جدول خاص بالمكون</option>
          </select>
        </div>
        <div className="form-group">
          <label>{type === "student" ? "الفوج" : "المكون"}</label>
          <select className="form-control" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            <option value="">-- اختر --</option>
            {targets.map((target) => (
              <option key={target.id} value={target.id}>{target.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>صورة الجدول</label>
          <input type="file" accept="image/*" className="form-control" onChange={onFileChange} />
        </div>
        {preview ? (
          <div className="timetable-preview">
            <img src={preview} alt="preview" style={{ width: "100%", borderRadius: "12px" }} />
          </div>
        ) : null}
        <button className="btn-primary" onClick={upload}>
          <Upload size={18} />
          حفظ الجدول
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">الجداول المرفوعة</h2>
        {items.length === 0 ? (
          <p style={{ color: "#64748b" }}>لا توجد جداول مرفوعة.</p>
        ) : (
          <div className="timetable-grid">
            {items.map((item) => (
              <div key={item.id} className="timetable-card">
                <img src={item.fileData} alt={getTargetName(item)} className="timetable-image" />
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontWeight: 700 }}>{getTargetName(item)}</div>
                  <div style={{ color: "#64748b", marginTop: "4px" }}>{item.type === "teacher" ? "جدول مكون" : "جدول فوج"}</div>
                  <div style={{ color: "#64748b", marginTop: "4px", fontSize: "0.9rem" }}>{formatDate(item.uploadedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsOverview() {
  const [stats, setStats] = useState([]);
  const [absenceRows, setAbsenceRows] = useState([]);
  const [gradeRows, setGradeRows] = useState([]);

  useEffect(() => {
    Promise.all([
      dataService.fetchUsers().catch(() => []),
      dataService.fetchGroups().catch(() => []),
      dataService.fetchSubjects().catch(() => []),
      dataService.fetchNews().catch(() => []),
      dataService.fetchAttendances().catch(() => []),
      dataService.fetchStudents().catch(() => []),
    ]).then(([users, groups, subjects, news, attendances, students]) => {
      const absentCount = attendances.filter((item) => item.status === "absent").length;
      const absenceSummary = groups.map((group) => {
        const rows = attendances.filter((row) => String(row.group) === String(group.id));
        const absences = rows.filter((row) => row.status === "absent").length;
        return { id: group.id, name: group.name, absences, total: rows.length };
      });
      const gradesSummary = subjects.map((subject) => {
        const finals = students
          .map((student) => dataService.calculateFinalGrade(student.grades?.[subject.id] || {}))
          .filter((value) => value != null);
        const average = finals.length ? (finals.reduce((sum, value) => sum + value, 0) / finals.length).toFixed(2) : "-";
        return { id: subject.id, name: subject.name, average, count: finals.length };
      });
      setStats([
        { id: "users", label: "إجمالي المستخدمين", value: users.length, color: "#2563eb" },
        { id: "groups", label: "إجمالي الأفواج", value: groups.length, color: "#4f46e5" },
        { id: "subjects", label: "الوحدات", value: subjects.length, color: "#f97316" },
        { id: "news", label: "الإعلانات", value: news.length, color: "#16a34a" },
        { id: "absences", label: "حالات الغياب", value: absentCount, color: "#dc2626" },
      ]);
      setAbsenceRows(absenceSummary);
      setGradeRows(gradesSummary);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>التقارير</h2>
      </div>
      <div className="stats-grid stats-grid-wide">
        {stats.map((card) => (
          <div key={card.id} className="stat-card">
            <div className="stat-indicator" style={{ backgroundColor: card.color }}></div>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1e293b" }}>{card.value}</div>
              <div style={{ color: "#64748b" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-container reports-grid">
        <div className="card">
          <h3 className="card-title">تقرير الغياب حسب الفوج</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>الفوج</th>
                  <th>الغيابات</th>
                  <th>السجلات</th>
                </tr>
              </thead>
              <tbody>
                {absenceRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.absences}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">تقرير المعدلات حسب المادة</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>عدد النتائج</th>
                  <th>متوسط النهائي</th>
                </tr>
              </thead>
              <tbody>
                {gradeRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                    <td>{row.average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdministrationSpace({ user }) {
  const [activeSection, setActiveSection] = useState("users");

  const sections = [
    { id: "users", label: "المستخدمون", icon: Users, className: "users" },
    { id: "structure", label: "الهيكلة", icon: Layers, className: "structure" },
    { id: "announcements", label: "الإعلانات", icon: Bell, className: "announcements" },
    { id: "timetables", label: "الجداول", icon: CalendarDays, className: "timetables" },
    { id: "reports", label: "التقارير", icon: BarChart2, className: "reports" },
  ];

  const renderSection = () => {
    if (activeSection === "users") return <UserManagement currentUser={user} />;
    if (activeSection === "structure") return <StructureManagement />;
    if (activeSection === "announcements") return <AnnouncementManagement />;
    if (activeSection === "timetables") return <TimetableManagement />;
    return <ReportsOverview />;
  };

  return (
    <div className="admin-container">
      <aside className="sidebar2">
        <div className="sidebar-header">
          <h1>ProPath</h1>
          <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>إدارة المنصة</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                className={`nav-btn ${section.className} ${isActive ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main-content">{renderSection()}</main>
    </div>
  );
}
