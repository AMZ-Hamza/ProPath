<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Group::with('branch')
            ->withCount(['studentProfiles', 'subjects']);

        if ($request->filled('branchId')) {
            $query->where('branch_id', $request->branchId);
        }

        $groups = $query->orderBy('name')->get();

        return response()->json([
            'data' => GroupResource::collection($groups),
        ]);
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $group = Group::create([
            'branch_id' => $request->branchId,
            'name' => $request->name,
            'year' => $request->year,
            'capacity' => $request->capacity,
            'description' => $request->description,
        ]);

        $group->load('branch');

        return response()->json([
            'data' => new GroupResource($group),
            'message' => 'Group created.',
        ], 201);
    }

    public function show(Group $group): JsonResponse
    {
        $group->load('branch');
        $group->loadCount(['studentProfiles', 'subjects']);

        return response()->json([
            'data' => new GroupResource($group),
        ]);
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $updateData = array_filter([
            'name' => $request->input('name'),
            'year' => $request->input('year'),
            'capacity' => $request->input('capacity'),
            'description' => $request->input('description'),
        ], fn($v) => !is_null($v));

        if ($request->filled('branchId')) {
            $updateData['branch_id'] = $request->branchId;

            // Update student branch association if group branch changed
            if ($group->branch_id != $request->branchId) {
                $group->studentProfiles()->update(['branch_id' => $request->branchId]);
            }
        }

        $group->update($updateData);
        $group->load('branch');

        return response()->json([
            'data' => new GroupResource($group),
            'message' => 'Group updated.',
        ]);
    }

    public function destroy(Group $group): JsonResponse
    {
        if ($group->studentProfiles()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete group while it has students.',
            ], 422);
        }

        if ($group->subjects()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete group while it is linked to subjects.',
            ], 422);
        }

        DB::transaction(function () use ($group) {
            $group->timetables()->delete();
            $group->delete();
        });

        return response()->json([
            'message' => 'Group deleted.',
        ]);
    }
}
