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

export default function CostIndex({ auth, costs, success, error }) {
    // Form untuk tambah biaya
    const { filters, costDrivers } = usePage().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: "",
        description: "",
        amount: "",
        cost_driver_id: "",
    });
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(10);

    // State untuk dialog hapus
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [costToDelete, setCostToDelete] = useState(null);

    const [resetTrigger, setResetTrigger] = useState(0);

    // Form untuk edit biaya
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
        amount: "",
        cost_driver_id: "",
    });

    // ✅ PERBAIKAN: Fungsi untuk menangani penambahan biaya baru
    const handleAddCost = (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("1. Data sebelum submit:", data);
    
    const dataToSend = { ...data };

    if (dataToSend.amount) {
        const cleanedAmount = dataToSend.amount.toString().replace(/\D/g, '');
        dataToSend.amount = cleanedAmount ? parseInt(cleanedAmount, 10) : 0;
    }

    console.log("2. Data yang akan dikirim:", dataToSend);

    post(route("costs.store"), {
        onSuccess: (page) => {
            console.log("3. Success callback triggered");
            console.log("4. Page props:", page.props);
            console.log("5. Data sebelum reset:", data);
            
            // ✅ Method 1: Gunakan setData untuk manual reset
            setData({
                name: "",
                description: "",
                amount: "",
                cost_driver_id: "",
            });
            
            console.log("6. setData called");
            
            // ✅ Clear errors
            clearErrors();
            
            // ✅ Force re-render
            setResetTrigger(prev => {
                console.log("7. resetTrigger updated:", prev + 1);
                return prev + 1;
            });
            
            // ✅ Delay check untuk memastikan state ter-update
            setTimeout(() => {
                console.log("8. Data setelah reset (delayed check):", data);
            }, 100);
        },
        onError: (formErrors) => {
            console.error("Form errors:", formErrors);
        },
        onFinish: () => {
            console.log("9. Request finished");
        }
    });
};

    // Fungsi untuk menampilkan dialog konfirmasi hapus
    const confirmDelete = (cost) => {
        setCostToDelete(cost);
        setIsDialogOpen(true);
    };

    // Fungsi untuk menghapus biaya
    const handleDeleteCost = () => {
        if (costToDelete) {
            router.delete(route("costs.destroy", costToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setCostToDelete(null);
                },
                onError: (formErrors) => {
                    console.error("Gagal menghapus biaya:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    const openEditDialog = (cost) => {
    console.log("Original cost amount:", cost.amount, typeof cost.amount);
    
    setEditData({
        id: cost.id,
        name: cost.name,
        description: cost.description,
        // ✅ Pastikan ini nilai numerik, BUKAN string yang diformat
        amount: cost.amount, 
        cost_driver_id: cost.cost_driver_id,
    });
    
    setIsEditDialogOpen(true);
};

    // Fungsi untuk update biaya
    // Perbaiki handleUpdateCost
const handleUpdateCost = (e) => {
    e.preventDefault();

    const dataToUpdate = { ...editData };

    // Debugging: cek nilai amount sebelum dikirim
    console.log("Amount before submit:", dataToUpdate.amount);

    router.put(route('costs.update', dataToUpdate.id), dataToUpdate, {
        onSuccess: () => {
            console.log("Update berhasil!");

            // Tutup dialog edit setelah update berhasil
            setIsEditDialogOpen(false);

            // Reset form edit
            editReset();
        },
        onError: (errors) => {
            console.error("Update gagal:", errors);
        }
    });
};



    // ✅ PERBAIKAN: Fungsi formatNumberWithDots
    const formatNumberWithDots = (number) => {
    if (!number || number === 0) return '';
    return Number(number).toLocaleString('id-ID').replace(/,/g, '.');
};

    const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // ✅ PERBAIKAN: Hapus semua karakter non-digit untuk mendapatkan nilai murni.
    const numericValue = value.replace(/\D/g, ''); 
    
    // Konversi ke integer. Jika kosong, gunakan null atau 0.
    const finalValue = numericValue ? parseInt(numericValue, 10) : null; 
    
    setEditData(prev => ({
        ...prev,
        amount: finalValue, 
    }));
};




    // ✅ PERBAIKAN: Handle new amount change untuk form tambah
    const handleNewAmountChange = (e) => {
        const { value } = e.target;
        // Hapus semua karakter non-digit
        const cleanedValue = value.replace(/\D/g, '');
        setData('amount', cleanedValue);
    };

    const handleExportExcel = () => {
        window.open(route("costs.export.excel", { search }), "_blank");
    };

    const handleExportPdf = () => {
        window.open(route("costs.export.pdf", { search }), "_blank");
    };

    const handleSearch = () => {
    router.get(
        route("costs.index"),
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
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold  dark:text-gray-100">
                        Biaya
                    </h2>
                </div>
            }
        >
            <Head title="Biaya" />

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
                        {/* ✅ PERBAIKAN: Formulir Tambah Biaya dengan key untuk force re-render */}
                        <Card className="shadow-xl bg-red-600 border-0 overflow-hidden">
                            <div className="relative">
                                <CardHeader className="pb-6 bg-red-700 border-b border-red-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-white">
                                            Tambah Biaya Baru
                                        </span>
                                    </CardTitle>
                                    <p className="text-red-100 text-sm mt-2 font-medium">
                                        Masukkan informasi biaya yang akan
                                        ditambahkan ke sistem.
                                    </p>
                                </CardHeader>

                                <CardContent className="pt-6 px-6 pb-6">
                                    {/* ✅ PERBAIKAN: Form dengan key dan struktur yang diperbaiki */}
                                    <form key={resetTrigger} onSubmit={handleAddCost} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Input Nama Biaya */}
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Nama Biaya
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Contoh: Biaya Listrik"
                                                        value={data.name || ""}
                                                        onChange={(e) => setData("name", e.target.value)}
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

                                            {/* Input Jumlah Biaya */}
                                            <div className="space-y-3">
                                                <Label htmlFor="amount" className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Jumlah Biaya (per bulan)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="amount"
                                                        type="text"
                                                        placeholder="Contoh: 1.000.000"
                                                        value={data.amount ? formatNumberWithDots(data.amount) : ''}
                                                        onChange={handleNewAmountChange}
                                                        className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                    <p className="text-xs text-white mt-1">* Input biaya total sumber daya untuk satu bulan.</p>
                                                </div>
                                                {errors.amount && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.amount}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Field Driver Biaya */}
                                            <div className="space-y-3">
                                                <Label htmlFor="driver_id" className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Driver Biaya
                                                </Label>
                                                <div className="relative">
                                                    <Select 
    key={resetTrigger} // Simplified key
    value={data.cost_driver_id} // Langsung dari useForm
    onValueChange={(value) => {
        console.log("Select changed to:", value);
        setData('cost_driver_id', value);
    }}
>
    <SelectTrigger id="driver_id" className="bg-white border-0 focus:ring-2 focus:ring-red-400 transition-all duration-300 text-gray-800 shadow-lg rounded-lg py-3 px-4">
        <SelectValue placeholder="Pilih Driver Biaya" />
    </SelectTrigger>
    <SelectContent>
        {costDrivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id.toString()}>
                {driver.name}
            </SelectItem>
        ))}
    </SelectContent>
