<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class StudentProfile extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'enrollment_number',
        'branch_id',
        'group_id',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class, 'student_id');
    }

    public function gradeRecords()
    {
        return $this->hasMany(GradeRecord::class, 'student_id');
    }

    public function absenceCount(): int
    {
        return $this->attendanceRecords()->where('status', 'absent')->count();
    }

    public function calculateYearGradeSummary(): array
    {
        $this->loadMissing([
            'group.subjects',
            'gradeRecords.subject',
        ]);

        $subjects = $this->group?->subjects instanceof Collection
            ? $this->group->subjects->values()
            : collect();

        $gradeRecords = $this->gradeRecords instanceof Collection
            ? $this->gradeRecords->keyBy(fn($grade) => (string) $grade->subject_id)
            : collect();

        $totalSubjects = $subjects->count();
        $gradedEfmCount = 0;
        $weightedTotal = 0.0;
        $coefficientTotal = 0.0;
        $allModuleFinalGradesAvailable = $totalSubjects > 0;

        foreach ($subjects as $subject) {
            $coefficient = max((float) ($subject->coefficient ?? 1), 0);
            $grade = $gradeRecords->get((string) $subject->id);

            $coefficientTotal += $coefficient;

            if (!is_null($grade?->efm)) {
                $gradedEfmCount++;
            }

            if (is_null($grade?->final_grade)) {
                $allModuleFinalGradesAvailable = false;
                continue;
            }

            $weightedTotal += (float) $grade->final_grade * $coefficient;
        }

        $allEfmsGraded = $totalSubjects > 0 && $gradedEfmCount === $totalSubjects;
        $canDisplayYearFinalGrade = $allEfmsGraded
            && $allModuleFinalGradesAvailable
            && $coefficientTotal > 0;

        $yearFinalGrade = $canDisplayYearFinalGrade
            ? round($weightedTotal / $coefficientTotal, 2)
            : null;

        return [
            'totalSubjects' => $totalSubjects,
            'gradedEfmCount' => $gradedEfmCount,
            'allEfmsGraded' => $allEfmsGraded,
            'canDisplayYearFinalGrade' => $canDisplayYearFinalGrade,
            'totalCoefficient' => round($coefficientTotal, 2),
            'yearFinalGrade' => $yearFinalGrade,
            'cumulativeGpa' => $yearFinalGrade,
        ];
    }
}
