<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'entityType' => $this->entity_type,
            'entityId' => $this->entity_id,
            'category' => $this->category,
            'fileName' => $this->file_name,
            'mimeType' => $this->mime_type,
            'sizeBytes' => $this->size_bytes,
            'storageDisk' => $this->storage_disk,
            'storagePath' => $this->storage_path,
            'data' => url('api/v1/assets/view/' . $this->id),
            'downloadUrl' => url('api/v1/assets/' . $this->id . '/download'),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
