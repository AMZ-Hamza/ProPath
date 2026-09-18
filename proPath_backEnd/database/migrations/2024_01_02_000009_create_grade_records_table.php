<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->decimal('cc1', 5, 2)->nullable();
            $table->decimal('cc2', 5, 2)->nullable();
            $table->decimal('cc3', 5, 2)->nullable();
            $table->decimal('efm', 5, 2)->nullable();
            $table->decimal('final_grade', 5, 2)->nullable();
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id']);
            $table->index(['student_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_records');
    }
};
