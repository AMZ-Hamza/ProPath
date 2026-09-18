<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\ExerciseResource;
use App\Http\Resources\TimetableResource;
use App\Models\Announcement;
use App\Models\Exercise;
use App\Models\Group;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\SystemSetting;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard/admin
     */
    public function admin(): JsonResponse
    {
        $totalUsers = User::count();
        $totalStudents = User::where('role', 'student')->count();
        $totalTrainers = User::where('role', 'trainer')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalGroups = Group::count();
        $totalSubjects = Subject::count();

        $latestAnnouncements = Announcement::with('author')
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        $warnings = [];
        if ($totalGroups === 0) $warnings[] = 'No groups configured.';
        if ($totalSubjects === 0) $warnings[] = 'No subjects configured.';
        if ($totalStudents === 0) $warnings[] = 'No students enrolled.';
        if (Timetable::where('is_active', true)->count() === 0) $warnings[] = 'No active timetables.';

        return response()->json([
            'data' => [
                'totalUsers' => $totalUsers,
                'totalStudents' => $totalStudents,
                'totalTrainers' => $totalTrainers,
                'totalAdmins' => $totalAdmins,
                'totalGroups' => $totalGroups,
                'totalSubjects' => $totalSubjects,
                'latestAnnouncements' => AnnouncementResource::collection($latestAnnouncements),
                'warnings' => $warnings,
            ],
        ]);
    }

    /**
     * GET /api/v1/dashboard/trainer
     */
    public function trainer(): JsonResponse
    {
        $user = Auth::user();

        $assignedSubjectsCount = $user->subjects()->count();
        $assignedGroupIds = $user->subjects()->with('groups')->get()
            ->pluck('groups')->flatten()->unique('id');
        $assignedGroupsCount = $assignedGroupIds->count();

        $lessonsCount = Lesson::where('trainer_user_id', $user->id)->count();
        $exercisesCount = Exercise::where('trainer_user_id', $user->id)->count();

        $announcements = Announcement::with('author')
            ->whereIn('audience', ['all', 'trainers'])
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        $timetable = Timetable::with('asset')
            ->where('target_type', 'trainer')
            ->where('target_trainer_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'data' => [
                'assignedSubjectsCount' => $assignedSubjectsCount,
                'assignedGroupsCount' => $assignedGroupsCount,
                'lessonsPublishedCount' => $lessonsCount,
                'exercisesPublishedCount' => $exercisesCount,
                'announcements' => AnnouncementResource::collection($announcements),
                'timetable' => $timetable ? new TimetableResource($timetable) : null,
            ],
        ]);
    }

    /**
     * GET /api/v1/dashboard/student
     */
    public function student(): JsonResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        if (!$profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $profile->load(['group', 'branch']);
        $settings = SystemSetting::instance();

        $groupId = $profile->group_id;
        $subjectCount = Subject::whereHas('groups', fn($q) => $q->where('groups.id', $groupId))->count();

        $announcements = Announcement::whereIn('audience', ['all', 'students'])
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        $absenceCount = $profile->attendanceRecords()->where('status', 'absent')->count();

        $upcomingExercises = Exercise::with(['subject'])
            ->where('group_id', $groupId)
            ->where('due_date', '>=', now()->toDateString())
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
                'group' => $profile->group->name,
                'branch' => $profile->branch->name,
                'subjectCount' => $subjectCount,
                'announcementCount' => $announcements->count(),
                'absenceCount' => $absenceCount,
                'absenceHours' => $absenceCount * $settings->attendance_hours_per_session,
                'upcomingExercises' => ExerciseResource::collection($upcomingExercises),
                'announcements' => AnnouncementResource::collection($announcements),
            ],
        ]);
    }
}
