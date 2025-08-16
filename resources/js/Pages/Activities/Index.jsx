import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Search,
    Plus,
    Edit3,
    Trash2,
    Coffee,
    AlertCircle,
    Building,
} from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { usePage } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ActivityIndex({
    auth,
    activities,
    costDrivers,
    departments, // TAMBAHAN BARU
    success,
    error,
}) {
    // Form untuk tambah aktivitas
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        department_id: "", // TAMBAHAN BARU
        primary_cost_driver_id: "",
    });
    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(10);

    // State untuk dialog hapus
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    // Form untuk edit aktivitas
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
        name: "",
        description: "",
        department_id: "", // TAMBAHAN BARU
        primary_cost_driver_id: "",
    });

    // Fungsi untuk menangani penambahan aktivitas baru
    const handleAddActivity = (e) => {
        e.preventDefault();
        post(route("activities.store"), {
            onSuccess: () => {
                reset();
            },
            onError: (formErrors) => {
                console.error("Gagal menambahkan aktivitas:", formErrors);
            },
        });
    };

    // Fungsi untuk menampilkan dialog konfirmasi hapus
    const confirmDelete = (activity) => {
        setActivityToDelete(activity);
        setIsDialogOpen(true);
    };

    // Fungsi untuk menghapus aktivitas
    const handleDeleteActivity = () => {
        if (activityToDelete) {
            router.delete(route("activities.destroy", activityToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setActivityToDelete(null);
                },
                onError: (formErrors) => {
                    console.error("Gagal menghapus aktivitas:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    // Fungsi untuk membuka dialog edit
    const openEditDialog = (activity) => {
        setEditData({
            id: activity.id,
            name: activity.name,
            description: activity.description,
            department_id: activity.department_id || "", // TAMBAHAN BARU
            primary_cost_driver_id: activity.primary_cost_driver_id || "",
        });
        setIsEditDialogOpen(true);
    };

    // Fungsi untuk memperbarui aktivitas
    const handleUpdateActivity = (e) => {
        e.preventDefault();
        put(route("activities.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                editReset();
            },
            onError: (formErrors) => {
                console.error("Gagal memperbarui aktivitas:", formErrors);
            },
        });
    };

    const getCostDriverName = (id) => {
        if (!id) return "-";
        const driver = costDrivers.find((driver) => driver.id === id);
        return driver ? `${driver.name} (${driver.unit})` : "Tidak Diketahui";
    };

    // TAMBAHAN BARU: Fungsi untuk mendapatkan nama department
    const getDepartmentName = (id) => {
        if (!id) return "-";
        const department = departments.find((dept) => dept.id === id);
        return department ? department.name : "Tidak Diketahui";
    };

    const handleExportExcel = () => {
        window.location.href = route("activities.export.excel");
    };

    const handleExportPdf = () => {
        window.location.href = route("activities.export.pdf");
    };

    const handleSearch = () => {
        router.get(
            route("activities.index"),
            { search, perPage },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Aktivitas
                    </h2>
                </div>
            }
        >
            <Head title="Aktivitas" />

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
                        {/* Formulir Tambah Aktivitas */}
                        <Card className="shadow-xl bg-sky-600 border-0 overflow-hidden">
                            <div className="relative">
                                {/* Header */}
                                <CardHeader className="pb-6 bg-sky-700 border-b border-sky-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-white">
                                            Tambah Aktivitas Baru
                                        </span>
                                    </CardTitle>
                                    <p className="text-sky-100 text-sm mt-2 font-medium">
                                        Silakan masukkan informasi aktivitas
                                        baru yang ingin ditambahkan
                                    </p>
                                </CardHeader>

                                {/* Form */}
                                <CardContent className="pt-6 px-6 pb-6">
                                    <div
                                        onSubmit={handleAddActivity}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {/* Nama Aktivitas */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Nama Aktivitas
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Contoh: Penggilingan Kopi"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* TAMBAHAN BARU: Departemen */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Departemen
                                                </Label>
                                                <Select
                                                    value={
                                                        data.department_id
                                                            ? data.department_id.toString()
                                                            : ""
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            "department_id",
                                                            value
                                                                ? parseInt(
                                                                      value
                                                                  )
                                                                : ""
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-blue-400 rounded-lg px-4 py-3 shadow-lg text-gray-800 placeholder:text-gray-500">
                                                        <SelectValue placeholder="Pilih Departemen" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map(
                                                            (department) => (
                                                                <SelectItem
                                                                    key={
                                                                        department.id
                                                                    }
                                                                    value={department.id.toString()}
                                                                >
                                                                    {
                                                                        department.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.department_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.department_id
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Driver Biaya Utama */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Driver Biaya Utama
                                                </Label>
                                                <Select
                                                    value={
                                                        data.primary_cost_driver_id
                                                            ? data.primary_cost_driver_id.toString()
                                                            : ""
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            "primary_cost_driver_id",
                                                            value &&
                                                                value !== "none"
                                                                ? parseInt(
                                                                      value
                                                                  )
                                                                : null
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-green-400 rounded-lg px-4 py-3 shadow-lg text-gray-800 placeholder:text-gray-500">
                                                        <SelectValue placeholder="Pilih Driver Biaya Utama" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            -- Tidak Ada --
                                                        </SelectItem>
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
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        driver.unit
                                                                    }
                                                                    )
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.primary_cost_driver_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {
                                                                errors.primary_cost_driver_id
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Deskripsi */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Deskripsi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="description"
                                                        type="text"
                                                        placeholder="Deskripsi Aktivitas"
                                                        value={data.description}
                                                        onChange={(e) =>
                                                            setData(
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-purple-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.description && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tombol Submit */}
                                        <div className="flex justify-end pt-6 border-t border-sky-500">
                                            <Button
                                                onClick={handleAddActivity}
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-sky-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menambahkan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-sky-600 mr-3 group-hover:bg-sky-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Aktivitas
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>

                        {/* Tabel Daftar Aktivitas */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl font-bold">
                                    Daftar Aktivitas
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full mt-4">
                                    {/* Input Search */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama aktivitas, deskripsi, atau departemen..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            className="pr-12 w-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="absolute inset-y-0 right-0 flex items-center justify-center px-3 bg-blue-600 hover:bg-blue-700 rounded-r-md"
                                        >
                                            <Search className="h-4 w-4 text-white" />
                                        </button>
                                    </div>

                                    {/* Select perPage */}
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={(value) => {
                                            setPerPage(Number(value));
                                            router.get(
                                                route("activities.index"),
                                                { perPage: value, search },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                }
                                            );
                                        }}
                                    >
                                        <SelectTrigger
                                            id="perPage"
                                            className="w-[100px]"
                                        >
                                            <SelectValue placeholder="Show" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">
                                                10
                                            </SelectItem>
                                            <SelectItem value="20">
                                                20
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50
                                            </SelectItem>
                                            <SelectItem
                                                value={String(activities.total)}
                                            >
                                                All
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Badge total aktivitas */}
                                    <div className="bg-sky-100 text-sky-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {activities.total} Aktivitas
                                    </div>

                                    {/* Tombol Export */}
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
                                {activities.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada aktivitas
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan aktivitas kopi
                                            pertama Anda untuk memulai bisnis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Card>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16 text-center font-bold">
                                                            No.
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Nama Aktivitas
                                                        </TableHead>
                                                        {/* TAMBAHAN BARU: Kolom Departemen */}
                                                        <TableHead className="font-bold">
                                                            Departemen
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Deskripsi
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Driver Biaya Utama
                                                        </TableHead>
                                                        <TableHead className="w-32 text-center font-bold">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {activities.data.map(
                                                        (activity, index) => (
                                                            <TableRow
                                                                key={
                                                                    activity.id
                                                                }
                                                                className="transition-colors duration-200 border-b"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {activities.from +
                                                                            index}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {
                                                                        activity.name
                                                                    }
                                                                </TableCell>
                                                                {/* TAMBAHAN BARU: Tampilkan nama departemen */}
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {getDepartmentName(
                                                                                activity.department_id
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="max-w-xs">
                                                                    {activity.description ? (
                                                                        <div
                                                                            className="truncate"
                                                                            title={
                                                                                activity.description
                                                                            }
                                                                        >
                                                                            {
                                                                                activity.description
                                                                            }
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getCostDriverName(
                                                                        activity.primary_cost_driver_id
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="flex justify-center space-x-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                openEditDialog(
                                                                                    activity
                                                                                )
                                                                            }
                                                                            className="text-sky-700 border-sky-200 hover:bg-sky-800 hover:border-sky-300 transition-all duration-200 p-2 bg-sky-700"
                                                                            title="Edit Aktivitas"
                                                                        >
                                                                            <Edit3 className="h-4 w-4 text-sky-50" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    activity
                                                                                )
                                                                            }
                                                                            className="text-red-700 border-red-200 hover:bg-red-800 hover:border-red-300 transition-all duration-200 p-2 bg-red-700"
                                                                            title="Hapus Aktivitas"
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
                                        {activities.total > perPage && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {activities.links.map(
                                                        (link, index) => (
                                                            <PaginationItem
                                                                key={index}
                                                            >
                                                                {link.label ===
                                                                "&laquo; Previous" ? (
                                                                    <PaginationPrevious
                                                                        href={
                                                                            link.url ??
                                                                            "#"
                                                                        }
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4" />
                                                                    </PaginationPrevious>
                                                                ) : link.label ===
                                                                  "Next &raquo;" ? (
                                                                    <PaginationNext
                                                                        href={
                                                                            link.url ??
                                                                            "#"
                                                                        }
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </PaginationNext>
                                                                ) : (
                                                                    <PaginationLink
                                                                        href={
                                                                            link.url ??
                                                                            "#"
                                                                        }
                                                                        isActive={
                                                                            link.active
                                                                        }
                                                                        className={
                                                                            link.active
                                                                                ? "bg-sky-600 hover:bg-sky-700 text-white hover:text-white"
                                                                                : ""
                                                                        }
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: link.label,
                                                                        }}
                                                                    />
                                                                )}
                                                            </PaginationItem>
                                                        )
                                                    )}
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

            {/* Dialog Konfirmasi Hapus */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Konfirmasi Hapus Aktivitas
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus aktivitas{" "}
                            <span className="font-semibold text-gray-900">
                                "{activityToDelete?.name}"
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan dan semua data
                            terkait akan hilang permanen.
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
                            onClick={handleDeleteActivity}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Aktivitas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Aktivitas */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-sky-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-sky-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Edit Aktivitas
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi aktivitas kopi Anda di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-name"
                                    className="text-sm font-semibold"
                                >
                                    Nama Aktivitas
                                </Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    placeholder="Contoh: Penggilingan Kopi"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData("name", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                                />
                                {editErrors.name && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* TAMBAHAN BARU: Edit Departemen */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-department"
                                    className="text-sm font-semibold"
                                >
                                    Departemen
                                </Label>
                                <Select
                                    value={
                                        editData.department_id
                                            ? editData.department_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) =>
                                        setEditData(
                                            "department_id",
                                            value ? parseInt(value) : ""
                                        )
                                    }
                                >
                                    <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-sky-500 rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-500">
                                        <SelectValue placeholder="Pilih Departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem
                                                key={department.id}
                                                value={department.id.toString()}
                                            >
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.department_id && (
                                    <p className="text-red-500 text-xs flex items-center mt-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.department_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-primary_cost_driver_id"
                                className="text-sm font-semibold"
                            >
                                Driver Biaya Utama
                            </Label>
                            <Select
                                value={
                                    editData.primary_cost_driver_id
                                        ? editData.primary_cost_driver_id.toString()
                                        : ""
                                }
                                onValueChange={(value) =>
                                    setEditData(
                                        "primary_cost_driver_id",
                                        value && value !== "none"
                                            ? parseInt(value)
                                            : null
                                    )
                                }
                            >
                                <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-sky-500 rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-500">
                                    <SelectValue placeholder="Pilih Driver Biaya Utama" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        -- Tidak Ada --
                                    </SelectItem>
                                    {costDrivers.map((driver) => (
                                        <SelectItem
                                            key={driver.id}
                                            value={driver.id.toString()}
                                        >
                                            {driver.name} ({driver.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editErrors.primary_cost_driver_id && (
                                <p className="text-red-500 text-xs flex items-center mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {editErrors.primary_cost_driver_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-description"
                                className="text-sm font-semibold"
                            >
                                Deskripsi
                            </Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Deskripsi Aktivitas"
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData("description", e.target.value)
                                }
                                className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-sky-500"
                                rows={3}
                            />
                            {editErrors.description && (
                                <p className="text-red-500 text-xs flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {editErrors.description}
                                </p>
                            )}
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
                                onClick={handleUpdateActivity}
                                disabled={editProcessing}
                                className="flex-1 bg-sky-600 hover:bg-sky-700"
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
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
