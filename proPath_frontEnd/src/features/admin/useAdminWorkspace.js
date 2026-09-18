import { useCallback, useEffect, useState } from "react";
import dataService from "../../dataService";
import { APP_NAME } from "../../constants";

export function useAdminWorkspace(activeSection, settings) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reloadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled([
        dataService.fetchNews(),
        dataService.fetchSubjects(),
        dataService.fetchGroups(),
        dataService.fetchSettings(),
        dataService.fetchBranches(),
      ]);

      const [newsRes, subjectsRes, groupsRes, settingsRes, branchesRes] = results;

      setWorkspace({
        news: newsRes.status === "fulfilled" ? newsRes.value : [],
        subjects: subjectsRes.status === "fulfilled" ? subjectsRes.value : [],
        groups: groupsRes.status === "fulfilled" ? groupsRes.value : [],
        settings: settingsRes.status === "fulfilled" ? settingsRes.value : { timeSlots: [] },
        branches: branchesRes.status === "fulfilled" ? branchesRes.value : [],
        users: null,
        students: null,
        timetables: null,
        appName: settings?.appName || (settingsRes.status === "fulfilled" ? settingsRes.value.appName : APP_NAME),
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  }, [settings?.appName]);

  useEffect(() => {
    reloadWorkspace();
  }, [reloadWorkspace]);

  useEffect(() => {
    if (!workspace) return;

    const fetchSectionData = async () => {
      try {
        const needsUsers = ["users", "subjects", "timetables"].includes(activeSection);
        const needsStudents = activeSection === "grades";
        const needsTimetables = activeSection === "timetables";

        const requests = [];
        if (needsUsers && workspace.users === null) requests.push(dataService.fetchUsers());
        if (needsStudents && workspace.students === null) requests.push(dataService.fetchStudents());
        if (needsTimetables && workspace.timetables === null) requests.push(dataService.fetchTimetables());

        if (requests.length > 0) {
          const results = await Promise.all(requests);
          setWorkspace((previous) => {
            const updates = {};
            let index = 0;

            if (needsUsers && previous.users === null) updates.users = results[index++];
            if (needsStudents && previous.students === null) updates.students = results[index++];
            if (needsTimetables && previous.timetables === null) updates.timetables = results[index++];

            return { ...previous, ...updates };
          });
        }
      } catch {
        // Keep the loaded workspace usable if a secondary section request fails.
      }
    };

    fetchSectionData();
  }, [activeSection, workspace]);

  return { error, loading, reloadWorkspace, workspace };
}
