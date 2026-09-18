<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branchId' => $this->branch_id,
            'name' => $this->name,
            'year' => $this->year,
            'capacity' => $this->capacity,
            'description' => $this->description,
            'branchName' => $this->whenLoaded('branch', fn() => $this->branch->name),
            'studentCount' => $this->when($this->student_profiles_count !== null, $this->student_profiles_count),
            'subjectCount' => $this->when($this->subjects_count !== null, $this->subjects_count),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
