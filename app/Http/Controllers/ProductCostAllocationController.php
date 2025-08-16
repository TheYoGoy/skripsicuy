<?php
// app/Http/Controllers/ProductCostAllocationController.php

namespace App\Http\Controllers;

use App\Models\ProductCostAllocation;
use App\Models\CostActivityAllocation;
use App\Models\ActivityUsage;
use App\Models\Product;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCostAllocationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = ProductCostAllocation::with(['product', 'activity'])
            ->orderBy('allocation_date', 'desc');

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('activity', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $allocations = $query->paginate($perPage)->appends($request->all());
        $products = Product::all(['id', 'name']);
        $activities = Activity::all(['id', 'name']);

        return Inertia::render('ProductCostAllocations/Index', [
            'allocations' => $allocations,
            'products' => $products,
            'activities' => $activities,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'allocation_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat
        $existingAllocation = ProductCostAllocation::where('product_id', $request->product_id)
            ->where('activity_id', $request->activity_id)
            ->where('allocation_date', $request->allocation_date)
            ->first();

        if ($existingAllocation) {
            return redirect()->back()->withErrors([
                'unique_allocation' => 'Alokasi biaya aktivitas ini ke produk ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        // Hitung alokasi otomatis menggunakan formula ABC
        $calculatedAmount = $this->calculateProductAllocation(
            $request->product_id,
            $request->activity_id,
            $request->allocation_date
        );

        if ($calculatedAmount === false) {
            return redirect()->back()->withErrors([
                'calculation' => 'Tidak dapat menghitung alokasi. Pastikan data penggunaan aktivitas dan alokasi biaya ke aktivitas sudah tersedia.'
            ])->withInput();
        }

        ProductCostAllocation::create([
            'product_id' => $request->product_id,
            'activity_id' => $request->activity_id,
            'allocated_amount' => $calculatedAmount,
            'allocation_date' => $request->allocation_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('product-cost-allocations.index')
            ->with('success', 'Alokasi Biaya ke Produk berhasil ditambahkan!');
    }

    public function calculate(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'allocation_date' => 'required|date',
        ]);

        $allocatedAmount = $this->calculateProductAllocation(
            $request->product_id,
            $request->activity_id,
            $request->allocation_date
        );

        if ($allocatedAmount === false) {
            return response()->json([
                'message' => 'Tidak dapat menghitung alokasi. Data penggunaan aktivitas atau alokasi biaya belum tersedia.',
                'error' => 'CALCULATION_ERROR'
            ], 422);
        }

        return response()->json([
            'allocated_amount' => round($allocatedAmount, 2)
        ]);
    }

    private function calculateProductAllocation($productId, $activityId, $allocationDate)
    {
        try {
            // 1. Ambil total biaya yang dialokasikan ke aktivitas pada tanggal tersebut
            $activityTotalCost = CostActivityAllocation::where('activity_id', $activityId)
                ->whereDate('allocation_date', $allocationDate)
                ->sum('allocated_amount');

            if ($activityTotalCost <= 0) {
                return false; // Tidak ada biaya yang dialokasikan ke aktivitas ini
            }

            // 2. Hitung total penggunaan aktivitas oleh semua produk pada tanggal tersebut
            $totalActivityUsage = ActivityUsage::where('activity_id', $activityId)
                ->whereDate('usage_date', $allocationDate)
                ->sum('usage_quantity');

            if ($totalActivityUsage <= 0) {
                return false; // Tidak ada penggunaan aktivitas pada tanggal ini
            }

            // 3. Hitung penggunaan aktivitas oleh produk tertentu pada tanggal tersebut
            $productActivityUsage = ActivityUsage::where('activity_id', $activityId)
                ->where('product_id', $productId)
                ->whereDate('usage_date', $allocationDate)
                ->sum('usage_quantity');

            if ($productActivityUsage <= 0) {
                return false; // Produk ini tidak menggunakan aktivitas pada tanggal tersebut
            }

            // 4. Hitung alokasi menggunakan formula ABC
            // Formula: Biaya per Produk = (Biaya Aktivitas × Penggunaan Aktivitas oleh Produk) / Total Penggunaan Aktivitas
            $allocatedAmount = ($productActivityUsage / $totalActivityUsage) * $activityTotalCost;

            return $allocatedAmount;

        } catch (\Exception $e) {
            \Log::error('Product allocation calculation error: ' . $e->getMessage());
            return false;
        }
    }

    public function update(Request $request, ProductCostAllocation $productCostAllocation)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'allocated_amount' => 'required|numeric|min:0',
            'allocation_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat untuk update
        $existingAllocation = ProductCostAllocation::where('product_id', $request->product_id)
            ->where('activity_id', $request->activity_id)
            ->where('allocation_date', $request->allocation_date)
            ->where('id', '!=', $productCostAllocation->id)
            ->first();

        if ($existingAllocation) {
            return redirect()->back()->withErrors([
                'unique_allocation' => 'Alokasi biaya aktivitas ini ke produk ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        $productCostAllocation->update($request->all());

        return redirect()->route('product-cost-allocations.index')
            ->with('success', 'Alokasi Biaya ke Produk berhasil diperbarui!');
    }

    public function destroy(ProductCostAllocation $productCostAllocation)
    {
        $productCostAllocation->delete();

        return redirect()->route('product-cost-allocations.index')
            ->with('success', 'Alokasi Biaya ke Produk berhasil dihapus!');
    }
}