<?php
// database/migrations/xxxx_create_product_cost_allocations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('product_cost_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->decimal('allocated_amount', 15, 2);
            $table->date('allocation_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint untuk mencegah duplikasi
            $table->unique(['product_id', 'activity_id', 'allocation_date'], 'unique_product_allocation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_cost_allocations');
    }
};