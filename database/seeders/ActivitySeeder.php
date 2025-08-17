<?php
// database/seeders/SimpleActivitySeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use App\Models\Department;
use App\Models\CostDriver;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $produksi = Department::where('name', 'Departemen Produksi')->first();
        $qc = Department::where('name', 'Departemen Quality Control')->first();
        $packaging = Department::where('name', 'Departemen Packaging')->first();

        $jamTenagaKerja = CostDriver::where('name', 'Jam Tenaga Kerja')->first();
        $jamMesin = CostDriver::where('name', 'Jam Mesin')->first();
        $kgProduk = CostDriver::where('name', 'Kilogram Produk')->first();
        $jumlahUnit = CostDriver::where('name', 'Jumlah Unit')->first();

        $activities = [
            [
                'name' => 'Sorting',
                'description' => 'Penyortiran biji kopi',
                'department_id' => $produksi->id,
                'primary_cost_driver_id' => $jamTenagaKerja->id
            ],
            [
                'name' => 'Roasting',
                'description' => 'Pemanggangan biji kopi',
                'department_id' => $produksi->id,
                'primary_cost_driver_id' => $jamMesin->id
            ],
            [
                'name' => 'Grinding',
                'description' => 'Penggilingan biji kopi',
                'department_id' => $produksi->id,
                'primary_cost_driver_id' => $jamMesin->id
            ],
            [
                'name' => 'Quality Check',
                'description' => 'Pemeriksaan kualitas',
                'department_id' => $qc->id,
                'primary_cost_driver_id' => $kgProduk->id
            ],
            [
                'name' => 'Packaging',
                'description' => 'Pengemasan produk',
                'department_id' => $packaging->id,
                'primary_cost_driver_id' => $jumlahUnit->id
            ]
        ];

        foreach ($activities as $activity) {
            Activity::create($activity);
        }
    }
}
