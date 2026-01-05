import React, { useState, useEffect } from 'react';
import './App.css';

/****** Demo initial data ******/
const DEMO = {
  years: [
    {
      id: 'year1',
      label: 'السنة الأولى',
      groups: [
        {
          id: 'A1',
          name: 'المجموعة A1',
          students: [
            { reg: '2024-PT-001', name: 'أحمد بن سعيد', cc: 12, efm: 28, absences: 0 },
            { reg: '2024-PT-002', name: 'هند عبد الله', cc: 14, efm: 30, absences: 1 },
            { reg: '2024-PT-003', name: 'يوسف خالد', cc: 10, efm: 22, absences: 2 },
          ],
        },
        {
          id: 'A2',
          name: 'المجموعة A2',
          students: [
            { reg: '2024-PT-011', name: 'سمير مراد', cc: 13, efm: 26, absences: 0 },
            { reg: '2024-PT-012', name: 'منى سعيد', cc: 16, efm: 33, absences: 0 },
          ],
        },
      ],
    },
    {
      id: 'year2',
      label: 'السنة الثانية',
      groups: [
        {
          id: 'B1',
          name: 'المجموعة B1',
          students: [
            { reg: '2023-PT-101', name: 'ليلى حسن', cc: 11, efm: 25, absences: 0 },
            { reg: '2023-PT-102', name: 'طارق أمين', cc: 15, efm: 31, absences: 3 },
            { reg: '2023-PT-103', name: 'نادية أيمن', cc: 12, efm: 27, absences: 1 },
          ],
        },
        {
          id: 'B2',
          name: 'المجموعة B2',
          students: [{ reg: '2023-PT-111', name: 'رامي سالم', cc: 13, efm: 29, absences: 0 }],
        },
      ],
    },
  ],
};

/****** Utility helpers ******/
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/****** GradeEditor component ******/
function GradeEditor({ students, onSave, onCancel }) {
  const [list, setList] = useState(() => deepCopy(students));

  useEffect(() => setList(deepCopy(students)), [students]);

  function updateStudent(idx, key, value) {
    setList((prev) => {
      const c = deepCopy(prev);
      if (value === '') {
        c[idx][key] = '';
        return c;
      }
      const num = Number(value);
      if (isNaN(num)) return prev;
      c[idx][key] = num;
      return c;
    });
  }

  function handleSave() {
    const corrected = list.map((s) => {
      return {
        ...s,
        cc: s.cc === '' ? 0 : Number(s.cc),
        efm: s.efm === '' ? 0 : Number(s.efm),
      };
    });
    onSave(corrected);
  }

  return (
    <div className="editor-container">
      <h3>تعديل النقط</h3>
      <p className="instruction">حدّث نقط الطلاب وانقر على حفظ</p>
      
      <div className="table-wrapper">
        <table className="grades-table">
          <thead>
            <tr>
              <th>رقم التسجيل</th>
              <th>اسم الطالب</th>
              <th>CC (20)</th>
              <th>EFM (40)</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, idx) => {
              const total = (Number(s.cc) || 0) + (Number(s.efm) || 0);
              return (
                <tr key={s.reg}>
                  <td>{s.reg}</td>
                  <td>{s.name}</td>
                  <td>
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      value={s.cc} 
                      onChange={(e) => updateStudent(idx, 'cc', e.target.value)} 
                      className="grade-input"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      min="0" 
                      max="40" 
                      value={s.efm} 
                      onChange={(e) => updateStudent(idx, 'efm', e.target.value)} 
                      className="grade-input"
                    />
                  </td>
                  <td className={`total ${total >= 30 ? 'pass' : 'fail'}`}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleSave}>💾 حفظ</button>
        <button className="btn btn-secondary" onClick={() => setList(deepCopy(students))}>↻ إعادة تعيين</button>
        <button className="btn btn-cancel" onClick={onCancel}>✕ إلغاء</button>
      </div>
    </div>
  );
}

