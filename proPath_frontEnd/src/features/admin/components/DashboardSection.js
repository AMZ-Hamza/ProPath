import React from "react";
import { BookCopy, Building2, FolderCog, Grip, Users } from "lucide-react";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { formatDate } from "../../../appUtils";
import { EmptyState, LoadingBlock, StatCard } from "../../../shared";
import { SectionHeader } from "./AdminPrimitives";

export default function DashboardSection() {
  const { data: summary, loading } = useDashboardData("admin");

  if (loading) return <LoadingBlock label="جاري تحميل ملخص لوحة القيادة..." />;

  const recentNews = summary?.latestAnnouncements || [];
  const healthItems = summary?.warnings || [];

  return (
    <div className="admin-section-stack">
      <SectionHeader
        title="لوحة القيادة"
        description="ملخص فوري لحالة المنصة والكيانات الأساسية."
      />

      <div className="stats-grid stats-grid-wide">
        <StatCard title="إجمالي المستخدمين" value={summary?.totalUsers || 0} accent="blue" icon={Users} />
        <StatCard title="المتدربون" value={summary?.totalStudents || 0} accent="teal" icon={Grip} />
        <StatCard title="المكوّنون" value={summary?.totalTrainers || 0} accent="amber" icon={BookCopy} />
        <StatCard title="الحسابات الإدارية" value={summary?.totalAdmins || 0} accent="indigo" icon={FolderCog} />
        <StatCard title="الأفواج" value={summary?.totalGroups || 0} accent="green" icon={Building2} />
        <StatCard title="المواد" value={summary?.totalSubjects || 0} accent="rose" icon={BookCopy} />
      </div>

      <div className="admin-grid admin-grid--two">
        <div className="panel-card">
          <h3>جاهزية النظام</h3>
          {healthItems.length === 0 ? (
            <div className="mini-empty mini-empty--success">
              جميع المكونات الأساسية متوفرة ويمكن متابعة العمل على المنصة.
            </div>
          ) : (
            <div className="stack-list">
              {healthItems.map((item) => (
                <div key={item} className="mini-empty">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-card">
          <h3>آخر الإعلانات</h3>
          {recentNews.length === 0 ? (
            <EmptyState
              title="لا توجد إعلانات"
              description="ابدأ بنشر أول إعلان داخلي للمستخدمين."
            />
          ) : (
            <div className="stack-list">
              {recentNews.map((item) => (
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
      </div>
    </div>
  );
}
