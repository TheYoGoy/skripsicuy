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
        Schema::create('product_activity_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade'); // Produk yang menggunakan aktivitas
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade'); // Aktivitas yang digunakan
            $table->foreignId('cost_driver_id')->constrained('cost_drivers')->onDelete('cascade'); // Driver biaya yang digunakan oleh aktivitas ini
            $table->decimal('quantity_consumed', 15, 4); // Jumlah driver biaya yang dikonsumsi oleh produk ini untuk aktivitas ini
            $table->date('usage_date'); // Tanggal pencatatan penggunaan
            $table->text('notes')->nullable(); // Catatan opsional
            $table->timestamps();

            // Opsional: Untuk mencegah duplikasi entri yang sama pada tanggal yang sama
            $table->unique(['product_id', 'activity_id', 'cost_driver_id', 'usage_date'], 'unique_product_activity_usage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_activity_usages');
    }
};
