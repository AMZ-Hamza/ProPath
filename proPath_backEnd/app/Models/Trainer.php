<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Trainer extends User
{
    protected $table = 'users';

    protected static function booted(): void
    {
        static::addGlobalScope('trainer_role', function (Builder $builder) {
            $builder->where('role', 'trainer');
        });
    }
}
