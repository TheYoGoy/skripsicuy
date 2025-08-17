import React, { useState, useEffect, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from "@/Components/ui/table";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Plus,
    Edit3,
    Trash2,
    Activity,
    AlertCircle,
    Calendar,
    Package,
    Target,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

export default function ProductActivityUsageIndex({
    auth,
    usages,
    products,
    activities,
    costDrivers,
    success,
    error,
    errors: formErrors,
}) {
    // useForm for adding new usage records
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: "",
        activity_id: "",
        cost_driver_id: "",
        quantity_consumed: "",
        allocated_amount: "",
        usage_date: new Date().toISOString().split("T")[0], // Default to current date
        notes: "",
    });

    // State untuk calculated amount
    const [calculatedAmount, setCalculatedAmount] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);
    const [costPerUnit, setCostPerUnit] = useState("");

    // State untuk recalculate
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [recalculateResult, setRecalculateResult] = useState(null);

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");
    const [perPage, setPerPage] = useState(filters?.perPage || 10);

    // State for delete confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [usageToDelete, setUsageToDelete] = useState(null);

    // State and useForm for editing usage records
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: editReset,
    } = useForm({
        id: null,
        product_id: "",
        activity_id: "",
        cost_driver_id: "",
        quantity_consumed: "",
        allocated_amount: "",
        usage_date: "",
        notes: "",
    });

    // Fungsi calculate dengan useCallback
    const calculateAllocation = useCallback(
        async (activityId, costDriverId, quantityConsumed, usageDate) => {
            if (
                !activityId ||
                !costDriverId ||
                !quantityConsumed ||
                !usageDate
            ) {
                setCalculatedAmount("");
                setCostPerUnit("");
                return;
            }

            console.log("=== PRODUCT CALCULATE DEBUG START ===");
            console.log("Input params:", {
                activityId,
                costDriverId,
                quantityConsumed,
                usageDate,
            });

            setIsCalculating(true);
            setCalculatedAmount("Menghitung...");

            try {
                const requestData = {
                    activity_id: activityId,
                    cost_driver_id: costDriverId,
                    quantity_consumed: quantityConsumed,
                    usage_date: usageDate,
                };

                console.log("Request data:", requestData);

                const response = await axios.post(
                    route("product-activity-usages.calculate"),
                    requestData
                );

                console.log("Success response:", response.data);
                const amount = response.data.allocated_amount;
                const perUnit = response.data.cost_per_unit;

                setCalculatedAmount(amount);
                setCostPerUnit(perUnit);

                setData((prev) => ({
                    ...prev,
                    allocated_amount: amount,
                }));
            } catch (error) {
                console.error("=== ERROR DETAILS ===");
                console.error("Error object:", error);
                console.error("Error response:", error.response);

                let errorMsg = "Gagal menghitung";
                if (error.response?.data?.error === "NO_ACTIVITY_COST") {
                    errorMsg = "Belum ada alokasi biaya aktivitas";
                } else if (
                    error.response?.data?.error === "NO_CONSUMPTION_DATA"
                ) {
                    errorMsg = "Belum ada data konsumsi";
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                }

                console.log("Final error message:", errorMsg);
                setCalculatedAmount(errorMsg);
                setCostPerUnit("");

                setData((prev) => ({
                    ...prev,
                    allocated_amount: "",
                }));
            } finally {
                setIsCalculating(false);
                console.log("=== PRODUCT CALCULATE DEBUG END ===");
            }
        },
        [setData]
    );

    // useEffect untuk menghitung alokasi
    useEffect(() => {
        calculateAllocation(
            data.activity_id,
            data.cost_driver_id,
            data.quantity_consumed,
            data.usage_date
        );
    }, [
        data.activity_id,
        data.cost_driver_id,
        data.quantity_consumed,
        data.usage_date,
        calculateAllocation,
    ]);

    // Function untuk recalculate all
    const handleRecalculateAll = async () => {
        if (
            !confirm(
                "Apakah Anda yakin ingin menghitung ulang semua data yang belum dihitung? Proses ini mungkin memakan waktu."
            )
        ) {
            return;
        }

        setIsRecalculating(true);
        setRecalculateResult(null);

        try {
            const response = await axios.post(
                route("product-activity-usages.recalculate.all")
            );

            if (response.data.success) {
                setRecalculateResult({
                    type: "success",
                    message: response.data.message,
                    details: response.data.details,
                });
                // Reload data
                router.reload({ only: ["usages"] });
            } else {
                setRecalculateResult({
                    type: "error",
                    message: response.data.message,
                });
            }
        } catch (error) {
            console.error("Recalculate failed:", error);
            setRecalculateResult({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Gagal menghitung ulang data",
            });
        } finally {
            setIsRecalculating(false);
        }
    };

    // Function untuk recalculate single
    const handleRecalculateSingle = async (usageId) => {
        try {
            const response = await axios.post(
                route("product-activity-usages.recalculate.single", usageId)
            );

            if (response.data.success) {
                alert(
                    `Berhasil menghitung ulang! Biaya baru: Rp ${new Intl.NumberFormat(
                        "id-ID"
                    ).format(response.data.data.new_amount)}`
                );
                router.reload({ only: ["usages"] });
            } else {
                alert(`Gagal menghitung ulang: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Single recalculate failed:", error);
            alert("Gagal menghitung ulang data");
        }
    };

    // Function untuk check prerequisites
    const handleCheckPrerequisites = async () => {
        try {
            const response = await axios.get(
                route("product-activity-usages.check.prerequisites")
            );
            console.log("Prerequisites check:", response.data);

            const { activities_without_cost, problematic_usages, summary } =
                response.data;

            let message = `Hasil pemeriksaan:\n`;
            message += `- Aktivitas tanpa alokasi biaya: ${summary.activities_missing_cost}\n`;
            message += `- Data yang perlu dihitung ulang: ${summary.usages_need_recalculation}\n\n`;

            if (activities_without_cost.length > 0) {
                message += `Aktivitas tanpa biaya:\n`;
                activities_without_cost.forEach((activity) => {
                    message += `- ${activity.name}\n`;
                });
            }

            alert(message);
        } catch (error) {
            console.error("Check prerequisites failed:", error);
            alert("Gagal memeriksa data");
        }
    };

    // Function to handle adding a new usage record
    const handleAddUsage = (e) => {
        e.preventDefault();

        if (
            !calculatedAmount ||
            calculatedAmount === "Menghitung..." ||
            isNaN(calculatedAmount)
        ) {
            alert(
                "Jumlah dialokasikan belum terhitung. Pastikan semua field terisi dengan benar."
            );
            return;
        }

        console.log("Data yang akan disubmit:", data);

        post(route("product-activity-usages.store"), {
            onSuccess: () => {
                reset({
                    product_id: "",
                    activity_id: "",
                    cost_driver_id: "",
                    quantity_consumed: "",
                    allocated_amount: "",
                    usage_date: new Date().toISOString().split("T")[0],
                    notes: "",
                });
                setCalculatedAmount("");
                setCostPerUnit("");
                router.reload({ only: ["usages"] });
            },
            onError: (formErrors) => {
                console.error("Failed to add usage:", formErrors);
            },
        });
    };

    // Function to show delete confirmation dialog
    const confirmDelete = (usage) => {
        setUsageToDelete(usage);
        setIsDeleteDialogOpen(true);
    };

    // Function to delete a usage record
    const handleDeleteUsage = () => {
        if (usageToDelete) {
            router.delete(
                route("product-activity-usages.destroy", usageToDelete.id),
                {
                    onSuccess: () => {
                        setIsDeleteDialogOpen(false); // Close dialog
                        setUsageToDelete(null); // Reset usage to delete
                    },
                    onError: (formErrors) => {
                        console.error("Failed to delete usage:", formErrors);
                        setIsDeleteDialogOpen(false);
                    },
                }
            );
        }
    };

    // Function to open edit dialog and populate data
    const openEditDialog = (usage) => {
        setEditData({
            id: usage.id,
            product_id: usage.product_id,
            activity_id: usage.activity_id,
            cost_driver_id: usage.cost_driver_id,
            quantity_consumed: usage.quantity_consumed,
            allocated_amount: usage.allocated_amount,
            usage_date: usage.usage_date,
            notes: usage.notes,
        });
        setIsEditDialogOpen(true);
    };

    // Function to handle updating a usage record
    const handleUpdateUsage = (e) => {
        e.preventDefault();
        put(route("product-activity-usages.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false); // Close dialog
                editReset(); // Clear edit form
            },
            onError: (formErrors) => {
                console.error("Failed to update usage:", formErrors);
            },
        });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search.trim()) {
            params.append("search", search.trim());
        }

        const url =
            route("product-activity-usages.export.excel") +
            (params.toString() ? "?" + params.toString() : "");
        window.open(url, "_blank");
    };

    // Function for PDF export
    const handleExportPdf = () => {
        const params = new URLSearchParams();
        if (search.trim()) {
            params.append("search", search.trim());
        }

        const url =
            route("product-activity-usages.export.pdf") +
            (params.toString() ? "?" + params.toString() : "");
        window.open(url, "_blank");
    };

    const groupedUsages = usages.data.reduce((groups, usage) => {
        const productName = usage.product.name;
        if (!groups[productName]) {
            groups[productName] = [];
        }
        groups[productName].push(usage);
        return groups;
    }, {});

    const handleSearch = () => {
        console.log("Searching for:", search);
        router.get(
            route("product-activity-usages.index"),
            {
                search: search.trim(),
                perPage: perPage,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    console.log("Search completed successfully");
                },
                onError: (errors) => {
                    console.error("Search failed:", errors);
                },
            }
        );
    };

    const handleClearSearch = () => {
        setSearch("");
        router.get(
            route("product-activity-usages.index"),
            {
                perPage: perPage,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        router.get(
            route("product-activity-usages.index"),
            {
                search: search,
                perPage: newPerPage,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Pagination component
    const PaginationComponent = () => {
        if (!usages.links || usages.links.length <= 3) return null;

        return (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-indigo-600 border rounded-lg shadow-sm">
                <div className="flex text-white items-center text-sm ">
                    <span>
                        Menampilkan {usages.from} sampai {usages.to} dari{" "}
                        {usages.total} data
                    </span>
                </div>

                <div className="flex items-center space-x-1 text-white">
                    {usages.links.map((link, index) => {
                        // Handle Previous button
                        if (link.label === "&laquo; Previous") {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="p-2 rounded-md"
                                    preserveState
                                >
                                    <ChevronLeft className="text-white h-4 w-4" />
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    disabled
                                    className="p-2 rounded-md cursor-not-allowed"
                                >
                                    <ChevronLeft className="text-whiteh-4 w-4" />
                                </button>
                            );
                        }

                        // Handle Next button
                        if (link.label === "Next &raquo;") {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="p-2 rounded-md"
                                    preserveState
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    disabled
                                    className="p-2 text-white rounded-md cursor-not-allowed"
                                >
                                    <ChevronRight className=" text-white h-4 w-4" />
                                </button>
                            );
                        }

                        // Handle page numbers
                        return link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`px-3 py-2 text-sm rounded-md ${
                                    link.active
                                        ? "bg-white text-purple-700 font-bold"
                                        : "hover:text-purple-600 hover:bg-white font-bold"
                                }`}
                                preserveState
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className={`px-3 py-2 text-sm rounded-md ${
                                    link.active
                                        ? "bg-white-600 text-white-600"
                                        : "cursor-not-allowed"
                                }`}
                            >
                                {link.label}
                            </span>
                        );
                    })}
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-white">Per halaman:</span>
                    <Select
                        value={perPage.toString()}
                        onValueChange={(value) =>
                            handlePerPageChange(parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-20 bg-white text-purple-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <span className="font-semibold text-xl  leading-tight">
                    Penggunaan Aktivitas
                </span>
            }
        >
            <Head title="Penggunaan Aktivitas per Produk" />

            <div className="py-8">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alert untuk Error */}
                    {errors.unique_usage && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {errors.unique_usage}
                            </AlertDescription>
                        </Alert>
                    )}
                    {formErrors.unique_usage && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {formErrors.unique_usage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Alert untuk Success */}
                    {success && (
                        <Alert className="mb-6 border-green-200 bg-green-50">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Alert untuk hasil recalculate */}
                    {recalculateResult && (
                        <Alert
                            className={`mb-4 ${
                                recalculateResult.type === "success"
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                            }`}
                        >
                            {recalculateResult.type === "success" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <AlertDescription
                                className={
                                    recalculateResult.type === "success"
                                        ? "text-green-800"
                                        : "text-red-800"
                                }
                            >
                                {recalculateResult.message}
                                {recalculateResult.details && (
                                    <div className="mt-2 text-sm">
                                        <div>
                                            Total diproses:{" "}
                                            {
                                                recalculateResult.details
                                                    .total_processed
                                            }
                                        </div>
                                        <div>
                                            Berhasil:{" "}
                                            {
                                                recalculateResult.details
                                                    .success_count
                                            }
                                        </div>
                                        <div>
                                            Error:{" "}
                                            {
                                                recalculateResult.details
                                                    .error_count
                                            }
                                        </div>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-8">
                        {/* Add Usage Record Form */}
                        <Card className="shadow-xl bg-indigo-600 border-0 overflow-hidden">
                            <div className="relative">
                                {/* Header Card dengan background ungu tua dan border bawah */}
                                <CardHeader className="pb-6 bg-indigo-700 border-b border-indigo-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        {/* Icon Plus dengan latar belakang transparan putih */}
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        {/* Judul dengan teks putih */}
                                        <span className="text-white">
                                            Tambah Penggunaan Aktivitas per
                                            Produk
                                        </span>
                                    </CardTitle>
                                    {/* Deskripsi di bawah judul */}
                                    <p className="text-indigo-100 text-sm mt-2 font-medium">
                                        Masukkan informasi penggunaan aktivitas
                                        yang akan dicatat dalam sistem.
                                    </p>
                                </CardHeader>

                                {/* Konten Card dengan padding yang diperbarui */}
                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddUsage}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Select Produk */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="productId"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Produk
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        value={
                                                            data.product_id
                                                                ? data.product_id.toString()
                                                                : ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setData(
                                                                "product_id",
                                                                value
                                                                    ? parseInt(
                                                                          value
                                                                      )
                                                                    : ""
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-orange-400 transition-all duration-300  shadow-lg rounded-lg py-3 px-4">
                                                            <SelectValue placeholder="Pilih Produk" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map(
                                                                (product) => (
                                                                    <SelectItem
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={product.id.toString()}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </div>
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.product_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.product_id}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Select Aktivitas */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="activityId"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Aktivitas
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        value={
                                                            data.activity_id
                                                                ? data.activity_id.toString()
                                                                : ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setData(
                                                                "activity_id",
                                                                value
                                                                    ? parseInt(
                                                                          value
                                                                      )
                                                                    : ""
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-indigo-400 transition-all duration-300  shadow-lg rounded-lg py-3 px-4">
                                                            <SelectValue placeholder="Pilih Aktivitas" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {activities.map(
                                                                (activity) => (
                                                                    <SelectItem
                                                                        key={
                                                                            activity.id
                                                                        }
                                                                        value={activity.id.toString()}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                activity.name
                                                                            }
                                                                        </div>
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.activity_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.activity_id}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Select Driver Biaya */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="costDriverId"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Driver Biaya
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        value={
                                                            data.cost_driver_id
                                                                ? data.cost_driver_id.toString()
                                                                : ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setData(
                                                                "cost_driver_id",
                                                                value
                                                                    ? parseInt(
                                                                          value
                                                                      )
                                                                    : ""
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300  shadow-lg rounded-lg py-3 px-4">
                                                            <SelectValue placeholder="Pilih Driver Biaya" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {costDrivers.map(
                                                                (driver) => (
                                                                    <SelectItem
                                                                        key={
                                                                            driver.id
                                                                        }
                                                                        value={driver.id.toString()}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                driver.name
                                                                            }{" "}
                                                                            (
                                                                            {
                                                                                driver.unit
                                                                            }
                                                                            )
                                                                        </div>
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.cost_driver_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.cost_driver_id
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Tanggal Penggunaan */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="usageDate"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Tanggal Penggunaan
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="usageDate"
                                                        type="date"
                                                        value={data.usage_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                "usage_date",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-pink-400 transition-all duration-300  shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.usage_date && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.usage_date}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Jumlah Dikonsumsi */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="quantityConsumed"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Jumlah Driver Biaya
                                                    Dikonsumsi
                                                    <span className="text-xs font-normal italic text-white/70">
                                                        (dalam 1 bulan)
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="quantityConsumed"
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="Misal: 10.5"
                                                        value={
                                                            data.quantity_consumed
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "quantity_consumed",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300  placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.quantity_consumed && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.quantity_consumed
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Biaya Dialokasikan - CALCULATED */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="allocatedAmount"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Biaya Dialokasikan
                                                    {costPerUnit && (
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                                            @Rp{" "}
                                                            {new Intl.NumberFormat(
                                                                "id-ID"
                                                            ).format(
                                                                costPerUnit
                                                            )}
                                                        </span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="allocatedAmount"
                                                        type="text"
                                                        placeholder="Otomatis dihitung berdasarkan ABC"
                                                        value={calculatedAmount}
                                                        readOnly
                                                        className={`border-0 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4 ${
                                                            isCalculating
                                                                ? "bg-yellow-50 text-yellow-800"
                                                                : calculatedAmount &&
                                                                  !isNaN(
                                                                      calculatedAmount
                                                                  )
                                                                ? "bg-green-50 text-green-800 font-semibold"
                                                                : calculatedAmount &&
                                                                  isNaN(
                                                                      calculatedAmount
                                                                  )
                                                                ? "bg-red-50 text-red-800"
                                                                : "bg-gray-100 text-gray-600"
                                                        }`}
                                                    />
                                                </div>
                                                {errors.allocated_amount && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.allocated_amount
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Catatan */}
                                            <div className="space-y-3 md:col-span-2 lg:col-span-1">
                                                <Label
                                                    htmlFor="notes"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Catatan (Opsional)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="notes"
                                                        type="text"
                                                        placeholder="Catatan tambahan"
                                                        value={data.notes}
                                                        onChange={(e) =>
                                                            setData(
                                                                "notes",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-indigo-400 transition-all duration-300  placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.notes && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tombol Submit */}
                                        <div className="flex justify-end pt-6 border-t border-indigo-500">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    !calculatedAmount ||
                                                    isNaN(calculatedAmount)
                                                }
                                                className="bg-white hover:bg-gray-50 text-indigo-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menambahkan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-indigo-600 mr-3 group-hover:bg-indigo-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Penggunaan
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>
                        </Card>

                        {/* List of Usage Records */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold ">
                                        Daftar Penggunaan Aktivitas per Produk
                                    </div>
                                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        Total: {usages.total} data
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama produk..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }}
                                            className="pr-20 w-full"
                                        />

                                        {/* Search Button */}
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="absolute inset-y-0 right-0 flex items-center justify-center px-3 bg-blue-600 hover:bg-blue-700 rounded-r-md text-white"
                                            title="Cari"
                                        >
                                            <Search className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Clear Search Button */}
                                    {search && (
                                        <Button
                                            onClick={handleClearSearch}
                                            variant="outline"
                                            className="text-gray-600"
                                        >
                                            Clear
                                        </Button>
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

                                    {/* Recalculate Buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCheckPrerequisites}
                                            variant="outline"
                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Check Data
                                        </Button>

                                        <Button
                                            onClick={handleRecalculateAll}
                                            disabled={isRecalculating}
                                            className="bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            {isRecalculating ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                    Menghitung...
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <RefreshCw className="h-4 w-4 mr-1" />
                                                    Hitung Ulang Semua
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {usages.data.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Activity className="h-20 w-20 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada catatan penggunaan
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan catatan penggunaan
                                            aktivitas per produk untuk melacak
                                            konsumsi.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Card>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-16 text-center font-bold ">
                                                                No.
                                                            </TableHead>
                                                            <TableHead className="font-bold ">
                                                                Produk
                                                            </TableHead>
                                                            <TableHead className="font-bold ">
                                                                Aktivitas
                                                            </TableHead>
                                                            <TableHead className="font-bold ">
                                                                Driver Biaya
                                                            </TableHead>
                                                            <TableHead className="text-right font-bold ">
                                                                Jumlah
                                                                Dikonsumsi
                                                            </TableHead>
                                                            <TableHead className="text-right font-bold ">
                                                                Biaya
                                                                Dialokasikan
                                                            </TableHead>
                                                            <TableHead className="font-bold ">
                                                                Tanggal
                                                            </TableHead>
                                                            <TableHead className="w-40 text-center font-bold ">
                                                                Aksi
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Object.entries(
                                                            groupedUsages
                                                        ).map(
                                                            (
                                                                [
                                                                    productName,
                                                                    group,
                                                                ],
                                                                productIndex
                                                            ) => (
                                                                <React.Fragment
                                                                    key={
                                                                        productName
                                                                    }
                                                                >
                                                                    {/* Baris Judul Kelompok */}
                                                                    <TableRow className="bg-indigo-600 hover:bg-indigo-700">
                                                                        <TableCell
                                                                            colSpan={
                                                                                8
                                                                            }
                                                                            className="font-bold text-indigo-50 text-lg"
                                                                        >
                                                                            {
                                                                                productName
                                                                            }
                                                                        </TableCell>
                                                                    </TableRow>

                                                                    {/* Baris Data dalam Kelompok */}
                                                                    {group.map(
                                                                        (
                                                                            usage,
                                                                            index
                                                                        ) => (
                                                                            <TableRow
                                                                                key={
                                                                                    usage.id
                                                                                }
                                                                                className="transition-colors duration-200 border-b"
                                                                            >
                                                                                <TableCell className="text-center">
                                                                                    <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                                        {index +
                                                                                            1}
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="font-semibold">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span>
                                                                                            {
                                                                                                usage
                                                                                                    .product
                                                                                                    .name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span>
                                                                                            {
                                                                                                usage
                                                                                                    .activity
                                                                                                    .name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span>
                                                                                            {
                                                                                                usage
                                                                                                    .cost_driver
                                                                                                    .name
                                                                                            }{" "}
                                                                                            (
                                                                                            {
                                                                                                usage
                                                                                                    .cost_driver
                                                                                                    .unit
                                                                                            }

                                                                                            )
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="text-right font-semibold">
                                                                                    <div className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-sm inline-block">
                                                                                        {Number(
                                                                                            usage.quantity_consumed
                                                                                        ).toLocaleString(
                                                                                            "id-ID",
                                                                                            {
                                                                                                maximumFractionDigits: 4,
                                                                                            }
                                                                                        )}{" "}
                                                                                        {usage
                                                                                            .cost_driver
                                                                                            ?.unit ||
                                                                                            ""}{" "}
                                                                                        <span className="text-xs italic">
                                                                                            (per
                                                                                            bulan)
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="text-right font-semibold">
                                                                                    {usage.allocated_amount &&
                                                                                    usage.allocated_amount >
                                                                                        0 ? (
                                                                                        <div className="bg-green-50 text-green-800 px-2 py-1 rounded text-sm inline-block">
                                                                                            Rp{" "}
                                                                                            {new Intl.NumberFormat(
                                                                                                "id-ID"
                                                                                            ).format(
                                                                                                usage.allocated_amount
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-red-400 italic text-sm font-semibold bg-red-50 px-2 py-1 rounded">
                                                                                            Belum
                                                                                            dihitung
                                                                                        </span>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span>
                                                                                            {new Date(
                                                                                                usage.usage_date
                                                                                            ).toLocaleDateString(
                                                                                                "id-ID"
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="text-center">
                                                                                    <div className="flex justify-center space-x-1">
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                                openEditDialog(
                                                                                                    usage
                                                                                                )
                                                                                            }
                                                                                            className="text-indigo-50 border-indigo-200 hover:bg-indigo-600 hover:border-indigo-300 transition-all duration-200 p-2 bg-indigo-600"
                                                                                            title="Edit Penggunaan"
                                                                                        >
                                                                                            <Edit3 className="h-4 w-4 text-indigo-50" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                                handleRecalculateSingle(
                                                                                                    usage.id
                                                                                                )
                                                                                            }
                                                                                            className="text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-200 p-2"
                                                                                            title="Hitung Ulang"
                                                                                        >
                                                                                            <RefreshCw className="h-4 w-4" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                                confirmDelete(
                                                                                                    usage
                                                                                                )
                                                                                            }
                                                                                            className="text-red-50 border-red-200 hover:bg-red-600 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
                                                                                            title="Hapus Penggunaan"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4 text-red-50" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    )}
                                                                </React.Fragment>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>

                                        {/* Pagination */}
                                        <PaginationComponent />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Konfirmasi Hapus Penggunaan
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus catatan penggunaan
                            aktivitas "{usageToDelete?.activity.name}" oleh
                            produk "{usageToDelete?.product.name}" pada tanggal{" "}
                            {usageToDelete &&
                                new Date(
                                    usageToDelete?.usage_date
                                ).toLocaleDateString("id-ID")}
                            ? Tindakan ini tidak dapat dibatalkan dan semua data
                            terkait akan hilang permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUsage}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Penggunaan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Usage Record Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-indigo-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Edit Penggunaan Aktivitas per Produk
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi penggunaan aktivitas per produk
                            di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateUsage}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Edit Select Produk */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editProductId"
                                    className="text-sm font-semibold  flex items-center gap-2"
                                >
                                    Produk
                                </Label>
                                <Select
                                    value={
                                        editData.product_id
                                            ? editData.product_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) =>
                                        setEditData(
                                            "product_id",
                                            value ? parseInt(value) : ""
                                        )
                                    }
                                >
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-orange-500">
                                        <SelectValue placeholder="Pilih Produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id.toString()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {product.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.product_id && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.product_id}
                                    </p>
                                )}
                            </div>

                            {/* Edit Select Aktivitas */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editActivityId"
                                    className="text-sm font-semibold  flex items-center gap-2"
                                >
                                    Aktivitas
                                </Label>
                                <Select
                                    value={
                                        editData.activity_id
                                            ? editData.activity_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) =>
                                        setEditData(
                                            "activity_id",
                                            value ? parseInt(value) : ""
                                        )
                                    }
                                >
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500">
                                        <SelectValue placeholder="Pilih Aktivitas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activities.map((activity) => (
                                            <SelectItem
                                                key={activity.id}
                                                value={activity.id.toString()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {activity.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.activity_id && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.activity_id}
                                    </p>
                                )}
                            </div>

                            {/* Edit Select Driver Biaya */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editCostDriverId"
                                    className="text-sm font-semibold  flex items-center gap-2"
                                >
                                    Driver Biaya
                                </Label>
                                <Select
                                    value={
                                        editData.cost_driver_id
                                            ? editData.cost_driver_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) =>
                                        setEditData(
                                            "cost_driver_id",
                                            value ? parseInt(value) : ""
                                        )
                                    }
                                >
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-green-500">
                                        <SelectValue placeholder="Pilih Driver Biaya" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {costDrivers.map((driver) => (
                                            <SelectItem
                                                key={driver.id}
                                                value={driver.id.toString()}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {driver.name} ({driver.unit}
                                                    )
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.cost_driver_id && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.cost_driver_id}
                                    </p>
                                )}
                            </div>

                            {/* Edit Input Tanggal */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editUsageDate"
                                    className="text-sm font-semibold  flex items-center gap-2"
                                >
                                    Tanggal Penggunaan
                                </Label>
                                <Input
                                    id="editUsageDate"
                                    type="date"
                                    value={editData.usage_date}
                                    onChange={(e) =>
                                        setEditData(
                                            "usage_date",
                                            e.target.value
                                        )
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-pink-500"
                                />
                                {editErrors.usage_date && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.usage_date}
                                    </p>
                                )}
                            </div>

                            {/* Edit Input Jumlah Dikonsumsi */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editQuantityConsumed"
                                    className="text-sm font-semibold "
                                >
                                    Jumlah Driver Biaya Dikonsumsi
                                </Label>
                                <Input
                                    id="editQuantityConsumed"
                                    type="number"
                                    step="0.0001"
                                    value={editData.quantity_consumed}
                                    onChange={(e) =>
                                        setEditData(
                                            "quantity_consumed",
                                            e.target.value
                                        )
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
                                />
                                {editErrors.quantity_consumed && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.quantity_consumed}
                                    </p>
                                )}
                            </div>

                            {/* Edit Input Biaya Dialokasikan */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="editAllocatedAmount"
                                    className="text-sm font-semibold "
                                >
                                    Biaya Dialokasikan
                                </Label>
                                <Input
                                    id="editAllocatedAmount"
                                    type="number"
                                    step="0.01"
                                    value={editData.allocated_amount}
                                    onChange={(e) =>
                                        setEditData(
                                            "allocated_amount",
                                            e.target.value
                                        )
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                />
                                {editErrors.allocated_amount && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.allocated_amount}
                                    </p>
                                )}
                            </div>

                            {/* Edit Input Catatan */}
                            <div className="space-y-2 md:col-span-2">
                                <Label
                                    htmlFor="editNotes"
                                    className="text-sm font-semibold "
                                >
                                    Catatan (Opsional)
                                </Label>
                                <Input
                                    id="editNotes"
                                    type="text"
                                    value={editData.notes}
                                    onChange={(e) =>
                                        setEditData("notes", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                                />
                                {editErrors.notes && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editProcessing}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            >
                                {editProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Edit3 className="h-4 w-4 mr-1" />
                                        Simpan Perubahan
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
