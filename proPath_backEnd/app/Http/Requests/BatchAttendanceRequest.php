<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BatchAttendanceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'groupId' => 'required|exists:groups,id',
            'date' => 'required|date',
            'sessionId' => 'required|exists:time_slots,id',
            'subjectId' => 'nullable|exists:subjects,id',
            'statuses' => 'required|array|min:1',
            'statuses.*' => 'required|in:present,absent',
        ];
    }
}
