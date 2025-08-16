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
        Schema::create('cost_drivers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama driver biaya, misal: Jam Mesin, Jumlah Batch
            $table->string('unit')->nullable(); // Satuan driver, misal: Jam, Batch, Unit
            $table->text('description')->nullable(); // Deskripsi singkat driver biaya
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_drivers');
    }
};
