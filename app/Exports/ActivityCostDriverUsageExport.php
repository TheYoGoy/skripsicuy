<?php

namespace App\Exports;

use App\Models\ActivityCostDriverUsage;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ActivityCostDriverUsageExport implements FromCollection, WithMapping, WithHeadings, WithStyles
{
    public function collection()
    {
        return ActivityCostDriverUsage::with(['activity', 'costDriver'])->latest()->get();
    }

    public function map($record): array
    {
        return [
            $record->id,
            $record->activity->name ?? '-',
            $record->costDriver->name ?? '-',
            $record->usage_quantity,
            $record->usage_date->format('Y-m-d'),
            $record->notes ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'ID',
            'Aktivitas',
            'Cost Driver',
            'Jumlah Penggunaan',
            'Tanggal Penggunaan',
            'Catatan',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Bold untuk baris pertama (heading)
            1 => ['font' => ['bold' => true]],
        ];
    }
}
