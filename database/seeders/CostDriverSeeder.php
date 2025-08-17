<?php
// database/seeders/SimpleCostDriverSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CostDriver;

class CostDriverSeeder extends Seeder
{
    public function run(): void
    {
        $costDrivers = [
            [
                'name' => 'Jam Tenaga Kerja',
                'unit' => 'Jam',
                'description' => 'Waktu kerja karyawan'
            ],
            [
                'name' => 'Jam Mesin',
                'unit' => 'Jam',
                'description' => 'Waktu operasional mesin'
            ],
            [
                'name' => 'Kilogram Produk',
                'unit' => 'Kg',
                'description' => 'Berat produk yang diproses'
            ],
            [
                'name' => 'Jumlah Unit',
                'unit' => 'Unit',
                'description' => 'Jumlah unit produk'
            ]
        ];

        foreach ($costDrivers as $driver) {
            CostDriver::create($driver);
        }
    }
}
