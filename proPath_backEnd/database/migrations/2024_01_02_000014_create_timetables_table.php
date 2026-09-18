<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->enum('target_type', ['group', 'trainer']);
            $table->foreignId('target_group_id')->nullable()->constrained('groups')->cascadeOnDelete();
            $table->foreignId('target_trainer_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('asset_id');
            $table->foreign('asset_id')->references('id')->on('assets')->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->constrained('users')->restrictOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamp('uploaded_at');
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetables');
    }
};
