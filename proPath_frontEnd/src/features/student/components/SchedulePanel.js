import { BookOpen, Download } from "lucide-react";
import { downloadFile } from "../../../appUtils";
import { EmptyState } from "../../../shared";

function getStudentTimetable(workspace) {
  if (!workspace?.student?.groupId || !workspace.timetables) return null;
  return workspace.timetables.find(
    (item) =>
      item.targetType === "group" &&
      String(item.targetId) === String(workspace.student.groupId),
  );
}

export default function SchedulePanel({ workspace }) {
  const timetable = getStudentTimetable(workspace);

  return (
    <div className="panel-card schedule-card">
      <h2>Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ</h2>
      <p>Ø§Ù„ÙÙˆØ¬ Ø§Ù„Ø­Ø§Ù„ÙŠ: {workspace.student?.groupName || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}</p>

      {!timetable ? (
        <EmptyState title="Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¬Ø¯ÙˆÙ„ Ù…Ù†Ø´ÙˆØ±" description="Ø³ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø¬Ø¯ÙˆÙ„ Ø§Ù„ÙÙˆØ¬ Ø¹Ù†Ø¯ Ù†Ø´Ø±Ù‡ Ù…Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©." />
      ) : (
        <>
          <div className="image-preview image-preview--contained">
            <img src={timetable.image?.data} alt={workspace.student?.groupName || "Schedule"} />
          </div>
          <div className="button-row" style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
            <a className="button button--ghost" href={timetable.image?.data} target="_blank" rel="noreferrer">
              <BookOpen size={16} />
              Ø¹Ø±Ø¶
            </a>
            <button type="button" className="button button--primary" onClick={() => downloadFile(timetable.image?.downloadUrl || timetable.image?.data, timetable.image?.name || "timetable.png")}>
              <Download size={16} />
              ØªØ­Ù…ÙŠÙ„
            </button>
          </div>
        </>
      )}
    </div>
  );
}
