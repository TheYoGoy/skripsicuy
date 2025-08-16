<?php
// sudut-timur-backend/database/migrations/YYYY_MM_DD_HHMMSS_create_cost_activity_allocations_table.php

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
        Schema::create('cost_activity_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cost_id')->constrained('costs')->onDelete('cascade'); // Biaya yang dialokasikan
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade'); // Aktivitas tujuan alokasi
            $table->decimal('allocated_amount', 15, 2); // Jumlah biaya yang dialokasikan (misal: Rp 1.500.000)
            $table->date('allocation_date'); // Tanggal alokasi (untuk periode tertentu, misal: awal bulan)
            $table->text('notes')->nullable(); // Catatan opsional
            $table->timestamps();

            // Tambahkan unique constraint untuk mencegah duplikasi alokasi biaya yang sama ke aktivitas yang sama pada tanggal yang sama
            $table->unique(['cost_id', 'activity_id', 'allocation_date'], 'unique_cost_activity_allocation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_activity_allocations');
    }
};
