<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('app_name', 120);
            $table->string('institute_name', 150)->nullable();
            $table->string('support_email', 150)->nullable();
            $table->string('locale', 10)->default('ar-MA');
            $table->boolean('rtl')->default(true);
            $table->decimal('attendance_hours_per_session', 4, 2)->default(2.50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
