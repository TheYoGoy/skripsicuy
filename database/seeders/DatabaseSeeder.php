<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        echo "🌱 Memulai seeding database Sudut Timur Coffee...\n\n";

        // STEP 1: Master Data Fundamental (Independent)
        echo "📋 STEP 1: Seeding Master Data Fundamental...\n";
        $this->call([
            UserSeeder::class,     // Users untuk login sistem
            DepartmentSeeder::class,
            CostDriverSeeder::class,
            ProductSeeder::class,
        ]);
        echo "\n";

        // STEP 2: Master Data yang Bergantung (Dependent)
        echo "🔗 STEP 2: Seeding Master Data Dependent...\n";
        $this->call([
            ActivitySeeder::class, // Butuh Department & CostDriver
            CostSeeder::class,     // Butuh CostDriver
        ]);
        echo "\n";

        // STEP 3: Operational Data
        echo "⚙️ STEP 3: Seeding Operational Data...\n";
        $this->call([
            ProductionSeeder::class,              // Data produksi
            CostActivityAllocationSeeder::class,  // Alokasi biaya ke aktivitas
            ActivityCostDriverUsageSeeder::class, // Penggunaan driver oleh aktivitas
            ProductActivityUsageSeeder::class,    // Penggunaan aktivitas oleh produk
        ]);
        echo "\n";

        echo "🎉 Seeding database berhasil diselesaikan!\n";
        echo "📊 Database Sudut Timur Coffee siap untuk ABC Costing Analysis!\n\n";

        // Summary
        echo "📈 SUMMARY:\n";
        echo "- ✅ Users: " . \App\Models\User::count() . " records\n";
        echo "- ✅ Departments: " . \App\Models\Department::count() . " records\n";
        echo "- ✅ Cost Drivers: " . \App\Models\CostDriver::count() . " records\n";
        echo "- ✅ Products: " . \App\Models\Product::count() . " records\n";
        echo "- ✅ Activities: " . \App\Models\Activity::count() . " records\n";
        echo "- ✅ Costs: " . \App\Models\Cost::count() . " records\n";
        echo "- ✅ Productions: " . \App\Models\Production::count() . " records\n";
        echo "- ✅ Cost Activity Allocations: " . \App\Models\CostActivityAllocation::count() . " records\n";
        echo "- ✅ Activity Cost Driver Usages: " . \App\Models\ActivityCostDriverUsage::count() . " records\n";
        echo "- ✅ Product Activity Usages: " . \App\Models\ProductActivityUsage::count() . " records\n";
        echo "\n🚀 Sistem ABC Costing Sudut Timur Coffee ready to go!\n";
    }
}
