<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('enrollment_number', 50)->unique();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('group_id')->constrained('groups')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('group_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
