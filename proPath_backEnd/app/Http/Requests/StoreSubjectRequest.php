<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'coefficient' => 'required|numeric|min:0.01|max:999.99',
            'trainerId' => 'nullable|exists:users,id',
            'groupIds' => 'nullable|array',
            'groupIds.*' => 'exists:groups,id',
        ];
    }
}
