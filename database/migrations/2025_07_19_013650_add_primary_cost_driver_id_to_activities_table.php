<?php
// sudut-timur-backend/database/migrations/YYYY_MM_DD_HHMMSS_add_primary_cost_driver_id_to_activities_table.php

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
        Schema::table('activities', function (Blueprint $table) {
            // Tambahkan kolom primary_cost_driver_id sebagai foreign key
            // Pastikan tabel 'cost_drivers' sudah ada sebelum menjalankan migrasi ini
            $table->foreignId('primary_cost_driver_id')
                ->nullable() // Boleh null jika aktivitas belum punya driver utama
                ->constrained('cost_drivers')
                ->onDelete('set null'); // Jika cost_driver dihapus, set null

            // Opsional: Tambahkan indeks untuk performa
            $table->index('primary_cost_driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            // Hapus foreign key dan kolom saat rollback
            $table->dropForeign(['primary_cost_driver_id']);
            $table->dropColumn('primary_cost_driver_id');
        });
    }
};
