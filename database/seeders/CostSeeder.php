<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Cost, CostDriver};
use Carbon\Carbon;

class CostSeeder extends Seeder
{
    public function run(): void
    {
        echo "💰 Creating simple cost data...\n";

        // Hanya 2 bulan saja (Juli & Agustus 2025)
        $months = [
            ['month' => 7, 'name' => 'Juli'],
            ['month' => 8, 'name' => 'Agustus'],
        ];

        // Hanya 6 jenis biaya utama
        $baseCosts = [
            ['name' => 'Biaya Listrik', 'amount' => 20000000, 'driver' => 'Listrik'],
            ['name' => 'Biaya Gas LPG', 'amount' => 12000000, 'driver' => 'Gas LPG'],
            ['name' => 'Gaji Tenaga Kerja', 'amount' => 35000000, 'driver' => 'Jam Tenaga Kerja'],
            ['name' => 'Biaya Maintenance', 'amount' => 15000000, 'driver' => 'Jam Mesin'],
            ['name' => 'Biaya Sewa Gudang', 'amount' => 6000000, 'driver' => 'Luas Lantai'],
            ['name' => 'Biaya Air', 'amount' => 2500000, 'driver' => 'Air'],
        ];

        foreach ($months as $monthData) {
            foreach ($baseCosts as $costData) {
                $costDriver = CostDriver::where('name', $costData['driver'])->first();

                if ($costDriver) {
                    Cost::firstOrCreate([
                        'name' => $costData['name'] . ' ' . $monthData['name'] . ' 2025'
                    ], [
                        'amount' => $costData['amount'],
                        'description' => "Biaya {$monthData['name']} 2025",
                        'cost_driver_id' => $costDriver->id,
                    ]);
                }
            }
        }

        $totalCosts = Cost::count();
        echo "✅ {$totalCosts} cost records berhasil dibuat!\n";
    }
}
