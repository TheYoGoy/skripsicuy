<?php

namespace App\Exports;

use App\Models\Department;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class DepartmentsExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Department::all()->values()->map(function ($department, $index) {
            return [
                'No' => $index + 1,
                'Nama Departemen' => $department->name,
                'Deskripsi' => $department->description ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No.',
            'Nama Departemen',
            'Deskripsi',
        ];
    }
}
