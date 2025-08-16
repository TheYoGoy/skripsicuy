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
        Schema::create('activity_cost_driver_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade'); // Foreign key ke tabel activities
            $table->foreignId('cost_driver_id')->constrained('cost_drivers')->onDelete('cascade'); // Foreign key ke tabel cost_drivers
            $table->decimal('usage_quantity', 15, 2); // Jumlah penggunaan driver biaya
            $table->date('usage_date'); // Tanggal penggunaan
            $table->text('notes')->nullable(); // Catatan opsional
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_cost_driver_usages');
    }
};
