<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'target_type',
        'target_group_id',
        'target_trainer_user_id',
        'asset_id',
        'uploaded_by_user_id',
        'is_active',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'uploaded_at' => 'datetime',
        ];
    }

    public function group()
    {
        return $this->belongsTo(Group::class, 'target_group_id');
    }

    public function trainerUser()
    {
        return $this->belongsTo(User::class, 'target_trainer_user_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
