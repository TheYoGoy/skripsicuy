<?php
// database/seeders/SimpleDepartmentSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Departemen Produksi',
                'description' => 'Departemen produksi kopi'
            ],
            [
                'name' => 'Departemen Quality Control',
                'description' => 'Departemen kontrol kualitas'
            ],
            [
                'name' => 'Departemen Packaging',
                'description' => 'Departemen pengemasan'
            ]
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
