<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'appName' => 'sometimes|string|max:120',
            'instituteName' => 'sometimes|nullable|string|max:150',
            'supportEmail' => 'sometimes|nullable|email|max:150',
            'locale' => 'sometimes|string|max:10',
            'rtl' => 'sometimes|boolean',
            'attendanceHoursPerSession' => 'sometimes|numeric|min:0|max:24',
            'timeSlots' => 'sometimes|array',
            'timeSlots.*.id' => 'required_with:timeSlots|string|max:40',
            'timeSlots.*.name' => 'required_with:timeSlots|string|max:100',
            'timeSlots.*.startTime' => 'required_with:timeSlots|date_format:H:i',
            'timeSlots.*.endTime' => 'required_with:timeSlots|date_format:H:i',
        ];
    }
}
