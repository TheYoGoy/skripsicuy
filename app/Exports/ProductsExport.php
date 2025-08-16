<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductsExport implements FromCollection, WithMapping, WithHeadings
{
    protected $index = 1;

    public function collection()
    {
        return Product::latest()->get();
    }

    public function map($product): array
    {
        return [
            $this->index++,
            $product->name ?? '-',
            $product->code ?? '-',
            $product->type ?? '-', // ganti sesuai nama relasi dan kolom
            $product->description ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'No.',
            'Nama Produk',
            'Kode Produk',
            'Jenis Kopi',
            'Deskripsi',
        ];
    }
}
