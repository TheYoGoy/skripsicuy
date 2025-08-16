<?php
// database/migrations/xxxx_create_resource_usages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('resource_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->foreignId('cost_driver_id')->constrained()->onDelete('cascade');
            $table->decimal('usage_quantity', 15, 2);
            $table->date('usage_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Unique constraint untuk mencegah duplikasi
            $table->unique(['activity_id', 'cost_driver_id', 'usage_date'], 'unique_resource_usage');
        });
    }

    public function down()
    {
        Schema::dropIfExists('resource_usages');
    }
};