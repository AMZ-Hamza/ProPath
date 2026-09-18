<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'groupCount' => $this->when($this->groups_count !== null, $this->groups_count),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
