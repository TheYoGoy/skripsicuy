import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Label } from "@/Components/ui/label";
import { Building, Activity, Package } from "lucide-react"; // TAMBAHAN: Import ikon Building

export default function ABCReportIndex({
    auth,
    activityReports = [],
    productCostReports = [],
    departmentReports = [], // TAMBAHAN: Department reports prop
    dashboardData = {},
    months = [],
    years = [],
    selectedMonth = new Date().getMonth() + 1,
    selectedYear = new Date().getFullYear(),
}) {
    // FIXED: Format currency function - MOVED TO TOP
    const formatCurrency = (value) => {
        if (!value && value !== 0) {
            return "0";
        }

        let numValue;
        if (typeof value === "string") {
            // Hapus semua non-numeric kecuali titik dan koma
            const cleaned = value.replace(/[^\d.,]/g, "");
            // Normalize decimal separator (koma ke titik)
            const normalized = cleaned.replace(",", ".");
            numValue = parseFloat(normalized) || 0;
        } else {
            numValue = Number(value) || 0;
        }

        // Convert ke integer untuk currency display (tidak ada decimal)
        const intValue = Math.floor(Math.abs(numValue));

        // Format dengan titik sebagai thousand separator
        return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // FIXED: Format currency with decimal for precise values
    const formatCurrencyWithDecimal = (value, decimals = 2) => {
        if (!value && value !== 0) return "0";

        let numValue;
        if (typeof value === "string") {
            const cleaned = value.replace(/[^\d.,]/g, "");
            const normalized = cleaned.replace(",", ".");
            numValue = parseFloat(normalized) || 0;
        } else {
            numValue = Number(value) || 0;
        }

        return numValue.toLocaleString("id-ID", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    // FIXED: Get safe numeric value
    const getSafeNumericValue = (value) => {
        if (!value && value !== 0) return 0;

        if (typeof value === "string") {
            const cleaned = value.replace(/[^\d.,]/g, "");
            const normalized = cleaned.replace(",", ".");
            return parseFloat(normalized) || 0;
        }

        return Number(value) || 0;
    };

    const formatCompactCurrency = (value) => {
        if (!value && value !== 0) return "0";

        const numValue = getSafeNumericValue(value);

        if (numValue >= 1000000000) {
            return (numValue / 1000000000).toFixed(1) + "B";
        } else if (numValue >= 1000000) {
            return (numValue / 1000000).toFixed(1) + "M";
        } else if (numValue >= 1000) {
            return (numValue / 1000).toFixed(1) + "K";
        }

        return formatCurrency(numValue);
    };

    const handleMonthChange = (value) => {
        router.get(
            route("abc-reports.index"),
            { month: value, year: selectedYear },
            { preserveState: true }
        );
    };

    const handleYearChange = (value) => {
        router.get(
            route("abc-reports.index"),
            { month: selectedMonth, year: value },
            { preserveState: true }
        );
    };

    const EmptyState = ({ title, description }) => (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                {description}
            </p>
        </div>
    );

    const handleExportExcel = () => {
        const params = new URLSearchParams({
            month: selectedMonth,
            year: selectedYear,
        });
        window.location.href =
            route("abc-reports.export.excel") + "?" + params.toString();
    };

    const handleExportPdf = () => {
        const params = new URLSearchParams({
            month: selectedMonth,
            year: selectedYear,
        });
        window.open(
            route("abc-reports.export.pdf") + "?" + params.toString(),
            "_blank"
        );
    };

    const getCurrentMonthName = () => {
        const month = months.find((m) => m.value === selectedMonth);
        return month ? month.name : "Unknown Month";
    };

    // DEBUG: Console log untuk melihat data yang diterima
    React.useEffect(() => {
        console.log("=== FRONTEND DEBUG ===");
        console.log("Dashboard data received:", dashboardData);
        console.log("Department reports:", departmentReports); // TAMBAHAN: Log department reports
        console.log("Activity reports:", activityReports);
        console.log("Product reports:", productCostReports);
        console.log("=== END FRONTEND DEBUG ===");
    }, [dashboardData, departmentReports, activityReports, productCostReports]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Laporan Perhitungan Biaya ABC
                    </h2>
                </div>
            }
        >
            <Head title="Laporan ABC" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex gap-2">
                    <Button
                        onClick={handleExportExcel}
                        className="bg-green-600 text-white hover:bg-green-700"
                    >
                        Export Excel
                    </Button>

                    <Button
                        onClick={handleExportPdf}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Export PDF
                    </Button>
                </div>

                {/* Filter Section */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                            <span>Filter Periode Laporan</span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Pilih bulan dan tahun untuk menganalisis laporan
                            biaya produksi
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Bulan
                                </Label>
                                <Select
                                    value={selectedMonth.toString()}
                                    onValueChange={handleMonthChange}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                        <SelectValue placeholder="Pilih Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem
                                                key={month.value}
                                                value={month.value.toString()}
                                            >
                                                {month.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tahun
                                </Label>
                                <Select
                                    value={selectedYear.toString()}
                                    onValueChange={handleYearChange}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                        <SelectValue placeholder="Pilih Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                            >
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section - TAMBAHAN: Tab Departemen */}
                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <TabsTrigger
                            value="dashboard"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                                <span>Dashboard</span>
                            </div>
                        </TabsTrigger>

                        {/* TAMBAHAN: Tab Departemen */}
                        <TabsTrigger
                            value="departments"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4" />
                                <span>Departemen</span>
                            </div>
                        </TabsTrigger>

                        <TabsTrigger
                            value="activityCosts"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4" />
                                <span>Biaya Aktivitas</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="productCosts"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <div className="flex items-center space-x-2">
                                <Package className="w-4 h-4" />
                                <span>Biaya Produk</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Total Cost Card - FIXED */}
                            <Card className="overflow-hidden border-0 shadow-lg">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">
                                                Total Biaya Produksi
                                            </p>

                                            <p className="text-3xl font-bold mt-2">
                                                Rp{" "}
                                                {formatCurrency(
                                                    getSafeNumericValue(
                                                        dashboardData.total_overall_production_cost
                                                    )
                                                )}
                                            </p>
                                            <p className="text-blue-100 text-sm mt-1">
                                                Periode: {getCurrentMonthName()}{" "}
                                                {selectedYear}
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* TAMBAHAN: Department Cost Breakdown Cards */}
                            {departmentReports &&
                                departmentReports.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <h3 className="col-span-full text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Breakdown Biaya per Departemen
                                        </h3>
                                        {departmentReports.map((department) => (
                                            <Card
                                                key={department.department_id}
                                                className="border-0 shadow-md"
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {
                                                                department.department_name
                                                            }
                                                        </h3>
                                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                                            <Building className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Total Biaya:
                                                            </span>
                                                            <span className="font-bold text-green-600">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    department.total_cost
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Jumlah
                                                                Aktivitas:
                                                            </span>
                                                            <span className="text-sm">
                                                                {
                                                                    department.activity_count
                                                                }{" "}
                                                                aktivitas
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                            {/* Product Cost Breakdown Cards */}
                            {productCostReports &&
                                productCostReports.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <h3 className="col-span-full text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Breakdown Biaya per Produk
                                        </h3>
                                        {productCostReports.map((product) => (
                                            <Card
                                                key={product.product_id}
                                                className="border-0 shadow-md"
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {
                                                                product.product_name
                                                            }
                                                        </h3>
                                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Total Biaya:
                                                            </span>
                                                            <span className="font-bold text-blue-600">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    product.total_product_cost
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Kuantitas:
                                                            </span>
                                                            <span className="text-sm">
                                                                {formatCurrency(
                                                                    product.total_production_quantity
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Biaya per Unit:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                Rp{" "}
                                                                {formatCurrencyWithDecimal(
                                                                    product.cost_per_unit,
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                            {/* Summary Verification Card */}
                            {productCostReports &&
                                productCostReports.length > 0 && (
                                    <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/20">
                                        <CardContent className="p-6">
                                            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">
                                                Verifikasi Perhitungan
                                            </h3>
                                            <div className="space-y-2">
                                                {productCostReports.map(
                                                    (product, index) => (
                                                        <div
                                                            key={
                                                                product.product_id
                                                            }
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {
                                                                    product.product_name
                                                                }
                                                                :
                                                            </span>
                                                            <span className="font-medium">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    product.total_product_cost
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                                <hr className="my-2 border-green-200 dark:border-green-700" />
                                                <div className="flex justify-between font-bold text-green-800 dark:text-green-200">
                                                    <span>Total:</span>
                                                    <span>
                                                        Rp{" "}
                                                        {formatCurrency(
                                                            productCostReports.reduce(
                                                                (sum, p) =>
                                                                    sum +
                                                                    getSafeNumericValue(
                                                                        p.total_product_cost
                                                                    ),
                                                                0
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    </TabsContent>

                    {/* TAMBAHAN: Departments Tab */}
                    <TabsContent value="departments">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Building className="w-5 h-5 text-green-600" />
                                    Laporan Biaya per Departemen
                                </CardTitle>
                                <CardDescription>
                                    Rincian biaya yang dialokasikan ke setiap
                                    departemen untuk periode{" "}
                                    <span className="font-medium text-blue-600">
                                        {getCurrentMonthName()} {selectedYear}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {!departmentReports ||
                                departmentReports.length === 0 ? (
                                    <EmptyState
                                        title="Tidak Ada Data Departemen"
                                        description="Pastikan Anda telah melengkapi alokasi biaya dan aktivitas yang terhubung dengan departemen."
                                    />
                                ) : (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Departemen
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Total Biaya
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Jumlah Aktivitas
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Rata-rata Biaya per
                                                        Aktivitas
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {departmentReports.map(
                                                    (report) => (
                                                        <TableRow
                                                            key={
                                                                report.department_id
                                                            }
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Building className="w-4 h-4 text-green-600" />
                                                                    {
                                                                        report.department_name
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    report.total_cost
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {
                                                                    report.activity_count
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-green-600">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    report.total_cost /
                                                                        report.activity_count
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Costs Tab - UPDATED: Tambah kolom departemen */}
                    <TabsContent value="activityCosts">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Laporan Biaya Aktivitas & Tarif
                                </CardTitle>
                                <CardDescription>
                                    Detail perhitungan biaya dan tarif per unit
                                    driver aktivitas untuk periode{" "}
                                    <span className="font-medium text-blue-600">
                                        {getCurrentMonthName()} {selectedYear}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {!activityReports ||
                                activityReports.length === 0 ? (
                                    <EmptyState
                                        title="Tidak Ada Data Aktivitas"
                                        description="Pastikan Anda telah melengkapi alokasi biaya dan driver aktivitas untuk periode ini."
                                    />
                                ) : (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Aktivitas
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Departemen
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Driver Biaya
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Total Biaya
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Total Driver
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Tarif per Unit
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activityReports.map(
                                                    (report) => (
                                                        <TableRow
                                                            key={
                                                                report.activity_id
                                                            }
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                        >
                                                            <TableCell className="font-medium">
                                                                {
                                                                    report.activity_name
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Building className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm font-medium text-green-600">
                                                                        {
                                                                            report.department_name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {
                                                                            report.primary_cost_driver_name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        (
                                                                        {
                                                                            report.primary_cost_driver_unit
                                                                        }
                                                                        )
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    report.total_activity_cost_pool
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    report.total_cost_driver_usage
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-blue-600">
                                                                Rp{" "}
                                                                {formatCurrencyWithDecimal(
                                                                    report.activity_rate,
                                                                    4
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Product Costs Tab */}
                    <TabsContent value="productCosts">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Laporan Biaya Produk & Per Unit
                                </CardTitle>
                                <CardDescription>
                                    Rincian biaya yang dialokasikan ke setiap
                                    produk dan biaya per unit produksi untuk
                                    periode{" "}
                                    <span className="font-medium text-blue-600">
                                        {getCurrentMonthName()} {selectedYear}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {!productCostReports ||
                                productCostReports.length === 0 ? (
                                    <EmptyState
                                        title="Tidak Ada Data Produk"
                                        description="Pastikan Anda telah melengkapi catatan produksi dan penggunaan aktivitas untuk produk."
                                    />
                                ) : (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Produk
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Total Biaya
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Kuantitas Produksi
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Biaya per Unit
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {productCostReports.map(
                                                    (report) => (
                                                        <TableRow
                                                            key={
                                                                report.product_id
                                                            }
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                        >
                                                            <TableCell className="font-medium">
                                                                {
                                                                    report.product_name
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    report.total_product_cost
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    report.total_production_quantity
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-blue-600">
                                                                Rp{" "}
                                                                {formatCurrencyWithDecimal(
                                                                    report.cost_per_unit,
                                                                    4
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
