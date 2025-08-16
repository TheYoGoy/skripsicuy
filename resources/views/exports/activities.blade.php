<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Data Aktivitas</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 12px;
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
            font-size: 11px;
        }

        .judul {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #333;
            /* Mengubah warna border */
            padding: 6px 8px;
            /* Menyesuaikan padding */
            font-size: 11px;
            /* Menyesuaikan ukuran font */
        }

        th {
            background-color: #f0f0f0;
            /* Menyesuaikan warna latar belakang header */
            font-weight: bold;
            text-align: center;
            /* Membuat teks header rata tengah */
        }

        .text-center {
            text-align: center;
        }

        .footer {
            margin-top: 50px;
            /* Menyesuaikan margin top */
            text-align: right;
            /* Membuat footer rata kanan */
            font-size: 11px;
            /* Menyesuaikan ukuran font footer */
        }

        .footer p {
            margin: 0;
        }

        .text-bold {
            font-weight: bold;
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
        LAPORAN DATA AKTIVITAS
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 8%;">No.</th>
                <th style="width: 25%;">Nama Aktivitas</th>
                <!-- TAMBAHAN: Kolom departemen -->
                <th style="width: 20%;">Departemen</th>
                <th style="width: 25%;">Deskripsi</th>
                <th style="width: 22%;">Driver Biaya Utama</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($activities as $index => $activity)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $activity->name ?? '-' }}</td>
                <!-- TAMBAHAN: Tampilkan nama departemen -->
                <td>{{ $activity->department ? $activity->department->name : '-' }}</td>
                <td>{{ $activity->description ?? '-' }}</td>
                <td>
                    @if ($activity->primaryCostDriver)
                    {{ $activity->primaryCostDriver->name }} ({{ $activity->primaryCostDriver->unit }})
                    @else
                    -
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <!-- PERBAIKAN: Update colspan menjadi 5 kolom -->
                <td colspan="5" class="text-center">Tidak ada data aktivitas.</td>
            </tr>
            @endforelse
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