import { BookOpen, CalendarDays, Newspaper, UserX } from "lucide-react";
import { formatDate } from "../../../appUtils";
import { EmptyState, LoadingBlock, StatCard } from "../../../shared";

export default function StudentDashboard({ workspace, summary, loading }) {
  if (loading) return <LoadingBlock label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù„Ø®Øµ..." />;

  const upcomingExercises = (summary?.upcomingExercises || workspace.exercises || [])
    .filter((exercise) => exercise.dueDate)
    .slice(0, 3);
  const news = summary?.announcements || workspace.news || [];

  return (
    <div className="student-stack">
      <div className="panel-card">
        <h2>Ù„ÙˆØ­Ø© Ø§Ù„Ù‚ÙŠØ§Ø¯Ø©</h2>
        <div className="stats-grid stats-grid-wide">
          <StatCard title="Ø§Ù„ÙÙˆØ¬" value={summary?.group || workspace.student?.groupName || "ØºÙŠØ± Ù…Ø±ØªØ¨Ø·"} accent="blue" icon={CalendarDays} />
          <StatCard title="Ø§Ù„Ù…ÙˆØ§Ø¯" value={summary?.subjectCount ?? workspace.subjects.length} accent="teal" icon={BookOpen} />
          <StatCard title="Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª" value={summary?.announcementCount ?? workspace.news.length} accent="indigo" icon={Newspaper} />
          <StatCard title="Ø§Ù„ØºÙŠØ§Ø¨Ø§Øª" value={summary?.absenceCount ?? (workspace.student?.absenceCount || 0)} accent="rose" icon={UserX} />
        </div>
      </div>

      <div className="student-grid">
        <div className="panel-card">
          <h3>Ø¢Ø®Ø± Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª</h3>
          {news.length === 0 ? (
            <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª" description="Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ¬Ù‡Ø© Ù„Ù„Ù…ØªØ¯Ø±Ø¨ÙŠÙ†." />
          ) : (
            <div className="stack-list">
              {news.slice(0, 5).map((item) => (
                <div key={item.id} className="announcement-card">
                  <div className="announcement-card__row">
                    <strong>{item.title}</strong>
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-card">
          <h3>ØªÙ…Ø§Ø±ÙŠÙ† Ù‚Ø±ÙŠØ¨Ø©</h3>
          {upcomingExercises.length === 0 ? (
            <EmptyState title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù‚Ø±ÙŠØ¨Ø©" description="Ø¹Ù†Ø¯ Ù†Ø´Ø± ØªÙ…Ø§Ø±ÙŠÙ† Ù…Ø¤Ø±Ø®Ø© Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§." />
          ) : (
            <div className="stack-list">
              {upcomingExercises.map((exercise) => (
                <div key={exercise.id} className="resource-card">
                  <strong>{exercise.title}</strong>
                  <small>{exercise.subjectName} Â· {formatDate(exercise.dueDate)}</small>
                  <p>{exercise.description || "Ø¨Ø¯ÙˆÙ† ÙˆØµÙ Ø¥Ø¶Ø§ÙÙŠ."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
