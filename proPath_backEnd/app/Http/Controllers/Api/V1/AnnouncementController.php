<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Requests\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Announcement::with('author');

        // Filter by audience for non-admin users
        if (!$user->isAdmin()) {
            $roleAudience = $user->role === 'trainer' ? 'trainers' : 'students';
            $query->whereIn('audience', ['all', $roleAudience]);
        }

        if ($request->filled('audience')) {
            $query->where('audience', $request->audience);
        }

        $announcements = $query->orderBy('published_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => AnnouncementResource::collection($announcements),
            'meta' => [
                'currentPage' => $announcements->currentPage(),
                'lastPage' => $announcements->lastPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    public function byAudience(string $role): JsonResponse
    {
        $announcements = Announcement::with('author')
            ->whereIn('audience', ['all', $role])
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'data' => AnnouncementResource::collection($announcements),
        ]);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create([
            'title' => $request->title,
            'content' => $request->content,
            'audience' => $request->input('audience', 'all'),
            'author_user_id' => Auth::id(),
            'published_at' => now(),
        ]);

        $announcement->load('author');

        return response()->json([
            'data' => new AnnouncementResource($announcement),
            'message' => 'Announcement published.',
        ], 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        $announcement->load('author');

        return response()->json([
            'data' => new AnnouncementResource($announcement),
        ]);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): JsonResponse
    {
        $announcement->update($request->validated());
        $announcement->load('author');

        return response()->json([
            'data' => new AnnouncementResource($announcement),
            'message' => 'Announcement updated.',
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
