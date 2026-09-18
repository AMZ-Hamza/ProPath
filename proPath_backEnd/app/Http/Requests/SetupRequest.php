<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appName' => 'sometimes|string|max:120',
            'name' => 'required|string|max:150',
            'username' => 'required|string|max:80|unique:users,username',
            'email' => 'nullable|email|max:150|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ];
    }
}
