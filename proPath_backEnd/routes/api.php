<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\TrainerController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\GroupController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\GradeController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\ExerciseController;
use App\Http\Controllers\Api\V1\AnnouncementController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\AbsenceReportController;


/*
|--------------------------------------------------------------------------
| Public Routes (no auth required)
|--------------------------------------------------------------------------
*/

Route::post('/setup', [AuthController::class, 'setup']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/boot', [SettingsController::class, 'boot']);
Route::get('/assets/view/{asset}', [AssetController::class, 'view']);
Route::get('/assets/{asset}/download', [AssetController::class, 'download']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::patch('/settings', [SettingsController::class, 'update'])->middleware('role:admin');

    // Users (admin only for CUD, read may vary)
    Route::get('/users', [UserController::class, 'index'])->middleware('role:admin');
    Route::post('/users', [UserController::class, 'store'])->middleware('role:admin');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('role:admin');
    Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('role:admin');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('role:admin');

    // Students
    Route::get('/students/me', [StudentController::class, 'me']);
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{student}', [StudentController::class, 'show']);
    Route::patch('/students/{student}', [StudentController::class, 'update'])->middleware('role:admin');
    Route::get('/students/{student}/attendance-summary', [StudentController::class, 'attendanceSummary']);
    Route::get('/students/{student}/grades', [StudentController::class, 'grades']);
    Route::post('/students/grades', [GradeController::class, 'bulkStore'])->middleware('role:trainer');

    // Trainers
    Route::get('/trainers', [TrainerController::class, 'index']);
    Route::get('/trainers/me/subjects', [TrainerController::class, 'mySubjects']);
    Route::get('/trainers/me/groups', [TrainerController::class, 'myGroups']);
    Route::get('/trainers/{trainer}/subjects', [TrainerController::class, 'subjects']);
    Route::get('/trainers/{trainer}/groups', [TrainerController::class, 'groups']);

    // Branches
    Route::apiResource('branches', BranchController::class)->middleware('role:admin');

    // Groups
    Route::apiResource('groups', GroupController::class);
    Route::get('/groups/{group}/grades', [GradeController::class, 'groupGrades']);

    // Subjects
    Route::apiResource('subjects', SubjectController::class);

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/batch', [AttendanceController::class, 'batchStore'])->middleware('role:admin,trainer');

    // Grades
    Route::get('/grades', [GradeController::class, 'index']);

    // Lessons
    Route::apiResource('lessons', LessonController::class);

    // Exercises
    Route::apiResource('exercises', ExerciseController::class);

    // Announcements (news)
    Route::get('/news', [AnnouncementController::class, 'index']);
    Route::get('/news/audience/{role}', [AnnouncementController::class, 'byAudience']);
    Route::post('/news', [AnnouncementController::class, 'store'])->middleware('role:admin');
    Route::get('/news/{announcement}', [AnnouncementController::class, 'show']);
    Route::patch('/news/{announcement}', [AnnouncementController::class, 'update'])->middleware('role:admin');
    Route::delete('/news/{announcement}', [AnnouncementController::class, 'destroy'])->middleware('role:admin');

    // Timetables
    Route::get('/timetables', [TimetableController::class, 'index']);
    Route::post('/timetables', [TimetableController::class, 'store'])->middleware('role:admin');
    Route::delete('/timetables/{timetable}', [TimetableController::class, 'destroy'])->middleware('role:admin');

    // Assets
    Route::post('/assets', [AssetController::class, 'store']);
    Route::get('/assets/{asset}', [AssetController::class, 'show']);

    // Dashboards
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->middleware('role:admin');
    Route::get('/dashboard/trainer', [DashboardController::class, 'trainer'])->middleware('role:trainer');
    Route::get('/dashboard/student', [DashboardController::class, 'student'])->middleware('role:student');

    // Absence Monitoring
    Route::get('/admin/absence-report/{group_id}', [AbsenceReportController::class, 'index'])->middleware('role:admin');
});

