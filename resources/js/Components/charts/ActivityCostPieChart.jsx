import React, { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
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
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";

const PIE_COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#6b7280", // Gray
    "#14b8a6", // Teal
    "#f472b6", // Fuchsia
    "#a855f7", // Purple
    "#22c55e", // Green
];

export default function ActivityCostPieChart({ data }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
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

    // Sort data by value descending untuk tampilan yang lebih rapi
    const sortedData = [...chartData].sort((a, b) => b.value - a.value);
    
    // Group small slices into "Others" if there are more than 8 items
    const processedData = sortedData.length > 8 ? (() => {
        const mainItems = sortedData.slice(0, 7);
        const otherItems = sortedData.slice(7);
        const othersTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
        
        if (othersTotal > 0) {
            return [...mainItems, { name: 'Lainnya', value: othersTotal, isOthers: true, items: otherItems }];
        }
        return mainItems;
    })() : sortedData;

    const displayData = processedData;

    // Calculate total for percentage calculation
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Custom label function - only show for slices > 3%
    const renderLabel = ({ name, value, percent }) => {
        if (percent < 0.03) return ''; // Hide labels for very small slices
        const displayPercent = (percent * 100).toFixed(0);
        return `${displayPercent}%`;
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                    <p className="font-medium text-gray-800">{data.name}</p>
                    <p className="text-blue-600">
                        {`Biaya: Rp ${data.value.toLocaleString("id-ID")}`}
                    </p>
                    <p className="text-gray-600">
                        {`Persentase: ${percentage}%`}
                    </p>
                    {data.payload.isOthers && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Terdiri dari:</p>
                            {data.payload.items.slice(0, 3).map((item, idx) => (
                                <p key={idx} className="text-xs text-gray-600">
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

    // Improved legend - responsive layout
    const renderLegend = (props) => {
        const { payload } = props;
        const displayItems = isExpanded ? payload : payload.slice(0, 6);
        
        return (
            <div className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {displayItems.map((entry, index) => {
                        const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                        return (
                            <div key={index} className="flex items-center gap-2 text-sm p-1">
                                <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate text-xs" title={entry.value}>
                                    {entry.value.length > 15 ? `${entry.value.substring(0, 15)}...` : entry.value} ({percentage}%)
                                </span>
                            </div>
                        );
                    })}
                </div>
                {payload.length > 6 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mx-auto"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Tampilkan Lebih Sedikit
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Tampilkan Semua ({payload.length - 6} lagi)
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Distribusi Biaya per Aktivitas
                </CardTitle>
                <CardDescription className="text-sm">
                    Persentase total biaya pool aktivitas untuk periode saat ini.
                    
                </CardDescription>
            </CardHeader>
            <CardContent>
                {displayData.length > 0 ? (
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={displayData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    innerRadius={45}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={renderLabel}
                                    labelStyle={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        fill: '#fff'
                                    }}
                                >
                                    {displayData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={renderLegend} />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Improved Summary section */}
                        <div className="mt-6">
                            <h4 className="font-medium mb-3">
                                Ringkasan Biaya Aktivitas
                            </h4>
                            <div className="max-h-64 overflow-y-auto border rounded-lg">
                                {sortedData.map((item, index) => {
                                    const percentage = ((item.value / total) * 100).toFixed(1);
                                    return (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-3 border-b last:border-b-0"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div 
                                                    className="w-3 h-3 rounded-full flex-shrink-0" 
                                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                />
                                                <span className="text-sm font-medium truncate" title={item.name}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-3">
                                                <div className="text-sm font-semibold">
                                                    Rp {item.value.toLocaleString("id-ID")}
                                                </div>
                                                <div className="text-xs">
                                                    {percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-4 p-3 rounded-lg border">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total Biaya:</span>
                                    <span className="font-bold text-lg text-blue-700">
                                        Rp {total.toLocaleString("id-ID")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-1 text-sm">
                                    <span>Total Aktivitas:</span>
                                    <span>{chartData.length} aktivitas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-16">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Tidak ada data</p>
                        <p className="text-sm">
                            Tidak ada data biaya aktivitas untuk ditampilkan.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}