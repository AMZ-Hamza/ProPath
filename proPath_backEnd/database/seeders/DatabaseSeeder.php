<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed singleton system settings
        SystemSetting::firstOrCreate(['id' => 1], [
            'app_name' => 'ProPath',
            'institute_name' => null,
            'support_email' => null,
            'locale' => 'ar-MA',
            'rtl' => true,
            'attendance_hours_per_session' => 2.50,
        ]);

        // Seed default time slots
        $defaultSlots = [
            ['id' => 'slot-1', 'name' => 'الحصة الأولى', 'start_time' => '08:30', 'end_time' => '11:00', 'sort_order' => 1],
            ['id' => 'slot-2', 'name' => 'الحصة الثانية', 'start_time' => '11:00', 'end_time' => '13:30', 'sort_order' => 2],
            ['id' => 'slot-3', 'name' => 'الحصة الثالثة', 'start_time' => '14:30', 'end_time' => '17:00', 'sort_order' => 3],
            ['id' => 'slot-4', 'name' => 'الحصة الرابعة', 'start_time' => '17:00', 'end_time' => '19:30', 'sort_order' => 4],
        ];

        foreach ($defaultSlots as $slot) {
            TimeSlot::firstOrCreate(
                ['id' => $slot['id']],
                [
                    'name' => $slot['name'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'sort_order' => $slot['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
