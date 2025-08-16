<?php

namespace App\Exports;

use App\Models\ProductActivityUsage;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductActivityUsagesExport implements FromCollection, WithMapping, WithHeadings
{
    protected $search;

    public function __construct($search = null)
    {
        $this->search = $search;
    }

    public function collection()
    {
        return ProductActivityUsage::with(['product', 'activity', 'costDriver'])
            ->when($this->search, function ($query) {
                $query->whereHas('product', function ($q) {
                    $q->where('name', 'like', '%' . $this->search . '%');
                })->orWhereHas('activity', function ($q) {
                    $q->where('description', 'like', '%' . $this->search . '%');
                });
            })
            ->get();
    }

    public function map($usage): array
    {
        return [
            $usage->id,
            $usage->product?->name ?? '-',
            $usage->activity?->description ?? '-',
            $usage->quantity_consumed ?? '-',
            $usage->costDriver?->unit ?? '-',
            $usage->usage_date ?? '-',
            optional($usage->created_at)->format('Y-m-d H:i:s'),
            optional($usage->updated_at)->format('Y-m-d H:i:s'),
        ];
    }

    public function headings(): array
    {
        return [
            'ID Penggunaan',
            'Nama Produk',
            'Deskripsi Aktivitas',
            'Jumlah Digunakan',
            'Unit',
            'Tanggal Penggunaan',
            'Dibuat Pada',
            'Diperbarui Pada',
        ];
    }
}
