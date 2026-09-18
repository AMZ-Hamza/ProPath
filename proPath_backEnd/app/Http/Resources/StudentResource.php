<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'name' => $this->whenLoaded('user', fn() => $this->user?->name),
            'email' => $this->whenLoaded('user', fn() => $this->user?->email),
            'username' => $this->whenLoaded('user', fn() => $this->user?->username),
            'enrollmentNumber' => $this->enrollment_number,
            'branchId' => $this->branch_id,
            'groupId' => $this->group_id,
            'notes' => $this->notes,
            'branchName' => $this->whenLoaded('branch', fn() => $this->branch->name),
            'groupName' => $this->whenLoaded('group', fn() => $this->group->name),
            'user' => new UserResource($this->whenLoaded('user')),
            'grades' => $this->whenLoaded('gradeRecords', function () {
                $grades = $this->gradeRecords
                    ->keyBy(fn($grade) => (string) $grade->subject_id)
                    ->map(fn($grade) => [
                        'cc1' => $this->nullableFloat($grade->cc1),
                        'cc2' => $this->nullableFloat($grade->cc2),
                        'cc3' => $this->nullableFloat($grade->cc3),
                        'efm' => $this->nullableFloat($grade->efm),
                        'final' => $this->nullableFloat($grade->final_grade),
                    ]);
                return $grades->isEmpty() ? new \stdClass() : (object) $grades->all();
            }),
            'gradeSummary' => $this->whenLoaded('gradeRecords', fn() => $this->calculateYearGradeSummary()),
            'absenceCount' => $this->when(isset($this->absence_count), $this->absence_count ?? null),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }

    private function nullableFloat(mixed $value): ?float
    {
        return is_null($value) ? null : (float) $value;
    }
}
