<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subject_group', function (Blueprint $table) {
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('group_id')->constrained('groups')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['subject_id', 'group_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_group');
    }
};
