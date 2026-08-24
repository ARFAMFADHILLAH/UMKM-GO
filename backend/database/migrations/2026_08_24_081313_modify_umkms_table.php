<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('umkms', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->change();
            $table->timestamp('rejected_at')->nullable()->after('is_verified');
            $table->json('photos')->nullable()->after('image_cover'); // ["umkms/xxx.jpg", ...]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkms', function (Blueprint $table) {
            $table->dropColumn(['rejected_at', 'photos']);
            $table->boolean('is_verified')->default(true)->change();
        });
    }
};
