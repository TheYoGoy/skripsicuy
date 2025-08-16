<?php
// app/Exports/ProductionExport.php

namespace App\Exports;

use App\Models\Production;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductionExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $search;

    public function __construct($search = null)
    {
        $this->search = $search;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Production::with('product');

        if ($this->search) {
            $query->whereHas('product', function($q) {
                $q->where('name', 'like', '%' . $this->search . '%');
            })
            ->orWhere('notes', 'like', '%' . $this->search . '%')
            ->orWhere('quantity', 'like', '%' . $this->search . '%');
        }

        return $query->orderBy('production_date', 'desc')->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'No',
            'Produk',
            'Tanggal Produksi',
            'Jumlah Produksi',
            'Catatan'
        ];
    }

    /**
     * @param $production
     * @return array
     */
    public function map($production): array
    {
        static $no = 1;
        
        return [
            $no++,
            $production->product->name,
            $production->production_date,
            $production->quantity . ' unit',
            $production->notes ?: '-'
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}