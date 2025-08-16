<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityCostDriverUsage;
use App\Models\CostActivityAllocation;
use App\Models\Product;
use App\Models\Production;
use App\Models\ProductActivityUsage;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AbcReportExport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ABCReportController extends Controller
{
    /**
     * Display ABC Report (Activity Cost Pools, Rates, Product Costs, and Dashboard Data).
     */
    public function index(Request $request)
    {
        try {
            // Validate and set default values
            $selectedMonth = $request->input('month', Carbon::now()->month);
            $selectedYear = $request->input('year', Carbon::now()->year);

            // Ensure month and year are valid
            $selectedMonth = max(1, min(12, (int) $selectedMonth));
            $selectedYear = max(2020, min(2030, (int) $selectedYear));

            // Date range for filtering
            $startDate = Carbon::create($selectedYear, $selectedMonth, 1)->startOfDay();
            $endDate = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->endOfDay();

            // Alternative: use date strings for more reliable comparison
            $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
            $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

            Log::info('=== ABC REPORT CALCULATION START ===');
            Log::info('Date Range:', [
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
                'startDateString' => $startDateString,
                'endDateString' => $endDateString
            ]);

            // === Step 1: ACTIVITY COST POOL & RATE CALCULATION (WITH DEPARTMENT) ===
            $activities = Activity::with(['primaryCostDriver', 'department'])->get();
            $activityReports = [];
            $activityRates = [];

            Log::info('Total Activities:', ['count' => $activities->count()]);

            foreach ($activities as $activity) {
                // Get total allocated cost for this activity in the period
                $totalActivityCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                    ->whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)
                    ->sum('allocated_amount') ?? 0.0;

                // FIXED: Get total driver usage for this activity (ALL drivers, not just primary)
                $totalDriverUsage = (float) ActivityCostDriverUsage::where('activity_id', $activity->id)
                    ->whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)
                    ->sum('usage_quantity') ?? 0.0;

                // Calculate rate per unit driver
                $ratePerUnit = ($totalDriverUsage > 0) ? ($totalActivityCost / $totalDriverUsage) : 0.0;

                Log::info("Activity: {$activity->name}", [
                    'activity_id' => $activity->id,
                    'department' => $activity->department ? $activity->department->name : 'No Department',
                    'total_activity_cost' => $totalActivityCost,
                    'total_driver_usage' => $totalDriverUsage,
                    'rate_per_unit' => $ratePerUnit,
                    'calculation_method' => 'flexible_driver_usage'
                ]);

                $activityReports[] = [
                    'activity_id' => $activity->id,
                    'activity_name' => $activity->name ?? 'Unknown Activity',
                    'department_id' => $activity->department_id,
                    'department_name' => $activity->department ? $activity->department->name : 'Tidak Ada Departemen',
                    'primary_cost_driver_name' => optional($activity->primaryCostDriver)->name ?? 'Multiple Drivers',
                    'primary_cost_driver_unit' => optional($activity->primaryCostDriver)->unit ?? 'Units',
                    'total_activity_cost_pool' => $totalActivityCost,
                    'total_cost_driver_usage' => $totalDriverUsage,
                    'activity_rate' => $ratePerUnit,
                ];

                // Store rates for product cost calculation
                $activityRates[$activity->id] = $ratePerUnit;
            }

            // Calculate department summary
            $departmentReports = [];
            $departments = Department::with(['activities'])->get();

            foreach ($departments as $department) {
                $departmentTotalCost = 0.0;
                $departmentActivities = [];

                foreach ($activities as $activity) {
                    if ($activity->department_id == $department->id) {
                        $activityCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                            ->whereDate('allocation_date', '>=', $startDateString)
                            ->whereDate('allocation_date', '<=', $endDateString)
                            ->sum('allocated_amount') ?? 0.0;

                        $departmentTotalCost += $activityCost;
                        $departmentActivities[] = [
                            'name' => $activity->name,
                            'cost' => $activityCost
                        ];
                    }
                }

                if ($departmentTotalCost > 0) {
                    $departmentReports[] = [
                        'department_id' => $department->id,
                        'department_name' => $department->name,
                        'total_cost' => $departmentTotalCost,
                        'activities' => $departmentActivities,
                        'activity_count' => count($departmentActivities)
                    ];
                }
            }

            // Check total allocated costs across all activities
            $totalAllocatedCosts = (float) CostActivityAllocation::whereDate('allocation_date', '>=', $startDateString)
                ->whereDate('allocation_date', '<=', $endDateString)
                ->sum('allocated_amount') ?? 0.0;

            Log::info('Total Allocated Costs (All Activities):', ['total' => $totalAllocatedCosts]);

            // === Step 2: PRODUCT COST CALCULATION ===
            $products = Product::all();
            $productCostReports = [];
            $totalOverallProductionCost = 0.0;

            Log::info('Total Products:', ['count' => $products->count()]);

            foreach ($products as $product) {
                // Get all activity usages for this product in the period
                $productActivityUsages = ProductActivityUsage::where('product_id', $product->id)
                    ->whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)
                    ->get();

                Log::info("Product: {$product->name}", [
                    'product_id' => $product->id,
                    'activity_usages_count' => $productActivityUsages->count()
                ]);

                $totalProductCost = 0.0;
                $productActivityBreakdown = [];
                $productDepartmentBreakdown = [];

                // Calculate cost based on activity usage
                foreach ($productActivityUsages as $usage) {
                    $activityRate = $activityRates[$usage->activity_id] ?? 0.0;
                    $quantityConsumed = (float) ($usage->quantity_consumed ?? 0.0);
                    $cost = $quantityConsumed * $activityRate;
                    $totalProductCost += $cost;

                    $activity = Activity::with('department')->find($usage->activity_id);
                    $activityName = $activity->name ?? 'Unknown';
                    $departmentName = $activity->department ? $activity->department->name : 'Tidak Ada Departemen';

                    $productActivityBreakdown[] = [
                        'activity_name' => $activityName,
                        'department_name' => $departmentName,
                        'quantity_consumed' => $quantityConsumed,
                        'activity_rate' => $activityRate,
                        'calculated_cost' => $cost
                    ];

                    // Aggregate by department
                    if (!isset($productDepartmentBreakdown[$departmentName])) {
                        $productDepartmentBreakdown[$departmentName] = 0.0;
                    }
                    $productDepartmentBreakdown[$departmentName] += $cost;
                }

                // Get total production quantity for this product in the period
                $producedQty = (float) Production::where('product_id', $product->id)
                    ->whereDate('production_date', '>=', $startDateString)
                    ->whereDate('production_date', '<=', $endDateString)
                    ->sum('quantity') ?? 0.0;

                // Calculate cost per unit
                $costPerUnit = ($producedQty > 0) ? ($totalProductCost / $producedQty) : 0.0;

                Log::info("Product Cost Breakdown for {$product->name}:", [
                    'total_product_cost' => $totalProductCost,
                    'produced_quantity' => $producedQty,
                    'cost_per_unit' => $costPerUnit,
                    'activity_breakdown' => $productActivityBreakdown,
                    'department_breakdown' => $productDepartmentBreakdown
                ]);

                $productCostReports[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name ?? 'Unknown Product',
                    'total_product_cost' => $totalProductCost,
                    'total_production_quantity' => $producedQty,
                    'cost_per_unit' => $costPerUnit,
                    'department_breakdown' => $productDepartmentBreakdown,
                ];

                $totalOverallProductionCost += $totalProductCost;
            }

            // Check if we have any data at all
            $dataChecks = [
                'cost_activity_allocations' => CostActivityAllocation::whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)->count(),
                'product_activity_usages' => ProductActivityUsage::whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)->count(),
                'productions' => Production::whereDate('production_date', '>=', $startDateString)
                    ->whereDate('production_date', '<=', $endDateString)->count(),
                'activity_cost_driver_usages' => ActivityCostDriverUsage::whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)->count(),
            ];

            Log::info('Data Availability Check:', $dataChecks);

            // If calculation results in 0 or too low, use direct allocation total
            if ($totalOverallProductionCost == 0 || $totalOverallProductionCost < ($totalAllocatedCosts * 0.5)) {
                Log::warning('Product cost calculation incomplete or too low, using direct allocation total', [
                    'calculated_product_cost' => $totalOverallProductionCost,
                    'total_allocated_costs' => $totalAllocatedCosts,
                    'using_allocation_total' => true
                ]);
                $totalOverallProductionCost = $totalAllocatedCosts;

                // Also create summary product reports based on activities if products are incomplete
                if (empty($productCostReports) || collect($productCostReports)->sum('total_product_cost') < ($totalAllocatedCosts * 0.5)) {
                    $productCostReports = [];
                    foreach ($activityReports as $activity) {
                        if ($activity['total_activity_cost_pool'] > 0) {
                            $productCostReports[] = [
                                'product_id' => 'activity_' . $activity['activity_id'],
                                'product_name' => 'Biaya ' . $activity['activity_name'],
                                'total_product_cost' => $activity['total_activity_cost_pool'],
                                'total_production_quantity' => 1,
                                'cost_per_unit' => $activity['total_activity_cost_pool'],
                                'department_breakdown' => [$activity['department_name'] => $activity['total_activity_cost_pool']],
                            ];
                        }
                    }
                }
            }

            Log::info('FINAL CALCULATION:', [
                'totalOverallProductionCost' => $totalOverallProductionCost,
                'totalAllocatedCosts' => $totalAllocatedCosts,
                'type' => gettype($totalOverallProductionCost)
            ]);

            // === Step 3: DASHBOARD DATA (WITH DEPARTMENT) ===
            $dashboardData = [
                'total_overall_production_cost' => $totalOverallProductionCost,
                'activity_cost_breakdown' => collect($activityReports)
                    ->filter(fn($a) => floatval($a['total_activity_cost_pool']) > 0)
                    ->map(fn($a) => [
                        'name' => $a['activity_name'],
                        'department' => $a['department_name'],
                        'value' => (float) $a['total_activity_cost_pool'],
                    ])->values()->toArray(),
                'product_cost_breakdown' => collect($productCostReports)
                    ->filter(fn($p) => floatval($p['total_product_cost']) > 0)
                    ->map(fn($p) => [
                        'name' => $p['product_name'],
                        'value' => (float) $p['total_product_cost'],
                    ])->values()->toArray(),
                'department_cost_breakdown' => collect($departmentReports)
                    ->map(fn($d) => [
                        'name' => $d['department_name'],
                        'value' => (float) $d['total_cost'],
                        'activity_count' => $d['activity_count'],
                    ])->values()->toArray(),
            ];

            // Ensure all numeric values in reports are properly cast
            foreach ($activityReports as &$report) {
                $report['total_activity_cost_pool'] = (float) $report['total_activity_cost_pool'];
                $report['total_cost_driver_usage'] = (float) $report['total_cost_driver_usage'];
                $report['activity_rate'] = (float) $report['activity_rate'];
            }

            foreach ($productCostReports as &$report) {
                $report['total_product_cost'] = (float) $report['total_product_cost'];
                $report['total_production_quantity'] = (float) $report['total_production_quantity'];
                $report['cost_per_unit'] = (float) $report['cost_per_unit'];
            }

            Log::info('Dashboard Data Final:', $dashboardData);
            Log::info('=== ABC REPORT CALCULATION END ===');

            // === Step 4: Generate Filter Options ===
            $months = collect(range(1, 12))->map(function ($m) {
                return [
                    'value' => $m,
                    'name' => Carbon::create(null, $m)->monthName,
                ];
            })->toArray();

            $currentYear = Carbon::now()->year;
            $years = range($currentYear - 5, $currentYear + 2);

            // === Return Response ===
            return Inertia::render('ABCReports/Index', [
                'activityReports' => $activityReports,
                'productCostReports' => $productCostReports,
                'departmentReports' => $departmentReports,
                'dashboardData' => $dashboardData,
                'months' => $months,
                'years' => $years,
                'selectedMonth' => (int) $selectedMonth,
                'selectedYear' => (int) $selectedYear,
            ]);
        } catch (\Exception $e) {
            Log::error('ABC Report Index Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty data structure to prevent frontend errors
            return Inertia::render('ABCReports/Index', [
                'activityReports' => [],
                'productCostReports' => [],
                'departmentReports' => [],
                'dashboardData' => [
                    'total_overall_production_cost' => 0.0,
                    'activity_cost_breakdown' => [],
                    'product_cost_breakdown' => [],
                    'department_cost_breakdown' => [],
                ],
                'months' => collect(range(1, 12))->map(function ($m) {
                    return [
                        'value' => $m,
                        'name' => Carbon::create(null, $m)->monthName,
                    ];
                })->toArray(),
                'years' => range(Carbon::now()->year - 5, Carbon::now()->year + 2),
                'selectedMonth' => Carbon::now()->month,
                'selectedYear' => Carbon::now()->year,
                'error' => 'Terjadi kesalahan saat memuat data laporan.',
            ]);
        }
    }

    /**
     * Export ABC Report to Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $selectedMonth = $request->get('month', Carbon::now()->month);
            $selectedYear = $request->get('year', Carbon::now()->year);

            // Validate parameters
            $selectedMonth = max(1, min(12, (int) $selectedMonth));
            $selectedYear = max(2020, min(2030, (int) $selectedYear));

            return Excel::download(
                new AbcReportExport($selectedMonth, $selectedYear),
                "abc-reports-{$selectedYear}-{$selectedMonth}.xlsx"
            );
        } catch (\Exception $e) {
            Log::error('ABC Report Excel Export Error: ' . $e->getMessage());

            return back()->with('error', 'Gagal mengexport data ke Excel: ' . $e->getMessage());
        }
    }

    /**
     * Export ABC Report to PDF
     */
    public function exportPdf(Request $request)
    {
        try {
            $selectedMonth = $request->get('month', Carbon::now()->month);
            $selectedYear = $request->get('year', Carbon::now()->year);

            // Validate parameters
            $selectedMonth = max(1, min(12, (int) $selectedMonth));
            $selectedYear = max(2020, min(2030, (int) $selectedYear));

            $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
            $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

            // Get data with proper error handling
            $products = Product::all();
            $activities = Activity::with(['primaryCostDriver', 'department'])->get();
            $departments = Department::with('activities')->get();

            // --- Calculate activity rates ---
            $activityRates = [];
            $activityReportsForPdf = [];

            foreach ($activities as $activity) {
                $allocatedCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                    ->whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)
                    ->sum('allocated_amount') ?? 0.0;

                // FIXED: Use all driver usage, not just primary
                $driverUsage = (float) ActivityCostDriverUsage::where('activity_id', $activity->id)
                    ->whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)
                    ->sum('usage_quantity') ?? 0.0;

                $activityRate = ($driverUsage > 0) ? ($allocatedCost / $driverUsage) : 0.0;
                $activityRates[$activity->id] = $activityRate;

                $activityReportsForPdf[] = [
                    'activity' => $activity,
                    'department' => $activity->department,
                    'allocated_cost' => $allocatedCost,
                    'driver_usage' => $driverUsage,
                    'activity_rate' => $activityRate,
                ];
            }

            // --- Calculate department reports ---
            $departmentReportsForPdf = [];
            foreach ($departments as $department) {
                $departmentTotalCost = 0.0;
                $departmentActivities = [];

                foreach ($activities as $activity) {
                    if ($activity->department_id == $department->id) {
                        $activityCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                            ->whereDate('allocation_date', '>=', $startDateString)
                            ->whereDate('allocation_date', '<=', $endDateString)
                            ->sum('allocated_amount') ?? 0.0;

                        if ($activityCost > 0) {
                            $departmentTotalCost += $activityCost;
                            $departmentActivities[] = [
                                'name' => $activity->name,
                                'cost' => $activityCost
                            ];
                        }
                    }
                }

                if ($departmentTotalCost > 0) {
                    $departmentReportsForPdf[] = [
                        'department' => $department,
                        'total_cost' => $departmentTotalCost,
                        'activities' => $departmentActivities,
                        'activity_count' => count($departmentActivities)
                    ];
                }
            }

            // --- Calculate product costs with activity details ---
            $productReportsForPdf = [];
            $productActivityDetails = [];

            foreach ($products as $product) {
                $totalProductCost = 0.0;
                $currentProductActivityDetails = [];
                $currentProductDepartmentBreakdown = [];

                $productActivityUsages = ProductActivityUsage::where('product_id', $product->id)
                    ->whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)
                    ->with(['activity.primaryCostDriver', 'activity.department'])
                    ->get();

                foreach ($productActivityUsages as $usage) {
                    $activityRate = $activityRates[$usage->activity_id] ?? 0.0;
                    $quantityConsumed = (float) ($usage->quantity_consumed ?? 0.0);
                    $costAllocatedFromActivity = $quantityConsumed * $activityRate;
                    $totalProductCost += $costAllocatedFromActivity;

                    $activity = $usage->activity ?? Activity::find($usage->activity_id);
                    $costDriver = optional($activity)->primaryCostDriver;
                    $department = optional($activity)->department;

                    $departmentName = $department ? $department->name : 'Tidak Ada Departemen';

                    $currentProductActivityDetails[] = [
                        'activity_name' => optional($activity)->name ?? 'Unknown Activity',
                        'department_name' => $departmentName,
                        'cost_driver_name' => optional($costDriver)->name ?? 'Multiple Drivers',
                        'cost_driver_unit' => optional($costDriver)->unit ?? 'Units',
                        'quantity_consumed' => $quantityConsumed,
                        'activity_rate' => $activityRate,
                        'allocated_cost' => $costAllocatedFromActivity,
                    ];

                    // Aggregate by department
                    if (!isset($currentProductDepartmentBreakdown[$departmentName])) {
                        $currentProductDepartmentBreakdown[$departmentName] = 0.0;
                    }
                    $currentProductDepartmentBreakdown[$departmentName] += $costAllocatedFromActivity;
                }

                $totalProduction = (float) Production::where('product_id', $product->id)
                    ->whereDate('production_date', '>=', $startDateString)
                    ->whereDate('production_date', '<=', $endDateString)
                    ->sum('quantity') ?? 0.0;

                $costPerUnit = ($totalProduction > 0) ? ($totalProductCost / $totalProduction) : 0.0;

                $productReportsForPdf[] = [
                    'product' => $product,
                    'total_cost' => $totalProductCost,
                    'total_production_quantity' => $totalProduction,
                    'unit_cost' => $costPerUnit,
                    'department_breakdown' => $currentProductDepartmentBreakdown,
                ];

                $productActivityDetails[$product->id] = $currentProductActivityDetails;
            }

            // --- Generate PDF ---
            $pdf = Pdf::loadView('exports.abc-reports-pdf-complete', [
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
                'monthName' => Carbon::create($selectedYear, $selectedMonth)->monthName,
                'activityReports' => collect($activityReportsForPdf),
                'productReports' => collect($productReportsForPdf),
                'departmentReports' => collect($departmentReportsForPdf),
                'productActivityDetails' => $productActivityDetails,
            ]);

            // Set PDF options for better output
            $pdf->setPaper('A4', 'landscape');
            $pdf->setOptions(['dpi' => 150, 'defaultFont' => 'sans-serif']);

            $filename = 'laporan-abc-lengkap-' . Carbon::create($selectedYear, $selectedMonth)->format('Y-m') . '.pdf';

            return $pdf->stream($filename);
        } catch (\Exception $e) {
            Log::error('ABC Report PDF Export Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Gagal menggenerate PDF: ' . $e->getMessage());
        }
    }

    /**
     * Get summary statistics for dashboard
     */
    public function getSummaryStats(Request $request)
    {
        try {
            $selectedMonth = $request->get('month', Carbon::now()->month);
            $selectedYear = $request->get('year', Carbon::now()->year);

            $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
            $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

            $stats = [
                'total_activities' => Activity::count(),
                'total_products' => Product::count(),
                'total_departments' => Department::count(),
                'total_allocations' => CostActivityAllocation::whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)->count(),
                'total_productions' => Production::whereDate('production_date', '>=', $startDateString)
                    ->whereDate('production_date', '<=', $endDateString)->count(),
                'total_allocated_cost' => (float) CostActivityAllocation::whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)->sum('allocated_amount') ?? 0.0,
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('ABC Report Summary Stats Error: ' . $e->getMessage());

            return response()->json([
                'error' => 'Gagal memuat statistik summary'
            ], 500);
        }
    }
}
