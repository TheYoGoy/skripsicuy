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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Search, Plus, Edit3, Trash2, Users, AlertCircle, UserPlus } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination"; // Fixed import path - should be Components not components
import { usePage } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UserIndex({
    auth,
    users = [],
    availableRoles = [],
    success,
    error,
    errors: formErrors,
}) {
    // Debug: log availableRoles to check if it has data
    console.log("Available Roles:", availableRoles);

    // useForm for adding new users
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        role: "", // Remove default role assignment to see if it helps
    });

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");
    const [perPage, setPerPage] = useState(10);

    // State for delete confirmation dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // State and useForm for editing users
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
        email: "",
        password: "", // Password is optional for edit
        role: "",
    });

    // Function to handle adding a new user
    const handleAddUser = (e) => {
        e.preventDefault();
        post(route("users.store"), {
            onSuccess: () => {
                reset("name", "email", "password"); // Clear relevant fields after success
            },
            onError: (formErrors) => {
                console.error("Failed to add user:", formErrors);
            },
        });
    };

    // Function to show delete confirmation dialog
    const confirmDelete = (user) => {
        setUserToDelete(user);
        setIsDialogOpen(true);
    };

    // Function to delete a user
    const handleDeleteUser = () => {
        if (userToDelete) {
            router.delete(route("users.destroy", userToDelete.id), {
                onSuccess: () => {
                    setIsDialogOpen(false); // Close dialog
                    setUserToDelete(null); // Reset user to delete
                },
                onError: (formErrors) => {
                    console.error("Failed to delete user:", formErrors);
                    setIsDialogOpen(false);
                },
            });
        }
    };

    // Function to open edit dialog and populate data
    const openEditDialog = (user) => {
        setEditData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: "", // Password should be empty for security reasons, user can fill to change
            role: user.role,
        });
        setIsEditDialogOpen(true);
    };

    // Function to handle updating a user
    const handleUpdateUser = (e) => {
        e.preventDefault();
        put(route("users.update", editData.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false); // Close dialog
                editReset("password"); // Clear password field after update
            },
            onError: (formErrors) => {
                console.error("Failed to update user:", formErrors);
            },
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Manajemen Pengguna
                    </h2>
                </div>
            }
        >
            <Head title="Manajemen Pengguna" />

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

                    {formErrors.unique_email && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {formErrors.unique_email}
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
                        {/* Formulir Tambah Pengguna */}
                        <Card className="shadow-xl bg-blue-600 border-0 overflow-hidden">
                            <div className="relative">
                                {/* Header Card dengan background ungu tua dan border bawah */}
                                <CardHeader className="pb-6 bg-blue-700 border-b border-blue-500">
                                    <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                        {/* Icon UserPlus dengan latar belakang transparan putih */}
                                        <div className="p-2 rounded-lg bg-white/20">
                                            <UserPlus className="h-6 w-6 text-white" />
                                        </div>
                                        {/* Judul dengan teks putih */}
                                        <span className="text-white">
                                            Tambah Pengguna Baru
                                        </span>
                                    </CardTitle>
                                    {/* Deskripsi di bawah judul */}
                                    <p className="text-blue-100 text-sm mt-2 font-medium">
                                        Masukkan informasi pengguna yang akan ditambahkan ke sistem.
                                    </p>
                                </CardHeader>

                                {/* Konten Card dengan padding yang diperbarui */}
                                <CardContent className="pt-6 px-6 pb-6">
                                    <form
                                        onSubmit={handleAddUser}
                                        className="space-y-6" // Gap vertikal antar elemen form
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Grid dengan gap yang diperbarui */}
                                            {/* Input Nama */}
                                            <div className="space-y-3"> {/* Gap vertikal antar label, input, dan error */}
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-semibold text-white flex items-center gap-2" // Teks putih dan flex untuk icon/dot
                                                >
                                                    Nama
                                                </Label>
                                                <div className="relative"> {/* Wrapper untuk input dan aksen vertikal */}
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Nama Pengguna"
                                                        value={data.name}
                                                        onChange={(e) => setData("name", e.target.value)}
                                                        className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                    {/* Aksen vertikal di sisi kanan input */}
                                                </div>
                                                {errors.name && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3"> {/* Gaya error yang diperbarui */}
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" /> {/* Icon error */}
                                                            {errors.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Email */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Email
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={data.email}
                                                        onChange={(e) => setData("email", e.target.value)}
                                                        className="bg-white border-0 focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.email}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Input Password */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="Minimal 8 karakter"
                                                        value={data.password}
                                                        onChange={(e) => setData("password", e.target.value)}
                                                        className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.password}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Select Role */}
                                            <div className="space-y-3">
                                                <Label
                                                    htmlFor="role"
                                                    className="text-sm font-semibold text-white flex items-center gap-2"
                                                >
                                                    Peran
                                                </Label>
                                                <div className="relative">
                                                    <Select
                                                        value={data.role}
                                                        onValueChange={(value) => setData("role", value)}
                                                    >
                                                        <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-pink-400 transition-all duration-300 text-gray-800 shadow-lg rounded-lg py-3 px-4 h-12">
                                                            <SelectValue placeholder="Pilih Peran" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableRoles && availableRoles.length > 0 ? (
                                                                availableRoles.map((role) => (
                                                                    <SelectItem
                                                                        key={role}
                                                                        value={role}
                                                                    >
                                                                        {role
                                                                            .charAt(0)
                                                                            .toUpperCase() +
                                                                            role.slice(1)}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-roles-available" disabled>
                                                                    Tidak ada peran tersedia
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.role && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                        <p className="text-red-700 text-xs font-medium flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2" />
                                                            {errors.role}
                                                        </p>
                                                    </div>
                                                )}
                                                {/* Debug info - remove this in production */}
                                                {availableRoles.length === 0 && (
                                                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                                                        <p className="text-yellow-700 text-xs font-medium">
                                                            Debug: availableRoles is empty. Check your backend data.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tombol Submit */}
                                        <div className="flex justify-end pt-6 border-t border-blue-500"> {/* Border atas dan padding */}
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
                                                            <UserPlus className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            Tambah Pengguna
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </div>
                        </Card>

                        {/* Tabel Daftar Pengguna */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div className="text-2xl font-bold">
                                        Daftar Pengguna
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                                        {/* Input Search */}
                                        <div className="relative w-full md:w-[300px] lg:w-[400px]">
                                            <Input
                                                type="text"
                                                placeholder="Cari pengguna..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pr-12" // ruang lebih lebar untuk tombol
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.get(
                                                        route("users.index"),
                                                        { search, perPage },
                                                        {
                                                            preserveState: true,
                                                            replace: true,
                                                        }
                                                    );
                                                }}
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
                                                    route("users.index"),
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
                                                    value={String(users.total || users.length)}
                                                >
                                                    All
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Badge total pengguna */}
                                        <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                            {users.total || users.length} Pengguna
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {(!users.data && !users.length) || (users.data && users.data.length === 0) || (users.length === 0) ? (
                                    <div className="text-center py-16">
                                        <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Belum ada pengguna
                                        </h3>
                                        <p className="text-gray-500 text-lg">
                                            Mulai tambahkan pengguna pertama untuk memulai sistem.
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
                                                        <TableHead className="font-bold ">
                                                            Nama
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Email
                                                        </TableHead>
                                                        <TableHead className="font-bold ">
                                                            Peran
                                                        </TableHead>
                                                        <TableHead className="w-32 text-center font-bold ">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {(users.data || users).map((user, index) => (
                                                        <TableRow
                                                            key={user.id}
                                                            className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
                                                        >
                                                            <TableCell className="text-center">
                                                                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                    {(users.from || 1) + index}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-semibold">
                                                                {user.name}
                                                            </TableCell>
                                                            <TableCell className="">
                                                                {user.email}
                                                            </TableCell>
                                                            <TableCell className="text-gray-600">
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'No Role'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center space-x-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openEditDialog(user)}
                                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 p-2 bg-blue-700"
                                                                        title="Edit Pengguna"
                                                                    >
                                                                        <Edit3 className="h-4 w-4 text-blue-50" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => confirmDelete(user)}
                                                                        disabled={auth.user.id === user.id}
                                                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200 p-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-700"
                                                                        title="Hapus Pengguna"
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
                                        {/* Pagination */}
                                        {users.total > perPage && users.links && (
                                            <Pagination className="mt-4">
                                                <PaginationContent>
                                                    {users.links.map((link, index) => (
                                                        <PaginationItem key={index}>
                                                            {link.label === "&laquo; Previous" ? (
                                                                <PaginationPrevious
                                                                    href={link.url ?? "#"}
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                </PaginationPrevious>
                                                            ) : link.label === "Next &raquo;" ? (
                                                                <PaginationNext
                                                                    href={link.url ?? "#"}
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </PaginationNext>
                                                            ) : (
                                                                <PaginationLink
                                                                    href={link.url ?? "#"}
                                                                    isActive={link.active}
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
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Konfirmasi Hapus Pengguna
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-3">
                            Apakah Anda yakin ingin menghapus pengguna{" "}
                            <span className="font-semibold text-gray-900">
                                "{userToDelete?.name}"
                            </span>{" "}
                            ({userToDelete?.email})? Tindakan ini tidak dapat dibatalkan dan semua data
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
                            onClick={handleDeleteUser}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus Pengguna
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Pengguna */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Edit3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                Edit Pengguna
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600 mt-2">
                            Perbarui informasi pengguna di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateUser}
                        className="space-y-4 mt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-name"
                                    className="text-sm font-semibold "
                                >
                                    Nama *
                                </Label>
                                <Input
                                    id="edit-name"
                                    type="text"
                                    placeholder="Nama Pengguna"
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
                                    htmlFor="edit-email"
                                    className="text-sm font-semibold "
                                >
                                    Email *
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={editData.email}
                                    onChange={(e) =>
                                        setEditData("email", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                                {editErrors.email && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-password"
                                    className="text-sm font-semibold "
                                >
                                    Password (Biarkan kosong jika tidak ingin mengubah)
                                </Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    value={editData.password}
                                    onChange={(e) =>
                                        setEditData("password", e.target.value)
                                    }
                                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                                {editErrors.password && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="edit-role"
                                    className="text-sm font-semibold "
                                >
                                    Peran *
                                </Label>
                                <Select
                                    value={editData.role}
                                    onValueChange={(value) =>
                                        setEditData("role", value)
                                    }
                                >
                                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                                        <SelectValue placeholder="Pilih Peran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles && availableRoles.length > 0 ? (
                                            availableRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() +
                                                        role.slice(1)}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-roles-available" disabled>
                                                Tidak ada peran tersedia
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {editErrors.role && (
                                    <p className="text-red-500 text-xs flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {editErrors.role}
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
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {editProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Memperbarui...
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