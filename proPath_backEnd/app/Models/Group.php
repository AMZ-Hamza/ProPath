<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;
    protected $fillable = [
        'branch_id',
        'name',
        'year',
        'capacity',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'capacity' => 'integer',
        ];
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_group');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'target_group_id');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function exercises()
    {
        return $this->hasMany(Exercise::class);
    }
}
