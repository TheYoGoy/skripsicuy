<?php
// sudut-timur-backend/app/Http/Controllers/ProductActivityUsageController.php

namespace App\Http\Controllers;

use App\Models\ProductActivityUsage;
use App\Models\CostActivityAllocation;
use App\Models\ActivityCostDriverUsage; // TAMBAHAN IMPORT
use App\Models\Product;
use App\Models\Activity;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use App\Exports\ProductActivityUsagesExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductActivityUsageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('perPage', 10);
        $search = $request->input('search');

        $query = ProductActivityUsage::with(['product', 'activity', 'costDriver']);

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        $usages = $query->orderBy('created_at', 'desc')
            ->orderBy('usage_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $products = Product::all(['id', 'name']);
        $activities = Activity::all(['id', 'name']);
        $costDrivers = CostDriver::all(['id', 'name', 'unit']);

        return Inertia::render('ProductActivityUsages/Index', [
            'usages' => $usages,
            'products' => $products,
            'activities' => $activities,
            'costDrivers' => $costDrivers,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ]
        ]);
    }

    /**
     * FIXED: ABC Stage 2 calculation method
     * Activity → Product allocation using ActivityCostDriverUsage as base
     */
    private function calculateAllocation($activityId, $costDriverId, $quantityConsumed, $usageDate, $excludeId = null)
    {
        \Log::info('=== CALCULATE ALLOCATION START (FIXED) ===', [
            'activity_id' => $activityId,
            'cost_driver_id' => $costDriverId,
            'quantity_consumed' => $quantityConsumed,
            'usage_date' => $usageDate,
            'exclude_id' => $excludeId
        ]);

        // 1. Ambil total biaya aktivitas dari CostActivityAllocation untuk bulan/tahun yang sama
        $totalActivityCost = CostActivityAllocation::where('activity_id', $activityId)
            ->whereMonth('allocation_date', date('m', strtotime($usageDate)))
            ->whereYear('allocation_date', date('Y', strtotime($usageDate)))
            ->sum('allocated_amount');

        \Log::info('Total activity cost', ['total' => $totalActivityCost]);

        if ($totalActivityCost <= 0) {
            return [
                'success' => false,
                'error' => 'NO_ACTIVITY_COST',
                'message' => 'Belum ada alokasi biaya untuk aktivitas ini pada bulan tersebut.'
            ];
        }

        // 2. FIXED: Ambil total usage dari ActivityCostDriverUsage (bukan dari ProductActivityUsage)
        $totalDriverUsage = ActivityCostDriverUsage::where('activity_id', $activityId)
            ->where('cost_driver_id', $costDriverId)
            ->whereMonth('usage_date', date('m', strtotime($usageDate)))
            ->whereYear('usage_date', date('Y', strtotime($usageDate)))
            ->sum('usage_quantity');

        \Log::info('Total driver usage from ActivityCostDriverUsage', [
            'total_driver_usage' => $totalDriverUsage,
            'activity_id' => $activityId,
            'cost_driver_id' => $costDriverId,
            'month' => date('m', strtotime($usageDate)),
            'year' => date('Y', strtotime($usageDate))
        ]);

        if ($totalDriverUsage <= 0) {
            return [
                'success' => false,
                'error' => 'NO_DRIVER_USAGE_DATA',
                'message' => 'Belum ada data penggunaan driver untuk aktivitas ini pada bulan tersebut.'
            ];
        }

        // 3. FIXED: Hitung cost per unit berdasarkan ActivityCostDriverUsage
        $costPerUnit = $totalActivityCost / $totalDriverUsage;
        $allocatedAmount = $costPerUnit * $quantityConsumed;

        \Log::info('Final calculation (FIXED)', [
            'total_activity_cost' => $totalActivityCost,
            'total_driver_usage' => $totalDriverUsage,
            'cost_per_unit' => $costPerUnit,
            'quantity_consumed' => $quantityConsumed,
            'allocated_amount' => $allocatedAmount,
            'formula' => "({$totalActivityCost} / {$totalDriverUsage}) * {$quantityConsumed}"
        ]);

        return [
            'success' => true,
            'allocated_amount' => round($allocatedAmount, 2),
            'cost_per_unit' => round($costPerUnit, 2),
            'total_activity_cost' => $totalActivityCost,
            'total_driver_usage' => $totalDriverUsage
        ];
    }

    // METHOD untuk preview calculation (untuk real-time calculation di frontend)
    public function calculate(Request $request)
    {
        \Log::info('=== PRODUCT ACTIVITY CALCULATE START (FIXED) ===');
        \Log::info('Request data: ' . json_encode($request->all()));

        // Validasi request
        try {
            $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'cost_driver_id' => 'required|exists:cost_drivers,id',
                'quantity_consumed' => 'required|numeric|min:0',
                'usage_date' => 'required|date',
            ]);
        } catch (\Exception $e) {
            \Log::error('Validation failed: ' . $e->getMessage());
            return response()->json(['error' => 'VALIDATION_ERROR', 'message' => $e->getMessage()], 422);
        }

        $result = $this->calculateAllocation(
            $request->activity_id,
            $request->cost_driver_id,
            $request->quantity_consumed,
            $request->usage_date
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
                'error' => $result['error']
            ], 422);
        }

        return response()->json([
            'allocated_amount' => $result['allocated_amount'],
            'cost_per_unit' => $result['cost_per_unit']
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('=== PRODUCT ACTIVITY USAGE STORE START (FIXED) ===');
        \Log::info('Request data:', $request->all());

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'quantity_consumed' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Gunakan database transaction untuk consistency
        return DB::transaction(function () use ($request) {
            // Check for unique constraint
            $existingUsage = ProductActivityUsage::where('product_id', $request->product_id)
                ->where('activity_id', $request->activity_id)
                ->where('cost_driver_id', $request->cost_driver_id)
                ->where('usage_date', $request->usage_date)
                ->first();

            if ($existingUsage) {
                return back()->withErrors([
                    'unique_usage' => 'Penggunaan aktivitas ini oleh produk ini dengan driver biaya ini pada tanggal tersebut sudah ada.'
                ])->withInput();
            }

            // Hitung alokasi biaya menggunakan shared method
            $calculation = $this->calculateAllocation(
                $request->activity_id,
                $request->cost_driver_id,
                $request->quantity_consumed,
                $request->usage_date
            );

            if (!$calculation['success']) {
                return back()->withErrors([
                    'allocated_amount' => $calculation['message']
                ])->withInput();
            }

            // Simpan data dengan allocated amount yang dihitung
            ProductActivityUsage::create([
                'product_id' => $request->product_id,
                'activity_id' => $request->activity_id,
                'cost_driver_id' => $request->cost_driver_id,
                'quantity_consumed' => $request->quantity_consumed,
                'allocated_amount' => $calculation['allocated_amount'],
                'usage_date' => $request->usage_date,
                'notes' => $request->notes,
            ]);

            return redirect()->route('product-activity-usages.index')
                ->with('success', 'Penggunaan Aktivitas per Produk berhasil ditambahkan!');
        });
    }

    public function update(Request $request, ProductActivityUsage $productActivityUsage)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'quantity_consumed' => 'required|numeric|min:0',
            'allocated_amount' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $productActivityUsage) {
            // Check for unique constraint excluding current record
            $existingUsage = ProductActivityUsage::where('product_id', $request->product_id)
                ->where('activity_id', $request->activity_id)
                ->where('cost_driver_id', $request->cost_driver_id)
                ->where('usage_date', $request->usage_date)
                ->where('id', '!=', $productActivityUsage->id)
                ->first();

            if ($existingUsage) {
                return back()->withErrors([
                    'unique_usage' => 'Penggunaan aktivitas ini oleh produk ini dengan driver biaya ini pada tanggal tersebut sudah ada.'
                ])->withInput();
            }

            // Update menggunakan nilai yang diinput manual atau hitung ulang jika diperlukan
            $productActivityUsage->update([
                'product_id' => $request->product_id,
                'activity_id' => $request->activity_id,
                'cost_driver_id' => $request->cost_driver_id,
                'quantity_consumed' => $request->quantity_consumed,
                'allocated_amount' => $request->allocated_amount, // Allow manual override for now
                'usage_date' => $request->usage_date,
                'notes' => $request->notes,
            ]);

            return redirect()->route('product-activity-usages.index')
                ->with('success', 'Penggunaan Aktivitas per Produk berhasil diperbarui!');
        });
    }

    public function destroy(ProductActivityUsage $productActivityUsage)
    {
        $productActivityUsage->delete();
        return redirect()->route('product-activity-usages.index')
            ->with('success', 'Penggunaan Aktivitas per Produk berhasil dihapus!');
    }

    /**
     * Recalculate semua allocated_amount yang NULL atau 0
     */
    public function recalculateAll()
    {
        \Log::info('=== RECALCULATE ALL START (FIXED) ===');

        try {
            // Ambil semua records yang allocated_amount-nya NULL atau 0
            $usages = ProductActivityUsage::whereNull('allocated_amount')
                ->orWhere('allocated_amount', 0)
                ->get();

            $successCount = 0;
            $errorCount = 0;
            $errors = [];

            foreach ($usages as $usage) {
                try {
                    $calculation = $this->calculateAllocation(
                        $usage->activity_id,
                        $usage->cost_driver_id,
                        $usage->quantity_consumed,
                        $usage->usage_date,
                        $usage->id // exclude current record
                    );

                    if ($calculation['success']) {
                        $usage->update([
                            'allocated_amount' => $calculation['allocated_amount']
                        ]);
                        $successCount++;

                        \Log::info("Updated usage ID {$usage->id}", [
                            'old_amount' => $usage->allocated_amount,
                            'new_amount' => $calculation['allocated_amount']
                        ]);
                    } else {
                        $errorCount++;
                        $errors[] = [
                            'id' => $usage->id,
                            'product' => $usage->product->name ?? 'Unknown',
                            'activity' => $usage->activity->name ?? 'Unknown',
                            'error' => $calculation['message']
                        ];

                        \Log::warning("Failed to calculate usage ID {$usage->id}: {$calculation['message']}");
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    $errors[] = [
                        'id' => $usage->id,
                        'product' => $usage->product->name ?? 'Unknown',
                        'activity' => $usage->activity->name ?? 'Unknown',
                        'error' => $e->getMessage()
                    ];

                    \Log::error("Exception for usage ID {$usage->id}: " . $e->getMessage());
                }
            }

            $result = [
                'success' => true,
                'message' => "Recalculation completed. Success: {$successCount}, Errors: {$errorCount}",
                'details' => [
                    'total_processed' => $usages->count(),
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                    'errors' => $errors
                ]
            ];

            \Log::info('=== RECALCULATE ALL COMPLETED (FIXED) ===', $result);

            return response()->json($result);
        } catch (\Exception $e) {
            \Log::error('Recalculate all failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Recalculation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check missing prerequisites untuk calculation
     */
    public function checkPrerequisites()
    {
        try {
            // 1. Check activities yang tidak punya CostActivityAllocation
            $activitiesWithoutCost = DB::table('activities')
                ->leftJoin('cost_activity_allocations', 'activities.id', '=', 'cost_activity_allocations.activity_id')
                ->whereNull('cost_activity_allocations.activity_id')
                ->select('activities.id', 'activities.name')
                ->get();

            // 2. Check ProductActivityUsage yang punya masalah
            $problematicUsages = DB::table('product_activity_usages as pau')
                ->join('products as p', 'pau.product_id', '=', 'p.id')
                ->join('activities as a', 'pau.activity_id', '=', 'a.id')
                ->join('cost_drivers as cd', 'pau.cost_driver_id', '=', 'cd.id')
                ->leftJoin('cost_activity_allocations as caa', function ($join) {
                    $join->on('pau.activity_id', '=', 'caa.activity_id')
                        ->whereRaw('MONTH(pau.usage_date) = MONTH(caa.allocation_date)')
                        ->whereRaw('YEAR(pau.usage_date) = YEAR(caa.allocation_date)');
                })
                ->where(function ($query) {
                    $query->whereNull('pau.allocated_amount')
                        ->orWhere('pau.allocated_amount', 0);
                })
                ->select(
                    'pau.id',
                    'p.name as product_name',
                    'a.name as activity_name',
                    'cd.name as cost_driver_name',
                    'pau.usage_date',
                    'pau.allocated_amount',
                    'caa.allocated_amount as activity_cost'
                )
                ->get();

            return response()->json([
                'activities_without_cost' => $activitiesWithoutCost,
                'problematic_usages' => $problematicUsages,
                'summary' => [
                    'activities_missing_cost' => $activitiesWithoutCost->count(),
                    'usages_need_recalculation' => $problematicUsages->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to check prerequisites: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recalculate single usage by ID
     */
    public function recalculateSingle($id)
    {
        try {
            \Log::info("=== RECALCULATE SINGLE DEBUG START ===", ['id' => $id]);

            $usage = ProductActivityUsage::findOrFail($id);

            \Log::info("Found usage record", [
                'id' => $usage->id,
                'current_allocated_amount' => $usage->allocated_amount,
                'product' => $usage->product->name ?? 'Unknown',
                'activity' => $usage->activity->name ?? 'Unknown',
                'quantity_consumed' => $usage->quantity_consumed,
                'usage_date' => $usage->usage_date
            ]);

            $calculation = $this->calculateAllocation(
                $usage->activity_id,
                $usage->cost_driver_id,
                $usage->quantity_consumed,
                $usage->usage_date,
                $usage->id
            );

            \Log::info("Calculation result", $calculation);

            if ($calculation['success']) {
                $oldAmount = $usage->allocated_amount;

                // CRITICAL: Save to database
                $updated = $usage->update([
                    'allocated_amount' => $calculation['allocated_amount']
                ]);

                \Log::info("Database update result", [
                    'updated' => $updated,
                    'old_amount' => $oldAmount,
                    'new_amount' => $calculation['allocated_amount']
                ]);

                // Verify database update
                $usage->refresh();
                \Log::info("After refresh - allocated_amount", [
                    'allocated_amount' => $usage->allocated_amount
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Recalculation successful',
                    'data' => [
                        'old_amount' => $oldAmount,
                        'new_amount' => $calculation['allocated_amount'],
                        'cost_per_unit' => $calculation['cost_per_unit'],
                        'database_updated' => $updated
                    ]
                ]);
            } else {
                \Log::error("Calculation failed", $calculation);
                return response()->json([
                    'success' => false,
                    'message' => $calculation['message'],
                    'error' => $calculation['error']
                ], 422);
            }
        } catch (\Exception $e) {
            \Log::error("Exception in recalculateSingle", [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Recalculation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportExcel(Request $request)
    {
        $search = $request->input('search');
        return Excel::download(new ProductActivityUsagesExport($search), 'product-activity-usages.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $search = $request->input('search');

        $query = ProductActivityUsage::with(['product', 'activity', 'costDriver']);

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        $usages = $query->get();
        $pdf = Pdf::loadView('exports.product-activity-usages', compact('usages'));
        return $pdf->stream('product-activity-usages.pdf');
    }
}
