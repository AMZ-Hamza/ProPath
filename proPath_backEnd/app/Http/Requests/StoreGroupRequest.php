<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'branchId' => 'required|exists:branches,id',
            'year' => 'nullable|integer|min:1|max:10',
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ];
    }
}
