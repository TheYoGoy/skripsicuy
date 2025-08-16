<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityCostDriverUsage;
use App\Models\CostActivityAllocation;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use App\Models\ProductActivityUsage;
use App\Models\Production;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Menampilkan Dashboard Utama dengan Statistik Umum dan Grafik ABC.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // FIXED: Gunakan Agustus 2025 dan bisa dinamis dari request
        $selectedMonth = $request->input('month', 8); // Default Agustus
        $selectedYear = $request->input('year', 2025);

        $startDate = Carbon::create($selectedYear, $selectedMonth, 1)->startOfDay();
        $endDate = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->endOfDay();
        
        // Alternative: use date strings for more reliable comparison
        $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
        $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

        // Statistik Umum
        $totalUsers = User::count();
        $totalProducts = Product::count();
        $totalActivities = Activity::count();
        $totalDepartments = Department::count();

        // Hitung Activity Rate - FIXED: Same logic as ABC Report
        $activities = Activity::with('primaryCostDriver')->get();
        $activityRates = [];
        $activityReportsForCharts = [];

        foreach ($activities as $activity) {
            // FIXED: Use date strings for reliable comparison
            $totalActivityCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                ->whereDate('allocation_date', '>=', $startDateString)
                ->whereDate('allocation_date', '<=', $endDateString)
                ->sum('allocated_amount') ?? 0.0;

            // FIXED: Use flexible driver usage (all drivers, not just primary)
            $totalDriverUsage = (float) ActivityCostDriverUsage::where('activity_id', $activity->id)
                ->whereDate('usage_date', '>=', $startDateString)
                ->whereDate('usage_date', '<=', $endDateString)
                ->sum('usage_quantity') ?? 0.0;

            $ratePerUnit = $totalDriverUsage > 0 ? $totalActivityCost / $totalDriverUsage : 0;

            $activityRates[$activity->id] = $ratePerUnit;

            // Only include activities with costs > 0 for chart
            if ($totalActivityCost > 0) {
                $activityReportsForCharts[] = [
                    'name' => $activity->name ?? 'Aktivitas Tidak Dikenal',
                    'value' => (float) $totalActivityCost,
                ];
            }
        }

        // Hitung Biaya Produk - FIXED
        $products = Product::all();
        $productCostReportsForCharts = [];

        foreach ($products as $product) {
            $totalProductCost = 0.0;

            // FIXED: Use date strings for reliable comparison
            $productActivityUsages = ProductActivityUsage::where('product_id', $product->id)
                ->whereDate('usage_date', '>=', $startDateString)
                ->whereDate('usage_date', '<=', $endDateString)
                ->get();

            foreach ($productActivityUsages as $usage) {
                $activityRate = $activityRates[$usage->activity_id] ?? 0;
                $cost = ($usage->quantity_consumed ?? 0) * $activityRate;
                $totalProductCost += $cost;
            }

            // Only include products with costs > 0 for chart
            if ($totalProductCost > 0) {
                $productCostReportsForCharts[] = [
                    'name' => $product->name ?? 'Produk Tidak Dikenal',
                    'value' => (float) $totalProductCost,
                ];
            }
        }

        // Data untuk dashboard grafik
        $dashboardData = [
            'activity_cost_breakdown' => collect($activityReportsForCharts)
                ->filter(fn($item) => $item !== null && isset($item['name'], $item['value']) && $item['value'] > 0)
                ->values(),
            'product_cost_breakdown' => collect($productCostReportsForCharts)
                ->filter(fn($item) => $item !== null && isset($item['name'], $item['value']) && $item['value'] > 0)
                ->values(),
        ];

        // Debug info
        \Log::info('Dashboard Data:', [
            'selected_month' => $selectedMonth,
            'selected_year' => $selectedYear,
            'activity_breakdown_count' => $dashboardData['activity_cost_breakdown']->count(),
            'product_breakdown_count' => $dashboardData['product_cost_breakdown']->count(),
            'activity_data' => $dashboardData['activity_cost_breakdown']->toArray(),
            'product_data' => $dashboardData['product_cost_breakdown']->toArray(),
        ]);

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_products' => $totalProducts,
                'total_activities' => $totalActivities,
                'total_departments' => $totalDepartments,
            ],
            'dashboardData' => $dashboardData,
            'selectedMonth' => $selectedMonth,
            'selectedYear' => $selectedYear,
        ]);
    }
}