<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan ABC Lengkap - {{ $monthName ?? 'Unknown' }} {{ $selectedYear ?? 'Unknown' }}</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 11px;
            margin: 30px;
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
            color: #2c3e50;
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

        .text-bold {
            font-weight: bold;
        }

        .footer {
            margin-top: 40px;
            text-align: right;
            font-size: 10px;
        }

        .footer p {
            margin: 2px 0;
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

        .department-header {
            background-color: #e6f3ff;
            font-weight: bold;
        }

        .department-summary {
            background-color: #f0f8ff;
        }

        .no-data {
            text-align: center;
            font-style: italic;
            color: #666;
            padding: 20px;
        }
    </style>
</head>

<body>

    <div class="kop">
        <h2>Kopi Sudut Timur</h2>
        <p>Jl. Bina Marga No. 8, Cipayung, Kota Jakarta Timur, 13840</p>
        <p>Tanggal: {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
    </div>

    <div class="judul">
        LAPORAN BIAYA BERBASIS AKTIVITAS (ABC) LENGKAP<br>
        PERIODE: {{ $monthName ?? 'Unknown Month' }} {{ $selectedYear ?? 'Unknown Year' }}
    </div>

    <!-- Section 1: Ringkasan Biaya per Departemen -->
    @if(isset($departmentReports) && $departmentReports->count() > 0)
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
                <td>{{ $deptReport['department']->name ?? 'Unknown Department' }}</td>
                <td class="text-center">{{ $deptReport['activity_count'] ?? 0 }}</td>
                <td class="text-right">Rp {{ number_format($deptReport['total_cost'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">
                    @php
                    $avgCost = ($deptReport['activity_count'] ?? 0) > 0 ? ($deptReport['total_cost'] ?? 0) / $deptReport['activity_count'] : 0;
                    @endphp
                    Rp {{ number_format($avgCost, 0, ',', '.') }}
                </td>
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

    <!-- Section 2: Ringkasan Biaya Aktivitas dan Rate -->
    <h3>{{ (isset($departmentReports) && $departmentReports->count() > 0) ? '2' : '1' }}. Ringkasan Biaya Aktivitas dan Rate</h3>
    @if(isset($activityReports) && $activityReports->count() > 0)
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 20%;">Nama Aktivitas</th>
                <th style="width: 15%;">Departemen</th>
                <th style="width: 15%;">Driver Biaya Utama</th>
                <th style="width: 8%;">Unit Driver</th>
                <th style="width: 12%;" class="text-right">Total Biaya Pool</th>
                <th style="width: 10%;" class="text-center">Total Penggunaan Driver</th>
                <th style="width: 15%;" class="text-right">Rate per Unit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($activityReports as $index => $report)
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>{{ $report['activity']->name ?? 'Unknown Activity' }}</td>
                <td>{{ $report['department'] ? $report['department']->name : 'Tidak Ada Departemen' }}</td>
                <td>{{ optional($report['activity']->primaryCostDriver)->name ?? 'Multiple Drivers' }}</td>
                <td class="text-center">{{ optional($report['activity']->primaryCostDriver)->unit ?? 'Units' }}</td>
                <td class="text-right">Rp {{ number_format($report['allocated_cost'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-center">{{ number_format($report['driver_usage'] ?? 0, 2, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($report['activity_rate'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">Tidak ada data aktivitas untuk periode ini.</div>
    @endif

    <!-- Section 3: Detail Alokasi Biaya Aktivitas per Produk -->
    <h3>{{ (isset($departmentReports) && $departmentReports->count() > 0) ? '3' : '2' }}. Detail Alokasi Biaya Aktivitas per Produk</h3>
    @if(isset($productReports) && $productReports->count() > 0)
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Nama Produk</th>
                <th style="width: 45%;">Detail Alokasi Aktivitas</th>
                <th style="width: 10%;" class="text-center">Total Produksi (Unit)</th>
                <th style="width: 12%;" class="text-right">Total Biaya Produk</th>
                <th style="width: 13%;" class="text-right">Biaya per Unit Produk</th>
            </tr>
        </thead>
        <tbody>
            @foreach($productReports as $index => $productReport)
            @php
            $product = $productReport['product'] ?? null;
            $productId = $product ? $product->id : null;
            @endphp
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>{{ $product ? $product->name : 'Unknown Product' }}</td>
                <td>
                    @if ($productId && isset($productActivityDetails[$productId]) && !empty($productActivityDetails[$productId]))
                    <table class="product-detail-table">
                        <thead>
                            <tr>
                                <th style="width: 20%;">Aktivitas</th>
                                <th style="width: 15%;">Departemen</th>
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
                                <td>{{ $detail['activity_name'] ?? 'Unknown' }}</td>
                                <td>{{ $detail['department_name'] ?? 'Tidak Ada Departemen' }}</td>
                                <td>{{ ($detail['cost_driver_name'] ?? 'Unknown') }} ({{ $detail['cost_driver_unit'] ?? 'Units' }})</td>
                                <td class="text-center">{{ number_format($detail['quantity_consumed'] ?? 0, 2, ',', '.') }}</td>
                                <td class="text-right">Rp {{ number_format($detail['activity_rate'] ?? 0, 0, ',', '.') }}</td>
                                <td class="text-right">Rp {{ number_format($detail['allocated_cost'] ?? 0, 0, ',', '.') }}</td>
                            </tr>
                            @php $subTotalAllocatedCost += ($detail['allocated_cost'] ?? 0); @endphp
                            @endforeach
                            <tr class="sub-total-row">
                                <td colspan="5" class="text-right">Subtotal Biaya Alokasi:</td>
                                <td class="text-right">Rp {{ number_format($subTotalAllocatedCost, 0, ',', '.') }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Department breakdown per product -->
                    @if(isset($productReport['department_breakdown']) && !empty($productReport['department_breakdown']))
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
                <td class="text-center">{{ number_format($productReport['total_production_quantity'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($productReport['total_cost'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($productReport['unit_cost'] ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-data">Tidak ada data biaya produk untuk periode ini.</div>
    @endif

    <!-- Section 4: Summary Total -->
    <h3>{{ (isset($departmentReports) && $departmentReports->count() > 0) ? '4' : '3' }}. Ringkasan Total Biaya</h3>
    <table style="width: 60%; margin-left: auto; margin-right: 0;">
        <tbody>
            <tr>
                <td style="width: 60%; padding: 8px;" class="text-right">Total Biaya Seluruh Aktivitas:</td>
                <td style="width: 40%; padding: 8px;" class="text-right text-bold">
                    Rp {{ number_format((isset($activityReports) ? $activityReports->sum('allocated_cost') : 0), 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td class="text-right">Total Biaya Seluruh Produk:</td>
                <td class="text-right text-bold">
                    Rp {{ number_format((isset($productReports) ? $productReports->sum('total_cost') : 0), 0, ',', '.') }}
                </td>
            </tr>
            @if(isset($departmentReports) && $departmentReports->count() > 0)
            <tr>
                <td class="text-right">Total Biaya Seluruh Departemen:</td>
                <td class="text-right text-bold">
                    Rp {{ number_format($departmentReports->sum('total_cost'), 0, ',', '.') }}
                </td>
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