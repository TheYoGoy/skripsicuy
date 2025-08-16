<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CostDriver;

class CostDriverSeeder extends Seeder
{
    public function run(): void
    {
        $costDrivers = [
            [
                'name' => 'Listrik',
                'unit' => 'kWh',
                'description' => 'Konsumsi listrik mesin produksi'
            ],
            [
                'name' => 'Jam Mesin',
                'unit' => 'Jam',
                'description' => 'Durasi penggunaan mesin'
            ],
            [
                'name' => 'Air',
                'unit' => 'Liter',
                'description' => 'Air untuk proses pencucian'
            ],
            [
                'name' => 'Jam Tenaga Kerja',
                'unit' => 'Jam',
                'description' => 'Waktu kerja karyawan'
            ],
            [
                'name' => 'Berat Bahan',
                'unit' => 'Kg',
                'description' => 'Berat bahan baku yang diproses'
            ],
            [
                'name' => 'Jumlah Batch',
                'unit' => 'Batch',
                'description' => 'Jumlah batch produksi'
            ],
            [
                'name' => 'Gas LPG',
                'unit' => 'Kg',
                'description' => 'Gas untuk proses roasting'
            ],
            [
                'name' => 'Luas Lantai',
                'unit' => 'm2',
                'description' => 'Luas area produksi'
            ]
        ];

        foreach ($costDrivers as $driverData) {
            CostDriver::firstOrCreate(
                ['name' => $driverData['name']],
                $driverData
            );
        }

        echo "✅ " . count($costDrivers) . " cost drivers berhasil dibuat!\n";
    }
}