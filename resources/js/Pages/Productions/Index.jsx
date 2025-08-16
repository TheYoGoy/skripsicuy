import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Search,
    Plus,
    Edit3,
    Trash2,
    Coffee,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { usePage } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

export default function ProductionIndex() {
    const {
        auth,
        productions,
        products,
        success,
        error,
        filters = {},
    } = usePage().props;

    // Define hasProducts to check if products exist
    const hasProducts = products && products.length > 0;

    // Debug log untuk melihat struktur data
    useEffect(() => {
        console.log("=== DEBUG DATA STRUCTURE ===");
        console.log("Full productions object:", productions);
        console.log("Productions type:", typeof productions);
        console.log("Productions is array:", Array.isArray(productions));
        console.log("Productions.data:", productions?.data);
        console.log("Productions.data type:", typeof productions?.data);
        console.log(
            "Productions.data is array:",
            Array.isArray(productions?.data)
        );
        console.log("Products:", products);
        console.log("Filters:", filters);
        console.log("============================");
    }, [productions, products, filters]);

    // useForm for adding new production records
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: "",
        production_date: new Date().toISOString().split("T")[0],
        quantity: "",
        notes: "",
    });

    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(filters.perPage || 10);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productionToDelete, setProductionToDelete] = useState(null);

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
        production_date: "",
        quantity: "",
        notes: "",
    });

    const handleAddProduction = (e) => {
        e.preventDefault();
        post(route("productions.store"), {
            onSuccess: () => {
                reset({
                    product_id: "",
                    production_date: new Date().toISOString().split("T")[0],
                    quantity: "",
                    notes: "",
                });
            },
            onError: (formErrors) => {
                console.error("Failed to add production:", formErrors);
            },
        });
    };

    const confirmDelete = (production) => {
        setProductionToDelete(production);
        setIsDialogOpen(true);
    };

    const handleDeleteProduction = () => {
        if (productionToDelete) {
            router.delete(route("productions.destroy", productionToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setProductionToDelete(null);
                },
                onError: (formErrors) => {
                    console.error("Failed to delete production:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    const openEditDialog = (production) => {
        setEditData({
            id: production.id,
            product_id: production.product_id,
            production_date: production.production_date,
            quantity: production.quantity,
            notes: production.notes || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateProduction = (e) => {
        e.preventDefault();
        put(route("productions.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                editReset();
            },
            onError: (formErrors) => {
                console.error("Failed to update production:", formErrors);
            },
        });
    };

    // Export Functions
    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search.trim()) {
            params.append("search", search.trim());
        }

        const url =
            route("productions.export.excel") +
            (params.toString() ? "?" + params.toString() : "");
        window.open(url, "_blank");
    };

    const handleExportPdf = () => {
        const params = new URLSearchParams();
        if (search.trim()) {
            params.append("search", search.trim());
        }

        const url =
            route("productions.export.pdf") +
            (params.toString() ? "?" + params.toString() : "");
        window.open(url, "_blank");
    };

    // Search Function
    const handleSearch = () => {
        router.get(
            route("productions.index"),
            {
                search: search.trim(),
                perPage: perPage,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Clear Search Function
    const handleClearSearch = () => {
        setSearch("");
        router.get(
            route("productions.index"),
            {
                perPage: perPage,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Handle Per Page Change
    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        router.get(
            route("productions.index"),
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

    // Safely get production data - handle both array and paginated object
    const getProductionData = () => {
        // If productions is null or undefined
        if (!productions) {
            console.log("Productions is null/undefined");
            return [];
        }

        // If productions is directly an array (old format)
        if (Array.isArray(productions)) {
            console.log("Productions is direct array");
            return productions;
        }

        // If productions is paginated object with data property
        if (productions.data && Array.isArray(productions.data)) {
            console.log("Productions is paginated object with data array");
            return productions.data;
        }

        // If productions is an object but not paginated (fallback)
        console.log("Productions format unknown, returning empty array");
        return [];
    };

    const productionData = getProductionData();
    const isPaginated =
        productions &&
        typeof productions === "object" &&
        !Array.isArray(productions) &&
        productions.links;

    // Pagination Component
    const PaginationComponent = () => {
        if (
            !isPaginated ||
            !productions.links ||
            productions.links.length <= 3
        ) {
            return null;
        }

        return (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-cyan-600 border rounded-lg shadow-sm ">
                <div className="flex items-center text-sm ">
                    <span>
                        Menampilkan {productions.from || 1} sampai{" "}
                        {productions.to || productionData.length} dari{" "}
                        {productions.total || productionData.length} data
                    </span>
                </div>

                <div className="flex items-center space-x-1 ">
                    {productions.links.map((link, index) => {
                        // Handle Previous button
                        if (link.label === "&laquo; Previous") {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="p-2 rounded-md text-white hover:bg-gray-100"
                                    preserveState
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    disabled
                                    className="p-2 rounded-md text-white cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            );
                        }

                        // Handle Next button
                        if (link.label === "Next &raquo;") {
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="p-2 rounded-md text-white hover:bg-gray-100"
                                    preserveState
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    disabled
                                    className="p-2 rounded-md text-white cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
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
                                        ? "bg-white text-cyan-600 hover:font-bold"
                                        : "hover:text-cyan-600 hover:bg-gray-100 hover:font-bold"
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
                                        ? "bg-cyan-600 text-cyan-600"
                                        : "text-cyan-400 cursor-not-allowed"
                                }`}
                            >
                                {link.label}
                            </span>
                        );
                    })}
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm ">Per halaman:</span>
                    <Select
                        value={perPage.toString()}
                        onValueChange={(value) =>
                            handlePerPageChange(parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-20 text-cyan-600 bg-white">
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
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold  dark:text-gray-100">
                        Catatan Produksi
                    </h2>
                </div>
            }
        >
            <Head title="Pencatatan Produksi" />

            <div className="py-8">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Success/Error messages */}
                    {success && (
                        <Alert className="mb-6 border-green-200 bg-green-50">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-8">
                        {/* Add Production Record Form */}
                        <Card className="shadow-xl bg-cyan-600 border-0 overflow-hidden">
                            <CardHeader className="pb-6 bg-cyan-700 border-b border-cyan-500">
                                <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                    <div className="p-2 rounded-lg bg-white/20">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-white">
                                        Tambah Catatan Produksi
                                    </span>
                                </CardTitle>
                                <p className="text-cyan-100 text-sm mt-2 font-medium">
                                    Masukkan detail produksi untuk produk yang
                                    dipilih.
                                </p>
                            </CardHeader>

                            <CardContent className="pt-6 px-6 pb-6">
                                <form
                                    onSubmit={handleAddProduction}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Produk */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-white">
                                                Produk
                                            </Label>
                                            <Select
                                                value={
                                                    data.product_id?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    setData(
                                                        "product_id",
                                                        parseInt(value)
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 text-gray-800 shadow-lg rounded-lg py-3 px-4">
                                                    <SelectValue placeholder="Pilih Produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {!hasProducts ? (
                                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                            <p className="text-red-700 text-sm font-medium flex items-center">
                                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                                Tidak ada produk
                                                                tersedia.
                                                                Silakan
                                                                tambahkan produk
                                                                terlebih dahulu.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <SelectContent>
                                                            {products.map(
                                                                (product) => (
                                                                    <SelectItem
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={product.id.toString()}
                                                                    >
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.product_id && (
                                                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                    <p className="text-red-700 text-xs font-medium flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-2" />
                                                        {errors.product_id}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tanggal Produksi */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-white">
                                                Tanggal Produksi
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.production_date}
                                                onChange={(e) =>
                                                    setData(
                                                        "production_date",
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-white border-0 focus:ring-2 focus:ring-cyan-400 text-gray-800 shadow-lg rounded-lg py-3 px-4"
                                            />
                                            {errors.production_date && (
                                                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                    <p className="text-red-700 text-xs font-medium flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-2" />
                                                        {errors.production_date}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Jumlah Produksi */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-white">
                                                Jumlah Produksi
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Jumlah unit yang diproduksi"
                                                value={data.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-white border-0 focus:ring-2 focus:ring-purple-400 text-gray-800 shadow-lg rounded-lg py-3 px-4"
                                            />
                                            {errors.quantity && (
                                                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                    <p className="text-red-700 text-xs font-medium flex items-center">
                                                        <AlertCircle className="h-3 w-3 mr-2" />
                                                        {errors.quantity}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Catatan */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-white">
                                                Catatan (Opsional)
                                            </Label>
                                            <Input
                                                type="text"
                                                placeholder="Catatan tambahan"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-white border-0 focus:ring-2 focus:ring-indigo-400 text-gray-800 shadow-lg rounded-lg py-3 px-4"
                                            />
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

                                    <div className="flex justify-end pt-6 border-t border-cyan-500">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-white hover:bg-gray-50 text-cyan-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-600 border-t-transparent mr-3"></div>
                                                    <span className="font-semibold">
                                                        Menambahkan...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center group">
                                                    <div className="p-1 rounded-full bg-cyan-600 mr-3 group-hover:bg-cyan-700 transition-colors duration-300">
                                                        <Plus className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="font-semibold">
                                                        Tambah Produksi
                                                    </span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* List of Production Records */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Catatan Produksi
                                    </div>
                                    <div className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        Total:{" "}
                                        {isPaginated
                                            ? productions.total
                                            : productionData.length}{" "}
                                        data
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama produk, jumlah, atau catatan..."
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
                                            className="pr-12 w-full"
                                        />

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
                                            size="sm"
                                        >
                                            Export Excel
                                        </Button>

                                        <Button
                                            onClick={handleExportPdf}
                                            className="bg-red-600 text-white hover:bg-red-700"
                                            size="sm"
                                        >
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {!Array.isArray(productionData) ||
                                productionData.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            {search
                                                ? `Tidak ada hasil untuk "${search}"`
                                                : "Belum ada catatan produksi"}
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            {search
                                                ? "Coba kata kunci lain atau hapus filter pencarian."
                                                : "Tambahkan catatan produksi untuk memulai."}
                                        </p>
                                        {search && (
                                            <Button
                                                onClick={handleClearSearch}
                                                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white"
                                            >
                                                Hapus Filter
                                            </Button>
                                        )}
                                        {/* Debug info */}
                                        <div className="mt-4 text-xs text-gray-400">
                                            Debug: productionData type ={" "}
                                            {typeof productionData}, isArray ={" "}
                                            {Array.isArray(
                                                productionData
                                            ).toString()}
                                            , length ={" "}
                                            {productionData?.length ||
                                                "undefined"}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-center font-bold  w-16">
                                                            No.
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Produk
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Tanggal Produksi
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Jumlah Produksi
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Catatan
                                                        </TableHead>
                                                        <TableHead className="text-center font-bold  w-32">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {productionData.map(
                                                        (production, index) => (
                                                            <TableRow
                                                                key={
                                                                    production.id
                                                                }
                                                                className=" border-b transition-colors duration-200"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {isPaginated
                                                                            ? (productions.current_page -
                                                                                  1) *
                                                                                  productions.per_page +
                                                                              index +
                                                                              1
                                                                            : index +
                                                                              1}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold ">
                                                                    {production
                                                                        .product
                                                                        ?.name ||
                                                                        "N/A"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(
                                                                        production.production_date
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            weekday:
                                                                                "short",
                                                                            year: "numeric",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-gray-600">
                                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                                                        {Number(
                                                                            production.quantity
                                                                        ).toLocaleString()}{" "}
                                                                        unit
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className=" max-w-xs">
                                                                    {production.notes ? (
                                                                        <div
                                                                            className="truncate cursor-help"
                                                                            title={
                                                                                production.notes
                                                                            }
                                                                        >
                                                                            {
                                                                                production.notes
                                                                            }
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="flex justify-center space-x-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                openEditDialog(
                                                                                    production
                                                                                )
                                                                            }
                                                                            className="text-cyan-50 border-cyan-200 hover:bg-cyan-700 hover:border-cyan-300 transition-all duration-200 p-2 bg-cyan-600"
                                                                            title="Edit Produksi"
                                                                        >
                                                                            <Edit3 className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    production
                                                                                )
                                                                            }
                                                                            className="text-red-50 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
                                                                            title="Hapus Produksi"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Konfirmasi Hapus
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus catatan produksi
                            untuk produk{" "}
                            <span className="font-semibold ">
                                "{productionToDelete?.product?.name}"
                            </span>{" "}
                            pada tanggal{" "}
                            <span className="font-semibold ">
                                {productionToDelete?.production_date
                                    ? new Date(
                                          productionToDelete.production_date
                                      ).toLocaleDateString("id-ID")
                                    : ""}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduction}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Produksi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Production Record Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-cyan-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-cyan-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Edit Catatan Produksi
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi produksi Anda di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateProduction}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Produk */}
                            <div>
                                <Label>Produk</Label>
                                <Select
                                    value={
                                        editData.product_id?.toString() || ""
                                    }
                                    onValueChange={(value) =>
                                        setEditData(
                                            "product_id",
                                            parseInt(value)
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Pilih Produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!hasProducts ? (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-red-700 text-sm font-medium flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Tidak ada produk tersedia.
                                                    Silakan tambahkan produk
                                                    terlebih dahulu.
                                                </p>
                                            </div>
                                        ) : (
                                            <Select>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={product.id.toString()}
                                                        >
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </SelectContent>
                                </Select>
                                {editErrors.product_id && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {editErrors.product_id}
                                    </div>
                                )}
                            </div>

                            {/* Tanggal Produksi */}
                            <div>
                                <Label>Tanggal Produksi</Label>
                                <Input
                                    type="date"
                                    value={editData.production_date}
                                    onChange={(e) =>
                                        setEditData(
                                            "production_date",
                                            e.target.value
                                        )
                                    }
                                    className="mt-1"
                                />
                                {editErrors.production_date && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {editErrors.production_date}
                                    </div>
                                )}
                            </div>

                            {/* Jumlah Produksi */}
                            <div>
                                <Label>Jumlah Produksi</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Jumlah unit yang diproduksi"
                                    value={editData.quantity}
                                    onChange={(e) =>
                                        setEditData("quantity", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                {editErrors.quantity && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {editErrors.quantity}
                                    </div>
                                )}
                            </div>

                            {/* Catatan */}
                            <div>
                                <Label>Catatan (Opsional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Catatan tambahan"
                                    value={editData.notes}
                                    onChange={(e) =>
                                        setEditData("notes", e.target.value)
                                    }
                                    className="mt-1"
                                />
                                {editErrors.notes && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {editErrors.notes}
                                    </div>
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
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
