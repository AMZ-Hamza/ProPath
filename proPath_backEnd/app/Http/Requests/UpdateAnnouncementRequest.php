<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:200',
            'content' => 'sometimes|string',
            'audience' => ['sometimes', Rule::in(['all', 'students', 'trainers', 'admins'])],
        ];
    }
}
