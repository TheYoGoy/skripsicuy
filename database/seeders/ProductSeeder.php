<?php
// database/seeders/SimpleProductSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Arabica Premium',
                'code' => 'PRD-0001',
                'type' => 'Arabica',
                'description' => 'Kopi Arabica premium'
            ],
            [
                'name' => 'Robusta Bold',
                'code' => 'PRD-0002',
                'type' => 'Robusta',
                'description' => 'Kopi Robusta bold'
            ],
            [
                'name' => 'Blend Special',
                'code' => 'PRD-0003',
                'type' => 'Blend',
                'description' => 'Campuran Arabica dan Robusta'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
