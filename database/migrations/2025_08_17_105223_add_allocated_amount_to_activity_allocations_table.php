-- database/migrations/xxxx_add_allocated_amount_to_product_activity_usages_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('product_activity_usages', function (Blueprint $table) {
            $table->decimal('allocated_amount', 15, 2)->default(0)->after('quantity_consumed');
        });
    }

    public function down()
    {
        Schema::table('product_activity_usages', function (Blueprint $table) {
            $table->dropColumn('allocated_amount');
        });
    }
};
