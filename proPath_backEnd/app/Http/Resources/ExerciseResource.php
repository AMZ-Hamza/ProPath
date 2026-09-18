<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attachment = $this->whenLoaded('asset', fn() => new AssetResource($this->asset));

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'dueDate' => $this->due_date?->toDateString(),
            'subjectId' => $this->subject_id,
            'groupId' => $this->group_id,
            'trainerId' => $this->trainer_user_id,
            'trainerUserId' => $this->trainer_user_id,
            'assetId' => $this->asset_id,
            'subjectName' => $this->whenLoaded('subject', fn() => $this->subject->name),
            'groupName' => $this->whenLoaded('group', fn() => $this->group->name),
            'trainerName' => $this->whenLoaded('trainer', fn() => $this->trainer->name),
            'asset' => $attachment,
            'attachment' => $attachment,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
