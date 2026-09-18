<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->date('attendance_date');
            $table->string('session_slot_id', 40);
            $table->foreign('session_slot_id')->references('id')->on('time_slots')->restrictOnDelete();
            $table->enum('status', ['present', 'absent']);
            $table->foreignId('recorded_by_user_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'attendance_date', 'session_slot_id'], 'att_student_date_slot_unique');
            $table->index(['student_id', 'attendance_date']);
            $table->index(['group_id', 'attendance_date', 'session_slot_id'], 'att_grp_date_slot_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
