<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $file = $this->whenLoaded('asset', fn() => new AssetResource($this->asset));

        return [
            'id' => $this->id,
            'title' => $this->title,
            'notes' => $this->notes,
            'subjectId' => $this->subject_id,
            'groupId' => $this->group_id,
            'trainerId' => $this->trainer_user_id,
            'trainerUserId' => $this->trainer_user_id,
            'assetId' => $this->asset_id,
            'publishedAt' => $this->published_at?->toISOString(),
            'subjectName' => $this->whenLoaded('subject', fn() => $this->subject->name),
            'groupName' => $this->whenLoaded('group', fn() => $this->group->name),
            'trainerName' => $this->whenLoaded('trainer', fn() => $this->trainer->name),
            'asset' => $file,
            'file' => $file,
        ];
    }
}
