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
import { Search, Plus, Edit3, Trash2, Coffee, AlertCircle } from "lucide-react";
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

export default function CostDriverIndex({ auth, costDrivers, success, error }) {
    // Form untuk tambah produk
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        unit: "",
        description: "",
    });
    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    const [perPage, setPerPage] = useState(10);

    // State untuk dialog hapus
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [costDriverToDelete, setCostDriverToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);
    // Form untuk edit produk
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
        unit: "",
        description: "",
    });

    // Fungsi untuk menangani penambahan produk baru
    const handleAddCostDriver = (e) => {
        e.preventDefault();
        post(route("cost-drivers.store"), {
            onSuccess: () => {
                reset(); // Clear the form after success
            },
            onError: (formErrors) => {
                console.error("Failed to add cost driver:", formErrors);
            },
        });
    };

    // Fungsi untuk menampilkan dialog konfirmasi hapus
    const confirmDelete = (driver) => {
    setCostDriverToDelete(driver);
    setIsDialogOpen(true);
};

    // Fungsi untuk menghapus produk
    const handleDeleteCostDriver = () => {
    if (!costDriverToDelete) return;

    setDeleting(true);

    router.delete(route("cost-drivers.destroy", costDriverToDelete.id), {
        preserveScroll: true,
        onSuccess: () => {
            setIsDialogOpen(false);
            setCostDriverToDelete(null);
        },
        onError: (errors) => {
            console.error("Gagal menghapus cost driver:", errors);
            setIsDialogOpen(false);
        },
        onFinish: () => {
            setDeleting(false);
        },
    });
};


    // Fungsi untuk membuka dialog edit
    const openEditDialog = (costDriver) => {
    setEditData({
        id: costDriver.id,
        name: costDriver.name,
        unit: costDriver.unit,
        description: costDriver.description,
    });
    setIsEditDialogOpen(true);
};

    // Fungsi untuk memperbarui produk
    const handleUpdateCostDriver = (e) => {
        e.preventDefault();
        put(route("cost-drivers.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false); // Close dialog
                editReset(); // Clear edit form
            },
            onError: (formErrors) => {
                console.error("Failed to update cost driver:", formErrors);
            },
        });
    };

    function handleExportExcel() {
        window.open(route("costDrivers.exportExcel"), "_blank");
    }

    function handleExportPdf() {
        window.open(route("costDrivers.exportPdf"), "_blank");
    }

    const handleSearch = () => {
    router.get(
        route("cost-drivers.index"),
        { search, perPage },
        {
            preserveState: true,
            replace: true,
        }
    );
};

