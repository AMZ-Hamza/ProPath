<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLessonRequest;
use App\Http\Resources\LessonResource;
use App\Models\Lesson;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Lesson::with(['subject', 'group', 'trainer', 'asset']);

        if ($user->isStudent()) {
            $groupId = $user->studentProfile?->group_id;
            $query->where('group_id', $groupId);
        } elseif ($user->isTrainer()) {
            $query->where('trainer_user_id', $user->id);
        }

        if ($request->filled('trainerId')) {
            $query->where('trainer_user_id', $request->trainerId);
        }
        if ($request->filled('groupId')) {
            $query->where('group_id', $request->groupId);
        }
        if ($request->filled('subjectId')) {
            $query->where('subject_id', $request->subjectId);
        }

        $lessons = $query->orderBy('published_at', 'desc')->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => LessonResource::collection($lessons),
            'meta' => [
                'currentPage' => $lessons->currentPage(),
                'lastPage' => $lessons->lastPage(),
                'total' => $lessons->total(),
            ],
        ]);
    }

    public function store(StoreLessonRequest $request): JsonResponse
    {
        $user = Auth::user();

        $lesson = Lesson::create([
            'title' => $request->title,
            'notes' => $request->notes,
            'subject_id' => $request->subjectId,
            'group_id' => $request->groupId,
            'trainer_user_id' => $user->id,
            'asset_id' => $request->assetId,
            'published_at' => now(),
        ]);

        $lesson->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'Lesson published.',
        ], 201);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        $lesson->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new LessonResource($lesson),
        ]);
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $user = Auth::user();

        // Trainers can only update their own lessons
        if ($user->isTrainer() && $lesson->trainer_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $lesson->update($request->only(['title', 'notes', 'asset_id']));
        $lesson->load(['subject', 'group', 'trainer', 'asset']);

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'Lesson updated.',
        ]);
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $user = Auth::user();

        // Trainers can only delete their own lessons
        if ($user->isTrainer() && $lesson->trainer_user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        AuditService::log('lesson.deleted', $user->id, 'lesson', $lesson->id, $lesson->toArray());

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted.']);
    }
}
