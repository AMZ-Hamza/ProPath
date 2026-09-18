<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'notes',
        'subject_id',
        'group_id',
        'trainer_user_id',
        'asset_id',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_user_id');
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
