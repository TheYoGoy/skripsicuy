<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Activity, CostDriver, Department};

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            // Aktivitas Pra-Produksi - Departemen Produksi
            [
                'name' => 'Penyortiran Biji Kopi',
                'description' => 'Pemilahan biji kopi berdasarkan ukuran dan kualitas',
                'driver' => 'Jam Tenaga Kerja',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Pencucian Biji',
                'description' => 'Pembersihan biji kopi dari kotoran dan kulit',
                'driver' => 'Air',
                'department' => 'Produksi'
            ],

            // Aktivitas Pengeringan - Departemen Produksi
            [
                'name' => 'Pengeringan Natural',
                'description' => 'Pengeringan biji kopi dengan sinar matahari',
                'driver' => 'Luas Lantai',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Pengeringan Mesin',
                'description' => 'Pengeringan biji dengan mesin pengering',
                'driver' => 'Listrik',
                'department' => 'Produksi'
            ],

            // Aktivitas Roasting - Departemen Produksi
            [
                'name' => 'Roasting Light',
                'description' => 'Pemanggangan ringan untuk kopi mild',
                'driver' => 'Gas LPG',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Roasting Medium',
                'description' => 'Pemanggangan sedang untuk kopi balance',
                'driver' => 'Gas LPG',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Roasting Dark',
                'description' => 'Pemanggangan gelap untuk kopi bold',
                'driver' => 'Gas LPG',
                'department' => 'Produksi'
            ],

            // Aktivitas Penggilingan - Departemen Produksi
            [
                'name' => 'Penggilingan Coarse',
                'description' => 'Penggilingan kasar untuk french press',
                'driver' => 'Listrik',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Penggilingan Medium',
                'description' => 'Penggilingan sedang untuk drip coffee',
                'driver' => 'Listrik',
                'department' => 'Produksi'
            ],
            [
                'name' => 'Penggilingan Fine',
                'description' => 'Penggilingan halus untuk espresso',
                'driver' => 'Listrik',
                'department' => 'Produksi'
            ],

            // Aktivitas Blending - Departemen Research & Development
            [
                'name' => 'Blending Premium',
                'description' => 'Pencampuran kopi premium grade',
                'driver' => 'Jam Mesin',
                'department' => 'Research & Development'
            ],
            [
                'name' => 'Blending Regular',
                'description' => 'Pencampuran kopi regular grade',
                'driver' => 'Jam Mesin',
                'department' => 'Research & Development'
            ],

            // Aktivitas Quality Control - Departemen Quality Control
            [
                'name' => 'Quality Testing',
                'description' => 'Pengujian rasa dan aroma kopi',
                'driver' => 'Jam Tenaga Kerja',
                'department' => 'Quality Control'
            ],

            // Aktivitas Pengemasan - Departemen Pengemasan
            [
                'name' => 'Pengemasan Sachet',
                'description' => 'Pengemasan kopi dalam sachet',
                'driver' => 'Jam Mesin',
                'department' => 'Pengemasan'
            ],
            [
                'name' => 'Pengemasan Pouch',
                'description' => 'Pengemasan kopi dalam standing pouch',
                'driver' => 'Jam Mesin',
                'department' => 'Pengemasan'
            ],
            [
                'name' => 'Pengemasan Tin',
                'description' => 'Pengemasan kopi dalam kaleng',
                'driver' => 'Jam Mesin',
                'department' => 'Pengemasan'
            ],
            [
                'name' => 'Labeling & Coding',
                'description' => 'Pemberian label dan kode produk',
                'driver' => 'Jam Mesin',
                'department' => 'Pengemasan'
            ],

            // Aktivitas Penyimpanan - Departemen Gudang
            [
                'name' => 'Penyimpanan Gudang',
                'description' => 'Penyimpanan produk jadi',
                'driver' => 'Luas Lantai',
                'department' => 'Gudang'
            ],

            // Aktivitas Maintenance - Departemen Maintenance
            [
                'name' => 'Maintenance Preventif',
                'description' => 'Perawatan rutin mesin produksi',
                'driver' => 'Jam Mesin',
                'department' => 'Maintenance'
            ],
            [
                'name' => 'Maintenance Korektif',
                'description' => 'Perbaikan mesin yang rusak',
                'driver' => 'Jam Tenaga Kerja',
                'department' => 'Maintenance'
            ]
        ];

        foreach ($activities as $activityData) {
            $costDriver = CostDriver::where('name', $activityData['driver'])->first();
            $department = Department::where('name', $activityData['department'])->first();

            if ($costDriver && $department) {
                Activity::firstOrCreate(
                    ['name' => $activityData['name']],
                    [
                        'description' => $activityData['description'],
                        'department_id' => $department->id,
                        'primary_cost_driver_id' => $costDriver->id,
                    ]
                );
            }
        }

        echo "✅ " . count($activities) . " activities berhasil dibuat!\n";
    }
}
