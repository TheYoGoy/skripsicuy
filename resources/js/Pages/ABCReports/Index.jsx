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
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Label } from "@/Components/ui/label";
import {
    Building,
    Activity,
    Package,
    AlertCircle,
    TrendingUp,
    BarChart3,
    PieChart,
} from "lucide-react";

export default function ABCReportIndex({
    auth,
    activityReports = [],
    productCostReports = [],
    departmentReports = [],
    dashboardData = {},
    dataChecks = {},
    months = [],
    years = [],
    selectedMonth = new Date().getMonth() + 1,
    selectedYear = new Date().getFullYear(),
    error = null,
}) {
    // FIXED: Format currency function
    const formatCurrency = (value) => {
        if (!value && value !== 0) return "0";

        let numValue;
        if (typeof value === "string") {
            const cleaned = value.replace(/[^\d.,]/g, "");
            const normalized = cleaned.replace(",", ".");
            numValue = parseFloat(normalized) || 0;
        } else {
            numValue = Number(value) || 0;
        }

        const intValue = Math.floor(Math.abs(numValue));
        return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

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
                <BarChart3 className="w-12 h-12 text-gray-400" />
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

    // Calculate totals for verification
    const totalProductCosts = productCostReports.reduce(
        (sum, p) => sum + getSafeNumericValue(p.total_product_cost),
        0
    );

    const totalActivityCosts = activityReports.reduce(
        (sum, a) => sum + getSafeNumericValue(a.total_activity_cost_pool),
        0
    );

    // Debug logging
    React.useEffect(() => {
        console.log("=== ABC FRONTEND DEBUG (FIXED) ===");
        console.log("Dashboard data:", dashboardData);
        console.log("Product reports:", productCostReports);
        console.log("Activity reports:", activityReports);
        console.log("Department reports:", departmentReports);
        console.log("Data checks:", dataChecks);
        console.log("Calculated totals:", {
            totalProductCosts,
            totalActivityCosts,
            dashboardTotal: getSafeNumericValue(
                dashboardData.total_overall_production_cost
            ),
        });
        console.log("=== END FRONTEND DEBUG ===");
    }, [dashboardData, productCostReports, activityReports, departmentReports]);

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
                {/* Error Alert */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Export Buttons */}
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
                            <PieChart className="w-5 h-5 text-blue-600" />
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

                {/* Data Check Alert - TAMBAHAN */}
                {dataChecks && Object.keys(dataChecks).length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <div className="text-sm">
                                <strong>Data Availability Check:</strong>
                                <ul className="mt-2 list-disc list-inside space-y-1">
                                    <li>
                                        Cost Activity Allocations:{" "}
                                        {dataChecks.cost_activity_allocations ||
                                            0}
                                    </li>
                                    <li>
                                        Product Activity Usages:{" "}
                                        {dataChecks.product_activity_usages ||
                                            0}
                                    </li>
                                    <li>
                                        Productions:{" "}
                                        {dataChecks.productions || 0}
                                    </li>
                                    <li>
                                        Activity Cost Driver Usages:{" "}
                                        {dataChecks.activity_cost_driver_usages ||
                                            0}
                                    </li>
                                </ul>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs Section */}
                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <TabsTrigger
                            value="dashboard"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4" />
                                <span>Dashboard</span>
                            </div>
                        </TabsTrigger>
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

                    {/* Dashboard Tab - IMPROVED */}
                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* FIXED: Total Cost Card dengan verifikasi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                    Periode:{" "}
                                                    {getCurrentMonthName()}{" "}
                                                    {selectedYear}
                                                </p>
                                            </div>
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                                <TrendingUp className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="overflow-hidden border-0 shadow-lg">
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">
                                                    Total Alokasi Biaya
                                                </p>
                                                <p className="text-3xl font-bold mt-2">
                                                    Rp{" "}
                                                    {formatCurrency(
                                                        getSafeNumericValue(
                                                            dashboardData.total_allocated_costs
                                                        )
                                                    )}
                                                </p>
                                                <p className="text-green-100 text-sm mt-1">
                                                    Stage 1 ABC
                                                </p>
                                            </div>
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                                <Activity className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="overflow-hidden border-0 shadow-lg">
                                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-medium">
                                                    Selisih Biaya
                                                </p>
                                                <p className="text-3xl font-bold mt-2">
                                                    Rp{" "}
                                                    {formatCurrency(
                                                        Math.abs(
                                                            getSafeNumericValue(
                                                                dashboardData.cost_difference
                                                            )
                                                        )
                                                    )}
                                                </p>
                                                <p className="text-purple-100 text-sm mt-1">
                                                    {getSafeNumericValue(
                                                        dashboardData.cost_difference
                                                    ) >= 0
                                                        ? "Belum Dialokasikan"
                                                        : "Over Allocated"}
                                                </p>
                                            </div>
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Product Cost Breakdown - IMPROVED */}
                            {productCostReports &&
                                productCostReports.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Breakdown Biaya per Produk (ABC
                                            Stage 2)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {productCostReports.map(
                                                (product) => (
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
                                                                        Total
                                                                        Biaya:
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
                                                                        Biaya
                                                                        per
                                                                        Unit:
                                                                    </span>
                                                                    <span className="text-sm font-medium">
                                                                        Rp{" "}
                                                                        {formatCurrencyWithDecimal(
                                                                            product.cost_per_unit,
                                                                            0
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {/* Tambahan: Department breakdown per produk */}
                                                                {product.department_breakdown &&
                                                                    Object.keys(
                                                                        product.department_breakdown
                                                                    ).length >
                                                                        0 && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                            <span className="text-xs text-gray-500 font-medium">
                                                                                Breakdown
                                                                                Departemen:
                                                                            </span>
                                                                            {Object.entries(
                                                                                product.department_breakdown
                                                                            ).map(
                                                                                ([
                                                                                    dept,
                                                                                    cost,
                                                                                ]) => (
                                                                                    <div
                                                                                        key={
                                                                                            dept
                                                                                        }
                                                                                        className="flex justify-between text-xs mt-1"
                                                                                    >
                                                                                        <span className="text-gray-500">
                                                                                            {
                                                                                                dept
                                                                                            }

                                                                                            :
                                                                                        </span>
                                                                                        <span className="text-gray-700">
                                                                                            Rp{" "}
                                                                                            {formatCurrency(
                                                                                                cost
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            )}
                                        </div>

                                        {/* Summary Verification Card - IMPROVED */}
                                        <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/20">
                                            <CardContent className="p-6">
                                                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5" />
                                                    Verifikasi Perhitungan ABC
                                                </h3>
                                                <div className="space-y-2">
                                                    {productCostReports.map(
                                                        (product) => (
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
                                                        <span>
                                                            Total Produk:
                                                        </span>
                                                        <span>
                                                            Rp{" "}
                                                            {formatCurrency(
                                                                totalProductCosts
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-blue-800 dark:text-blue-200">
                                                        <span>
                                                            Total Aktivitas:
                                                        </span>
                                                        <span>
                                                            Rp{" "}
                                                            {formatCurrency(
                                                                totalActivityCosts
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-purple-800 dark:text-purple-200">
                                                        <span>Selisih:</span>
                                                        <span>
                                                            Rp{" "}
                                                            {formatCurrency(
                                                                Math.abs(
                                                                    totalActivityCosts -
                                                                        totalProductCosts
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                            {/* Department breakdown - UPDATED */}
                            {departmentReports &&
                                departmentReports.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <h3 className="col-span-full text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Breakdown Biaya per Departemen (ABC
                                            Stage 1)
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
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Rata-rata per
                                                                Aktivitas:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                Rp{" "}
                                                                {formatCurrency(
                                                                    department.total_cost /
                                                                        department.activity_count
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </TabsContent>

                    {/* Department Tab - SAME AS BEFORE */}
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
                                                        Rata-rata per Aktivitas
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

                    {/* Activity Costs Tab - IMPROVED */}
                    <TabsContent value="activityCosts">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
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
                                                                <div className="flex items-center gap-2">
                                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                                    {
                                                                        report.activity_name
                                                                    }
                                                                </div>
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

                    {/* Product Costs Tab - IMPROVED */}
                    <TabsContent value="productCosts">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" />
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
                                    <div className="space-y-6">
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
                                                                    <div className="flex items-center gap-2">
                                                                        <Package className="w-4 h-4 text-purple-600" />
                                                                        {
                                                                            report.product_name
                                                                        }
                                                                    </div>
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
                                                                <TableCell className="text-right font-bold text-purple-600">
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

                                        {/* Detail breakdown per produk */}
                                        {productCostReports.some(
                                            (p) =>
                                                p.activity_breakdown &&
                                                p.activity_breakdown.length > 0
                                        ) && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    Detail Breakdown Aktivitas
                                                    per Produk
                                                </h3>
                                                {productCostReports
                                                    .filter(
                                                        (p) =>
                                                            p.activity_breakdown &&
                                                            p.activity_breakdown
                                                                .length > 0
                                                    )
                                                    .map((product) => (
                                                        <Card
                                                            key={`detail-${product.product_id}`}
                                                            className="border-0 shadow-sm"
                                                        >
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="text-lg">
                                                                    {
                                                                        product.product_name
                                                                    }
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="pt-0">
                                                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                                                    <Table>
                                                                        <TableHeader className="bg-gray-50">
                                                                            <TableRow>
                                                                                <TableHead className="text-sm">
                                                                                    Aktivitas
                                                                                </TableHead>
                                                                                <TableHead className="text-sm">
                                                                                    Departemen
                                                                                </TableHead>
                                                                                <TableHead className="text-sm">
                                                                                    Driver
                                                                                </TableHead>
                                                                                <TableHead className="text-right text-sm">
                                                                                    Kuantitas
                                                                                </TableHead>
                                                                                <TableHead className="text-right text-sm">
                                                                                    Biaya
                                                                                </TableHead>
                                                                                <TableHead className="text-sm">
                                                                                    Tanggal
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {product.activity_breakdown.map(
                                                                                (
                                                                                    activity,
                                                                                    index
                                                                                ) => (
                                                                                    <TableRow
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="text-sm"
                                                                                    >
                                                                                        <TableCell className="font-medium">
                                                                                            {
                                                                                                activity.activity_name
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                activity.department_name
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                activity.cost_driver_name
                                                                                            }
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right">
                                                                                            {formatCurrencyWithDecimal(
                                                                                                activity.quantity_consumed,
                                                                                                2
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell className="text-right font-medium">
                                                                                            Rp{" "}
                                                                                            {formatCurrency(
                                                                                                activity.allocated_cost
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            {
                                                                                                activity.usage_date
                                                                                            }
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                            </div>
                                        )}
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
