<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    protected $fillable = [
        'title',
        'description',
        'due_date',
        'subject_id',
        'group_id',
        'trainer_user_id',
        'asset_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
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
