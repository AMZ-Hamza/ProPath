<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    // ── Relationships ──

    public function trainerProfile()
    {
        return $this->hasOne(TrainerProfile::class, 'user_id');
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class, 'user_id');
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'trainer_user_id');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'author_user_id');
    }

    public function recordedAttendance()
    {
        return $this->hasMany(AttendanceRecord::class, 'recorded_by_user_id');
    }

    public function recordedGrades()
    {
        return $this->hasMany(GradeRecord::class, 'recorded_by_user_id');
    }

    // ── Helpers ──

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'proAdmin'], true);
    }

    public function isProAdmin(): bool
    {
        return $this->role === 'proAdmin';
    }

    public function isTrainer(): bool
    {
        return $this->role === 'trainer';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
