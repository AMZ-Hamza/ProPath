<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'coefficient' => $this->coefficient,
            'trainerUserId' => $this->trainer_user_id,
            'trainerId' => $this->trainer_user_id,
            'trainerName' => $this->whenLoaded('trainer', fn() => $this->trainer->name),
            'groups' => GroupResource::collection($this->whenLoaded('groups')),
            'groupNames' => $this->whenLoaded('groups', fn() => $this->groups->pluck('name')),
            'groupIds' => $this->whenLoaded('groups', fn() => $this->groups->pluck('id')),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
