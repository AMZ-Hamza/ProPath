<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->foreignId('trainer_user_id')->constrained('users')->restrictOnDelete();
            $table->unsignedBigInteger('asset_id')->nullable();
            $table->foreign('asset_id')->references('id')->on('assets')->nullOnDelete();
            $table->timestamps();

            $table->index(['group_id', 'subject_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
