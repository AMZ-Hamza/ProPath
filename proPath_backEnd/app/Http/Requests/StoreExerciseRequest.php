<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExerciseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'dueDate' => 'nullable|date',
            'subjectId' => 'required|exists:subjects,id',
            'groupId' => 'required|exists:groups,id',
            'assetId' => 'nullable|exists:assets,id',
        ];
    }
}
