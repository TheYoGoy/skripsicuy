<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Laporan Data Biaya</title>
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

        .text-right {
            text-align: right;
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

        .text-gray-400 {
            color: #9ca3af;
        }

        .italic {
            font-style: italic;
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
        LAPORAN DATA BIAYA
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Nama Biaya</th>
                <th>Jumlah Biaya</th>
                <th>Deskripsi</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($costs as $index => $cost)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $cost->name ?? '-' }}</td>
                <td class="text-right">
                    {{ $cost->amount !== null
                            ? 'Rp ' . number_format($cost->amount, 0, ',', '.')
                            : '-' }}
                </td>
                <td>
                    {!! $cost->description
                    ? e($cost->description)
                    : '<span class="text-gray-400 italic">-</span>' !!}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="text-center">Tidak ada data biaya.</td>
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