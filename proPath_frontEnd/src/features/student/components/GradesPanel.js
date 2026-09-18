import { BookOpen, CalendarDays } from "lucide-react";
import { normalizeGradeRecord } from "../../../services/normalizers";
import { EmptyState, StatCard } from "../../../shared";

export default function GradesPanel({ workspace }) {
  const gradeSummary = workspace.student?.gradeSummary;
  const rows = workspace.subjects.map((subject) => ({
    ...normalizeGradeRecord(workspace.student?.grades?.[subject.id] || {}),
    id: subject.id,
    subjectName: subject.name,
    coefficient: subject.coefficient ?? 1,
  }));

  return (
    <div className="panel-card">
      <h2>ÙƒØ´Ù Ø§Ù„Ù†Ù‚Ø·</h2>
      <div className="stats-grid stats-grid-wide" style={{ marginBottom: "1rem" }}>
        <StatCard title="Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø³Ù†ÙˆÙŠ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" value={gradeSummary?.canDisplayYearFinalGrade ? gradeSummary.yearFinalGrade : "ØºÙŠØ± Ù…ØªÙˆÙØ±"} accent="blue" icon={BookOpen} />
        <StatCard title="Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„ØªØ±Ø§ÙƒÙ…ÙŠ" value={gradeSummary?.canDisplayYearFinalGrade ? gradeSummary.cumulativeGpa : "ÙÙŠ Ø§Ù†ØªØ¸Ø§Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ù†Ù‡Ø§ÙŠØ© Ø§Ù„ÙˆØ­Ø¯Ø§Øª"} accent="teal" icon={CalendarDays} />
      </div>

      {!gradeSummary?.canDisplayYearFinalGrade && gradeSummary?.totalSubjects ? (
        <div className="mini-empty" style={{ marginBottom: "1rem" }}>
          {`Ø³ØªØ¸Ù‡Ø± Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø³Ù†ÙˆÙŠØ© Ø¨Ø¹Ø¯ Ø±ØµØ¯ Ø¬Ù…ÙŠØ¹ Ù†Ù‚Ø· Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ù†Ù‡Ø§ÙŠØ© Ø§Ù„ÙˆØ­Ø¯Ø§Øª (${gradeSummary.gradedEfmCount}/${gradeSummary.totalSubjects}).`}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†Ù‚Ø· Ù…ØªØ§Ø­Ø©" description="Ø³ØªØ¸Ù‡Ø± Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ù‡Ù†Ø§ Ø¨Ø¹Ø¯ Ø±ØµØ¯Ù‡Ø§ Ù…Ù† Ø·Ø±Ù Ø§Ù„Ù…ÙƒÙˆÙ‘Ù†." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Ø§Ù„Ù…Ø§Ø¯Ø©</th>
              <th>Ø§Ù„Ù…Ø¹Ø§Ù…Ù„</th>
              <th>C1</th>
              <th>C2</th>
              <th>C3</th>
              <th>EFM</th>
              <th>Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.subjectName}</td>
                <td>{row.coefficient}</td>
                <td>{row.cc1 || "-"}</td>
                <td>{row.cc2 || "-"}</td>
                <td>{row.cc3 || "-"}</td>
                <td>{row.efm || "-"}</td>
                <td>{row.final ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
