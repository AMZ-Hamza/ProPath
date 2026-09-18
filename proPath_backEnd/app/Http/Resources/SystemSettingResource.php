<?php

namespace App\Http\Resources;

use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'appName' => $this->app_name,
            'instituteName' => $this->institute_name,
            'supportEmail' => $this->support_email,
            'locale' => $this->locale,
            'rtl' => $this->rtl,
            'attendanceHoursPerSession' => (float) $this->attendance_hours_per_session,
            'timeSlots' => TimeSlot::orderBy('sort_order')->get()->map(fn($ts) => [
                'id' => $ts->id,
                'name' => $ts->name,
                'startTime' => $ts->start_time,
                'endTime' => $ts->end_time,
            ]),
        ];
    }
}
