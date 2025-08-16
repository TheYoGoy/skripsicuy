<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Daftar Penggunaan Aktivitas per Produk</title>
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
            /* Mengubah warna border menjadi #333 */
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

        .text-right {
            text-align: right;
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
        LAPORAN DAFTAR PENGGUNAAN AKTIVITAS PER PRODUK
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Produk</th>
                <th>Aktivitas</th>
                <th>Driver Biaya</th>
                <th>Unit</th>
                <th class="text-right">Kuantitas</th>
                <th>Tanggal Penggunaan</th>
                <th>Catatan</th>
                <th>Dibuat Pada</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($usages as $index => $usage)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $usage->product->name ?? '-' }}</td>
                <td>{{ $usage->activity->name ?? '-' }}</td>
                <td>{{ $usage->costDriver->name ?? '-' }}</td>
                <td class="text-center">{{ $usage->costDriver->unit ?? '-' }}</td>
                <td class="text-right">{{ number_format($usage->quantity_consumed, 2) }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($usage->usage_date)->format('d F Y') }}</td>
                <td>{{ $usage->notes ?? '-' }}</td>
                <td class="text-center">{{ \Carbon\Carbon::parse($usage->created_at)->format('d F Y H:i:s') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" class="text-center">Tidak ada data penggunaan aktivitas untuk ditampilkan.</td>
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