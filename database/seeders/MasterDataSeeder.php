<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        echo "🚀 Mulai seeding master data Sudut Timur Coffee...\n\n";

        $this->call([
            DepartmentSeeder::class,
            CostDriverSeeder::class,
            ActivitySeeder::class,
            ProductSeeder::class,
            CostSeeder::class,
        ]);

        echo "\n🎉 Semua master data berhasil di-seed!\n";
        echo "📝 Summary:\n";
        echo "   - Departments: 6 departemen\n";
        echo "   - Cost Drivers: 8 driver biaya\n";
        echo "   - Activities: 18 aktivitas produksi\n";
        echo "   - Products: 15 produk kopi\n";
        echo "   - Costs: 48 cost records (6 bulan x 8 jenis biaya)\n";
        echo "\n✨ Sistem ABC Costing siap untuk digunakan!\n";
    }
}