<?php

namespace App\Exports;

use App\Models\CostDriver;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CostDriversExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        $drivers = CostDriver::all();

        return $drivers->values()->map(function ($item, $index) {
            return [
                'No' => $index + 1,
                'Nama Biaya' => $item->name,
                'Satuan' => $item->unit ?? '-', // pastikan aman jika unit null
                'Deskripsi' => $item->description ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No.',
            'Nama Biaya',
            'Satuan',
            'Deskripsi',
        ];
    }
}
