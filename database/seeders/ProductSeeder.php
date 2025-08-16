<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Single Origin Series
            [
                'code' => 'ST-ARA-001',
                'name' => 'Sudut Timur Arabika Aceh Gayo', 
                'type' => 'Biji Utuh', 
                'description' => 'Single origin premium dari dataran tinggi Aceh'
            ],
            [
                'code' => 'ST-ARA-002',
                'name' => 'Sudut Timur Arabika Toraja', 
                'type' => 'Biji Utuh', 
                'description' => 'Kopi arabika asli Tana Toraja'
            ],
            [
                'code' => 'ST-ARA-003',
                'name' => 'Sudut Timur Arabika Kintamani', 
                'type' => 'Biji Utuh', 
                'description' => 'Arabika dari lereng Gunung Batur, Bali'
            ],
            [
                'code' => 'ST-ROB-001',
                'name' => 'Sudut Timur Robusta Lampung', 
                'type' => 'Biji Utuh', 
                'description' => 'Robusta berkualitas dari Lampung'
            ],
            
            // Ground Coffee Series
            [
                'code' => 'ST-GRD-001',
                'name' => 'Sudut Timur Medium Roast Ground', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Kopi bubuk roasting sedang untuk drip'
            ],
            [
                'code' => 'ST-GRD-002',
                'name' => 'Sudut Timur Dark Roast Ground', 
                'type' => 'Bubuk Halus', 
                'description' => 'Kopi bubuk roasting gelap untuk espresso'
            ],
            [
                'code' => 'ST-GRD-003',
                'name' => 'Sudut Timur French Press Ground', 
                'type' => 'Bubuk Kasar', 
                'description' => 'Kopi bubuk kasar untuk french press'
            ],
            
            // Blend Series
            [
                'code' => 'ST-BLD-001',
                'name' => 'Sudut Timur House Blend', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Signature blend arabika-robusta 70:30'
            ],
            [
                'code' => 'ST-BLD-002',
                'name' => 'Sudut Timur Morning Blend', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Blend ringan untuk pagi hari'
            ],
            [
                'code' => 'ST-BLD-003',
                'name' => 'Sudut Timur Espresso Blend', 
                'type' => 'Bubuk Halus', 
                'description' => 'Blend khusus untuk espresso dan latte'
            ],
            
            // Premium Series
            [
                'code' => 'ST-PRM-001',
                'name' => 'Sudut Timur Premium Gold', 
                'type' => 'Biji Utuh', 
                'description' => 'Grade AAA premium selection'
            ],
            [
                'code' => 'ST-PRM-002',
                'name' => 'Sudut Timur Luwak Coffee', 
                'type' => 'Biji Utuh', 
                'description' => 'Kopi luwak asli Jawa Timur'
            ],
            
            // Instant Series
            [
                'code' => 'ST-INS-001',
                'name' => 'Sudut Timur Instant Classic', 
                'type' => 'Instant', 
                'description' => 'Kopi instan rasa klasik'
            ],
            [
                'code' => 'ST-INS-002',
                'name' => 'Sudut Timur 3in1 Original', 
                'type' => 'Instant', 
                'description' => 'Kopi instan dengan gula dan krimer'
            ],
            [
                'code' => 'ST-INS-003',
                'name' => 'Sudut Timur 3in1 Less Sugar', 
                'type' => 'Instant', 
                'description' => 'Kopi instan rendah gula'
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['code' => $productData['code']],
                $productData
            );
        }

        echo "✅ " . count($products) . " products berhasil dibuat!\n";
    }
}