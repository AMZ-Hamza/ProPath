<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'audience' => ['sometimes', Rule::in(['all', 'students', 'trainers', 'admins'])],
        ];
    }
}
