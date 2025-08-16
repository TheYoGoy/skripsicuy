import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
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
import { usePage } from "@inertiajs/react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search as SearchIcon } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Coffee, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ActivityCostDriverUsageIndex({
    auth,
    usages,
    products,
    activities,
    costDrivers,
    success,
    error,
}) {
    // useForm for adding new usage records

    const { data, setData, post, processing, errors, reset } = useForm({
        activity_id: "",
        cost_driver_id: "",
        usage_quantity: "",
        usage_date: new Date().toISOString().split("T")[0], // Default to current date
        notes: "",
    });
    const [selectedCostDriverId, setSelectedCostDriverId] = useState(null);
    const [selectedCostDriver, setSelectedCostDriver] = useState(null);

    const { filters = {} } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(10);

    // State for delete confirmation dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [usageToDelete, setUsageToDelete] = useState(null);

    // State and useForm for editing usage records
    const [isEdit3DialogOpen, setIsEdit3DialogOpen] = useState(false);
    const {
        data: editData,
        setData: setEdit3Data,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: editReset,
    } = useForm({
        id: null,
        activity_id: "",
        cost_driver_id: "",
        usage_quantity: "",
        usage_date: "",
        notes: "",
    });

    const currentUsages = usages.data || [];

    // Function to handle adding a new usage record
    const handleAddUsage = (e) => {
    e.preventDefault();
    post(route("activity-cost-driver-usages.store"), {
        onSuccess: () => {
            // Reset form ke state awal
            reset({
                activity_id: "",
                cost_driver_id: "",
                usage_quantity: "",
                usage_date: new Date().toISOString().split("T")[0],
                notes: "",  // ✅ Ini sudah benar
            });
            
            // Reset state tambahan
            setSelectedCostDriver(null);
            
            // Scroll ke atas untuk melihat data baru
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log("Data berhasil ditambahkan dan form direset!");
        },
        onError: (formErrors) => {
            console.error("Failed to add usage:", formErrors);
        },
    });
};

    // Function to show delete confirmation dialog
    const confirmDelete = (usage) => {
        setUsageToDelete(usage);
        setIsDialogOpen(true);
    };

    // Function to delete a usage record
    const handleDeleteUsage = () => {
        if (usageToDelete) {
            router.delete(
                route("activity-cost-driver-usages.destroy", usageToDelete.id),
                {
                    onSuccess: () => {
                        setIsDialogOpen(false); // Close dialog
                        setUsageToDelete(null); // Reset usage to delete
                    },
                    onError: (formErrors) => {
                        console.error("Failed to delete usage:", formErrors);
                        setIsDialogOpen(false);
                    },
                }
            );
        }
    };

    // Function to open edit dialog and populate data
    const openEdit3Dialog = (usage) => {
        setEdit3Data({
            id: usage.id,
            activity_id: usage.activity_id,
            cost_driver_id: usage.cost_driver_id,
            usage_quantity: usage.usage_quantity,
            usage_date: usage.usage_date,
            notes: usage.notes,
        });
        setIsEdit3DialogOpen(true);
    };

    // Function to handle updating a usage record
    const handleUpdateUsage = (e) => {
        e.preventDefault();
        put(route("activity-cost-driver-usages.update", editData.id), {
            onSuccess: () => {
                setIsEdit3DialogOpen(false); // Close dialog
                editReset(); // Clear edit form
            },
            onError: (formErrors) => {
                console.error("Failed to update usage:", formErrors);
            },
        });
    };

    const handleExportExcel = () => {
        window.open(
            route("activity-cost-driver-usages.export.excel"),
            "_blank"
        );
    };

    const handleExportPdf = () => {
        window.open(route("activity-cost-driver-usages.export.pdf"), "_blank");
    };

    const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleSearchSubmit();
    }
};