/****** AbsenceMarker component ******/
function AbsenceMarker({ students, onSave, onCancel }) {
  const [list, setList] = useState(() => deepCopy(students));

  useEffect(() => setList(deepCopy(students)), [students]);

  function toggleAbs(idx) {
    setList((prev) => {
      const c = deepCopy(prev);
      c[idx].selectedAbsent = !c[idx].selectedAbsent;
      return c;
    });
  }

  function handleSave() {
    const updated = list.map((s) => {
      if (s.selectedAbsent)
        return { ...s, absences: (Number(s.absences) || 0) + 1, selectedAbsent: false };
      return s;
    });
    onSave(updated);
  }

  const selectedCount = list.filter(s => s.selectedAbsent).length;

  return (
    <div className="editor-container">
      <h3>تسجيل الغياب</h3>
      <p className="instruction">حدد الطلاب الغائبين وانقر على حفظ (المحددون: {selectedCount})</p>
      
      <div className="table-wrapper">
        <table className="absence-table">
          <thead>
            <tr>
              <th width="50">✓</th>
              <th>رقم التسجيل</th>
              <th>اسم الطالب</th>
              <th>إجمالي الغيابات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, idx) => (
              <tr key={s.reg} className={s.selectedAbsent ? 'absent' : ''}>
                <td className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={!!s.selectedAbsent} 
                    onChange={() => toggleAbs(idx)}
                    className="absence-checkbox"
                  />
                </td>
                <td>{s.reg}</td>
                <td>{s.name}</td>
                <td className="absence-count">{s.absences || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleSave}>💾 حفظ</button>
        <button className="btn btn-secondary" onClick={() => setList(deepCopy(students))}>↻ إعادة تعيين</button>
        <button className="btn btn-cancel" onClick={onCancel}>✕ إلغاء</button>
      </div>
    </div>
  );
}

