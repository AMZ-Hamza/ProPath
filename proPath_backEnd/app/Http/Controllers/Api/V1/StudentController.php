<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\GradeResource;
use App\Models\StudentProfile;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = StudentProfile::with(['user', 'branch', 'group.subjects', 'gradeRecords.subject']);

        // Scope: students only see themselves
        if ($user->isStudent()) {
            $query->where('user_id', $user->id);
        }
        // Trainers see only students in their assigned groups
        elseif ($user->isTrainer()) {
            $assignedGroupIds = $user->subjects()->with('groups')->get()
                ->pluck('groups')->flatten()->pluck('id')->unique();
            $query->whereIn('group_id', $assignedGroupIds);
        }

        if ($request->filled('groupId')) {
            $query->where('group_id', $request->groupId);
        }
        if ($request->filled('branchId')) {
            $query->where('branch_id', $request->branchId);
        }

        $students = $query->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => StudentResource::collection($students),
            'meta' => [
                'currentPage' => $students->currentPage(),
                'lastPage' => $students->lastPage(),
                'total' => $students->total(),
            ],
        ]);
    }

    public function show(StudentProfile $student): JsonResponse
    {
        $this->authorizeStudentAccess($student);
        $student->load(['user', 'branch', 'group.subjects', 'gradeRecords.subject']);

        return response()->json([
            'data' => new StudentResource($student),
        ]);
    }

    public function update(Request $request, StudentProfile $student): JsonResponse
    {
        $student->update($request->only(['notes', 'enrollment_number']));
        $student->load(['user', 'branch', 'group.subjects', 'gradeRecords.subject']);

        return response()->json([
            'data' => new StudentResource($student),
            'message' => 'Student profile updated.',
        ]);
    }

    /**
     * GET /api/v1/students/me
     */
    public function me(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isStudent()) {
            return response()->json(['message' => 'Not a student account.'], 403);
        }

        $profile = $user->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $profile->load(['user', 'branch', 'group.subjects', 'gradeRecords.subject']);
        $settings = SystemSetting::instance();

        $absenceCount = $profile->attendanceRecords()->where('status', 'absent')->count();
        $absenceHours = $absenceCount * $settings->attendance_hours_per_session;

        return response()->json([
            'data' => array_merge(
                (new StudentResource($profile))->resolve(),
                [
                    'absenceCount' => $absenceCount,
                    'absenceHours' => $absenceHours,
                ]
            ),
        ]);
    }

    /**
     * GET /api/v1/students/{student}/attendance-summary
     */
    public function attendanceSummary(StudentProfile $student): JsonResponse
    {
        $this->authorizeStudentAccess($student);
        $settings = SystemSetting::instance();

        $records = $student->attendanceRecords()
            ->with(['subject', 'timeSlot', 'group'])
            ->orderBy('attendance_date', 'desc')
            ->get();

        $absenceCount = $records->where('status', 'absent')->count();
        $absenceHours = $absenceCount * $settings->attendance_hours_per_session;

        return response()->json([
            'data' => [
                'totalAbsences' => $absenceCount,
                'absenceHours' => $absenceHours,
                'records' => AttendanceResource::collection($records),
            ],
        ]);
    }

    /**
     * GET /api/v1/students/{student}/grades
     */
    public function grades(StudentProfile $student): JsonResponse
    {
        $this->authorizeStudentAccess($student);
        $student->loadMissing(['group.subjects']);

        $grades = $student->gradeRecords()->with(['subject'])->get();

        return response()->json([
            'data' => GradeResource::collection($grades),
            'summary' => $student->calculateYearGradeSummary(),
        ]);
    }

    private function authorizeStudentAccess(StudentProfile $student): void
    {
        $user = Auth::user();

        if ($user->isStudent() && $user->studentProfile?->id !== $student->id) {
            abort(403, 'Access denied.');
        }

        if ($user->isTrainer()) {
            $assignedGroupIds = $user->subjects()->with('groups')->get()
                ->pluck('groups')->flatten()->pluck('id')->unique();
            if (!$assignedGroupIds->contains($student->group_id)) {
                abort(403, 'Access denied.');
            }
        }
    }
}
