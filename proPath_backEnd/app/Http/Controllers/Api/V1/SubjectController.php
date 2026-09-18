<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Subject::with(['trainer', 'groups']);

        if ($request->filled('trainerId')) {
            $query->where('trainer_user_id', $request->trainerId);
        }
        if ($request->filled('groupId')) {
            $query->whereHas('groups', fn($q) => $q->where('groups.id', $request->groupId));
        }

        // Trainers only see their assigned subjects
        if ($user->isTrainer()) {
            $query->where('trainer_user_id', $user->id);
        }
        // Students only see subjects for their group
        if ($user->isStudent()) {
            $groupId = $user->studentProfile?->group_id;
            $query->whereHas('groups', fn($q) => $q->where('groups.id', $groupId));
        }

        $subjects = $query->orderBy('name')->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects),
        ]);
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $subject = Subject::create([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'coefficient' => $request->coefficient,
                'trainer_user_id' => $request->trainerId,
            ]);

            if ($request->filled('groupIds')) {
                $subject->groups()->sync($request->groupIds);
            }

            $subject->load(['trainer', 'groups']);

            return response()->json([
                'data' => new SubjectResource($subject),
                'message' => 'Subject created.',
            ], 201);
        });
    }

    public function show(Subject $subject): JsonResponse
    {
        $subject->load(['trainer', 'groups']);

        return response()->json([
            'data' => new SubjectResource($subject),
        ]);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        return DB::transaction(function () use ($request, $subject) {
            $oldTrainerId = $subject->trainer_user_id;

            $updateData = array_filter([
                'name' => $request->input('name'),
                'code' => $request->input('code'),
                'description' => $request->input('description'),
                'coefficient' => $request->input('coefficient'),
            ], fn($v) => !is_null($v));

            if ($request->has('trainerId')) {
                $updateData['trainer_user_id'] = $request->trainerId;
            }

            $subject->update($updateData);

            if ($request->has('groupIds')) {
                $subject->groups()->sync($request->groupIds);
            }

            // Audit trainer reassignment
            if ($request->has('trainerId') && $oldTrainerId !== $request->trainerId) {
                AuditService::log(
                    'subject.trainer_reassigned',
                    auth()->id(),
                    'subject',
                    $subject->id,
                    ['trainer_user_id' => $oldTrainerId],
                    ['trainer_user_id' => $request->trainerId],
                );
            }

            $subject->load(['trainer', 'groups']);

            return response()->json([
                'data' => new SubjectResource($subject),
                'message' => 'Subject updated.',
            ]);
        });
    }

    public function destroy(Subject $subject): JsonResponse
    {
        DB::transaction(function () use ($subject) {
            // Cascade: delete lessons, exercises, grade records
            $subject->lessons()->delete();
            $subject->exercises()->delete();
            $subject->gradeRecords()->delete();
            $subject->groups()->detach();
            $subject->delete();
        });

        return response()->json([
            'message' => 'Subject deleted.',
        ]);
    }
}