</Select>
                                                </div>
                                                {errors.cost_driver_id && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.cost_driver_id}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Deskripsi */}
                                            <div className="space-y-3">
                                                <Label htmlFor="description" className="text-sm font-semibold text-white flex items-center gap-2">
                                                    Deskripsi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="description"
                                                        type="text"
                                                        placeholder="Deskripsi Biaya"
                                                        value={data.description || ""}
                                                        onChange={(e) => setData("description", e.target.value)}
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
                                        <div className="flex justify-end pt-6 border-t border-red-500">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-red-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">Menambahkan...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-red-600 mr-3 group-hover:bg-red-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">Tambah Biaya</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>
                        </Card>

                        {/* Tabel Daftar Biaya - Bagian ini tetap sama seperti kode asli */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Biaya
                                    </div>
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-2 w-full">
                                    {/* Input Search */}
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama biaya"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
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
                                                route("costs.index"),
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
                                            <SelectItem value={String(costs.total)}>All</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Badge total biaya */}
                                    <div className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {costs.total} Biaya
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
                                {costs.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">
                                            Belum ada biaya
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan biaya kopi pertama Anda untuk memulai bisnis.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Card>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16 text-center font-bold ">No.</TableHead>
                                                        <TableHead className="font-bold ">Nama Biaya</TableHead>
                                                        <TableHead className="font-bold ">Jumlah</TableHead>
                                                        <TableHead className="font-bold ">Driver Biaya</TableHead>
                                                        <TableHead className="font-bold ">Deskripsi</TableHead>
                                                        <TableHead className="w-32 text-center font-bold ">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {costs.data.map((cost, index) => (
                                                        <TableRow
                                                            key={cost.id}
                                                            className="hover:bg-gray-50 transition-colors duration-200 border-b"
                                                        >
                                                            <TableCell className="text-center">
                                                                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                    {costs.from + index}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-semibold ">
                                                                {cost.name}
                                                            </TableCell>
                                                            <TableCell className="">
    {cost.amount !== null ? (
        <div className="flex flex-col leading-tight">
            <span>
                Rp {new Intl.NumberFormat("id-ID").format(cost.amount)} {/* Format untuk tampilan */}
            </span>
            <span className="text-xs text-gray-500">per bulan</span>
        </div>
    ) : (
        "-"
    )}
</TableCell>

                                                            <TableCell className="">
                                                                {cost.driver ? (
                                                                    <div className="flex flex-col leading-tight">
                                                                        <span className="font-medium">{cost.driver.name}</span>
                                                                        <span className="text-xs text-gray-500">({cost.driver.unit})</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Belum dipilih</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className=" max-w-xs">
                                                                {cost.description ? (
                                                                    <div className="truncate" title={cost.description}>
                                                                        {cost.description}
                                                                    </div>
                                                                ) : (
                                                                    <span className=" italic">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center space-x-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openEditDialog(cost)}
                                                                        className="text-red-700 border-red-200 hover:bg-red-800 hover:border-red-300 transition-all duration-200 p-2 bg-green-600"
                                                                        title="Edit Biaya"
                                                                    >
                                                                        <Edit3 className="h-4 w-4 text-green-50" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => confirmDelete(cost)}
                                                                        className="text-red-600 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
                                                                        title="Hapus Biaya"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-50" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                        {costs.total > perPage && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {costs.links.map((link, index) => (
                                                        <PaginationItem key={index}>
                                                            {link.label === "&laquo; Previous" ? (
                                                                <PaginationPrevious href={link.url ?? "#"}>
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </PaginationPrevious>
                                                            ) : link.label === "Next &raquo;" ? (
                                                                <PaginationNext href={link.url ?? "#"}>
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </PaginationNext>
                                                            ) : (
                                                                <PaginationLink
                                                                    href={link.url ?? "#"}
                                                                    isActive={link.active}
                                                                    className={
                                                                        link.active
                                                                            ? "bg-red-600 hover:bg-red-700 text-white hover:text-white"
                                                                            : ""
                                                                    }
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

            {/* Dialog Konfirmasi Hapus */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Konfirmasi Hapus Biaya
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus biaya{" "}
                            <span className="font-semibold ">
                                "{costToDelete?.name}"
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
                            onClick={handleDeleteCost}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Biaya
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Biaya */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Edit Biaya
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi biaya kopi Anda di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateCost} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Biaya */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-sm font-semibold ">
                                    Nama Biaya
                                </Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    placeholder="Contoh: Biaya Listrik"
                                    value={editData.name || ""}
                                    onChange={(e) =>
                                        setEditData(prev => ({ ...prev, name: e.target.value }))
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500 sm:text-sm"
                                />
                                {editErrors.name && (
                                    <p className="text-red-600 text-xs flex items-center mt-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Jumlah Biaya */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-amount" className="text-sm font-semibold ">
                                    Jumlah Biaya (per bulan)
                                </Label>
                                <Input
    id="edit-amount"
    type="text"
    placeholder="Contoh: 1.000.000"
    // ✅ PERBAIKAN: Gunakan fungsi format untuk TAMPILAN di UI
    value={editData.amount !== null ? formatNumberWithDots(editData.amount) : ""}
    onChange={handleAmountChange}
    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 sm:text-sm"
/>
                                <p className="text-xs text-gray-500">
                                    * Input biaya total sumber daya untuk satu bulan.
                                </p>
                                {editErrors.amount && (
                                    <p className="text-red-600 text-xs flex items-center mt-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.amount}
                                    </p>
                                )}
                            </div>

                            {/* Driver Biaya */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-cost-driver" className="text-sm font-semibold ">
                                    Driver Biaya
                                </Label>
                                <Select
                                    value={editData.cost_driver_id ? editData.cost_driver_id.toString() : ""}
                                    onValueChange={(value) =>
                                        setEditData(prev => ({ 
                                            ...prev, 
                                            cost_driver_id: value ? parseInt(value) : null 
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 sm:text-sm">
                                        <SelectValue placeholder="Pilih Driver Biaya" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {costDrivers.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                                {driver.name}{driver.unit ? ` (${driver.unit})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.cost_driver_id && (
                                    <p className="text-red-600 text-xs flex items-center mt-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.cost_driver_id}
                                    </p>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm font-semibold ">
                                    Deskripsi
                                </Label>
                                <Input
                                    id="edit-description"
                                    type="text"
                                    placeholder="Deskripsi Biaya"
                                    value={editData.description || ""}
                                    onChange={(e) =>
                                        setEditData(prev => ({ ...prev, description: e.target.value }))
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:text-sm"
                                />
                                {editErrors.description && (
                                    <p className="text-red-600 text-xs flex items-center mt-1">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <DialogFooter className="flex justify-end pt-4 border-t border-gray-200 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="px-5 py-2 rounded-lg border-gray-300"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editProcessing}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editProcessing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
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