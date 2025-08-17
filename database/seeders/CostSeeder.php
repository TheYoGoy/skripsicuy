<?php
// database/seeders/SimpleCostSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cost;
use App\Models\CostDriver;

class CostSeeder extends Seeder
{
    public function run(): void
    {
        $jamTenagaKerja = CostDriver::where('name', 'Jam Tenaga Kerja')->first();
        $jamMesin = CostDriver::where('name', 'Jam Mesin')->first();
        $kgProduk = CostDriver::where('name', 'Kilogram Produk')->first();
        $jumlahUnit = CostDriver::where('name', 'Jumlah Unit')->first();

        $costs = [
            [
                'name' => 'Gaji Karyawan',
                'amount' => 8000000,
                'description' => 'Gaji karyawan produksi',
                'cost_driver_id' => $jamTenagaKerja->id
            ],
            [
                'name' => 'Biaya Listrik Mesin',
                'amount' => 3000000,
                'description' => 'Biaya listrik untuk mesin',
                'cost_driver_id' => $jamMesin->id
            ],
            [
                'name' => 'Biji Kopi',
                'amount' => 40000000,
                'description' => 'Pembelian biji kopi',
                'cost_driver_id' => $kgProduk->id
            ],
            [
                'name' => 'Bahan Kemasan',
                'amount' => 2000000,
                'description' => 'Biaya kemasan produk',
                'cost_driver_id' => $jumlahUnit->id
            ],
            [
                'name' => 'Maintenance Mesin',
                'amount' => 1500000,
                'description' => 'Perawatan mesin produksi',
                'cost_driver_id' => $jamMesin->id
            ]
        ];

        foreach ($costs as $cost) {
            Cost::create($cost);
        }
    }
}
