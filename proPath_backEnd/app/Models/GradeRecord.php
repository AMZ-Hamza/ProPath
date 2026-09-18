<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GradeRecord extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id',
        'cc1',
        'cc2',
        'cc3',
        'efm',
        'final_grade',
        'recorded_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'cc1' => 'decimal:2',
            'cc2' => 'decimal:2',
            'cc3' => 'decimal:2',
            'efm' => 'decimal:2',
            'final_grade' => 'decimal:2',
        ];
    }

    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * Calculate and set final_grade.
     * Formula: final = (efm * 0.75) + (ccAvg * 0.25)
     * cc2 and cc3 are optional.
     * Returns null if mandatory components (cc1, efm) are missing.
     */
    public function calculateFinalGrade(): ?float
    {
        if (is_null($this->cc1) || is_null($this->efm)) {
            $this->final_grade = null;
            return null;
        }

        $ccs = collect([$this->cc1, $this->cc2, $this->cc3])->filter(fn($v) => !is_null($v));
        $ccAvg = $ccs->average();

        $final = ($this->efm * 0.75) + ($ccAvg * 0.25);
        $this->final_grade = round($final, 2);

        return $this->final_grade;
    }
}
