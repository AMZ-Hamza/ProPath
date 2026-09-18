<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BatchAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\AttendanceRecord;
use App\Models\StudentProfile;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = AttendanceRecord::with(['student.user', 'group', 'subject', 'timeSlot']);

        // Mandatory Scoping by Role
        if ($user->isStudent()) {
            $query->where('student_id', $user->studentProfile?->id);
        } elseif ($user->isTrainer()) {
            // Trainers see attendance for groups they are assigned to
            $assignedGroupIds = $user->subjects()->with('groups')->get()
                ->pluck('groups')->flatten()->pluck('id')->unique();
            $query->whereIn('group_id', $assignedGroupIds);
        }

        // Optional Filters
        if ($request->filled('groupId')) {
            $query->where('group_id', $request->groupId);
        }
        if ($request->filled('studentId')) {
            $query->where('student_id', $request->studentId);
        }
        if ($request->filled('subjectId')) {
            $query->where('subject_id', $request->subjectId);
        }
        if ($request->filled('date')) {
            $query->where('attendance_date', $request->date);
        }
        if ($request->filled('sessionId')) {
            $query->where('session_slot_id', $request->sessionId);
        }

        // If no date is provided and it's a large request, limit results
        $limit = $request->input('limit', 100);
        $records = $query->orderBy('attendance_date', 'desc')
            ->orderBy('session_slot_id', 'asc')
            ->take($limit)
            ->get();

        return response()->json([
            'data' => AttendanceResource::collection($records),
        ]);
    }

    /**
     * POST /api/v1/attendance/batch
     * Upsert attendance: one row per student/date/session_slot
     */
    public function batchStore(BatchAttendanceRequest $request): JsonResponse
    {
        $user = Auth::user();

        // Trainers can only record attendance for assigned groups
        if ($user->isTrainer()) {
            $assignedGroupIds = $user->subjects()->with('groups')->get()
                ->pluck('groups')->flatten()->pluck('id')->unique();
            if (!$assignedGroupIds->contains($request->groupId)) {
                return response()->json([
                    'message' => 'You are not assigned to this group.',
                ], 403);
            }
        }

        $records = DB::transaction(function () use ($request, $user) {
            $results = [];

            foreach ($request->statuses as $studentId => $status) {
                // Verify student belongs to the group
                $student = StudentProfile::where('id', $studentId)
                    ->where('group_id', $request->groupId)
                    ->first();

                if (!$student) continue;

                $record = AttendanceRecord::updateOrCreate(
                    [
                        'student_id' => $studentId,
                        'attendance_date' => $request->date,
                        'session_slot_id' => $request->sessionId,
                    ],
                    [
                        'group_id' => $request->groupId,
                        'subject_id' => $request->subjectId,
                        'status' => $status,
                        'recorded_by_user_id' => $user->id,
                    ]
                );

                $results[] = $record;
            }

            return $results;
        });

        AuditService::log(
            'attendance.batch_saved',
            $user->id,
            'attendance_batch',
            null,
            null,
            ['count' => count($records)],
            [
                'groupId' => $request->groupId,
                'date' => $request->date,
                'sessionId' => $request->sessionId,
            ],
        );

        return response()->json([
            'data' => AttendanceResource::collection($records),
            'message' => 'Attendance saved.',
        ]);
    }
}
