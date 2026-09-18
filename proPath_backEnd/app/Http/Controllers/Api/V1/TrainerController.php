<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Http\Resources\GroupResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trainers = User::where('role', 'trainer')
            ->with('trainerProfile')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => UserResource::collection($trainers),
        ]);
    }

    public function subjects(User $trainer): JsonResponse
    {
        $subjects = $trainer->subjects()->with(['groups', 'trainer'])->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects),
        ]);
    }

    public function groups(User $trainer): JsonResponse
    {
        $groupIds = $trainer->subjects()->with('groups')->get()
            ->pluck('groups')->flatten()->unique('id');

        return response()->json([
            'data' => GroupResource::collection($groupIds),
        ]);
    }

    public function mySubjects(): JsonResponse
    {
        $user = Auth::user();
        $subjects = $user->subjects()->with(['groups', 'trainer'])->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects),
        ]);
    }

    public function myGroups(): JsonResponse
    {
        $user = Auth::user();
        $groups = $user->subjects()->with('groups')->get()
            ->pluck('groups')->flatten()->unique('id');

        return response()->json([
            'data' => GroupResource::collection($groups),
        ]);
    }
}
