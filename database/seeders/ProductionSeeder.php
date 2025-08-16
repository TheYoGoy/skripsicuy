<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Production, Product};
use Carbon\Carbon;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        echo "🏭 Creating simple production data...\n";

        // Hanya 3 produk dengan data production simple
        $simpleProduction = [
            'Sudut Timur Arabika Aceh Gayo' => 500,
            'Sudut Timur Medium Roast Ground' => 800,
            'Sudut Timur House Blend' => 1000,
        ];

        $months = [7, 8]; // Juli & Agustus

        foreach ($months as $month) {
            foreach ($simpleProduction as $productName => $quantity) {
                $product = Product::where('name', $productName)->first();

                if ($product) {
                    $productionDate = Carbon::create(2025, $month, 15);

                    Production::firstOrCreate([
                        'product_id' => $product->id,
                        'production_date' => $productionDate->toDateString(),
                    ], [
                        'quantity' => $quantity,
                        'notes' => "Produksi {$productName} bulan " . $productionDate->format('F Y'),
                    ]);
                }
            }
        }

        $totalProductions = Production::count();
        echo "✅ {$totalProductions} production records berhasil dibuat!\n";
    }
}
