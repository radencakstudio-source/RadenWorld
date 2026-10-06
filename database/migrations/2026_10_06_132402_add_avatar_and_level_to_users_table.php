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
            $table->json('avatar')->nullable()->after('password');
            $table->integer('level')->default(1)->after('avatar');
            $table->integer('exp')->default(0)->after('level');
            $table->string('title')->default('Petualang Pemula')->after('exp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'level', 'exp', 'title']);
        });
    }
};
