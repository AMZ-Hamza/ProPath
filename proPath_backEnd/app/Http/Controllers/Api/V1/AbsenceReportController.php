<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceReportController extends Controller
{
    /**
     * GET /api/v1/admin/absence-report/{group_id}
     *
     * Retrieve a list of students in a group with their total absent slots count.
     */
    public function index(Request $request, $group_id): JsonResponse
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        $students = StudentProfile::where('group_id', $group_id)
            ->with('user:id,name')
            ->withCount(['attendanceRecords as absent_slots_count' => function ($query) use ($startDate, $endDate) {
                $query->where('status', 'absent');
                if ($startDate) {
                    $query->where('attendance_date', '>=', $startDate);
                }
                if ($endDate) {
                    $query->where('attendance_date', '<=', $endDate);
                }
            }])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'studentName' => $student->user->name,
                    'absentCount' => $student->absent_slots_count,
                    // Hours calculation can be done on frontend or backend.
                    // User said "calculated as the count of absent slots", so we provide the count.
                ];
            });

        return response()->json([
            'data' => $students
        ]);
    }
}