const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
};

    return (
        <AuthenticatedLayout user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold  dark:text-gray-100">
                        Driver Biaya
                    </h2>
                </div>
            }>
            <Head title="Produk" />

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
                        {/* Formulir Tambah Produk */}
                        <Card className="shadow-xl bg-blue-600 border-0 overflow-hidden">
                            <div className="relative">
                                {/* Header Card dengan background biru tua dan border bawah */}
                                <CardHeader className="pb-6 bg-blue-700 border-b border-blue-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        {/* Icon Plus dengan latar belakang transparan putih */}
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        {/* Judul dengan teks putih */}
                                        <span className="text-white">
                                            Tambah Driver Biaya Baru
                                        </span>
                                    </CardTitle>
                                    {/* Deskripsi di bawah judul */}
                                    <p className="text-blue-100 text-sm mt-2 font-medium">
                                        Masukkan informasi driver biaya yang
                                        akan ditambahkan ke sistem.
                                    </p>
                                </CardHeader>

                                {/* Konten Card dengan padding yang diperbarui */}
                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddCostDriver}
                                        className="space-y-6" // Gap vertikal antar elemen form
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {" "}
                                            {/* Grid dengan gap yang diperbarui */}
                                            {/* Input Nama Driver Biaya */}
                                            <div className="space-y-3">
                                                {" "}
                                                {/* Gap vertikal antar label, input, dan error */}
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-semibold text-white flex items-center gap-2" // Teks putih dan flex untuk icon/dot
                                                >
                                                    {/* Dot dekoratif (opsional, bisa disesuaikan) */}
                                                    {/* <div className="w-3 h-3 bg-yellow-400 rounded-full"></div> */}
                                                    Nama Driver Biaya
                                                </Label>
                                                <div className="relative">
                                                    {" "}
                                                    {/* Wrapper untuk input dan aksen vertikal */}
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Contoh: Jam Mesin"
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
                                                        {" "}
                                                        {/* Gaya error yang diperbarui */}
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />{" "}
                                                            {/* Icon error */}
                                                            {errors.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Input Satuan (Opsional) */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="costDriverUnit" // Mengubah htmlFor dari "type" menjadi "costDriverUnit"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Satuan
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="costDriverUnit" // Mengubah id dari "type" menjadi "costDriverUnit"
                                                        type="text"
                                                        placeholder="Misal: Jam, Batch, Unit"
                                                        value={data.unit}
                                                        onChange={(e) =>
                                                            setData(
                                                                "unit",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.unit && ( // Mengubah errors.type menjadi errors.unit
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.unit}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Input Deskripsi (Opsional) */}
                                            <div className="space-y-3 md:col-span-1">
                                                <Label
                                                    htmlFor="costDriverDescription" // Mengubah htmlFor dari "description" menjadi "costDriverDescription"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    {/* <div className="w-3 h-3 bg-purple-400 rounded-full"></div> */}
                                                    Deskripsi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="costDriverDescription" // Mengubah id dari "description" menjadi "costDriverDescription"
                                                        type="text"
                                                        placeholder="Deskripsi Driver Biaya"
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
                                        <div className="flex justify-end pt-6 border-t border-blue-500">
                                            {" "}
                                            {/* Border atas dan padding */}
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menambahkan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-blue-600 mr-3 group-hover:bg-blue-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Driver Biaya
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>
                        </Card>

                        {/* Tabel Daftar Produk */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Biaya Driver
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full mt-2">
                                    {/* Input Search */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama biaya driver"
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
                                                route("cost-drivers.index"),
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
                                                value={String(
                                                    costDrivers.total
                                                )}
                                            >
                                                All
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Badge total biaya driver */}
                                    <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {costDrivers.total} Driver Biaya
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
                                {costDrivers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">
                                            Belum ada biaya driver
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan biaya driver kopi
                                            pertama Anda untuk memulai bisnis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Card>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16 text-center font-bold ">
                                                            No.
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Nama Driver Biaya
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Satuan
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Deskripsi
                                                        </TableHead>
                                                        <TableHead className="w-32 text-center font-bold ">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {costDrivers.data.map(
                                                        (costDriver, index) => (
                                                            <TableRow
                                                                key={
                                                                    costDriver.id
                                                                }
                                                                className="transition-colors duration-200 border-b"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {costDrivers.from +
                                                                            index}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold ">
                                                                    {
                                                                        costDriver.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="">
                                                                    {costDriver.unit ? (
                                                                        <div className="flex items-center space-x-1">
                                                                            <span>
                                                                                {
                                                                                    costDriver.unit
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="italic">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="max-w-xs">
                                                                    {costDriver.description ? (
                                                                        <div
                                                                            className="truncate"
                                                                            title={
                                                                                costDriver.description
                                                                            }
                                                                        >
                                                                            {
                                                                                costDriver.description
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
                                                                                    costDriver
                                                                                )
                                                                            }
                                                                            className="text-blue-700 border-blue-200 hover:bg-blue-800 hover:border-blue-300 transition-all duration-200 p-2 bg-blue-600"
                                                                            title="Edit Produk"
                                                                        >
                                                                            <Edit3 className="h-4 w-4 text-blue-50" />
                                                                        </Button>
                                                                        <Button
    variant="outline"
    size="sm"
    onClick={() => confirmDelete(costDriver)}
    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
    title="Hapus Driver Biaya"
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
                                        {costDrivers.total > perPage && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {costDrivers.links.map(
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
                                                                                ? "bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
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
                <DialogTitle className="text-lg font-bold ">
                    Konfirmasi Hapus Driver Biaya
                </DialogTitle>
            </div>

            <DialogDescription className="text-gray-600 mt-4">
                Apakah Anda yakin ingin menghapus driver biaya
                <span className="font-semibold "> "{costDriverToDelete?.name}"</span>?
                Tindakan ini tidak dapat dibatalkan. Semua data terkait akan hilang secara permanen.
            </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex space-x-2 mt-6">
            <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                disabled={deleting}
            >
                Batal
            </Button>

            <Button
                variant="destructive"
                onClick={handleDeleteCostDriver}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleting}
            >
                {deleting ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Menghapus...
                    </div>
                ) : (
                    <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                    </>
                )}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

            {/* Dialog Edit Produk */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Edit Driver Biaya
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi driver biaya Anda di bawah
                            ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateCostDriver}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-name"
                                    className="text-sm font-semibold "
                                >
                                    Nama Driver Biaya
                                </Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    placeholder="Nama Driver Biaya"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData("name", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                                {editErrors.name && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-unit"
                                    className="text-sm font-semibold "
                                >
                                    Satuan
                                </Label>
                                <Input
    id="edit-unit"
    type="text"
    placeholder="Misal: Jam, Batch, Unit"
    value={editData.unit}
    onChange={(e) =>
        setEditData({
            ...editData,
            unit: e.target.value
        })
    }
/>


                                {editErrors.unit && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.type}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-description"
                                className="text-sm font-semibold "
                            >
                                Deskripsi
                            </Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Deskripsi Driver Biaya"
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData("description", e.target.value)
                                }
                                className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
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
                                type="submit"
                                disabled={editProcessing}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
