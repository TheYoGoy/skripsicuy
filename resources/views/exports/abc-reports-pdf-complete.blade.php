<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan ABC Lengkap - {{ \Carbon\Carbon::create(null, $selectedMonth)->translatedFormat('F') }} {{ $selectedYear }}</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 11px;
            margin: 40px;
            color: #333;
        }

        .kop {
            margin-bottom: 20px;
        }

        .kop h2 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .kop p {
            margin: 2px 0;
            font-size: 10px;
        }

        .judul {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }

        h3 {
            font-size: 13px;
            margin-top: 25px;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 5px 7px;
            font-size: 10px;
            vertical-align: top;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .footer {
            margin-top: 40px;
            text-align: right;
            font-size: 10px;
        }

        .footer p {
            margin: 0;
        }

        .text-bold {
            font-weight: bold;
        }

        .product-detail-table {
            width: 100%;
            margin: 0;
            border-collapse: collapse;
        }

        .product-detail-table th,
        .product-detail-table td {
            border: 1px dashed #bbb;
            padding: 3px 5px;
            font-size: 9px;
            background-color: #fafafa;
        }

        .product-detail-table th {
            background-color: #e8e8e8;
            font-weight: normal;
            text-align: center;
        }

        .sub-total-row td {
            font-weight: bold;
            background-color: #f5f5f5;
        }

        /* TAMBAHAN: Style untuk department */
        .department-header {
            background-color: #e6f3ff;
            font-weight: bold;
        }

        .department-summary {
            background-color: #f0f8ff;
        }
    </style>
</head>

<body>

    <div class="kop">
        <h2>Kopi Sudut Timur </h2>
        <p>Jl. Bina Marga No. 8, Cipayung, Kota Jakarta Timur, 13840</p>
        <p>Tanggal: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
    </div>

    <div class="judul">
        LAPORAN BIAYA BERBASIS AKTIVITAS (ABC) LENGKAP<br>
        PERIODE: {{ \Carbon\Carbon::create(null, $selectedMonth)->translatedFormat('F Y') }}
    </div>

    <!-- TAMBAHAN: Section 1 - Ringkasan Biaya per Departemen -->
    @if($departmentReports && $departmentReports->count() > 0)
    <h3>1. Ringkasan Biaya per Departemen</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 30%;">Nama Departemen</th>
                <th style="width: 15%;" class="text-center">Jumlah Aktivitas</th>
                <th style="width: 25%;" class="text-right">Total Biaya</th>
                <th style="width: 25%;" class="text-right">Rata-rata Biaya per Aktivitas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($departmentReports as $index => $deptReport)
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>{{ $deptReport['department']->name ?? '-' }}</td>
                <td class="text-center">{{ $deptReport['activity_count'] }}</td>
                <td class="text-right">Rp {{ number_format($deptReport['total_cost'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($deptReport['activity_count'] > 0 ? $deptReport['total_cost'] / $deptReport['activity_count'] : 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="department-summary">
                <td colspan="3" class="text-right text-bold">TOTAL BIAYA SEMUA DEPARTEMEN:</td>
                <td class="text-right text-bold">Rp {{ number_format($departmentReports->sum('total_cost'), 0, ',', '.') }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>
    @endif

    <!-- UPDATED: Section 2 - Ringkasan Biaya Aktivitas dan Rate (dengan Departemen) -->
    <h3>{{ $departmentReports && $departmentReports->count() > 0 ? '2' : '1' }}. Ringkasan Biaya Aktivitas dan Rate</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 20%;">Nama Aktivitas</th>
                <th style="width: 15%;">Departemen</th> <!-- TAMBAHAN: Kolom Departemen -->
                <th style="width: 15%;">Driver Biaya Utama</th>
                <th style="width: 8%;">Unit Driver</th>
                <th style="width: 12%;" class="text-right">Total Biaya Pool</th>
                <th style="width: 10%;" class="text-center">Total Penggunaan Driver</th>
                <th style="width: 15%;" class="text-right">Rate per Unit</th>
            </tr>
        </thead>
        <tbody>
            @forelse($activityReports as $index => $report)
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>{{ $report['activity']->name ?? '-' }}</td>
                <td>{{ $report['department'] ? $report['department']->name : 'Tidak Ada Departemen' }}</td> <!-- TAMBAHAN: Department -->
                <td>{{ $report['activity']->primaryCostDriver->name ?? '-' }}</td>
                <td class="text-center">{{ $report['activity']->primaryCostDriver->unit ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($report['allocated_cost'], 0, ',', '.') }}</td>
                <td class="text-center">{{ number_format($report['driver_usage'], 2, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($report['activity_rate'], 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center">Tidak ada data aktivitas dan rate untuk periode ini.</td> <!-- UPDATED: colspan 8 -->
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- UPDATED: Section 3 - Detail Alokasi Biaya Aktivitas per Produk (dengan Departemen) -->
    <h3>{{ $departmentReports && $departmentReports->count() > 0 ? '3' : '2' }}. Detail Alokasi Biaya Aktivitas per Produk</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Nama Produk</th>
                <th style="width: 45%;">Detail Alokasi Aktivitas</th> <!-- UPDATED: Width untuk accommodate departemen -->
                <th style="width: 10%;" class="text-center">Total Produksi (Unit)</th>
                <th style="width: 12%;" class="text-right">Total Biaya Produk</th>
                <th style="width: 13%;" class="text-right">Biaya per Unit Produk</th>
            </tr>
        </thead>
        <tbody>
            @forelse($productReports as $index => $productReport)
            @php
            $product = $productReport['product'];
            $productId = $product->id ?? null;
            @endphp
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>{{ $product->name ?? '-' }}</td>
                <td>
                    @if (!empty($productActivityDetails[$productId]))
                    <table class="product-detail-table">
                        <thead>
                            <tr>
                                <th style="width: 20%;">Aktivitas</th>
                                <th style="width: 15%;">Departemen</th> <!-- TAMBAHAN: Kolom Departemen -->
                                <th style="width: 15%;">Driver (Unit)</th>
                                <th style="width: 12%;" class="text-center">Konsumsi</th>
                                <th style="width: 18%;" class="text-right">Rate</th>
                                <th style="width: 20%;" class="text-right">Alokasi Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            @php $subTotalAllocatedCost = 0; @endphp
                            @foreach($productActivityDetails[$productId] as $detail)
                            <tr>
                                <td>{{ $detail['activity_name'] }}</td>
                                <td>{{ $detail['department_name'] ?? 'Tidak Ada Departemen' }}</td> <!-- TAMBAHAN: Department -->
                                <td>{{ $detail['cost_driver_name'] }} ({{ $detail['cost_driver_unit'] }})</td>
                                <td class="text-center">{{ number_format($detail['quantity_consumed'], 2, ',', '.') }}</td>
                                <td class="text-right">Rp {{ number_format($detail['activity_rate'], 0, ',', '.') }}</td>
                                <td class="text-right">Rp {{ number_format($detail['allocated_cost'], 0, ',', '.') }}</td>
                            </tr>
                            @php $subTotalAllocatedCost += $detail['allocated_cost']; @endphp
                            @endforeach
                            <tr class="sub-total-row">
                                <td colspan="5" class="text-right">Subtotal Biaya Alokasi:</td> <!-- UPDATED: colspan 5 -->
                                <td class="text-right">Rp {{ number_format($subTotalAllocatedCost, 0, ',', '.') }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- TAMBAHAN: Department breakdown per product -->
                    @if(!empty($productReport['department_breakdown']))
                    <br>
                    <table class="product-detail-table">
                        <thead>
                            <tr>
                                <th colspan="2" class="department-header">Breakdown Biaya per Departemen</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($productReport['department_breakdown'] as $deptName => $deptCost)
                            <tr>
                                <td style="width: 70%;">{{ $deptName }}</td>
                                <td style="width: 30%;" class="text-right">Rp {{ number_format($deptCost, 0, ',', '.') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @endif
                    @else
                    Tidak ada detail aktivitas.
                    @endif
                </td>
                <td class="text-center">{{ number_format($productReport['total_production_quantity'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($productReport['total_cost'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($productReport['unit_cost'], 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center">Tidak ada data biaya produk untuk periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- TAMBAHAN: Section 4 - Summary Total -->
    <h3>{{ $departmentReports && $departmentReports->count() > 0 ? '4' : '3' }}. Ringkasan Total Biaya</h3>
    <table style="width: 60%; margin-left: auto; margin-right: 0;">
        <tbody>
            <tr>
                <td style="width: 60%; padding: 8px;" class="text-right">Total Biaya Seluruh Aktivitas:</td>
                <td style="width: 40%; padding: 8px;" class="text-right text-bold">Rp {{ number_format($activityReports->sum('allocated_cost'), 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="text-right">Total Biaya Seluruh Produk:</td>
                <td class="text-right text-bold">Rp {{ number_format($productReports->sum('total_cost'), 0, ',', '.') }}</td>
            </tr>
            @if($departmentReports && $departmentReports->count() > 0)
            <tr>
                <td class="text-right">Total Biaya Seluruh Departemen:</td>
                <td class="text-right text-bold">Rp {{ number_format($departmentReports->sum('total_cost'), 0, ',', '.') }}</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p>Jakarta, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
        <br><br><br>
        <p class="text-bold">(___________________________)</p>
        <p>Mengetahui</p>
    </div>

</body>

</html>