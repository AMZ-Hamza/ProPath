<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'active' => $this->status === 'active',
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'groupId' => $this->studentProfile?->group_id,
            'branchId' => $this->studentProfile?->branch_id,
            'studentProfile' => new StudentResource($this->whenLoaded('studentProfile')),
            'trainerProfile' => new TrainerResource($this->whenLoaded('trainerProfile')),
        ];
    }
}
