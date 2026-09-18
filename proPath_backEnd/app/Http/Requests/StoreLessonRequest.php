<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'notes' => 'nullable|string',
            'subjectId' => 'required|exists:subjects,id',
            'groupId' => 'required|exists:groups,id',
            'assetId' => 'nullable|exists:assets,id',
        ];
    }
}
