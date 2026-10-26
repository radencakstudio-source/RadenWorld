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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('gold')->default(1000)->after('avatar_url');
            $table->unsignedBigInteger('diamonds')->default(50)->after('gold');
            $table->string('google_email', 255)->nullable()->after('provider_id');
            $table->string('facebook_email', 255)->nullable()->after('google_email');
            $table->boolean('is_banned')->default(false)->after('role');
            $table->string('ban_reason', 255)->nullable()->after('is_banned');
            $table->string('wallet_hash', 64)->nullable()->after('ban_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gold',
                'diamonds',
                'google_email',
                'facebook_email',
                'is_banned',
                'ban_reason',
                'wallet_hash',
            ]);
        });
    }
};
