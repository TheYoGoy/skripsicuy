<?php

namespace App\Exports;

use App\Models\Activity;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ActivitiesExport implements FromCollection, WithMapping, WithHeadings
{
    protected $index = 1;

    public function collection()
    {
        // TAMBAHAN: Include department relationship
        return Activity::with(['primaryCostDriver', 'department'])->latest()->get();
    }

    public function map($activity): array
    {
        return [
            $this->index++,
            $activity->name ?? '-',
            // TAMBAHAN: Kolom departemen
            $activity->department ? $activity->department->name : '-',
            $activity->description ?? '-',
            $activity->primaryCostDriver
                ? $activity->primaryCostDriver->name . ' (' . $activity->primaryCostDriver->unit . ')'
                : '-',
        ];
    }

    public function headings(): array
    {
        return [
            'No.',
            'Nama Aktivitas',
            'Departemen', // TAMBAHAN: Header departemen
            'Deskripsi',
            'Driver Biaya Utama',
        ];
    }
}
