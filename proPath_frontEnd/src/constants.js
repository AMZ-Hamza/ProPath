export const APP_NAME = "ProPath";

export const ROLE_OPTIONS = [
  { value: "proAdmin", label: "Pro Admin" },
  { value: "admin", label: "الإدارة" },
  { value: "trainer", label: "المكوّن" },
  { value: "student", label: "المتدرب" },
];

export const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map((role) => [role.value, role.label]),
);

export const AUDIENCE_OPTIONS = [
  { value: "all", label: "الجميع" },
  { value: "students", label: "المتدربون" },
  { value: "trainers", label: "المكوّنون" },
  { value: "admins", label: "الإدارة" },
];

export const TIMETABLE_TARGET_OPTIONS = [
  { value: "group", label: "فوج" },
  { value: "trainer", label: "مكوّن" },
];

export const DEFAULT_TIME_SLOTS = [
  {
    id: "slot-1",
    name: "الحصة الأولى",
    startTime: "08:30",
    endTime: "11:00",
  },
  {
    id: "slot-2",
    name: "الحصة الثانية",
    startTime: "11:00",
    endTime: "13:30",
  },
  {
    id: "slot-3",
    name: "الحصة الثالثة",
    startTime: "13:30",
    endTime: "16:00",
  },
  {
    id: "slot-4",
    name: "الحصة الرابعة",
    startTime: "16:00",
    endTime: "18:30",
  },
];
