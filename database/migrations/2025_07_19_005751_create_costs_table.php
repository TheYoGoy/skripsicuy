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
        Schema::create('costs', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama biaya, misal: Biaya Listrik Pabrik, Gaji Tenaga Kerja Produksi
            $table->text('description')->nullable(); // Deskripsi singkat biaya
            $table->decimal('amount', 15, 2)->nullable(); // Jumlah biaya, bisa diisi nanti atau diupdate
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('costs');
    }
};
