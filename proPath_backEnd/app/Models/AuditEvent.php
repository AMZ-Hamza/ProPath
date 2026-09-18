<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditEvent extends Model
{
    protected $table = 'audit_events';
    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'actor_user_id',
        'entity_type',
        'entity_id',
        'before',
        'after',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'before' => 'array',
            'after' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
