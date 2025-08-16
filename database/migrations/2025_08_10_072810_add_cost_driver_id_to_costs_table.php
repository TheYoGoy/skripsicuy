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
        Schema::table('costs', function (Blueprint $table) {
        $table->unsignedBigInteger('cost_driver_id')->nullable()->after('amount');
        $table->foreign('cost_driver_id')->references('id')->on('cost_drivers')->onDelete('set null');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('costs', function (Blueprint $table) {
        $table->dropForeign(['cost_driver_id']);
        $table->dropColumn('cost_driver_id');
    });
    }
};
