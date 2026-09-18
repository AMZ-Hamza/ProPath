<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::withCount('groups')->orderBy('name')->get();

        return response()->json([
            'data' => BranchResource::collection($branches),
        ]);
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $branch = Branch::create($request->validated());

        return response()->json([
            'data' => new BranchResource($branch),
            'message' => 'Branch created.',
        ], 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        $branch->loadCount('groups');

        return response()->json([
            'data' => new BranchResource($branch),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());

        return response()->json([
            'data' => new BranchResource($branch),
            'message' => 'Branch updated.',
        ]);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        if ($branch->groups()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete branch while it has groups.',
            ], 422);
        }

        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted.',
        ]);
    }
}
