<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{CostActivityAllocation, Cost, Activity};
use Carbon\Carbon;

class CostActivityAllocationSeeder extends Seeder
{
    public function run(): void
    {
        echo "💰 Creating simple cost allocations...\n";

        // Mapping simple: 1 cost type ke beberapa aktivitas
        $simpleMapping = [
            'Gaji Tenaga Kerja' => [
                'Penyortiran Biji Kopi' => 30, // 30%
                'Quality Testing' => 20, // 20%
            ],
            'Biaya Gas LPG' => [
                'Roasting Medium' => 80, // 80%
            ],
            'Biaya Listrik' => [
                'Penggilingan Medium' => 40, // 40%
            ],
            'Biaya Maintenance' => [
                'Pengemasan Pouch' => 50, // 50%
            ],
            'Biaya Air' => [
                'Pencucian Biji' => 60, // 60%
            ],
            'Biaya Sewa Gudang' => [
                'Penyimpanan Gudang' => 70, // 70%
            ],
        ];

        $months = ['Juli', 'Agustus'];

        foreach ($months as $monthName) {
            foreach ($simpleMapping as $costType => $activities) {
                $cost = Cost::where('name', 'LIKE', "%{$costType}%{$monthName}%")->first();

                if ($cost) {
                    foreach ($activities as $activityName => $percentage) {
                        $activity = Activity::where('name', $activityName)->first();

                        if ($activity) {
                            $allocatedAmount = $cost->amount * ($percentage / 100);
                            $allocationDate = Carbon::create(2025, $monthName === 'Juli' ? 7 : 8, 15);

                            CostActivityAllocation::firstOrCreate([
                                'cost_id' => $cost->id,
                                'activity_id' => $activity->id,
                                'allocation_date' => $allocationDate->toDateString(),
                            ], [
                                'allocated_amount' => $allocatedAmount,
                                'notes' => "Alokasi {$percentage}% dari {$cost->name}",
                            ]);
                        }
                    }
                }
            }
        }

        $totalAllocations = CostActivityAllocation::count();
        echo "✅ {$totalAllocations} cost allocations berhasil dibuat!\n";
    }
}
