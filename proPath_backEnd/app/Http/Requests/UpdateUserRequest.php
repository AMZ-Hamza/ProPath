<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => 'sometimes|string|max:150',
            'username' => ['sometimes', 'string', 'max:80', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['sometimes', 'nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'password' => 'sometimes|string|min:6',
            'role' => ['sometimes', Rule::in(['proAdmin', 'admin', 'trainer', 'student'])],
            'groupId' => 'nullable|exists:groups,id',
            'branchId' => 'nullable|exists:branches,id',
            'enrollmentNumber' => 'nullable|string|max:50',
            'active' => 'sometimes|boolean',
        ];
    }
}
