<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'username' => 'required|string|max:80|unique:users,username',
            'email' => 'nullable|email|max:150|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['proAdmin', 'admin', 'trainer', 'student'])],
            'groupId' => 'required_if:role,student|nullable|exists:groups,id',
            'branchId' => 'nullable|exists:branches,id',
            'enrollmentNumber' => 'nullable|string|max:50|unique:student_profiles,enrollment_number',
            'active' => 'sometimes|boolean',
        ];
    }
}
