<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Http\Resources\SystemSettingResource;
use App\Http\Resources\UserResource;
use App\Models\SystemSetting;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    /**
     * GET /api/v1/boot
     */
    public function boot(): JsonResponse
    {
        $isConfigured = User::count() > 0;
        $settings = $isConfigured ? new SystemSettingResource(SystemSetting::instance()) : null;
        $user = Auth::guard('sanctum')->user();

        return response()->json([
            'data' => [
                'isConfigured' => $isConfigured,
                'settings' => $settings,
                'user' => $user ? new UserResource($user) : null,
            ],
        ]);
    }

    /**
     * GET /api/v1/settings
     */
    public function show(): JsonResponse
    {
        $settings = SystemSetting::instance();
        $timeSlots = TimeSlot::orderBy('sort_order')->get();

        return response()->json([
            'data' => new SystemSettingResource($settings),
        ]);
    }

    /**
     * PATCH /api/v1/settings
     */
    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $settings = SystemSetting::instance();

        $settingsData = array_filter([
            'app_name' => $request->input('appName'),
            'institute_name' => $request->input('instituteName'),
            'support_email' => $request->input('supportEmail'),
            'locale' => $request->input('locale'),
            'rtl' => $request->input('rtl'),
            'attendance_hours_per_session' => $request->input('attendanceHoursPerSession'),
        ], fn($v) => !is_null($v));

        if (!empty($settingsData)) {
            $settings->update($settingsData);
        }

        // Sync time slots if provided
        if ($request->has('timeSlots')) {
            $incomingSlots = collect($request->input('timeSlots'));
            $incomingIds = $incomingSlots->pluck('id')->filter()->all();

            // Delete slots not in the incoming list
            TimeSlot::whereNotIn('id', $incomingIds)->delete();

            // Upsert each slot
            foreach ($incomingSlots as $i => $slot) {
                TimeSlot::updateOrCreate(
                    ['id' => $slot['id']],
                    [
                        'name' => $slot['name'],
                        'start_time' => $slot['startTime'],
                        'end_time' => $slot['endTime'],
                        'sort_order' => $i + 1,
                        'is_active' => true,
                    ]
                );
            }
        }

        return response()->json([
            'data' => new SystemSettingResource($settings->fresh()),
            'message' => 'Settings updated.',
        ]);
    }
}
