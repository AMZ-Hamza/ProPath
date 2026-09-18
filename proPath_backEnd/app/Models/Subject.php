<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'code',
        'description',
        'coefficient',
        'trainer_user_id',
    ];

    protected function casts(): array
    {
        return [
            'coefficient' => 'decimal:2',
        ];
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_user_id');
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'subject_group');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function exercises()
    {
        return $this->hasMany(Exercise::class);
    }

    public function gradeRecords()
    {
        return $this->hasMany(GradeRecord::class);
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
