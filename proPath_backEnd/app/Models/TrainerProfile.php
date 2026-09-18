<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'employee_code',
        'specialization',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
