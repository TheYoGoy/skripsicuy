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

export default function DepartmentIndex({ auth, departments, success, error }) {
    // Form untuk tambah departemen
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
    });
    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    const [perPage, setPerPage] = useState(10);

    // State untuk dialog hapus
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

    // Form untuk edit departemen
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
    });

    // Fungsi untuk menangani penambahan departemen baru
    const handleAddDepartment = (e) => {
    e.preventDefault();
    post(route("departments.store"), {
        onSuccess: () => {
            // Reset form
            reset();
            // Force clear jika perlu
            setData("name", "");
            setData("description", "");
        },
        onError: (formErrors) => {
            console.error("Gagal menambahkan departemen:", formErrors);
        },
    });
};

    // Fungsi untuk menampilkan dialog konfirmasi hapus
    const confirmDelete = (department) => {
        setDepartmentToDelete(department);
        setIsDialogOpen(true);
    };

    // Fungsi untuk menghapus departemen
    const handleDeleteDepartment = () => {
        if (departmentToDelete) {
            router.delete(route("departments.destroy", departmentToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setDepartmentToDelete(null);
                },
                onError: (formErrors) => {
                    console.error("Gagal menghapus departemen:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    // Fungsi untuk membuka dialog edit
    const openEditDialog = (department) => {
        setEditData({
            id: department.id,
            name: department.name,
            description: department.description,
        });
        setIsEditDialogOpen(true);
    };

    // Fungsi untuk memperbarui departemen
    const handleUpdateDepartment = (e) => {
        e.preventDefault();
        put(route("departments.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                editReset();
            },
            onError: (formErrors) => {
                console.error("Gagal memperbarui departemen:", formErrors);
            },
        });
    };

    function handleExportExcel() {
        window.open(route("departments.exportExcel"), "_blank");
    }

    function handleExportPdf() {
        window.open(route("departments.exportPdf"), "_blank");
    }

    const handleSearch = () => {
    router.get(
        route("departments.index"),
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Departemen
                    </h2>
                </div>
            }>
            <Head title="Departemen" />

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
                        {/* Formulir Tambah Departemen */}
                        <Card className="shadow-xl bg-green-600 border-0 overflow-hidden">
                            <div className="relative">
                                {/* Header Card dengan background biru tua dan border bawah */}
                                <CardHeader className="pb-6 bg-green-700 border-b border-green-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        {/* Icon Plus dengan latar belakang transparan putih */}
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        {/* Judul dengan teks putih */}
                                        <span className="text-white">
                                            Tambah Departemen Baru
                                        </span>
                                    </CardTitle>
                                    {/* Deskripsi di bawah judul */}
                                    <p className="text-green-100 text-sm mt-2 font-medium">
                                        Masukkan informasi departemen yang akan
                                        ditambahkan ke sistem.
                                    </p>
                                </CardHeader>

                                {/* Konten Card dengan padding yang diperbarui */}
                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddDepartment}
                                        className="space-y-6" // Gap vertikal antar elemen form
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {" "}
                                            {/* Grid disesuaikan menjadi 2 kolom karena hanya ada 2 input utama */}
                                            {/* Input Nama Departemen */}
                                            <div className="space-y-3">
                                                {" "}
                                                {/* Gap vertikal antar label, input, dan error */}
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-semibold text-white flex items-center gap-2" // Teks putih dan flex untuk icon/dot
                                                >
                                                    {/* Dot dekoratif (opsional, bisa disesuaikan) */}
                                                    {/* <div className="w-3 h-3 bg-yellow-400 rounded-full"></div> */}
                                                    Nama Departemen
                                                </Label>
                                                <div className="relative">
                                                    {" "}
                                                    {/* Wrapper untuk input dan aksen vertikal */}
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Contoh: Departemen Produksi" // Placeholder yang lebih relevan
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
                                            {/* Input Deskripsi (Opsional) */}
                                            <div className="space-y-3 md:col-span-1">
                                                <Label
                                                    htmlFor="description"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    {/* <div className="w-3 h-3 bg-purple-400 rounded-full"></div> */}
                                                    Deskripsi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="description"
                                                        type="text"
                                                        placeholder="Deskripsi Departemen"
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
                                        <div className="flex justify-end pt-6 border-t border-green-500">
                                            {" "}
                                            {/* Border atas dan padding */}
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-green-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menambahkan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-green-600 mr-3 group-hover:bg-green-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Departemen
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>
                        </Card>

                        {/* Tabel Daftar Departemen */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Departemen
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full mt-2">
                                    {/* Input Search */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama departemen"
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
                                                route("departments.index"),
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
                                                    departments.total
                                                )}
                                            >
                                                All
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Badge total departemen */}
                                    <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {departments.total} Departemen
                                    </div>

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
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {departments.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada departemen
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan departemen kopi
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
                                                            Nama Departemen
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Deskripsi
                                                        </TableHead>
                                                        <TableHead className="w-32 text-center font-bold">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {departments.data.map(
                                                        (department, index) => (
                                                            <TableRow
                                                                key={
                                                                    department.id
                                                                }
                                                                className=" transition-colors duration-200 border-b"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {departments.from +
                                                                            index}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {
                                                                        department.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className=" max-w-xs">
                                                                    {department.description ? (
                                                                        <div
                                                                            className="truncate"
                                                                            title={
                                                                                department.description
                                                                            }
                                                                        >
                                                                            {
                                                                                department.description
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
                                                                                    department
                                                                                )
                                                                            }
                                                                            className="text-green-600 border-green-200 hover:bg-green-700 hover:border-green-300 transition-all duration-200 p-2 bg-green-600"
                                                                            title="Edit Departemen"
                                                                        >
                                                                            <Edit3 className="h-4 w-4 text-green-50" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    department
                                                                                )
                                                                            }
                                                                            className="text-red-600 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-500"
                                                                            title="Hapus Departemen"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-zinc-50" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                        {departments.total > perPage && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {departments.links.map(
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
                                                                                ? "bg-green-600 hover:bg-green-700 text-white hover:text-white"
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
                                Konfirmasi Hapus Departemen
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus departemen{" "}
                            <span className="font-semibold text-gray-900">
                                "{departmentToDelete?.name}"
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
                            onClick={handleDeleteDepartment}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Departemen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Departemen */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-green-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Edit Departemen
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi departemen kopi Anda di bawah
                            ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateDepartment}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-name"
                                    className="text-sm font-semibold text-gray-700"
                                >
                                    Nama Departemen
                                </Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    placeholder="Contoh: Departemen Produksi"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData("name", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                />
                                {editErrors.name && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-description"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Deskripsi
                            </Label>
                            <Textarea
                                id="edit-description"
                                placeholder="Deskripsi Departemen"
                                value={editData.description}
                                onChange={(e) =>
                                    setEditData("description", e.target.value)
                                }
                                className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-green-500"
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
                                className="flex-1 bg-green-600 hover:bg-green-700"
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
