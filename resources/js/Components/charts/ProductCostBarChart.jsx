import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Package, ArrowUpDown, Grid, BarChart3 } from "lucide-react";

export default function ProductCostBarChart({ data }) {
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc', 'name'
    const [viewMode, setViewMode] = useState('chart'); // 'chart', 'table'
    
    // Pastikan data selalu berupa array yang valid dan setiap item memiliki name dan value
    const chartData = Array.isArray(data)
        ? data.filter(
              (item) =>
                  item &&
                  typeof item.name === "string" &&
                  typeof item.value === "number" &&
                  item.value > 0
          )
        : [];

    // Sort data berdasarkan pilihan user
    const sortedData = [...chartData].sort((a, b) => {
        if (sortOrder === 'asc') return a.value - b.value;
        if (sortOrder === 'desc') return b.value - a.value;
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    // Group small items into "Others" if there are more than 10 items
    const processedData = sortedData.length > 10 ? (() => {
        const mainItems = sortedData.slice(0, 9);
        const otherItems = sortedData.slice(9);
        const othersTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
        
        if (othersTotal > 0) {
            return [...mainItems, { name: 'Lainnya', value: othersTotal, isOthers: true, items: otherItems }];
        }
        return mainItems;
    })() : sortedData;

    const chartDisplayData = processedData;

    // Determine chart height based on data count - DIPERBESAR
    const getChartHeight = () => {
        if (processedData.length <= 5) return 400;
        if (processedData.length <= 8) return 450;
        return 500;
    };

    // Custom tick formatter untuk XAxis yang memotong teks panjang
    const formatXAxisTick = (value) => {
        if (typeof value !== "string") return "N/A";
        // Potong lebih pendek untuk menghindari overlap
        return value.length > 8 ? value.substring(0, 8) + "..." : value;
    };

    // Custom tooltip untuk menampilkan nama lengkap
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalCost) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <p className="font-medium text-black break-words">{label}</p>
                    <p className="text-blue-600">
                        {`Total Biaya: Rp ${data.value.toLocaleString("id-ID")}`}
                    </p>
                    <p className=" text-sm">
                        {`${percentage}% dari total`}
                    </p>
                    {data.payload.isOthers && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Terdiri dari {data.payload.items.length} produk:</p>
                            {data.payload.items.slice(0, 3).map((item, idx) => (
                                <p key={idx} className="text-xs ">
                                    • {item.name}
                                </p>
                            ))}
                            {data.payload.items.length > 3 && (
                                <p className="text-xs text-gray-500">
                                    dan {data.payload.items.length - 3} lainnya
                                </p>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const totalCost = sortedData.reduce((sum, item) => sum + item.value, 0);

    const getSortIcon = () => {
        if (sortOrder === 'asc') return '↑';
        if (sortOrder === 'desc') return '↓';
        return '';
    };

    const toggleSort = () => {
        if (sortOrder === 'desc') setSortOrder('asc');
        else if (sortOrder === 'asc') setSortOrder('name');
        else setSortOrder('desc');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                Biaya Produksi per Produk
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                                Total biaya produksi untuk setiap produk periode saat ini.
                                
                            </CardDescription>
                        </div>
                    </div>
                    
                    {sortedData.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors"
                                title="Ubah urutan sortir"
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                <span className="font-mono">{getSortIcon()}</span>
                            </button>
                            
                            <div className="flex rounded-md border overflow-hidden">
                                <button
                                    onClick={() => setViewMode('chart')}
                                    className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                                        viewMode === 'chart' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Chart
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                                        viewMode === 'table' 
                                            ? 'bg-blue-600' 
                                            : 'bg-zinc'
                                    }`}
                                >
                                    <Grid className="h-4 w-4" />
                                    Table
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {sortedData.length > 0 ? (
                    <div className="w-full">
                        {viewMode === 'chart' ? (
                            <>
                                <ResponsiveContainer width="100%" height={getChartHeight()}>
                                    <BarChart
                                        data={chartDisplayData}
                                        margin={{ 
                                            top: 20, 
                                            right: 20, 
                                            left: 20, 
                                            bottom: 100
                                        }}
                                        barCategoryGap={processedData.length > 8 ? "10%" : "20%"}
                                    >
                                        <CartesianGrid 
                                            strokeDasharray="3 3" 
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            interval={0}
                                            angle={-20}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ 
                                                fontSize: processedData.length > 8 ? 10 : 11, 
                                                fontWeight: 500
                                            }}
                                            tickFormatter={formatXAxisTick}
                                            axisLine={{ stroke: '#d1d5db' }}
                                            tickLine={{ stroke: '#d1d5db' }}
                                        />
                                        <YAxis
                                            tick={{ 
                                                fontSize: 11, 
                                                fontWeight: 400
                                            }}
                                            tickFormatter={(value) =>
                                                `${
                                                    typeof value === "number"
                                                        ? value >= 1000000000 
                                                            ? (value / 1000000000).toFixed(1) + "M" 
                                                            : value >= 1000000
                                                            ? (value / 1000000).toFixed(1) + "jt"
                                                            : value >= 1000
                                                            ? (value / 1000).toFixed(0) + "rb"
                                                            : value.toString()
                                                        : "N/A"
                                                }`
                                            }
                                            axisLine={{ stroke: '#d1d5db' }}
                                            tickLine={{ stroke: '#d1d5db' }}
                                            width={60}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                        />
                                        <Legend 
                                            wrapperStyle={{
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#3b82f6"
                                            name="Total Biaya Produk"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={processedData.length > 8 ? 50 : 70}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                
                                {processedData.length !== sortedData.length && (
                                    <div className="mt-4 p-3 border rounded-lg">
                                        <p className="text-sm">
                                            <strong>Info:</strong> Chart mengelompokkan {sortedData.length - processedData.length + 1} produk dengan biaya terkecil ke dalam "Lainnya". 
                                            Lihat tabel di bawah untuk detail lengkap.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-800">
                                        Detail Biaya Produk
                                    </h4>
                                    <span className="text-sm ">
                                        {sortedData.length} produk
                                    </span>
                                </div>
                                
                                <div className="max-h-96 overflow-auto border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                    No.
                                                </th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                    Nama Produk
                                                </th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">
                                                    Total Biaya
                                                </th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">
                                                    % Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedData.map((item, index) => {
                                                const percentage = ((item.value / totalCost) * 100).toFixed(1);
                                                return (
                                                    <tr 
                                                        key={index} 
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="py-3 px-4 ">
                                                            {index + 1}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-800">
                                                            {item.name}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                                                            Rp {item.value.toLocaleString("id-ID")}
                                                        </td>
                                                        <td className="py-3 px-4 text-right ">
                                                            {percentage}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 p-4 rounded-lg border">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-sm">Total Produk</div>
                                    <div className="text-lg font-bold">{sortedData.length}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm ">Total Biaya</div>
                                    <div className="text-lg font-bold text-blue-700">
                                        Rp {totalCost.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm ">Rata-rata Biaya</div>
                                    <div className="text-lg font-bold">
                                        Rp {Math.round(totalCost / sortedData.length).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-16">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Tidak ada data</p>
                        <p className="text-sm">
                            Tidak ada data biaya produk untuk ditampilkan.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}