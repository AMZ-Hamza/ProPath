<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('content');
            $table->enum('audience', ['all', 'students', 'trainers', 'admins'])->default('all');
            $table->foreignId('author_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('published_at');
            $table->timestamp('updated_at')->nullable();

            $table->index(['audience', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
