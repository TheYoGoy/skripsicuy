<?php
// sudut-timur-backend/app/Http/Controllers/CostActivityAllocationController.php

namespace App\Http\Controllers;

use App\Models\CostActivityAllocation;
use App\Models\ActivityCostDriverUsage;
use App\Models\Cost;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CostActivityAllocationController extends Controller
{
    /**
     * Display a listing of the cost activity allocations and render the Inertia page.
     * Also passes the lists of costs and activities for selection.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = CostActivityAllocation::with(['cost', 'activity'])
            ->orderBy('allocation_date', 'desc');

        if ($search) {
            $query->whereHas('cost', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('activity', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $allocations = $query
            ->paginate($perPage)
            ->appends($request->all());

        $costs = Cost::all(['id', 'name']); // For dropdown

        // FIXED: Only show activities that have usage data
        // Get activities that have ActivityCostDriverUsage data
        $activitiesWithUsage = Activity::whereHas('activityCostDriverUsages')
            ->get(['id', 'name']);

        // If no specific date filter, show all activities with any usage data
        // Frontend will handle date-specific filtering via AJAX
        $activities = $activitiesWithUsage;

        return Inertia::render('CostActivityAllocations/Index', [
            'allocations' => $allocations,
            'costs' => $costs,
            'activities' => $activities,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function getActivitiesByDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = $request->input('date');

        // Get activities that have usage data for the specific date
        $activities = Activity::whereHas('activityCostDriverUsages', function ($query) use ($date) {
            $query->whereMonth('usage_date', date('m', strtotime($date)))
                ->whereYear('usage_date', date('Y', strtotime($date)));
        })
            ->get(['id', 'name'])
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'name' => $activity->name,
                ];
            });

        return response()->json([
            'activities' => $activities
        ]);
    }

    /**
     * Store a newly created cost activity allocation record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        \Log::info('=== DEBUG FORM SUBMIT ===');
        \Log::info('Request data:', $request->all());
        \Log::info('Form data received:', $request->all());

        $request->validate([
            'cost_id' => 'required|exists:costs,id',
            'activity_id' => 'required|exists:activities,id',
            // 'allocated_amount' dihapus dari validasi karena akan dihitung otomatis
            'allocation_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat
        $existingAllocation = CostActivityAllocation::where('cost_id', $request->cost_id)
            ->where('activity_id', $request->activity_id)
            ->where('allocation_date', $request->allocation_date)
            ->first();

        if ($existingAllocation) {
            return redirect()->back()->withErrors([
                'unique_allocation' => 'Alokasi biaya ini ke aktivitas ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        // Ambil driver
        $cost = Cost::with('driver')->findOrFail($request->cost_id);
        $driverId = $cost->driver?->id;

        if (!$driverId) {
            return redirect()->back()->withErrors(['driver' => 'Biaya ini belum punya driver biaya.'])->withInput();
        }

        // Hitung total penggunaan driver
        $totalUsage = ActivityCostDriverUsage::where('cost_driver_id', $driverId)
            ->whereMonth('usage_date', date('m', strtotime($request->allocation_date)))
            ->whereYear('usage_date', date('Y', strtotime($request->allocation_date)))
            ->sum('usage_quantity');

        $activityUsage = ActivityCostDriverUsage::where('cost_driver_id', $driverId)
            ->where('activity_id', $request->activity_id)
            ->whereMonth('usage_date', date('m', strtotime($request->allocation_date)))
            ->whereYear('usage_date', date('Y', strtotime($request->allocation_date)))
            ->sum('usage_quantity');

        if ($totalUsage <= 0) {
            return redirect()->back()->withErrors([
                'usage' => 'Tidak ditemukan data penggunaan driver biaya pada tanggal ini.'
            ])->withInput();
        }

        if ($activityUsage <= 0) {
            return redirect()->back()->withErrors([
                'usage' => 'Aktivitas ini belum menggunakan driver biaya pada tanggal tersebut.'
            ])->withInput();
        }

        // Hitung alokasi otomatis
        $allocatedAmount = ($activityUsage / $totalUsage) * $cost->amount;

        CostActivityAllocation::create([
            'cost_id' => $request->cost_id,
            'activity_id' => $request->activity_id,
            'allocated_amount' => $allocatedAmount,
            'allocation_date' => $request->allocation_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('cost-activity-allocations.index')->with('success', 'Alokasi Biaya ke Aktivitas berhasil ditambahkan!');
    }

    /**
     * Update the specified cost activity allocation record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CostActivityAllocation  $costActivityAllocation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, CostActivityAllocation $costActivityAllocation)
    {
        $request->validate([
            'cost_id' => 'required|exists:costs,id',
            'activity_id' => 'required|exists:activities,id',
            'allocated_amount' => 'required|numeric|min:0',
            'allocation_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Check for unique constraint manually for update, excluding current record
        $existingAllocation = CostActivityAllocation::where('cost_id', $request->cost_id)
            ->where('activity_id', $request->activity_id)
            ->where('allocation_date', $request->allocation_date)
            ->where('id', '!=', $costActivityAllocation->id)
            ->first();

        if ($existingAllocation) {
            return redirect()->back()->withErrors([
                'unique_allocation' => 'Alokasi biaya ini ke aktivitas ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        $costActivityAllocation->update($request->all());

        return redirect()->route('cost-activity-allocations.index')->with('success', 'Alokasi Biaya ke Aktivitas berhasil diperbarui!');
    }

    /**
     * Remove the specified cost activity allocation record from storage.
     *
     * @param  \App\Models\CostActivityAllocation  $costActivityAllocation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(CostActivityAllocation $costActivityAllocation)
    {
        $costActivityAllocation->delete();

        return redirect()->route('cost-activity-allocations.index')->with('success', 'Alokasi Biaya ke Aktivitas berhasil dihapus!');
    }

    public function calculate(Request $request)
    {
        \Log::info('=== CALCULATE REQUEST START ===');
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request URL: ' . $request->url());
        \Log::info('Request data: ' . json_encode($request->all()));

        // Validasi request
        try {
            $request->validate([
                'cost_id' => 'required|exists:costs,id',
                'activity_id' => 'required|exists:activities,id',
                'allocation_date' => 'required|date',
            ]);
            \Log::info('Validation passed');
        } catch (\Exception $e) {
            \Log::error('Validation failed: ' . $e->getMessage());
            return response()->json(['error' => 'VALIDATION_ERROR', 'message' => $e->getMessage()], 422);
        }

        try {
            // Ambil cost dengan driver-nya
            $cost = Cost::with('driver')->findOrFail($request->cost_id);

            \Log::info('Cost data found', [
                'id' => $cost->id,
                'name' => $cost->name,
                'amount' => $cost->amount,
                'cost_driver_id' => $cost->cost_driver_id,
                'driver_relation' => $cost->driver ? $cost->driver->toArray() : null
            ]);

            // Coba akses driver ID
            $driverId = $cost->cost_driver_id ?? $cost->driver?->id;

            if (!$driverId) {
                \Log::warning('No driver found for cost', [
                    'cost_id' => $request->cost_id,
                    'cost_driver_id_field' => $cost->cost_driver_id,
                    'driver_relationship' => $cost->driver
                ]);
                return response()->json([
                    'message' => 'Biaya belum memiliki driver biaya.',
                    'error' => 'NO_DRIVER'
                ], 400);
            }

            \Log::info('Using driver_id: ' . $driverId);

            // Debug: Cek semua data usage untuk tanggal tersebut
            $allUsageData = ActivityCostDriverUsage::where('cost_driver_id', $driverId)
                ->whereMonth('usage_date', date('m', strtotime($request->allocation_date)))
                ->whereYear('usage_date', date('Y', strtotime($request->allocation_date)))
                ->get();

            \Log::info('All usage data for driver', [
                'driver_id' => $driverId,
                'date' => $request->allocation_date,
                'count' => $allUsageData->count(),
                'data' => $allUsageData->toArray()
            ]);

            // Hitung total usage
            $totalUsage = ActivityCostDriverUsage::where('cost_driver_id', $driverId)
                ->whereMonth('usage_date', date('m', strtotime($request->allocation_date)))
                ->whereYear('usage_date', date('Y', strtotime($request->allocation_date)))
                ->sum('usage_quantity');

            $activityUsage = ActivityCostDriverUsage::where('cost_driver_id', $driverId)
                ->where('activity_id', $request->activity_id)
                ->whereMonth('usage_date', date('m', strtotime($request->allocation_date)))
                ->whereYear('usage_date', date('Y', strtotime($request->allocation_date)))
                ->sum('usage_quantity');

            \Log::info('Usage calculation', [
                'total_usage' => $totalUsage,
                'activity_usage' => $activityUsage,
                'cost_amount' => $cost->amount
            ]);

            if ($totalUsage <= 0) {
                \Log::warning('No usage data found', [
                    'driver_id' => $driverId,
                    'date' => $request->allocation_date
                ]);

                return response()->json([
                    'message' => 'Tidak ditemukan data penggunaan driver biaya pada tanggal ini.',
                    'error' => 'NO_USAGE_DATA'
                ], 422);
            }

            if ($activityUsage <= 0) {
                \Log::warning('No activity usage found', [
                    'activity_id' => $request->activity_id,
                    'driver_id' => $driverId,
                    'date' => $request->allocation_date
                ]);

                return response()->json([
                    'message' => 'Aktivitas ini belum menggunakan driver biaya pada tanggal tersebut.',
                    'error' => 'NO_USAGE_DATA'
                ], 422);
            }

            // Hitung alokasi
            $allocatedAmount = ($activityUsage / $totalUsage) * $cost->amount;

            \Log::info('Final calculation success', [
                'allocated_amount' => $allocatedAmount,
                'formula' => "({$activityUsage} / {$totalUsage}) * {$cost->amount}"
            ]);

            return response()->json([
                'allocated_amount' => round($allocatedAmount, 2)
            ]);
        } catch (\Exception $e) {
            \Log::error('Calculate method error', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghitung alokasi.',
                'error' => 'CALCULATION_ERROR'
            ], 500);
        }
    }
}