const handleSearchSubmit = () => {
    router.get(
        route("activity-cost-driver-usages.index"), // Ganti dengan route yang benar
        { search, perPage },
        {
            preserveState: true,
            replace: true,
        }
    );
};

    return (
        <AuthenticatedLayout user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Catatan Penggunaan
                    </h2>
                </div>
            }>
            <Head title="Penggunaan Sumber Daya" />

            <div className="py-8">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alert untuk Error */}
                    {errors.unique_allocation && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {errors.unique_allocation}
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
                    <div className="space-y-8">
                        {/* Add Usage Record Form */}
                        <Card className="shadow-xl bg-emerald-600 border-0 overflow-hidden">
                            <div className="relative">
                                <CardHeader className="pb-6 bg-emerald-700 border-b border-emerald-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-white">
                                            Tambah Catatan Penggunaan
                                        </span>
                                    </CardTitle>
                                    <p className="text-emerald-100 text-sm mt-2 font-medium">
                                        Masukkan detail aktivitas, cost driver,
                                        dan jumlah penggunaannya.
                                    </p>
                                </CardHeader>

                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddUsage}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white">
                                                    Aktivitas
                                                </Label>
                                                <Select
                                                    value={data.activity_id?.toString()}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            "activity_id",
                                                            parseInt(value)
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 text-gray-800 shadow-lg rounded-lg py-3 px-4">
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
                                                                    {
                                                                        activity.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.activity_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.activity_id}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white">
                                                    Cost Driver
                                                </Label>
                                                <Select
                                                    value={data.cost_driver_id?.toString()}
                                                    onValueChange={(value) => {
                                                        const selected =
                                                            costDrivers.find(
                                                                (cd) =>
                                                                    cd.id ===
                                                                    parseInt(
                                                                        value
                                                                    )
                                                            );
                                                        setSelectedCostDriver(
                                                            selected
                                                        ); // simpan object-nya
                                                        setData(
                                                            "cost_driver_id",
                                                            parseInt(value)
                                                        ); // simpan ID-nya ke form
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 text-gray-800 shadow-lg rounded-lg py-3 px-4">
                                                        <SelectValue placeholder="Pilih Cost Driver" />
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
                                                                    {
                                                                        driver.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                {/* ✅ TAMBAHKAN BAGIAN INI UNTUK MENAMPILKAN SATUAN */}
                                                {selectedCostDriver && (
                                                    <p className="text-sm text-white italic">
                                                        Satuan:{" "}
                                                        {
                                                            selectedCostDriver.unit
                                                        }{" "}
                                                        / bulan
                                                    </p>
                                                )}

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

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white">
                                                    Jumlah Penggunaan{" "}
                                                    <span className="text-xs font-normal text-gray-300">
                                                        (per bulan)
                                                    </span>
                                                </Label>

                                                <Input
                                                    type="number"
                                                    value={data.usage_quantity}
                                                    onChange={(e) =>
                                                        setData(
                                                            "usage_quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Masukkan jumlah penggunaan"
                                                    className="bg-white border-0 focus:ring-2 focus:ring-green-400 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                />

                                                {errors.usage_quantity && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.usage_quantity
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white">
                                                    Tanggal Penggunaan
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={data.usage_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "usage_date",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="bg-white border-0 focus:ring-2 focus:ring-purple-400 text-gray-800 shadow-lg rounded-lg py-3 px-4"
                                                />
                                                {errors.usage_date && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.usage_date}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Catatan */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-white">
                                                Catatan (Opsional)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Masukkan catatan jika perlu"
                                                className="bg-white border-0 focus:ring-2 focus:ring-emerald-400 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                            />
                                        </div>

                                        {/* Tombol Simpan */}
                                        <div className="flex justify-end pt-6 border-t border-emerald-500">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-emerald-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menyimpan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-emerald-600 mr-3 group-hover:bg-emerald-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Simpan Catatan
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
                        <Card className="w-full mx-auto mb-8 shadow-md rounded-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Penggunaan Sumber Daya
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full mt-2">
                                    {/* Input Search */}
                                    <div className="relative flex-1 min-w-[250px]">
    <Input
        type="text"
        placeholder="Cari aktivitas atau driver biaya..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown} // Tambahkan ini untuk Enter key
        className="pr-12 w-full"
    />
    <button
        type="button"
        onClick={handleSearchSubmit} // Ganti dengan fungsi yang benar
        className="absolute inset-y-0 right-0 flex items-center justify-center px-3 bg-emerald-600 hover:bg-emerald-700 rounded-r-md"
    >
        <SearchIcon className="h-4 w-4 text-white" />
    </button>
</div>

                                    {/* Select perPage */}
                                    <Select
    value={String(perPage)}
    onValueChange={(value) => {
        setPerPage(Number(value));
        router.get(
            route("activity-cost-driver-usages.index"), // Ganti dengan route yang benar
            { perPage: value, search },
            {
                preserveState: true,
                replace: true,
            }
        );
    }}
>
    <SelectTrigger id="perPage" className="w-[100px]">
        <SelectValue placeholder="Show" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value={String(usages.total || 0)}>All</SelectItem>
    </SelectContent>
</Select>

                                    {/* Badge total data */}
                                    <div className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {usages.total || 0} Catatan
                                    </div>

                                    {/* Buttons Export */}
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
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {(!currentUsages || currentUsages.length === 0) ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada catatan penggunaan sumber
                                            daya
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan catatan penggunaan
                                            untuk melacak biaya.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Card>
                                            {" "}
                                            {/* Card di sekitar tabel untuk border dan shadow */}
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16 text-center font-bold ">
                                                            No.
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Aktivitas
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Driver Biaya
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Jumlah
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Tanggal
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Catatan
                                                        </TableHead>
                                                        <TableHead className="w-32 text-center font-bold ">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentUsages.map(
                                                        (usage, index) => (
                                                            <TableRow
                                                                key={usage.id}
                                                                className="transition-colors duration-200 border-b"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {index +
                                                                            1}{" "}
                                                                        {/* Nomor urut */}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {usage
                                                                        .activity
                                                                        ?.name ||
                                                                        "-"}
                                                                </TableCell>
                                                                <TableCell className="">
                                                                    {usage
                                                                        .cost_driver
                                                                        ?.name ||
                                                                        "-"}{" "}
                                                                    (
                                                                    {usage
                                                                        .cost_driver
                                                                        ?.unit ||
                                                                        ""}
                                                                    )
                                                                </TableCell>
                                                                <TableCell className="">
                                                                    {usage.usage_quantity
                                                                        ? `${Number(
                                                                              usage.usage_quantity
                                                                          ).toLocaleString(
                                                                              "id-ID"
                                                                          )} ${
                                                                              usage
                                                                                  .cost_driver
                                                                                  ?.unit ||
                                                                              ""
                                                                          } / bulan`
                                                                        : "0"}
                                                                </TableCell>

                                                                <TableCell>
                                                                    {usage.usage_date
                                                                        ? new Date(
                                                                              usage.usage_date
                                                                          ).toLocaleDateString(
                                                                              "id-ID"
                                                                          )
                                                                        : "-"}
                                                                </TableCell>
                                                                <TableCell className="max-w-xs">
                                                                    {usage.notes ? (
                                                                        <div
                                                                            className="truncate"
                                                                            title={
                                                                                usage.notes
                                                                            }
                                                                        >
                                                                            {
                                                                                usage.notes
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
                                                                                openEdit3Dialog(
                                                                                    usage
                                                                                )
                                                                            }
                                                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-700 hover:border-emerald-300 transition-all duration-200 p-2 bg-emerald-600"
                                                                            title="Edit3 Catatan"
                                                                        >
                                                                            <Edit3 className="h-4 w-4 text-emerald-50" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    usage
                                                                                )
                                                                            }
                                                                            className="text-red-600 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
                                                                            title="Hapus Catatan"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-50" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Card>

                                        {(usages.total || 0) > perPage && (
    <Pagination className="mt-4">
        <PaginationContent>
            {(usages.links || []).map((link, index) => ( // Ganti dari allocations ke usages
                <PaginationItem key={index}>
                    {link.label === "&laquo; Previous" ? (
                        <PaginationPrevious
                            href={link.url ?? "#"}
                            onClick={(e) => {
                                if (link.url) {
                                    e.preventDefault();
                                    router.get(link.url);
                                }
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </PaginationPrevious>
                    ) : link.label === "Next &raquo;" ? (
                        <PaginationNext
                            href={link.url ?? "#"}
                            onClick={(e) => {
                                if (link.url) {
                                    e.preventDefault();
                                    router.get(link.url);
                                }
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </PaginationNext>
                    ) : (
                        <PaginationLink
                            href={link.url ?? "#"}
                            isActive={link.active}
                            className={
                                link.active
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
                                    : ""
                            }
                            onClick={(e) => {
                                if (link.url) {
                                    e.preventDefault();
                                    router.get(link.url);
                                }
                            }}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    )}
                </PaginationItem>
            ))}
        </PaginationContent>
    </Pagination>
)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Dialog open={isEdit3DialogOpen} onOpenChange={setIsEdit3DialogOpen}>
    <DialogContent className="sm:max-w-2xl p-6 bg-white rounded-lg">
        <DialogHeader className="pb-4 border-b border-gray-300">
            <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-white/20">
                    <Edit3 className="h-6 w-6 text-cyan-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                    Edit Catatan Penggunaan Sumber Daya
                </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 mt-2 text-sm">
                Perbarui informasi catatan penggunaan sumber daya Anda di bawah ini.
            </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateUsage} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aktivitas */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                        Aktivitas
                    </Label>
                    <Select
                        value={editData.activity_id?.toString()}
                        onValueChange={(value) =>
                            setEdit3Data("activity_id", parseInt(value))
                        }
                    >
                        <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-yellow-400 text-gray-800 shadow-none rounded-lg py-3 px-4">
                            <SelectValue placeholder="Pilih Aktivitas" />
                        </SelectTrigger>
                        <SelectContent>
                            {activities.map((activity) => (
                                <SelectItem key={activity.id} value={activity.id.toString()}>
                                    {activity.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {editErrors.activity_id && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <p className="text-red-700 text-xs font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-2" />
                                {editErrors.activity_id}
                            </p>
                        </div>
                    )}
                </div>

                {/* Driver Biaya */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                        Driver Biaya
                    </Label>
                    <Select
                        value={editData.cost_driver_id?.toString()}
                        onValueChange={(value) =>
                            setEdit3Data("cost_driver_id", parseInt(value))
                        }
                    >
                        <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-green-400 text-gray-800 shadow-none rounded-lg py-3 px-4">
                            <SelectValue placeholder="Pilih Driver Biaya" />
                        </SelectTrigger>
                        <SelectContent>
                            {costDrivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id.toString()}>
                                    {driver.name} ({driver.unit})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {editErrors.cost_driver_id && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <p className="text-red-700 text-xs font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-2" />
                                {editErrors.cost_driver_id}
                            </p>
                        </div>
                    )}
                </div>

                {/* Jumlah Penggunaan */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                        Jumlah Penggunaan
                    </Label>
                    <Input
                        type="number"
                        value={editData.usage_quantity}
                        onChange={(e) => setEdit3Data("usage_quantity", e.target.value)}
                        placeholder="Masukkan jumlah penggunaan"
                        className="bg-white border border-gray-300 focus:ring-2 focus:ring-green-400 text-gray-800 placeholder:text-gray-500 shadow-none rounded-lg py-3 px-4"
                    />
                    {editErrors.usage_quantity && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <p className="text-red-700 text-xs font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-2" />
                                {editErrors.usage_quantity}
                            </p>
                        </div>
                    )}
                </div>

                {/* Tanggal Penggunaan */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">
                        Tanggal Penggunaan
                    </Label>
                    <Input
                        type="date"
                        value={editData.usage_date}
                        onChange={(e) => setEdit3Data("usage_date", e.target.value)}
                        className="bg-white border border-gray-300 focus:ring-2 focus:ring-purple-400 text-gray-800 shadow-none rounded-lg py-3 px-4"
                    />
                    {editErrors.usage_date && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <p className="text-red-700 text-xs font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-2" />
                                {editErrors.usage_date}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Catatan */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                    Catatan (Opsional)
                </Label>
                <Input
                    type="text"
                    value={editData.notes}
                    onChange={(e) => setEdit3Data("notes", e.target.value)}
                    placeholder="Masukkan catatan jika perlu"
                    className="bg-white border border-gray-300 focus:ring-2 focus:ring-emerald-400 text-gray-800 placeholder:text-gray-500 shadow-none rounded-lg py-3 px-4"
                />
            </div>

            {/* Tombol Submit */}
            <DialogFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-cyan-500">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEdit3DialogOpen(false)}
                    className="flex-1 border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-200 py-2.5 px-4 rounded-lg"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={editProcessing}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200"
                >
                    {editProcessing ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Menyimpan...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Simpan Perubahan
                        </div>
                    )}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>




            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md p-6 bg-white rounded-lg shadow-xl">
                    <DialogHeader className="border-b pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Konfirmasi Hapus
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <DialogDescription className=" text-base leading-relaxed mb-6">
                        Apakah Anda yakin ingin menghapus catatan penggunaan
                        sumber daya untuk aktivitas{" "}
                        <span className="font-semibold text-gray-900">
                            "{usageToDelete?.activity?.name || "N/A"}"
                        </span>{" "}
                        (
                        <span className="font-semibold text-gray-900">
                            {usageToDelete?.cost_driver?.name || "N/A"}
                        </span>
                        ) pada tanggal{" "}
                        <span className="font-semibold text-gray-900">
                            {usageToDelete?.usage_date
                                ? new Date(
                                      usageToDelete.usage_date
                                  ).toLocaleDateString("id-ID")
                                : "N/A"}
                        </span>
                        ? Tindakan ini tidak dapat dibatalkan dan semua data
                        terkait akan hilang permanen.
                    </DialogDescription>
                    <DialogFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1 border-gray-300  hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 py-2.5 px-4 rounded-lg"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUsage}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus Catatan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
