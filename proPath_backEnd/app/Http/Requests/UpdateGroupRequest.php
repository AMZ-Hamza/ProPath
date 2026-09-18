<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:100',
            'branchId' => 'sometimes|exists:branches,id',
            'year' => 'nullable|integer|min:1|max:10',
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ];
    }
}