/****** FileUploader component ******/
function FileUploader({ files, onUpload, onCancel }) {
  const [selected, setSelected] = useState([]);
  const [currentFiles, setCurrentFiles] = useState(() => files || []);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => setCurrentFiles(files || []), [files]);

  function handleFileChange(e) {
    const fl = Array.from(e.target.files || []);
    setSelected(fl);
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const fl = Array.from(e.dataTransfer.files || []);
    setSelected(fl);
  }

  function handleUpload() {
    if (selected.length === 0) {
      alert('يرجى اختيار ملف واحد على الأقل');
      return;
    }
    onUpload(selected);
    setSelected([]);
    document.getElementById('file-input').value = '';
  }

  function handleRemove(index) {
    const next = currentFiles.filter((f, i) => i !== index);
    setCurrentFiles(next);
  }

  function getFileIcon(name) {
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (name.match(/\.(mp4|avi|mov|mkv)$/)) return '🎥';
    if (name.match(/\.(jpg|png|gif|jpeg)$/)) return '🖼️';
    return '📎';
  }

  return (
    <div className="editor-container">
      <h3>رفع الدروس والتمارين</h3>
      <p className="instruction">أضف ملفات الدروس والتمارين والموارد التعليمية</p>

      <div
        className={`upload-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📤</div>
          <p className="upload-text">اسحب الملفات هنا أو</p>
          <label htmlFor="file-input" className="file-label">
            اختر من الجهاز
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="selected-files">
          <p className="selected-label">الملفات المختارة ({selected.length}):</p>
          <ul className="file-list-selected">
            {selected.map((f, idx) => (
              <li key={idx}>{getFileIcon(f.name)} {f.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleUpload}>📤 رفع الملفات</button>
        <button className="btn btn-cancel" onClick={onCancel}>✕ إلغاء</button>
      </div>

      {currentFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>الملفات المرفوعة</h4>
          <div className="files-grid">
            {currentFiles.map((f, idx) => (
              <div className="file-card" key={idx}>
                <div className="file-icon">{getFileIcon(f.name)}</div>
                <div className="file-info">
                  <p className="file-name">{f.name}</p>
                  <p className="file-meta">{f.size ? Math.round(f.size / 1024) + ' KB' : 'بدون حجم'}</p>
                  {f.date && <p className="file-date">{f.date}</p>}
                </div>
                <button 
                  className="btn-delete" 
                  onClick={() => handleRemove(idx)}
                  title="حذف الملف"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/****** Main App component ******/
function App() {
  const [data, setData] = useState(() => deepCopy(DEMO));
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [mode, setMode] = useState('home');
  const [toast, setToast] = useState('');

  const yearObj = data.years.find((y) => y.id === selectedYear);
  const groups = yearObj ? yearObj.groups : [];
  const group = groups.find((g) => g.id === selectedGroupId);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function handleSaveGrades(updatedStudents) {
    setData((prev) => {
      const copy = deepCopy(prev);
      for (let y of copy.years) {
        for (let g of y.groups) {
          if (g.id === selectedGroupId) {
            g.students = updatedStudents;
          }
        }
      }
      return copy;
    });
    setToast('✅ تم حفظ النقط بنجاح');
    setMode('home');
  }

  function handleSaveAbsences(updatedStudents) {
    setData((prev) => {
      const copy = deepCopy(prev);
      for (let y of copy.years) {
        for (let g of y.groups) {
          if (g.id === selectedGroupId) {
            g.students = updatedStudents;
          }
        }
      }
      return copy;
    });
    setToast('✅ تم تسجيل الغياب بنجاح');
    setMode('home');
  }

  function handleUploadFiles(files) {
    setData((prev) => {
      const copy = deepCopy(prev);
      for (let y of copy.years) {
        for (let g of y.groups) {
          if (g.id === selectedGroupId) {
            g.files = g.files || [];
            const mapped = files.map((f) => ({ 
              name: f.name, 
              size: f.size, 
              date: new Date().toLocaleString('ar-SA')
            }));
            g.files = [...mapped, ...g.files];
          }
        }
      }
      return copy;
    });
    setToast('✅ تم رفع الملفات بنجاح');
    setMode('home');
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🎓</div>
            <div className="header-text">
              <h1>ProPath</h1>
              <p>منصة إدارة الأفواج الدراسية</p>
            </div>
          </div>
          <div className="user-info">
            <span className="role-badge">👨‍🏫 مدير المجموعة</span>
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">📚 اختر السنة الدراسية</h3>
            <select 
              value={selectedYear} 
              onChange={(e) => { 
                setSelectedYear(e.target.value); 
                setSelectedGroupId(''); 
                setMode('home');
              }}
              className="select-input"
            >
              <option value="">-- اختر السنة --</option>
              {data.years.map((y) => (
                <option key={y.id} value={y.id}>{y.label}</option>
              ))}
            </select>

            <h3 className="sidebar-title">👥 اختر المجموعة</h3>
            <select 
              value={selectedGroupId} 
              onChange={(e) => { 
                setSelectedGroupId(e.target.value); 
                setMode('home');
              }}
              disabled={!selectedYear}
              className="select-input"
            >
              <option value="">-- اختر المجموعة --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            {group && (
              <div className="group-info">
                <h3 className="sidebar-title">📋 معلومات المجموعة</h3>
                <div className="info-item">
                  <span className="info-label">المجموعة:</span>
                  <span className="info-value">{group.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">عدد الطلاب:</span>
                  <span className="info-value">{group.students.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">الملفات:</span>
                  <span className="info-value">{(group.files || []).length}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="main-content">
          {mode === 'home' && (
            <div className="home-view">
              {!group ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h2>مرحباً بك في ProPath</h2>
                  <p>اختر سنة دراسية ومجموعة من القائمة الجانبية للبدء</p>
                </div>
              ) : (
                <div className="actions-grid">
                  <div className="action-card" onClick={() => setMode('grades')}>
                    <div className="action-icon">📊</div>
                    <h3>تعديل النقط</h3>
                    <p>إضافة وتعديل نقاط الطلاب</p>
                  </div>

                  <div className="action-card" onClick={() => setMode('absence')}>
                    <div className="action-icon">📍</div>
                    <h3>تسجيل الغياب</h3>
                    <p>تسجيل حالات الغياب</p>
                  </div>

                  <div className="action-card" onClick={() => setMode('upload')}>
                    <div className="action-icon">📤</div>
                    <h3>رفع الدروس</h3>
                    <p>رفع الملفات والمواد التعليمية</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'grades' && group && (
            <GradeEditor 
              students={group.students} 
              onSave={handleSaveGrades}
              onCancel={() => setMode('home')}
            />
          )}

          {mode === 'absence' && group && (
            <AbsenceMarker 
              students={group.students} 
              onSave={handleSaveAbsences}
              onCancel={() => setMode('home')}
            />
          )}

          {mode === 'upload' && group && (
            <FileUploader 
              files={group.files || []} 
              onUpload={handleUploadFiles}
              onCancel={() => setMode('home')}
            />
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;