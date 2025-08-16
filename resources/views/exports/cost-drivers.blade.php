<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Daftar Biaya Driver</title>
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
            padding: 6px 8px;
            font-size: 11px;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        .footer {
            margin-top: 50px;
            text-align: right;
            font-size: 11px;
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
        LAPORAN DAFTAR BIAYA DRIVER
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Nama Biaya Driver</th>
                <th>Satuan</th>
                <th>Deskripsi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($costDrivers as $index => $costDriver)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $costDriver->name ?? '-' }}</td>
                <td class="text-center">{{ $costDriver->unit ?? '-' }}</td>
                <td>{{ $costDriver->description ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="text-center">Tidak ada data biaya driver.</td>
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