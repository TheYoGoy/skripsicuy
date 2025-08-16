<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Produksi',
                'description' => 'Departemen produksi utama Sudut Timur Coffee'
            ],
            [
                'name' => 'Pengemasan',
                'description' => 'Departemen pengemasan dan finishing'
            ],
            [
                'name' => 'Quality Control',
                'description' => 'Departemen kontrol kualitas produk kopi'
            ],
            [
                'name' => 'Gudang',
                'description' => 'Departemen penyimpanan dan distribusi'
            ],
            [
                'name' => 'Maintenance',
                'description' => 'Departemen perawatan mesin dan peralatan'
            ],
            [
                'name' => 'Research & Development',
                'description' => 'Departemen riset dan pengembangan produk'
            ]
        ];

        foreach ($departments as $deptData) {
            Department::firstOrCreate(
                ['name' => $deptData['name']],
                $deptData
            );
        }

        echo "✅ " . count($departments) . " departments berhasil dibuat!\n";
    }
}