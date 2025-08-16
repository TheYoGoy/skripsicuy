<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{ProductActivityUsage, Product, Activity};
use Carbon\Carbon;

class ProductActivityUsageSeeder extends Seeder
{
    public function run(): void
    {
        echo "🔗 Creating simple product activity usage...\n";

        // Hanya 3 produk utama dengan aktivitas yang simple
        $simpleProductUsage = [
            'Sudut Timur Arabika Aceh Gayo' => [
                'Penyortiran Biji Kopi' => 0.2,
                'Roasting Medium' => 0.3,
                'Quality Testing' => 0.15,
                'Pengemasan Pouch' => 0.1,
            ],
            'Sudut Timur Medium Roast Ground' => [
                'Penyortiran Biji Kopi' => 0.2,
                'Roasting Medium' => 0.3,
                'Penggilingan Medium' => 0.25,
                'Quality Testing' => 0.15,
                'Pengemasan Pouch' => 0.1,
            ],
            'Sudut Timur House Blend' => [
                'Penyortiran Biji Kopi' => 0.25,
                'Roasting Medium' => 0.35,
                'Penggilingan Medium' => 0.25,
                'Quality Testing' => 0.2,
                'Pengemasan Pouch' => 0.12,
            ],
        ];

        $months = [7, 8]; // Juli & Agustus

        foreach ($months as $month) {
            foreach ($simpleProductUsage as $productName => $activities) {
                $product = Product::where('name', $productName)->first();

                if ($product) {
                    foreach ($activities as $activityName => $quantity) {
                        $activity = Activity::where('name', $activityName)->first();

                        if ($activity && $activity->primary_cost_driver_id) {
                            $usageDate = Carbon::create(2025, $month, 15);

                            ProductActivityUsage::firstOrCreate([
                                'product_id' => $product->id,
                                'activity_id' => $activity->id,
                                'usage_date' => $usageDate->toDateString(),
                            ], [
                                'cost_driver_id' => $activity->primary_cost_driver_id,
                                'quantity_consumed' => $quantity,
                                'notes' => "Usage {$activityName} untuk {$productName}",
                            ]);
                        }
                    }
                }
            }
        }

        $totalUsages = ProductActivityUsage::count();
        echo "✅ {$totalUsages} product activity usages berhasil dibuat!\n";
    }
}
