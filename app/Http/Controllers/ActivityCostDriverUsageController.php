<?php
// sudut-timur-backend/app/Http/Controllers/ActivityCostDriverUsageController.php

namespace App\Http\Controllers;

use App\Models\ActivityCostDriverUsage;
use App\Models\Activity;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use App\Exports\ActivityCostDriverUsageExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Product;
use Inertia\Inertia;

class ActivityCostDriverUsageController extends Controller
{
    public function index(Request $request)
    {
        // Get filters from request
        $search = $request->get('search');
        $perPage = $request->get('perPage', 10);
        $activityId = $request->get('activity_id');
        $costDriverId = $request->get('cost_driver_id');
        $usageDate = $request->get('usage_date');
        
        // Get sorting parameters
        $sortBy = $request->get('sort_by', 'created_at'); // Default sort by created_at
        $sortOrder = $request->get('sort_order', 'desc'); // Default descending (terbaru di atas)

        // Build query with eager loading
        $query = ActivityCostDriverUsage::with(['activity', 'costDriver']);

        // Apply sorting - pastikan data terbaru di atas
        $allowedSortFields = ['created_at', 'updated_at', 'usage_date', 'usage_quantity'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            // Default: data yang baru ditambahkan muncul di atas
            $query->orderBy('created_at', 'desc');
        }
        
        // Tambahan: jika sort by created_at, tambahkan secondary sort
        if ($sortBy === 'created_at') {
            $query->orderBy('id', 'desc'); // Untuk memastikan urutan yang konsisten
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('activity', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('costDriver', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhere('notes', 'like', '%' . $search . '%')
                ->orWhere('usage_quantity', 'like', '%' . $search . '%');
            });
        }

        // Apply activity filter
        if ($activityId) {
            $query->where('activity_id', $activityId);
        }

        // Apply cost driver filter
        if ($costDriverId) {
            $query->where('cost_driver_id', $costDriverId);
        }

        // Apply usage date filter
        if ($usageDate) {
            $query->whereDate('usage_date', $usageDate);
        }

        // Handle "All" case - if perPage equals total count, don't paginate
        $totalCount = $query->count();
        
        if ($perPage == $totalCount || $perPage == 'all') {
            $usages = $query->get();
            
            // Create a mock pagination object for frontend consistency
            $paginatedUsages = new \Illuminate\Pagination\LengthAwarePaginator(
                $usages,
                $totalCount,
                $totalCount,
                1,
                [
                    'path' => $request->url(),
                    'pageName' => 'page',
                ]
            );
            $paginatedUsages->appends($request->query());
        } else {
            // Use pagination
            $paginatedUsages = $query->paginate($perPage);
            $paginatedUsages->appends($request->query());
        }

        $activities = Activity::all(['id', 'name']);
        $costDrivers = CostDriver::all(['id', 'name', 'unit']);
        $products = Product::all();

        return Inertia::render('ActivityCostDriverUsages/Index', [
            'usages' => $paginatedUsages,
            'activities' => $activities,
            'products' => $products,
            'costDrivers' => $costDrivers,
            'filters' => [
                'search' => $search,
                'activity_id' => $activityId,
                'cost_driver_id' => $costDriverId,
                'usage_date' => $usageDate,
                'perPage' => $perPage,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'cost_driver_id' => 'required|exists:cost_drivers,id',
                'usage_quantity' => 'required|numeric|min:0',
                'usage_date' => 'required|date',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Check for unique combination if needed
            $existingUsage = ActivityCostDriverUsage::where('activity_id', $validated['activity_id'])
                ->where('cost_driver_id', $validated['cost_driver_id'])
                ->where('usage_date', $validated['usage_date'])
                ->first();

            if ($existingUsage) {
                return redirect()->back()->withErrors([
                    'unique_allocation' => 'Kombinasi aktivitas, cost driver, dan tanggal ini sudah ada. Silakan gunakan kombinasi yang berbeda atau edit data yang sudah ada.'
                ]);
            }

            // Buat record baru
            $newUsage = ActivityCostDriverUsage::create($validated);

            // Redirect ke halaman pertama untuk melihat data yang baru ditambahkan
            return redirect()->route('activity-cost-driver-usages.index', [
                'page' => 1,
                'sort_by' => 'created_at',
                'sort_order' => 'desc'
            ])->with('success', 'Penggunaan Driver Biaya berhasil ditambahkan!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function update(Request $request, ActivityCostDriverUsage $activityCostDriverUsage)
    {
        try {
            $validated = $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'cost_driver_id' => 'required|exists:cost_drivers,id',
                'usage_quantity' => 'required|numeric|min:0',
                'usage_date' => 'required|date',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Check for unique combination excluding current record
            $existingUsage = ActivityCostDriverUsage::where('activity_id', $validated['activity_id'])
                ->where('cost_driver_id', $validated['cost_driver_id'])
                ->where('usage_date', $validated['usage_date'])
                ->where('id', '!=', $activityCostDriverUsage->id)
                ->first();

            if ($existingUsage) {
                return redirect()->back()->withErrors([
                    'unique_allocation' => 'Kombinasi aktivitas, cost driver, dan tanggal ini sudah ada. Silakan gunakan kombinasi yang berbeda.'
                ]);
            }

            $activityCostDriverUsage->update($validated);

            return redirect()->route('activity-cost-driver-usages.index')
                ->with('success', 'Penggunaan Driver Biaya berhasil diperbarui!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage()]);
        }
    }

    public function destroy(ActivityCostDriverUsage $activityCostDriverUsage)
    {
        try {
            $activityCostDriverUsage->delete();

            return redirect()->route('activity-cost-driver-usages.index')
                ->with('success', 'Penggunaan Driver Biaya berhasil dihapus!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage()]);
        }
    }

    public function exportExcel(Request $request)
    {
        $search = $request->get('search');
        return Excel::download(
            new ActivityCostDriverUsageExport($search), 
            'activity_cost_driver_usages_' . date('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    public function exportPdf(Request $request)
    {
        $search = $request->get('search');
        
        $query = ActivityCostDriverUsage::with(['activity', 'costDriver'])
            ->orderBy('created_at', 'desc'); // Ubah ke created_at untuk konsistensi

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('activity', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('costDriver', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhere('notes', 'like', '%' . $search . '%');
            });
        }

        $usages = $query->get();

        $pdf = Pdf::loadView('exports.activity-cost-driver-usages', compact('usages', 'search'));
        return $pdf->stream('activity_cost_driver_usages_' . date('Y-m-d_H-i-s') . '.pdf');
    }
}