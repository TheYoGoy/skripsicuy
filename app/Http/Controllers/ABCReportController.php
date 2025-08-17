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
     * Display ABC Report - FIXED VERSION
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
            $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
            $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

            Log::info('=== ABC REPORT CALCULATION START (FIXED) ===');
            Log::info('Date Range:', [
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
                'startDate' => $startDateString,
                'endDate' => $endDateString
            ]);

            // === Step 1: ACTIVITY COST POOL & RATE CALCULATION ===
            $activities = Activity::with(['primaryCostDriver', 'department'])->get();
            $activityReports = [];
            $activityRates = [];

            foreach ($activities as $activity) {
                // Get total allocated cost for this activity in the period
                $totalActivityCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                    ->whereDate('allocation_date', '>=', $startDateString)
                    ->whereDate('allocation_date', '<=', $endDateString)
                    ->sum('allocated_amount') ?? 0.0;

                // FIXED: Get total driver usage for this activity (per cost driver specific)
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
                    'rate_per_unit' => $ratePerUnit
                ]);

                if ($totalActivityCost > 0) { // Only include activities with cost
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
            }

            // === Step 2: DEPARTMENT SUMMARY ===
            $departmentReports = [];
            $departments = Department::with(['activities'])->get();

            foreach ($departments as $department) {
                $departmentTotalCost = 0.0;
                $departmentActivities = [];
                $activityCount = 0;

                foreach ($activityReports as $activityReport) {
                    if ($activityReport['department_id'] == $department->id) {
                        $departmentTotalCost += $activityReport['total_activity_cost_pool'];
                        $departmentActivities[] = [
                            'name' => $activityReport['activity_name'],
                            'cost' => $activityReport['total_activity_cost_pool']
                        ];
                        $activityCount++;
                    }
                }

                if ($departmentTotalCost > 0) {
                    $departmentReports[] = [
                        'department_id' => $department->id,
                        'department_name' => $department->name,
                        'total_cost' => $departmentTotalCost,
                        'activities' => $departmentActivities,
                        'activity_count' => $activityCount
                    ];
                }
            }

            // === Step 3: PRODUCT COST CALCULATION (FIXED ABC STAGE 2) ===
            $products = Product::all();
            $productCostReports = [];
            $totalOverallProductionCost = 0.0;

            Log::info('=== PRODUCT COST CALCULATION START ===');

            foreach ($products as $product) {
                // Get all activity usages for this product in the period
                $productActivityUsages = ProductActivityUsage::where('product_id', $product->id)
                    ->whereDate('usage_date', '>=', $startDateString)
                    ->whereDate('usage_date', '<=', $endDateString)
                    ->with(['activity', 'costDriver'])
                    ->get();

                Log::info("Product: {$product->name}", [
                    'product_id' => $product->id,
                    'activity_usages_count' => $productActivityUsages->count()
                ]);

                $totalProductCost = 0.0;
                $productActivityBreakdown = [];
                $productDepartmentBreakdown = [];

                // FIXED: Use actual allocated_amount from ProductActivityUsage
                foreach ($productActivityUsages as $usage) {
                    // Use the allocated_amount that was calculated by ABC Stage 2
                    $allocatedCost = (float) ($usage->allocated_amount ?? 0.0);
                    $totalProductCost += $allocatedCost;

                    $activity = $usage->activity;
                    $activityName = $activity ? $activity->name : 'Unknown';
                    $departmentName = ($activity && $activity->department) ? $activity->department->name : 'Tidak Ada Departemen';

                    $productActivityBreakdown[] = [
                        'activity_name' => $activityName,
                        'department_name' => $departmentName,
                        'quantity_consumed' => (float) $usage->quantity_consumed,
                        'allocated_cost' => $allocatedCost,
                        'cost_driver_name' => $usage->costDriver ? $usage->costDriver->name : 'Unknown Driver',
                        'usage_date' => $usage->usage_date
                    ];

                    // Aggregate by department
                    if (!isset($productDepartmentBreakdown[$departmentName])) {
                        $productDepartmentBreakdown[$departmentName] = 0.0;
                    }
                    $productDepartmentBreakdown[$departmentName] += $allocatedCost;
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
                    'activity_breakdown_count' => count($productActivityBreakdown),
                    'department_breakdown' => $productDepartmentBreakdown
                ]);

                // Only include products with cost
                if ($totalProductCost > 0) {
                    $productCostReports[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name ?? 'Unknown Product',
                        'total_product_cost' => $totalProductCost,
                        'total_production_quantity' => $producedQty,
                        'cost_per_unit' => $costPerUnit,
                        'department_breakdown' => $productDepartmentBreakdown,
                        'activity_breakdown' => $productActivityBreakdown, // Add detailed breakdown
                    ];

                    $totalOverallProductionCost += $totalProductCost;
                }
            }

            // Check total allocated costs across all activities
            $totalAllocatedCosts = (float) CostActivityAllocation::whereDate('allocation_date', '>=', $startDateString)
                ->whereDate('allocation_date', '<=', $endDateString)
                ->sum('allocated_amount') ?? 0.0;

            Log::info('COST VERIFICATION:', [
                'totalOverallProductionCost' => $totalOverallProductionCost,
                'totalAllocatedCosts' => $totalAllocatedCosts,
                'difference' => $totalAllocatedCosts - $totalOverallProductionCost
            ]);

            // === Step 4: DASHBOARD DATA ===
            $dashboardData = [
                'total_overall_production_cost' => $totalOverallProductionCost,
                'total_allocated_costs' => $totalAllocatedCosts,
                'cost_difference' => $totalAllocatedCosts - $totalOverallProductionCost,
                'activity_cost_breakdown' => collect($activityReports)
                    ->map(fn($a) => [
                        'name' => $a['activity_name'],
                        'department' => $a['department_name'],
                        'value' => (float) $a['total_activity_cost_pool'],
                        'rate' => (float) $a['activity_rate'],
                        'driver_usage' => (float) $a['total_cost_driver_usage'],
                    ])->values()->toArray(),
                'product_cost_breakdown' => collect($productCostReports)
                    ->map(fn($p) => [
                        'name' => $p['product_name'],
                        'value' => (float) $p['total_product_cost'],
                        'quantity' => (float) $p['total_production_quantity'],
                        'unit_cost' => (float) $p['cost_per_unit'],
                        'department_breakdown' => $p['department_breakdown']
                    ])->values()->toArray(),
                'department_cost_breakdown' => collect($departmentReports)
                    ->map(fn($d) => [
                        'name' => $d['department_name'],
                        'value' => (float) $d['total_cost'],
                        'activity_count' => $d['activity_count'],
                    ])->values()->toArray(),
            ];

            // Data availability check
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
            Log::info('Final Dashboard Data:', $dashboardData);
            Log::info('=== ABC REPORT CALCULATION END (FIXED) ===');

            // === Step 5: Generate Filter Options ===
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
                'dataChecks' => $dataChecks, // Add for debugging
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
                    'total_allocated_costs' => 0.0,
                    'cost_difference' => 0.0,
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
                'error' => 'Terjadi kesalahan saat memuat data laporan: ' . $e->getMessage(),
            ]);
        }
    }

    // ... (exportExcel, exportPdf, dan getSummaryStats methods tetap sama) ...

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

    public function exportPdf(Request $request)
    {
        try {
            // Add memory and timeout limits for PDF generation
            ini_set('memory_limit', '512M');
            ini_set('max_execution_time', 300);

            $selectedMonth = $request->get('month', Carbon::now()->month);
            $selectedYear = $request->get('year', Carbon::now()->year);

            // Validate parameters
            $selectedMonth = max(1, min(12, (int) $selectedMonth));
            $selectedYear = max(2020, min(2030, (int) $selectedYear));

            Log::info('PDF Export Started', [
                'month' => $selectedMonth,
                'year' => $selectedYear,
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time')
            ]);

            $startDateString = Carbon::create($selectedYear, $selectedMonth, 1)->format('Y-m-d');
            $endDateString = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth()->format('Y-m-d');

            // Get data with proper error handling - SAME LOGIC AS INDEX METHOD
            $activities = Activity::with(['primaryCostDriver', 'department'])->get();
            $products = Product::all();
            $departments = Department::with('activities')->get();

            // Initialize collections
            $activityReports = collect();
            $productReports = collect();
            $departmentReports = collect();
            $productActivityDetails = [];
            $activityRates = []; // Store activity rates for consistency

            // === STEP 1: CALCULATE ACTIVITY REPORTS (Same as index method) ===
            foreach ($activities as $activity) {
                try {
                    $allocatedCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                        ->whereDate('allocation_date', '>=', $startDateString)
                        ->whereDate('allocation_date', '<=', $endDateString)
                        ->sum('allocated_amount') ?? 0.0;

                    $driverUsage = (float) ActivityCostDriverUsage::where('activity_id', $activity->id)
                        ->whereDate('usage_date', '>=', $startDateString)
                        ->whereDate('usage_date', '<=', $endDateString)
                        ->sum('usage_quantity') ?? 0.0;

                    $activityRate = ($driverUsage > 0) ? ($allocatedCost / $driverUsage) : 0.0;
                    $activityRates[$activity->id] = $activityRate; // Store for product calculation

                    if ($allocatedCost > 0) {
                        $activityReports->push([
                            'activity' => $activity,
                            'department' => $activity->department,
                            'allocated_cost' => $allocatedCost,
                            'driver_usage' => $driverUsage,
                            'activity_rate' => $activityRate,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing activity {$activity->id} for PDF: " . $e->getMessage());
                    continue;
                }
            }

            // === STEP 2: CALCULATE DEPARTMENT REPORTS ===
            foreach ($departments as $department) {
                try {
                    $departmentTotalCost = 0.0;
                    $departmentActivities = [];

                    // Get activities for this department from our activity reports
                    $departmentActivityReports = $activityReports->filter(function ($report) use ($department) {
                        return $report['activity']->department_id == $department->id;
                    });

                    foreach ($departmentActivityReports as $activityReport) {
                        $departmentTotalCost += $activityReport['allocated_cost'];
                        $departmentActivities[] = [
                            'name' => $activityReport['activity']->name,
                            'cost' => $activityReport['allocated_cost']
                        ];
                    }

                    if ($departmentTotalCost > 0) {
                        $departmentReports->push([
                            'department' => $department,
                            'total_cost' => $departmentTotalCost,
                            'activities' => $departmentActivities,
                            'activity_count' => count($departmentActivities)
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing department {$department->id} for PDF: " . $e->getMessage());
                    continue;
                }
            }

            // === STEP 3: CALCULATE PRODUCT REPORTS (Same as index method) ===
            foreach ($products as $product) {
                try {
                    $productActivityUsages = ProductActivityUsage::where('product_id', $product->id)
                        ->whereDate('usage_date', '>=', $startDateString)
                        ->whereDate('usage_date', '<=', $endDateString)
                        ->with(['activity.primaryCostDriver', 'activity.department', 'costDriver'])
                        ->get();

                    $totalProductCost = 0.0;
                    $currentProductActivityDetails = [];
                    $currentProductDepartmentBreakdown = [];

                    foreach ($productActivityUsages as $usage) {
                        // Use the allocated_amount from database (calculated by ABC Stage 2)
                        $allocatedCost = (float) ($usage->allocated_amount ?? 0.0);
                        $totalProductCost += $allocatedCost;

                        $activity = $usage->activity ?? Activity::find($usage->activity_id);
                        $costDriver = $usage->costDriver ?? optional($activity)->primaryCostDriver;
                        $department = optional($activity)->department;

                        $departmentName = $department ? $department->name : 'Tidak Ada Departemen';

                        $currentProductActivityDetails[] = [
                            'activity_name' => optional($activity)->name ?? 'Unknown Activity',
                            'department_name' => $departmentName,
                            'cost_driver_name' => optional($costDriver)->name ?? 'Multiple Drivers',
                            'cost_driver_unit' => optional($costDriver)->unit ?? 'Units',
                            'quantity_consumed' => (float) ($usage->quantity_consumed ?? 0.0),
                            'activity_rate' => $activityRates[$usage->activity_id] ?? 0.0,
                            'allocated_cost' => $allocatedCost,
                        ];

                        // Aggregate by department
                        if (!isset($currentProductDepartmentBreakdown[$departmentName])) {
                            $currentProductDepartmentBreakdown[$departmentName] = 0.0;
                        }
                        $currentProductDepartmentBreakdown[$departmentName] += $allocatedCost;
                    }

                    $totalProduction = (float) Production::where('product_id', $product->id)
                        ->whereDate('production_date', '>=', $startDateString)
                        ->whereDate('production_date', '<=', $endDateString)
                        ->sum('quantity') ?? 0.0;

                    $costPerUnit = ($totalProduction > 0) ? ($totalProductCost / $totalProduction) : 0.0;

                    if ($totalProductCost > 0) {
                        $productReports->push([
                            'product' => $product,
                            'total_cost' => $totalProductCost,
                            'total_production_quantity' => $totalProduction,
                            'unit_cost' => $costPerUnit,
                            'department_breakdown' => $currentProductDepartmentBreakdown,
                        ]);

                        $productActivityDetails[$product->id] = $currentProductActivityDetails;
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing product {$product->id} for PDF: " . $e->getMessage());
                    continue;
                }
            }

            Log::info('PDF Data Collection Complete', [
                'activities_count' => $activityReports->count(),
                'products_count' => $productReports->count(),
                'departments_count' => $departmentReports->count(),
                'total_activity_cost' => $activityReports->sum('allocated_cost'),
                'total_product_cost' => $productReports->sum('total_cost')
            ]);

            // === STEP 4: GENERATE PDF ===
            // Check if view file exists
            $viewPath = 'exports.abc-reports-pdf-complete';
            if (!view()->exists($viewPath)) {
                Log::error("PDF view file not found: {$viewPath}");
                return back()->with('error', 'Template PDF tidak ditemukan. Pastikan file view ada di resources/views/exports/abc-reports-pdf-complete.blade.php');
            }

            // Generate PDF with comprehensive data
            $pdf = Pdf::loadView($viewPath, [
                'selectedMonth' => $selectedMonth,
                'selectedYear' => $selectedYear,
                'monthName' => Carbon::create($selectedYear, $selectedMonth)->monthName,
                'activityReports' => $activityReports,
                'productReports' => $productReports,
                'departmentReports' => $departmentReports,
                'productActivityDetails' => $productActivityDetails,
            ]);

            // Set PDF options for better output
            $pdf->setPaper('A4', 'landscape'); // Use landscape for better table fitting
            $pdf->setOptions([
                'dpi' => 150,
                'defaultFont' => 'sans-serif',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
            ]);

            $filename = 'laporan-abc-lengkap-' . Carbon::create($selectedYear, $selectedMonth)->format('Y-m') . '.pdf';

            Log::info('PDF generated successfully', [
                'filename' => $filename,
                'memory_peak' => memory_get_peak_usage(true) / 1024 / 1024 . ' MB'
            ]);

            return $pdf->stream($filename);
        } catch (\Exception $e) {
            Log::error('ABC Report PDF Export Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'memory_usage' => memory_get_usage(true) / 1024 / 1024 . ' MB',
                'memory_peak' => memory_get_peak_usage(true) / 1024 / 1024 . ' MB'
            ]);

            // Return user-friendly error
            return back()->with('error', 'Gagal menggenerate PDF: ' . $e->getMessage() . '. Silakan cek log untuk detail error.');
        }
    }

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
            return response()->json(['error' => 'Gagal memuat statistik summary'], 500);
        }
    }
}
