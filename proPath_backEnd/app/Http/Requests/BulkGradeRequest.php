<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkGradeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subjectId' => 'required|exists:subjects,id',
            'gradesByStudent' => 'required|array|min:1',
            'gradesByStudent.*.cc1' => 'nullable|numeric|min:0|max:20',
            'gradesByStudent.*.cc2' => 'nullable|numeric|min:0|max:20',
            'gradesByStudent.*.cc3' => 'nullable|numeric|min:0|max:20',
            'gradesByStudent.*.efm' => 'nullable|numeric|min:0|max:40',
        ];
    }
}
