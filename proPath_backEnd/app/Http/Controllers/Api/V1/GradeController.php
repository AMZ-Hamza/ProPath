<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkGradeRequest;
use App\Http\Resources\GradeResource;
use App\Models\GradeRecord;
use App\Models\Group;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = GradeRecord::with(['student.user', 'subject']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->studentProfile?->id);
        } elseif ($user->isTrainer()) {
            $subjectIds = $user->subjects->pluck('id');
            $query->whereIn('subject_id', $subjectIds);
        }

        if ($request->filled('studentId')) {
            $query->where('student_id', $request->studentId);
        }
        if ($request->filled('subjectId')) {
            $query->where('subject_id', $request->subjectId);
        }
        if ($request->filled('groupId')) {
            $query->whereHas('student', fn($q) => $q->where('group_id', $request->groupId));
        }

        $grades = $query->get();

        return response()->json([
            'data' => GradeResource::collection($grades),
        ]);
    }

    /**
     * POST /api/v1/students/grades - Bulk grade save
     */
    public function bulkStore(BulkGradeRequest $request): JsonResponse
    {
        $user = Auth::user();

        // Trainers can only grade their assigned subjects
        if ($user->isTrainer()) {
            $assignedSubjectIds = $user->subjects->pluck('id');
            if (!$assignedSubjectIds->contains($request->subjectId)) {
                return response()->json([
                    'message' => 'You are not assigned to this subject.',
                ], 403);
            }
        }

        $grades = DB::transaction(function () use ($request, $user) {
            $results = [];

            foreach ($request->gradesByStudent as $studentId => $gradeData) {
                $before = GradeRecord::where('student_id', $studentId)
                    ->where('subject_id', $request->subjectId)
                    ->first();

                $beforeData = $before ? $before->only(['cc1', 'cc2', 'cc3', 'efm', 'final_grade']) : null;

                $grade = GradeRecord::updateOrCreate(
                    [
                        'student_id' => $studentId,
                        'subject_id' => $request->subjectId,
                    ],
                    [
                        'cc1' => $gradeData['cc1'] ?? null,
                        'cc2' => $gradeData['cc2'] ?? null,
                        'cc3' => $gradeData['cc3'] ?? null,
                        'efm' => $gradeData['efm'] ?? null,
                        'recorded_by_user_id' => $user->id,
                    ]
                );

                // Calculate final grade
                $grade->calculateFinalGrade();
                $grade->save();

                $afterData = $grade->only(['cc1', 'cc2', 'cc3', 'efm', 'final_grade']);

                AuditService::log(
                    'grade.updated',
                    $user->id,
                    'grade_record',
                    $grade->id,
                    $beforeData,
                    $afterData,
                    [
                        'studentId' => $studentId,
                        'subjectId' => $request->subjectId,
                    ],
                );

                $results[] = $grade;
            }

            return $results;
        });

        return response()->json([
            'data' => GradeResource::collection($grades),
            'message' => 'Grades saved.',
        ]);
    }

    /**
     * GET /api/v1/groups/{group}/grades
     */
    public function groupGrades(Group $group, Request $request): JsonResponse
    {
        $query = GradeRecord::with(['student.user', 'subject'])
            ->whereHas('student', fn($q) => $q->where('group_id', $group->id));

        if ($request->filled('subjectId')) {
            $query->where('subject_id', $request->subjectId);
        }

        $grades = $query->get();

        return response()->json([
            'data' => GradeResource::collection($grades),
        ]);
    }
}
