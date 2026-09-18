<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimetableRequest;
use App\Http\Resources\TimetableResource;
use App\Models\Timetable;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Asset;

class TimetableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = Timetable::with(['group', 'asset', 'trainerUser', 'uploader']);

        // Scope for students: only their group timetable
        if ($user->isStudent()) {
            $groupId = $user->studentProfile?->group_id;
            $query->where('target_type', 'group')
                ->where('target_group_id', $groupId)
                ->where('is_active', true);
        }
        // Scope for trainers: only their personal timetable
        elseif ($user->isTrainer()) {
            $query->where(function ($q) use ($user) {
                $q->where(fn($q2) => $q2->where('target_type', 'trainer')
                    ->where('target_trainer_user_id', $user->id))
                    ->orWhere(fn($q2) => $q2->where('target_type', 'group')
                        ->where('is_active', true));
            });
        }

        if ($request->filled('targetType')) {
            $query->where('target_type', $request->targetType);
        }
        if ($request->filled('targetId')) {
            if ($request->targetType === 'group') {
                $query->where('target_group_id', $request->targetId);
            } else {
                $query->where('target_trainer_user_id', $request->targetId);
            }
        }

        $timetables = $query->orderBy('uploaded_at', 'desc')->get();

        return response()->json([
            'data' => TimetableResource::collection($timetables),
        ]);
    }

    public function store(StoreTimetableRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            // Deactivate previous active timetable for same target
            $deactivateQuery = Timetable::where('target_type', $validated['targetType'])
                ->where('is_active', true);

            if ($validated['targetType'] === 'group') {
                $deactivateQuery->where('target_group_id', $validated['targetId']);
            } else {
                $deactivateQuery->where('target_trainer_user_id', $validated['targetId']);
            }

            $deactivateQuery->update(['is_active' => false]);

            $assetId = $validated['assetId'] ?? null;
            $asset = null;
            $imageData = data_get($validated, 'image.data');
            
            // Handle base64 image if provided
            if (!empty($imageData)) {
                $fileName = $validated['image']['name'] ?? ('timetable_' . time() . '.png');
                
                // Remove base64 header if exists
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $imageData = substr($imageData, strpos($imageData, ',') + 1);
                    $type = strtolower($type[1]);
                } else {
                    $type = 'png';
                }

                $imageData = base64_decode($imageData);
                if ($imageData === false) {
                    throw new \Exception('Invalid base64 data.');
                }

                $path = "propath/timetables/" . date('Y/m') . "/" . Str::random(40) . "." . $type;
                Storage::disk('local')->put($path, $imageData);

                $asset = Asset::create([
                    'entity_type' => 'timetable',
                    'category' => 'image',
                    'file_name' => $fileName,
                    'mime_type' => 'image/' . $type,
                    'size_bytes' => strlen($imageData),
                    'storage_disk' => 'local',
                    'storage_path' => $path,
                    'uploaded_by_user_id' => $user->id,
                ]);
                $assetId = $asset->id;
            }

            if (!$assetId) {
                throw new \Exception('No asset ID or image data provided.');
            }

            // Create new active timetable
            $timetable = Timetable::create([
                'target_type' => $validated['targetType'],
                'target_group_id' => $validated['targetType'] === 'group' ? $validated['targetId'] : null,
                'target_trainer_user_id' => $validated['targetType'] === 'trainer' ? $validated['targetId'] : null,
                'asset_id' => $assetId,
                'uploaded_by_user_id' => $user->id,
                'is_active' => true,
                'uploaded_at' => now(),
            ]);

            if (!empty($asset)) {
                $asset->update(['entity_id' => $timetable->id]);
            }

            AuditService::log(
                'timetable.published',
                $user->id,
                'timetable',
                $timetable->id,
                null,
                ['targetType' => $validated['targetType'], 'targetId' => $validated['targetId']],
            );

            $timetable->load(['group', 'asset', 'trainerUser', 'uploader']);

            return response()->json([
                'data' => new TimetableResource($timetable),
                'message' => 'Timetable published.',
            ], 201);
        });
    }

    public function destroy(Timetable $timetable): JsonResponse
    {
        $timetable->delete();

        return response()->json(['message' => 'Timetable deleted.']);
    }
}
