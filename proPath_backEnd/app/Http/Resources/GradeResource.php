<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'studentId' => $this->student_id,
            'subjectId' => $this->subject_id,
            'cc1' => $this->nullableFloat($this->cc1),
            'cc2' => $this->nullableFloat($this->cc2),
            'cc3' => $this->nullableFloat($this->cc3),
            'efm' => $this->nullableFloat($this->efm),
            'finalGrade' => $this->nullableFloat($this->final_grade),
            'recordedByUserId' => $this->recorded_by_user_id,
            'studentName' => $this->whenLoaded('student', fn() => $this->student->user?->name),
            'subjectName' => $this->whenLoaded('subject', fn() => $this->subject->name),
            'subjectCoefficient' => $this->whenLoaded('subject', fn() => $this->nullableFloat($this->subject->coefficient)),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }

    private function nullableFloat(mixed $value): ?float
    {
        return is_null($value) ? null : (float) $value;
    }
}
