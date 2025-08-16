import React, { useState, useEffect } from "react";
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
import debounce from "lodash.debounce";

export default function ProductIndex({
    auth,
    products,
    success,
    generatedCode,
    error,
}) {
    // Form untuk tambah produk
    const { data, setData, post, reset, processing, errors } = useForm({
        name: "",
        code: "",
        type: "",
        description: "",
    });
    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(10);

    // State untuk dialog hapus
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

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
        type: "",
        description: "",
    });

 useEffect(() => {
    console.log('Form data:', data);
  }, [data]);

    useEffect(() => {
    if (generatedCode && !data.code) {
        setData("code", generatedCode);
    }
}, [generatedCode]);
    // Fungsi untuk menangani penambahan produk baru
    const handleAddProduct = (e) => {
        // Penting: e.preventDefault() untuk mencegah halaman reload
        e.preventDefault(); 
        
        // Kirim data ke server
        post(route('products.store'), {
  onSuccess: () => {
    // Ini berjalan hanya jika status 200 OK
    reset();
  },
  onError: (errors) => {
    // Callback ini akan berjalan jika server mengembalikan error,
    // misalnya karena validasi form gagal.
    console.error("Gagal menambahkan produk:", errors);
  },
});
    };


    // Fungsi untuk menampilkan dialog konfirmasi hapus
    const confirmDelete = (product) => {
        setProductToDelete(product);
        setIsDialogOpen(true);
    };

    // Fungsi untuk menghapus produk
    const handleDeleteProduct = () => {
        if (productToDelete) {
            router.delete(route("products.destroy", productToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setProductToDelete(null);
                },
                onError: (formErrors) => {
                    console.error("Gagal menghapus produk:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    // Fungsi untuk membuka dialog edit
    const openEditDialog = (product) => {
    setEditData({
        id: product.id,
        name: product.name,
        code: product.code, // pastikan ini ada
        type: product.type,
        description: product.description,
    });
    setIsEditDialogOpen(true);
};

    // Fungsi untuk memperbarui produk
    const handleUpdateProduct = (e) => {
        e.preventDefault();
        put(route("products.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                editReset();
            },
            onError: (formErrors) => {
                console.error("Gagal memperbarui produk:", formErrors);
            },
        });
    };

    const handleExportExcel = () => {
        window.location.href = "/products/export/excel"; // trigger download
    };

    const handleExportPdf = () => {
        window.open("/products/export/pdf", "_blank"); // buka PDF di tab baru
    };

    const handleSearch = () => {
    router.get(
        route("products.index"),
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
                        Produk
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
                        <Card className="shadow-xl bg-yellow-600 border-0 overflow-hidden">
                            <div className="relative">
                                <CardHeader className="pb-6 bg-yellow-700 border-b border-yellow-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <Plus className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-white">
                                            Tambah Produk Baru
                                        </span>
                                    </CardTitle>
                                    <p className="text-yellow-100 text-sm mt-2 font-medium">
                                        Masukkan informasi produk kopi yang akan
                                        ditambahkan ke sistem
                                    </p>
                                </CardHeader>

                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddProduct}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Nama Produk
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Contoh: Kopi Arabika Premium"
                                                        value={data.name}
                                                        onChange={e =>
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
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="code"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Kode Produk (Otomatis)
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="code"
                                                        type="text"
                                                        value={data.code}
                                                        disabled
                                                        readOnly
                                                        className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.code && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.code}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="type"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Jenis Kopi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="type"
                                                        type="text"
                                                        placeholder="Contoh: Arabika, Robusta"
                                                        value={data.type}
                                                        onChange={e =>
                                                            setData(
                                                                "type",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.type && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.type}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="description"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Deskripsi
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="description"
                                                        type="text"
                                                        placeholder="Deskripsi Produk"
                                                        value={data.description}
                                                        onChange={e =>
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

                                        <div className="flex justify-end pt-6 border-t border-yellow-500">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-white hover:bg-gray-50 text-yellow-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent mr-3"></div>
                                                        <span className="font-semibold">
                                                            Menambahkan...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center group">
                                                        <div className="p-1 rounded-full bg-yellow-600 mr-3 group-hover:bg-yellow-700 transition-colors duration-300">
                                                            <Plus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Produk
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>

                            {/* Simple decorative accent */}
                        </Card>

                        {/* Tabel Daftar Produk */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Produk
                                    </div>
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2 w-full">
                                    <div className="relative flex-1 min-w-[250px]">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama produk atau jenis kopi..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            className="pr-12 w-full" // ruang lebih lebar untuk tombol
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
                                                route("products.index"),
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
                                                value={String(products.total)}
                                            >
                                                All
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Badge total produk */}
                                    <div className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                        {products.total} Produk
                                    </div>

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
                                {products.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada produk
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan produk kopi pertama
                                            Anda untuk memulai bisnis.
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
                                                            Nama Produk
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Kode Produk
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Jenis Kopi
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
                                                    {products.data.map(
                                                        (product, index) => (
                                                            <TableRow
                                                                key={product.id}
                                                                className="transition-colors duration-200 border-b"
                                                            >
                                                                <TableCell className="text-center">
                                                                    <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                        {products.from +
                                                                            index}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold ">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-1 rounded-full w-fit mx-auto">
                                                                        {
                                                                            product.code
                                                                        }
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell>
                                                                    {" "}
                                                                    {/* Changed from text-white */}{" "}
                                                                    {product.type ? (
                                                                        <div className="flex items-center space-x-1">
                                                                            {" "}
                                                                            <span>
                                                                                {" "}
                                                                                {
                                                                                    product.type
                                                                                }{" "}
                                                                            </span>{" "}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="italic">
                                                                            -{" "}
                                                                        </span>
                                                                    )}{" "}
                                                                </TableCell>
                                                                <TableCell className="max-w-xs">
                                                                    {product.description ? (
                                                                        <div
                                                                            className="truncate"
                                                                            title={
                                                                                product.description
                                                                            }
                                                                        >
                                                                            {
                                                                                product.description
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
                                                                                    product
                                                                                )
                                                                            }
                                                                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 p-2 bg-yellow-600"
                                                                            title="Edit Produk"
                                                                        >
                                                                            <Edit3 className="h-4 w-4 text-yellow-50" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    product
                                                                                )
                                                                            }
                                                                            className="text-red-600 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-600"
                                                                            title="Hapus Produk"
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
                                        {products.total > perPage && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {products.links.map(
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
                                                                                ? "bg-yellow-600 hover:bg-yellow-700 text-white hover:text-white"
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
                                Konfirmasi Hapus Produk
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus produk{" "}
                            <span className="font-semibold ">
                                "{productToDelete?.name}"
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
                            onClick={handleDeleteProduct}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Produk
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Produk */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-yellow-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold ">
                                Edit Produk
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi produk kopi Anda di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateProduct} className="space-y-4 mt-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Produk */}
        <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-semibold">
                Nama Produk
            </Label>
            <Input
                id="edit-name"
                type="text"
                placeholder="Nama Produk Kopi"
                value={editData.name}
                onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
            />
            {editErrors.name && (
                <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {editErrors.name}
                </p>
            )}
        </div>

        {/* Kode Produk */}
        <div className="space-y-2">
            <Label htmlFor="edit-code" className="text-sm font-semibold">
                Kode Produk
            </Label>
            <Input
                id="edit-code"
                type="text"
                placeholder="Kode Produk"
                value={editData.code}
                disabled
                readonly
                onChange={(e) =>
                    setEditData((prev) => ({ ...prev, code: e.target.value }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
            />
            {editErrors.code && (
                <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {editErrors.code}
                </p>
            )}
        </div>

        {/* Jenis Produk */}
        <div className="space-y-2">
            <Label htmlFor="edit-type" className="text-sm font-semibold">
                Jenis Kopi
            </Label>
            <Input
                id="edit-type"
                type="text"
                placeholder="Misal: Arabika, Robusta"
                value={editData.type}
                onChange={(e) =>
                    setEditData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
            />
            {editErrors.type && (
                <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {editErrors.type}
                </p>
            )}
        </div>
    </div>

    {/* Deskripsi */}
    <div className="space-y-2">
        <Label htmlFor="edit-description" className="text-sm font-semibold">
            Deskripsi
        </Label>
        <Textarea
            id="edit-description"
            placeholder="Deskripsi Produk"
            value={editData.description}
            onChange={(e) =>
                setEditData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
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
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
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
