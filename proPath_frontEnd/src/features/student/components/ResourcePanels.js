import { BookOpen, Download } from "lucide-react";
import { downloadFile, formatDate, getDownloadUrl, getFileName, getFileUrl } from "../../../appUtils";
import { EmptyState, LoadingBlock } from "../../../shared";

export function ResourcesPanel({ workspace }) {
  return (
    <div className="panel-card">
      <h2>Ø§Ù„Ø¯Ø±ÙˆØ³ ÙˆØ§Ù„Ù…ÙˆØ§Ø±Ø¯</h2>
      {!workspace.lessons ? (
        <LoadingBlock label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¯Ø±ÙˆØ³..." />
      ) : workspace.lessons.length === 0 ? (
        <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¯Ø±ÙˆØ³" description="Ø¹Ù†Ø¯ Ø±ÙØ¹ Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„Ø®Ø§ØµØ© Ø¨ÙÙˆØ¬Ùƒ Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§." />
      ) : (
        <div className="stack-list">
          {workspace.lessons.map((lesson) => (
            <div key={lesson.id} className="resource-card">
              <div className="announcement-card__row">
                <div>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.subjectName} Â· {formatDate(lesson.publishedAt)}</small>
                </div>
                <a className="button button--ghost" href={getFileUrl(lesson)} target="_blank" rel="noreferrer">
                  <BookOpen size={16} />
                  Ø¹Ø±Ø¶
                </a>
                <button type="button" className="button button--primary" onClick={() => downloadFile(getDownloadUrl(lesson), getFileName(lesson, "lesson.pdf"))}>
                  <Download size={16} />
                  ØªØ­Ù…ÙŠÙ„
                </button>
              </div>
              <p>{lesson.notes || "Ø¨Ø¯ÙˆÙ† Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExercisesPanel({ workspace }) {
  return (
    <div className="panel-card">
      <h2>Ø§Ù„ØªÙ…Ø§Ø±ÙŠÙ†</h2>
      {!workspace.exercises ? (
        <LoadingBlock label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ…Ø§Ø±ÙŠÙ†..." />
      ) : workspace.exercises.length === 0 ? (
        <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ…Ø§Ø±ÙŠÙ†" description="Ù„Ù… ÙŠØªÙ… Ù†Ø´Ø± ØªÙ…Ø§Ø±ÙŠÙ† Ø®Ø§ØµØ© Ø¨ÙÙˆØ¬Ùƒ Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†." />
      ) : (
        <div className="stack-list">
          {workspace.exercises.map((exercise) => (
            <div key={exercise.id} className="resource-card">
              <div className="announcement-card__row">
                <div>
                  <strong>{exercise.title}</strong>
                  <small>
                    {exercise.subjectName}
                    {exercise.dueDate ? ` Â· ${formatDate(exercise.dueDate)}` : ""}
                  </small>
                </div>
                {getFileUrl(exercise) ? (
                  <>
                    <a className="button button--ghost" href={getFileUrl(exercise)} target="_blank" rel="noreferrer">
                      <BookOpen size={16} />
                      Ø¹Ø±Ø¶
                    </a>
                    <button type="button" className="button button--primary" onClick={() => downloadFile(getDownloadUrl(exercise), getFileName(exercise, "exercise.pdf"))}>
                      <Download size={16} />
                      ØªØ­Ù…ÙŠÙ„
                    </button>
                  </>
                ) : null}
              </div>
              <p>{exercise.description || "Ø¨Ø¯ÙˆÙ† ÙˆØµÙ Ø¥Ø¶Ø§ÙÙŠ."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
