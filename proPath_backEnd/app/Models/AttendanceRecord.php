<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'student_id',
        'group_id',
        'subject_id',
        'attendance_date',
        'session_slot_id',
        'status',
        'recorded_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
        ];
    }

    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function timeSlot()
    {
        return $this->belongsTo(TimeSlot::class, 'session_slot_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }
}
