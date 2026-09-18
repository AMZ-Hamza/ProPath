<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTimetableRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'targetType' => $this->input('targetType', $this->input('target_type')),
            'targetId' => $this->input('targetId', $this->input('target_id')),
            'assetId' => $this->input('assetId', $this->input('asset_id')),
        ]);
    }

    public function rules(): array
    {
        return [
            'targetType' => ['required', Rule::in(['group', 'trainer'])],
            'targetId' => 'required|integer',
            'assetId' => 'nullable|exists:assets,id',
            'image' => 'nullable|array',
            'image.data' => 'required_without:assetId|string',
            'image.name' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'image.data.required_without' => 'The image data field is required when no asset id is provided.',
        ];
    }
}
