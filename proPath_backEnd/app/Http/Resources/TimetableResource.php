<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimetableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $image = $this->whenLoaded('asset', fn() => new AssetResource($this->asset));

        return [
            'id' => $this->id,
            'targetType' => $this->target_type,
            'targetId' => $this->target_type === 'group' ? $this->target_group_id : $this->target_trainer_user_id,
            'targetGroupId' => $this->target_group_id,
            'targetTrainerUserId' => $this->target_trainer_user_id,
            'assetId' => $this->asset_id,
            'uploadedByUserId' => $this->uploaded_by_user_id,
            'isActive' => $this->is_active,
            'uploadedAt' => $this->uploaded_at?->toISOString(),
            'asset' => $image,
            'image' => $image,
            'groupName' => $this->whenLoaded('group', fn() => $this->group?->name),
        ];
    }
}
