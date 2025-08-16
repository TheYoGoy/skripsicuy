<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{ActivityCostDriverUsage, Activity, CostDriver};
use Carbon\Carbon;

class ActivityCostDriverUsageSeeder extends Seeder
{
    public function run(): void
    {
        echo "⚡ Creating simple activity usage...\n";

        // Hanya aktivitas utama dengan usage yang simple
        $simpleUsage = [
            'Penyortiran Biji Kopi' => ['Jam Tenaga Kerja' => 20],
            'Pencucian Biji' => ['Air' => 300],
            'Roasting Medium' => ['Gas LPG' => 40],
            'Penggilingan Medium' => ['Listrik' => 80],
            'Quality Testing' => ['Jam Tenaga Kerja' => 15],
            'Pengemasan Pouch' => ['Jam Mesin' => 25],
            'Penyimpanan Gudang' => ['Luas Lantai' => 50],
        ];

        // Hanya 2 bulan
        $months = [7, 8]; // Juli & Agustus

        foreach ($months as $month) {
            foreach ($simpleUsage as $activityName => $drivers) {
                $activity = Activity::where('name', $activityName)->first();

                if ($activity) {
                    foreach ($drivers as $driverName => $usage) {
                        $costDriver = CostDriver::where('name', $driverName)->first();

                        if ($costDriver) {
                            $usageDate = Carbon::create(2025, $month, 15); // Tanggal 15 setiap bulan

                            ActivityCostDriverUsage::firstOrCreate([
                                'activity_id' => $activity->id,
                                'cost_driver_id' => $costDriver->id,
                                'usage_date' => $usageDate->toDateString(),
                            ], [
                                'usage_quantity' => $usage,
                                'notes' => "Usage {$driverName} - {$activityName}",
                            ]);
                        }
                    }
                }
            }
        }

        $totalUsages = ActivityCostDriverUsage::count();
        echo "✅ {$totalUsages} activity usages berhasil dibuat!\n";
    }
}
