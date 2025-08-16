<?php

namespace App\Exports;

use App\Models\Cost;
use Maatwebsite\Excel\Concerns\FromCollection;

class CostsExport implements FromCollection
{
    protected $search;

    public function __construct($search = null)
    {
        $this->search = $search;
    }

    public function collection()
    {
        return Cost::when($this->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->get()
            ->map(function ($cost, $index) {
                return [
                    'No' => $index + 1,
                    'Nama Biaya' => $cost->name,
                    'Jumlah Biaya' => $cost->amount !== null
                        ? 'Rp ' . number_format($cost->amount, 0, ',', '.')
                        : '-',
                    'Deskripsi' => $cost->description ?? '-',
                ];
            });
    }
}
