<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExerciseRequest;
use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Exercise::with(['subject', 'group', 'trainer', 'asset']);

        if ($user->isStudent()) {
            $groupId = $user->studentProfile?->group_id;
            $query->where('group_id', $groupId);
        } elseif ($user->isTrainer()) {
            $query->where('trainer_user_id', $user->id);
        }

        if ($request->filled('trainerId')) $query->where('trainer_user_id', $request->trainerId);
        if ($request->filled('groupId')) $query->where('group_id', $request->groupId);
        if ($request->filled('subjectId')) $query->where('subject_id', $request->subjectId);

        $exercises = $query->orderBy('due_date', 'asc')
            ->orderBy('created_at', 'asc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => ExerciseResource::collection($exercises),
            'meta' => [
                'currentPage' => $exercises->currentPage(),
                'lastPage' => $exercises->lastPage(),
                'total' => $exercises->total(),
            ],
        ]);
    }

    public function store(StoreExerciseRequest $request): JsonResponse
    {
        $user = Auth::user();

        $exercise = Exercise::create([
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->dueDate,
            'subject_id' => $request->subjectId,
            'group_id' => $request->groupId,
            'trainer_user_id' => $user->id,
            'asset_id' => $request->assetId,
        ]);

        $exercise->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new ExerciseResource($exercise),
            'message' => 'Exercise published.',
        ], 201);
    }

    public function show(Exercise $exercise): JsonResponse
    {
        $exercise->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new ExerciseResource($exercise),
        ]);
    }

    public function update(Request $request, Exercise $exercise): JsonResponse
    {
        $user = Auth::user();

        if ($user->isTrainer() && $exercise->trainer_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $exercise->update($request->only(['title', 'description', 'due_date', 'asset_id']));
        $exercise->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new ExerciseResource($exercise),
            'message' => 'Exercise updated.',
        ]);
    }

    public function destroy(Exercise $exercise): JsonResponse
    {
        $user = Auth::user();

        if ($user->isTrainer() && $exercise->trainer_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        AuditService::log('exercise.deleted', $user->id, 'exercise', $exercise->id, $exercise->toArray());
        $exercise->delete();

        return response()->json(['message' => 'Exercise deleted.']);
    }
}
