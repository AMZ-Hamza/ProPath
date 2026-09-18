<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssetController extends Controller
{
    /**
     * POST /api/v1/assets - Upload a file
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'entityType' => 'required|string|max:50',
            'entityId' => 'nullable|integer',
            'category' => 'nullable|string|max:50',
            'file' => 'required',
        ]);

        $entityType = $request->input('entityType');
        $category = $request->input('category', $entityType);
        $datePath = now()->format('Y/m');
        $storagePath = "propath/{$entityType}/{$datePath}";

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store($storagePath, 'local');
            $fileName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType() ?: 'application/octet-stream';
            $sizeBytes = $file->getSize();
            $checksum = hash_file('sha256', $file->getRealPath());
        } else {
            $payload = $request->input('file');
            if (!is_array($payload) || empty($payload['data'])) {
                return response()->json(['message' => 'A valid file payload is required.'], 422);
            }

            $rawData = $payload['data'];
            $mimeType = 'application/octet-stream';
            $extension = pathinfo((string) ($payload['name'] ?? ''), PATHINFO_EXTENSION) ?: 'bin';

            if (preg_match('/^data:([^;]+);base64,/', $rawData, $matches)) {
                $mimeType = $matches[1];
                $rawData = substr($rawData, strpos($rawData, ',') + 1);
                $guessedExtension = explode('/', $mimeType)[1] ?? null;
                if ($guessedExtension) {
                    $extension = $guessedExtension;
                }
            }

            $binary = base64_decode($rawData, true);
            if ($binary === false) {
                return response()->json(['message' => 'Invalid base64 file payload.'], 422);
            }

            $fileName = $payload['name'] ?? ('asset_' . Str::random(12) . '.' . $extension);
            $filePath = $storagePath . '/' . Str::random(40) . '.' . $extension;
            Storage::disk('local')->put($filePath, $binary);
            $sizeBytes = strlen($binary);
            $checksum = hash('sha256', $binary);
        }

        $asset = Asset::create([
            'entity_type' => $entityType,
            'entity_id' => $request->input('entityId'),
            'category' => $category,
            'file_name' => $fileName,
            'mime_type' => $mimeType,
            'size_bytes' => $sizeBytes,
            'checksum_sha256' => $checksum,
            'storage_disk' => 'local',
            'storage_path' => $filePath,
            'uploaded_by_user_id' => Auth::id(),
        ]);


        return response()->json([
            'data' => new AssetResource($asset),
            'message' => 'File uploaded.',
        ], 201);
    }

    /**
     * GET /api/v1/assets/{asset}
     */
    public function show(Asset $asset): JsonResponse
    {
        return response()->json([
            'data' => new AssetResource($asset),
        ]);
    }

    /**
     * GET /api/v1/assets/{asset}/download
     */
    public function download(Asset $asset)
    {
        $disk = Storage::disk($asset->storage_disk);

        if (!$disk->exists($asset->storage_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return $disk->download($asset->storage_path, $asset->file_name, [
            'Content-Type' => 'application/octet-stream',
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length, Content-Type',
        ]);
    }

    /**
     * GET /api/v1/assets/view/{asset}
     */
    public function view(Asset $asset)
    {
        $disk = Storage::disk($asset->storage_disk);

        if (!$disk->exists($asset->storage_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $mimeType = $asset->mime_type ?: 'application/octet-stream';
        
        return response()->file($disk->path($asset->storage_path), [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $asset->file_name . '"',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
