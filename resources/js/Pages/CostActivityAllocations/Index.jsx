import React, { useState, useEffect, useCallback } from "react";
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
} from "@/Components/ui/select";
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from "@/Components/ui/pagination";
import { usePage } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import axios from "axios";

export default function CostActivityAllocationIndex({
   auth,
   allocations,
   costs,
   activities: initialActivities,
   success,
   error,
   errors: formErrors,
}) {
   // Form untuk tambah alokasi
   const { data, setData, post, processing, errors, reset } = useForm({
       cost_id: "",
       activity_id: "",
       allocated_amount: "",
       allocation_date: new Date().toISOString().split("T")[0],
       notes: "",
   });

   // State terpisah untuk calculated amount
   const [calculatedAmount, setCalculatedAmount] = useState("");
   const [isCalculating, setIsCalculating] = useState(false);

   const { filters } = usePage().props;
   const [search, setSearch] = useState(filters?.search || "");
   const [perPage, setPerPage] = useState(filters?.perPage || 10);

   // State untuk dialog hapus
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [allocationToDelete, setAllocationToDelete] = useState(null);

   // Form untuk edit alokasi
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
       cost_id: "",
       activity_id: "",
       allocated_amount: "",
       allocation_date: "",
       notes: "",
   });

   // State untuk aktivitas yang difilter berdasarkan tanggal
   const [availableActivities, setAvailableActivities] = useState(initialActivities);
   const [isLoadingActivities, setIsLoadingActivities] = useState(false);

   // Fungsi untuk fetch aktivitas berdasarkan tanggal
   const fetchActivitiesByDate = useCallback(async (date) => {
       if (!date) {
           setAvailableActivities(initialActivities);
           return;
       }

       setIsLoadingActivities(true);
       try {
           const response = await axios.post(route('cost-activity-allocations.activities-by-date'), {
               date: date
           });
           
           console.log('Activities for date', date, ':', response.data.activities);
           setAvailableActivities(response.data.activities);
           
           // Reset activity selection jika aktivitas yang dipilih tidak tersedia untuk tanggal ini
           if (data.activity_id && !response.data.activities.find(a => a.id == data.activity_id)) {
               setData(prev => ({ ...prev, activity_id: "" }));
               setCalculatedAmount("");
           }
           
       } catch (error) {
           console.error('Error fetching activities:', error);
           setAvailableActivities([]);
           if (data.activity_id) {
               setData(prev => ({ ...prev, activity_id: "" }));
               setCalculatedAmount("");
           }
       } finally {
           setIsLoadingActivities(false);
       }
   }, [data.activity_id, setData, initialActivities]);
   
   // Effect untuk fetch aktivitas ketika tanggal berubah
   useEffect(() => {
       fetchActivitiesByDate(data.allocation_date);
   }, [data.allocation_date, fetchActivitiesByDate]);
   
   // Fungsi calculate dengan useCallback
   const calculateAllocation = useCallback(async (costId, activityId, allocationDate) => {
       if (!costId || !activityId || !allocationDate) {
           setCalculatedAmount("");
           return;
       }

       console.log("=== CALCULATE DEBUG START ===");
       console.log("Input params:", { costId, activityId, allocationDate });
       
       setIsCalculating(true);
       setCalculatedAmount("Menghitung...");

       try {
           const requestData = {
               cost_id: costId,
               activity_id: activityId,
               allocation_date: allocationDate,
           };
           
           console.log("Request data:", requestData);
           console.log("Route URL:", route("cost-activity-allocations.calculate"));

           const response = await axios.post(route("cost-activity-allocations.calculate"), requestData);

           console.log("Success response:", response.data);
           const amount = response.data.allocated_amount;
           setCalculatedAmount(amount);
           
           setData(prev => ({
               ...prev,
               allocated_amount: amount
           }));

       } catch (error) {
           console.error("=== ERROR DETAILS ===");
           console.error("Error object:", error);
           console.error("Error response:", error.response);
           console.error("Error response data:", error.response?.data);
           console.error("Error status:", error.response?.status);
           console.error("Error message:", error.message);
           
           let errorMsg = "Gagal menghitung";
           if (error.response?.data?.error === 'NO_DRIVER') {
               errorMsg = "Biaya belum punya driver";
           } else if (error.response?.data?.error === 'NO_USAGE_DATA') {
               errorMsg = "Data penggunaan belum tersedia";
           } else if (error.response?.data?.message) {
               errorMsg = error.response.data.message;
           }
           
           console.log("Final error message:", errorMsg);
           setCalculatedAmount(errorMsg);
           
           setData(prev => ({
               ...prev,
               allocated_amount: ""
           }));
       } finally {
           setIsCalculating(false);
           console.log("=== CALCULATE DEBUG END ===");
       }
   }, [setData]);

   // useEffect yang aman untuk menghitung alokasi
   useEffect(() => {
       calculateAllocation(data.cost_id, data.activity_id, data.allocation_date);
   }, [data.cost_id, data.activity_id, data.allocation_date, calculateAllocation]);

   // Fungsi untuk menangani penambahan alokasi baru
   const handleAddAllocation = (e) => {
       e.preventDefault();
       
       if (!calculatedAmount || calculatedAmount === "Menghitung..." || isNaN(calculatedAmount)) {
           alert("Jumlah dialokasikan belum terhitung. Pastikan semua field terisi dengan benar.");
           return;
       }
       
       console.log("Data yang akan disubmit:", data);
       
       post(route("cost-activity-allocations.store"), {
           onSuccess: () => {
               reset({
                   cost_id: "",
                   activity_id: "",
                   allocated_amount: "",
                   allocation_date: new Date().toISOString().split("T")[0],
                   notes: "",
               });
               setCalculatedAmount("");
               router.reload({ only: ['allocations'] });
           },
           onError: (formErrors) => {
               console.error("Gagal menambahkan alokasi:", formErrors);
           },
       });
   };

   // Fungsi untuk menampilkan dialog konfirmasi hapus
   const confirmDelete = (allocation) => {
       setAllocationToDelete(allocation);
       setIsDialogOpen(true);
   };

   // Fungsi untuk menghapus alokasi
   const handleDeleteAllocation = () => {
       if (allocationToDelete) {
           router.delete(
               route(
                   "cost-activity-allocations.destroy",
                   allocationToDelete.id
               ),
               {
                   onSuccess: () => {
                       setIsDialogOpen(false);
                       setAllocationToDelete(null);
                   },
                   onError: (formErrors) => {
                       console.error("Gagal menghapus alokasi:", formErrors);
                       setIsDialogOpen(false);
                   },
               }
           );
       }
   };

   // State untuk aktivitas edit
   const [editAvailableActivities, setEditAvailableActivities] = useState(initialActivities);
   const [isLoadingEditActivities, setIsLoadingEditActivities] = useState(false);

   // Fungsi untuk fetch aktivitas edit berdasarkan tanggal
   const fetchEditActivitiesByDate = useCallback(async (date) => {
       if (!date) {
           setEditAvailableActivities(initialActivities);
           return;
       }

       setIsLoadingEditActivities(true);
       try {
           const response = await axios.post(route('cost-activity-allocations.activities-by-date'), {
               date: date
           });
           
           setEditAvailableActivities(response.data.activities);
           
           // Reset activity selection jika aktivitas yang dipilih tidak tersedia untuk tanggal ini
           if (editData.activity_id && !response.data.activities.find(a => a.id == editData.activity_id)) {
               setEditData(prev => ({ ...prev, activity_id: "" }));
           }
           
       } catch (error) {
           console.error('Error fetching edit activities:', error);
           setEditAvailableActivities([]);
       } finally {
           setIsLoadingEditActivities(false);
       }
   }, [editData.activity_id, setEditData, initialActivities]);

   // Effect untuk fetch aktivitas edit ketika tanggal berubah
   useEffect(() => {
       if (isEditDialogOpen && editData.allocation_date) {
           fetchEditActivitiesByDate(editData.allocation_date);
       }
   }, [editData.allocation_date, isEditDialogOpen, fetchEditActivitiesByDate]);

   // Fungsi untuk membuka dialog edit
   const openEditDialog = (allocation) => {
       setEditData({
           id: allocation.id,
           cost_id: allocation.cost_id,
           activity_id: allocation.activity_id,
           allocated_amount: allocation.allocated_amount,
           allocation_date: allocation.allocation_date,
           notes: allocation.notes,
       });
       setIsEditDialogOpen(true);
   };

   // Fungsi untuk memperbarui alokasi
   const handleUpdateAllocation = (e) => {
       e.preventDefault();
       put(route("cost-activity-allocations.update", editData.id), {
           onSuccess: () => {
               setIsEditDialogOpen(false);
               editReset();
           },
           onError: (formErrors) => {
               console.error("Gagal memperbarui alokasi:", formErrors);
           },
       });
   };

   const handleSearch = () => {
       router.get(
           route("cost-activity-allocations.index"),
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
                   <h2 className="text-2xl font-bold dark:text-gray-100">
                       Alokasi Biaya
                   </h2>
               </div>
           }
       >
           <Head title="Alokasi Biaya ke Aktivitas" />

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
                       {/* Formulir Tambah Alokasi */}
                       <Card className="shadow-xl bg-purple-600 border-0 overflow-hidden">
                           <div className="relative">
                               <CardHeader className="pb-6 bg-purple-700 border-b border-purple-500">
                                   <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                                       <div className="p-2 rounded-lg bg-white/20">
                                           <Plus className="h-6 w-6 text-white" />
                                       </div>
                                       <span className="text-white">
                                           Tambah Alokasi Baru
                                       </span>
                                   </CardTitle>
                                   <p className="text-purple-100 text-sm mt-2 font-medium">
                                       Masukkan informasi alokasi biaya ke aktivitas.
                                   </p>
                               </CardHeader>

                               <CardContent className="pt-6 px-6 pb-6">
                                   <form onSubmit={handleAddAllocation} className="space-y-6">
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                           {/* Input Tanggal Alokasi - Pindah ke atas */}
                                           <div className="space-y-3 md:col-span-1">
                                               <Label htmlFor="allocationDate" className="text-sm font-semibold text-white flex items-center gap-2">
                                                   Tanggal Alokasi
                                               </Label>
                                               <div className="relative">
                                                   <Input
                                                       id="allocationDate"
                                                       type="date"
                                                       value={data.allocation_date}
                                                       onChange={(e) => setData("allocation_date", e.target.value)}
                                                       className="bg-white border-0 focus:ring-2 focus:ring-purple-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                   />
                                               </div>
                                               {errors.allocation_date && (
                                                   <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                       <p className="text-red-700 text-xs font-medium flex items-center">
                                                           <AlertCircle className="h-3 w-3 mr-2" />
                                                           {errors.allocation_date}
                                                       </p>
                                                   </div>
                                               )}
                                           </div>

                                           {/* Input Biaya (Select) */}
                                           <div className="space-y-3">
                                               <Label htmlFor="cost_id" className="text-sm font-semibold text-white flex items-center gap-2">
                                                   Biaya
                                               </Label>
                                               <div className="relative">
                                                   <Select
                                                       value={data.cost_id ? data.cost_id.toString() : ""}
                                                       onValueChange={(value) => setData("cost_id", value ? parseInt(value) : null)}
                                                   >
                                                       <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4">
                                                           <SelectValue placeholder="Pilih Biaya" />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                           {costs.map((cost) => (
                                                               <SelectItem key={cost.id} value={cost.id.toString()}>
                                                                   {cost.name}
                                                               </SelectItem>
                                                           ))}
                                                       </SelectContent>
                                                   </Select>
                                               </div>
                                               {errors.cost_id && (
                                                   <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                       <p className="text-red-700 text-xs font-medium flex items-center">
                                                           <AlertCircle className="h-3 w-3 mr-2" />
                                                           {errors.cost_id}
                                                       </p>
                                                   </div>
                                               )}
                                           </div>

                                           {/* Input Aktivitas (Select) - Dinamis berdasarkan tanggal */}
                                           <div className="space-y-3">
                                               <Label htmlFor="activity_id" className="text-sm font-semibold text-white flex items-center gap-2">
                                                   Aktivitas
                                                   {isLoadingActivities && (
                                                       <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                                   )}
                                               </Label>
                                               <div className="relative">
                                                   <Select
                                                       value={data.activity_id ? data.activity_id.toString() : ""}
                                                       onValueChange={(value) => setData("activity_id", value ? parseInt(value) : null)}
                                                       disabled={isLoadingActivities || !data.allocation_date}
                                                   >
                                                       <SelectTrigger className="bg-white border-0 focus:ring-2 focus:ring-green-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4">
                                                           <SelectValue 
                                                               placeholder={
                                                                   !data.allocation_date 
                                                                       ? "Pilih tanggal terlebih dahulu" 
                                                                       : isLoadingActivities 
                                                                           ? "Memuat aktivitas..." 
                                                                           : availableActivities.length === 0 
                                                                               ? "Tidak ada aktivitas untuk tanggal ini" 
                                                                               : "Pilih Aktivitas"
                                                               } 
                                                           />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                           {availableActivities.map((activity) => (
                                                               <SelectItem key={activity.id} value={activity.id.toString()}>
                                                                   {activity.name}
                                                               </SelectItem>
                                                           ))}
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

                                           {/* Input Jumlah Dialokasikan */}
                                           <div className="space-y-3 md:col-span-3">
                                               <Label htmlFor="allocatedAmount" className="text-sm font-semibold text-white flex items-center gap-2">
                                                   Jumlah Dialokasikan
                                               </Label>
                                               <div className="relative">
                                                   <Input
                                                       id="allocatedAmount"
                                                       type="text"
                                                       placeholder="Otomatis dihitung berdasarkan penggunaan sumber daya"
                                                       value={calculatedAmount}
                                                       readOnly
                                                       className={`border-0 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4 ${
                                                           isCalculating 
                                                               ? "bg-yellow-50 text-yellow-800" 
                                                               : calculatedAmount && !isNaN(calculatedAmount)
                                                                   ? "bg-green-50 text-green-800 font-semibold"
                                                                   : calculatedAmount && isNaN(calculatedAmount)
                                                                       ? "bg-red-50 text-red-800"
                                                                       : "bg-gray-100 text-gray-600"
                                                       }`}
                                                   />
                                               </div>
                                               {errors.allocated_amount && (
                                                   <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                                       <p className="text-red-700 text-xs font-medium flex items-center">
                                                           <AlertCircle className="h-3 w-3 mr-2" />
                                                           {errors.allocated_amount}
                                                       </p>
                                                   </div>
                                               )}
                                           </div>

                                           {/* Input Catatan (Opsional) */}
                                           <div className="space-y-3 md:col-span-3">
                                               <Label htmlFor="notes" className="text-sm font-semibold text-white flex items-center gap-2">
                                                   Catatan (Opsional)
                                               </Label>
                                               <div className="relative">
                                                   <Textarea
                                                       id="notes"
                                                       placeholder="Catatan tambahan tentang alokasi ini..."
                                                       value={data.notes}
                                                       onChange={(e) => setData("notes", e.target.value)}
                                                       className="bg-white border-0 focus:ring-2 focus:ring-indigo-400 transition-all duration-300 text-gray-800 placeholder:text-gray-500 shadow-lg rounded-lg py-3 px-4"
                                                       rows={3}
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
                                       <div className="flex justify-end pt-6 border-t border-purple-500">
                                           <Button
                                               type="submit"
                                               disabled={processing || !calculatedAmount || isNaN(calculatedAmount)}
                                               className="bg-white hover:bg-gray-50 text-purple-600 font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                           >
                                               {processing ? (
                                                   <div className="flex items-center justify-center">
                                                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent mr-3"></div>
                                                       <span className="font-semibold">Menambahkan...</span>
                                                   </div>
                                               ) : (
                                                   <div className="flex items-center justify-center group">
                                                       <div className="p-1 rounded-full bg-purple-600 mr-3 group-hover:bg-purple-700 transition-colors duration-300">
                                                           <Plus className="h-4 w-4 text-white" />
                                                       </div>
                                                       <span className="font-semibold">Tambah Alokasi</span>
                                                   </div>
                                               )}
                                           </Button>
                                       </div>
                                   </form>
                               </CardContent>
                           </div>
                       </Card>

                       {/* Tabel Daftar Alokasi */}
                       <Card className="shadow-md">
                           <CardHeader className="pb-4">
                               <CardTitle className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                   <div className="text-2xl font-bold">
                                       Daftar Alokasi Biaya
                                   </div>

                                   <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
                                       {/* Input Search */}
                                       <div className="relative w-full md:w-[300px] lg:w-[400px]">
                                           <Input
                                               type="text"
                                               placeholder="Cari biaya atau aktivitas..."
                                               value={search}
                                               onKeyPress={handleKeyPress}
                                               onChange={(e) => setSearch(e.target.value)}
                                               className="pr-12"
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
                                                   route("cost-activity-allocations.index"),
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
                                               <SelectItem value={String(allocations.total)}>
                                                   All
                                               </SelectItem>
                                           </SelectContent>
                                       </Select>

                                       {/* Badge total alokasi */}
                                       <div className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded whitespace-nowrap">
                                           {allocations.total} Alokasi
                                       </div>
                                   </div>
                               </CardTitle>
                           </CardHeader>
                           <CardContent className="pt-0">
                               {allocations.data.length === 0 ? (
                                   <div className="text-center py-16">
                                       <Coffee className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                       <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                           Belum ada alokasi
                                       </h3>
                                       <p className="text-gray-500 text-lg">
                                           Mulai tambahkan alokasi biaya ke aktivitas.
                                       </p>
                                   </div>
                               ) : (
                                   <div className="overflow-x-auto">
                                       <Card>
                                           <Table>
                                               <TableHeader>
                                                   <TableRow>
                                                       <TableHead className="w-16 text-center font-bold">No.</TableHead>
                                                       <TableHead className="font-bold">Biaya</TableHead>
                                                       <TableHead className="font-bold">Aktivitas</TableHead>
                                                       <TableHead className="font-bold">Jumlah</TableHead>
                                                       <TableHead className="font-bold">Tanggal Alokasi</TableHead>
                                                       <TableHead className="font-bold">Catatan</TableHead>
                                                       <TableHead className="w-32 text-center font-bold">Aksi</TableHead>
                                                   </TableRow>
                                               </TableHeader>
                                               <TableBody>
                                                   {allocations.data.map((allocation, index) => (
                                                       <TableRow key={allocation.id} className="transition-colors duration-200 border-b">
                                                           <TableCell className="text-center">
                                                               <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                                                                   {allocations.from + index}
                                                               </div>
                                                           </TableCell>
                                                           <TableCell className="font-semibold">
                                                               {allocation.cost?.name}
                                                           </TableCell>
                                                           <TableCell className="font-semibold">
                                                               {allocation.activity?.name}
                                                           </TableCell>
                                                           <TableCell>
                                                               {allocation.allocated_amount ? (
                                                                   <div className="flex items-center space-x-1">
                                                                       <span>
                                                                           Rp {new Intl.NumberFormat("id-ID").format(allocation.allocated_amount)}
                                                                       </span>
                                                                   </div>
                                                               ) : (
                                                                   <span className="text-gray-400 italic">-</span>
                                                               )}
                                                           </TableCell>
                                                           <TableCell className="max-w-xs">
                                                               {allocation.allocation_date ? (
                                                                   <div className="truncate" title={dayjs(allocation.allocation_date).format("YYYY-MM-DD")}>
                                                                       {dayjs(allocation.allocation_date).format("DD/MM/YYYY")}
                                                                   </div>
                                                               ) : (
                                                                   <span className="text-gray-400 italic">-</span>
                                                               )}
                                                           </TableCell>
                                                           <TableCell className="max-w-xs">
                                                               {allocation.notes ? (
                                                                   <div className="truncate" title={allocation.notes}>
                                                                       {allocation.notes}
                                                                   </div>
                                                               ) : (
                                                                   <span className="text-gray-400 italic">-</span>
                                                               )}
                                                           </TableCell>
                                                           <TableCell className="text-center">
                                                               <div className="flex justify-center space-x-1">
                                                                   <Button
                                                                       variant="outline"
                                                                       size="sm"
                                                                       onClick={() => openEditDialog(allocation)}
                                                                       className="text-purple-600 border-purple-200 hover:bg-purple-700 hover:border-purple-300 transition-all duration-200 p-2 bg-purple-700"
                                                                       title="Edit Alokasi"
                                                                   >
                                                                       <Edit3 className="h-4 w-4 text-purple-50" />
                                                                   </Button>
                                                                   <Button
                                                                       variant="outline"
                                                                       size="sm"
                                                                       onClick={() => confirmDelete(allocation)}
                                                                       className="text-red-600 border-red-200 hover:bg-red-700 hover:border-red-300 transition-all duration-200 p-2 bg-red-700"
                                                                       title="Hapus Alokasi"
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
                                       {allocations.total > perPage && (
                                           <Pagination className="mt-4">
                                               <PaginationContent>
                                                   {allocations.links.map((link, index) => (
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
                                                                           ? "bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
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
                           <DialogTitle className="text-lg font-bold">
                               Konfirmasi Hapus
                           </DialogTitle>
                       </div>
                       <DialogDescription className="text-gray-600 mt-3">
                           Apakah Anda yakin ingin menghapus alokasi biaya ini? 
                           Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang permanen.
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
                           onClick={handleDeleteAllocation}
                           className="flex-1 bg-red-600 hover:bg-red-700"
                       >
                           <Trash2 className="h-4 w-4 mr-1" />
                           Hapus Alokasi
                       </Button>
                   </DialogFooter>
               </DialogContent>
           </Dialog>

           {/* Dialog Edit Alokasi */}
           <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
               <DialogContent className="sm:max-w-2xl">
                   <DialogHeader>
                       <div className="flex items-center space-x-2">
                           <div className="bg-purple-100 p-2 rounded-full">
                               <Edit3 className="h-5 w-5 text-purple-600" />
                           </div>
                           <DialogTitle className="text-lg font-bold">
                               Edit Alokasi Biaya
                           </DialogTitle>
                       </div>
                       <DialogDescription className="text-gray-600 mt-2">
                           Perbarui informasi alokasi biaya Anda di bawah ini.
                       </DialogDescription>
                   </DialogHeader>

                   <form onSubmit={handleUpdateAllocation} className="space-y-4 mt-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Edit Tanggal Alokasi */}
                           <div>
                               <Label htmlFor="editAllocationDate">Tanggal Alokasi</Label>
                               <Input
                                   id="editAllocationDate"
                                   type="date"
                                   value={editData.allocation_date}
                                   onChange={(e) => setEditData("allocation_date", e.target.value)}
                                   className="mt-1"
                               />
                               {editErrors.allocation_date && (
                                   <div className="text-red-500 text-sm mt-1">
                                       {editErrors.allocation_date}
                                   </div>
                               )}
                           </div>

                           {/* Edit Biaya */}
                           <div>
                               <Label htmlFor="editCostId">Biaya</Label>
                               <Select
                                   value={editData.cost_id.toString()}
                                   onValueChange={(value) => setEditData("cost_id", parseInt(value))}
                               >
                                   <SelectTrigger className="w-full mt-1">
                                       <SelectValue placeholder="Pilih Biaya" />
                                   </SelectTrigger>
                                   <SelectContent>
                                       {costs.map((cost) => (
                                           <SelectItem key={cost.id} value={cost.id.toString()}>
                                               {cost.name}
                                           </SelectItem>
                                       ))}
                                   </SelectContent>
                               </Select>
                               {editErrors.cost_id && (
                                   <div className="text-red-500 text-sm mt-1">
                                       {editErrors.cost_id}
                                   </div>
                               )}
                           </div>

                           {/* Edit Aktivitas - Dinamis berdasarkan tanggal */}
                           <div>
                               <Label htmlFor="editActivityId">
                                   Aktivitas
                                   {isLoadingEditActivities && (
                                       <div className="inline-block ml-2 animate-spin rounded-full h-3 w-3 border-2 border-gray-600 border-t-transparent"></div>
                                   )}
                               </Label>
                               <Select
                                   value={editData.activity_id.toString()}
                                   onValueChange={(value) => setEditData("activity_id", parseInt(value))}
                                   disabled={isLoadingEditActivities || !editData.allocation_date}
                               >
                                   <SelectTrigger className="w-full mt-1">
                                       <SelectValue placeholder={
                                           !editData.allocation_date 
                                               ? "Pilih tanggal terlebih dahulu" 
                                               : isLoadingEditActivities 
                                                   ? "Memuat aktivitas..." 
                                                   : editAvailableActivities.length === 0 
                                                       ? "Tidak ada aktivitas untuk tanggal ini" 
                                                       : "Pilih Aktivitas"
                                       } />
                                   </SelectTrigger>
                                   <SelectContent>
                                       {editAvailableActivities.map((activity) => (
                                           <SelectItem key={activity.id} value={activity.id.toString()}>
                                               {activity.name}
                                           </SelectItem>
                                       ))}
                                   </SelectContent>
                               </Select>
                               {editErrors.activity_id && (
                                   <div className="text-red-500 text-sm mt-1">
                                       {editErrors.activity_id}
                                   </div>
                               )}
                           </div>

                           {/* Edit Jumlah Dialokasikan */}
                           <div>
                               <Label htmlFor="editAllocatedAmount">Jumlah Dialokasikan</Label>
                               <Input
                                   id="editAllocatedAmount"
                                   type="number"
                                   step="0.01"
                                   value={editData.allocated_amount}
                                   onChange={(e) => setEditData("allocated_amount", e.target.value)}
                                   className="mt-1"
                               />
                               {editErrors.allocated_amount && (
                                   <div className="text-red-500 text-sm mt-1">
                                       {editErrors.allocated_amount}
                                   </div>
                               )}
                           </div>

                           {/* Edit Catatan */}
                           <div className="md:col-span-2">
                               <Label htmlFor="editNotes">Catatan (Opsional)</Label>
                               <Textarea
                                   id="editNotes"
                                   value={editData.notes}
                                   onChange={(e) => setEditData("notes", e.target.value)}
                                   className="mt-1"
                                   rows={3}
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
                               className="flex-1 bg-purple-600 hover:bg-purple-700"
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