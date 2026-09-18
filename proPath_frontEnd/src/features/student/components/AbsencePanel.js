import { useMemo } from "react";
import { AlertCircle, UserX } from "lucide-react";
import { formatDate } from "../../../appUtils";
import { EmptyState, LoadingBlock, StatCard } from "../../../shared";

export default function AbsencePanel({ workspace, summary }) {
  const rows = useMemo(() => {
    if (!workspace.attendance) return [];
    const grouped = new Map();

    workspace.attendance.forEach((record) => {
      if (!grouped.has(record.date)) {
        grouped.set(record.date, { date: record.date, sessions: {} });
      }
      grouped.get(record.date).sessions[record.sessionId] = record.status;
    });

    return [...grouped.values()].sort(
      (left, right) => new Date(right.date) - new Date(left.date),
    );
  }, [workspace.attendance]);

  const absenceCount = summary?.absenceCount ?? (workspace.student?.absenceCount || 0);
  const absenceHours = summary?.absenceHours ?? (absenceCount * Number(workspace.settings.attendanceHoursPerSession || 2.5));

  return (
    <div className="panel-card">
      <h2>Ø³Ø¬Ù„ Ø§Ù„ØºÙŠØ§Ø¨</h2>
      <div className="stats-grid stats-grid-wide">
        <StatCard title="Ø¹Ø¯Ø¯ Ø§Ù„ØºÙŠØ§Ø¨Ø§Øª" value={absenceCount} accent="rose" icon={UserX} />
        <StatCard title="Ø³Ø§Ø¹Ø§Øª Ø§Ù„ØºÙŠØ§Ø¨" value={Number(absenceHours).toFixed(1)} accent="amber" icon={AlertCircle} />
      </div>

      {!workspace.attendance ? (
        <LoadingBlock label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø³Ø¬Ù„ Ø§Ù„ØºÙŠØ§Ø¨..." />
      ) : rows.length === 0 ? (
        <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ ØºÙŠØ§Ø¨Ø§Øª" description="Ø³Ø¬Ù„ Ø§Ù„ØºÙŠØ§Ø¨ Ø§Ù„Ø®Ø§Øµ Ø¨Ùƒ ÙØ§Ø±Øº Ø­Ø§Ù„ÙŠØ§Ù‹." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              {workspace.settings.timeSlots.map((slot) => (
                <th key={slot.id}>{slot.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td>{formatDate(row.date)}</td>
                {workspace.settings.timeSlots.map((slot) => {
                  const status = row.sessions[slot.id];
                  return (
                    <td key={`${row.date}-${slot.id}`}>
                      <span className={`status-pill ${status === "absent" ? "status-pill--danger" : "status-pill--muted"}`}>
                        {status === "absent" ? "ØºØ§Ø¦Ø¨" : status === "present" ? "Ø­Ø§Ø¶Ø±" : "-"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
