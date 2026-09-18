<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'studentId' => $this->student_id,
            'groupId' => $this->group_id,
            'subjectId' => $this->subject_id,
            'attendanceDate' => $this->attendance_date?->toDateString(),
            'sessionSlotId' => $this->session_slot_id,
            'status' => $this->status,
            'recordedByUserId' => $this->recorded_by_user_id,
            'studentName' => $this->whenLoaded('student', fn() => $this->student->user?->name),
            'groupName' => $this->whenLoaded('group', fn() => $this->group->name),
            'subjectName' => $this->whenLoaded('subject', fn() => $this->subject?->name),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
