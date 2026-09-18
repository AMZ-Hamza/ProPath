<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'app_name',
        'institute_name',
        'support_email',
        'locale',
        'rtl',
        'attendance_hours_per_session',
    ];

    protected function casts(): array
    {
        return [
            'rtl' => 'boolean',
            'attendance_hours_per_session' => 'decimal:2',
        ];
    }

    /**
     * Get the singleton settings instance.
     */
    public static function instance(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'app_name' => 'ProPath',
            'locale' => 'ar-MA',
            'rtl' => true,
            'attendance_hours_per_session' => 2.50,
        ]);
    }
}
