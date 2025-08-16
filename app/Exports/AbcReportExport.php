<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\Activity;
use App\Models\Department;
use App\Models\ProductActivityUsage;
use App\Models\CostActivityAllocation;
use App\Models\ActivityCostDriverUsage;
use App\Models\Production; // TAMBAHAN: Import Production model
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class AbcReportExport implements FromView
{
    protected $month, $year;

    public function __construct($month = null, $year = null)
    {
        $this->month = $month ?? now()->month;
        $this->year = $year ?? now()->year;
    }

    public function view(): View
    {
        try {
            // FIXED: Consistent date handling with Controller
            $startDateString = Carbon::create($this->year, $this->month, 1)->format('Y-m-d');
            $endDateString = Carbon::create($this->year, $this->month, 1)->endOfMonth()->format('Y-m-d');

            // Get all products, activities, and departments safely
            $products = Product::all();
            $activities = Activity::with(['primaryCostDriver', 'department'])->get();
            $departments = Department::with('activities')->get();

            // Initialize collections
            $activityReports = collect();
            $productReports = collect();
            $departmentReports = collect();
            $productActivityDetails = [];
            $activityRates = []; // TAMBAHAN: Store activity rates

            // Process department reports
            foreach ($departments as $department) {
                try {
                    $departmentTotalCost = 0;
                    $departmentActivities = [];

                    // Get activities for this department
                    $departmentActivitiesData = Activity::where('department_id', $department->id)->get();

                    foreach ($departmentActivitiesData as $activity) {
                        // FIXED: Use consistent date format
                        $activityCost = CostActivityAllocation::where('activity_id', $activity->id)
                            ->whereDate('allocation_date', '>=', $startDateString)
                            ->whereDate('allocation_date', '<=', $endDateString)
                            ->sum('allocated_amount');

                        if ($activityCost > 0) {
                            $departmentTotalCost += $activityCost;
                            $departmentActivities[] = [
                                'name' => $activity->name,
                                'cost' => $activityCost
                            ];
                        }
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
                    \Log::error("Error processing department {$department->id}: " . $e->getMessage());
                    continue;
                }
            }

            // Process each activity
            foreach ($activities as $activity) {
                try {
                    // FIXED: Use consistent date format with Controller
                    $allocatedCost = (float) CostActivityAllocation::where('activity_id', $activity->id)
                        ->whereDate('allocation_date', '>=', $startDateString)
                        ->whereDate('allocation_date', '<=', $endDateString)
                        ->sum('allocated_amount') ?? 0.0;

                    // FIXED: Use same logic as Controller - all driver usage
                    $driverUsage = (float) ActivityCostDriverUsage::where('activity_id', $activity->id)
                        ->whereDate('usage_date', '>=', $startDateString)
                        ->whereDate('usage_date', '<=', $endDateString)
                        ->sum('usage_quantity') ?? 0.0;

                    // Calculate rate safely (same as Controller)
                    $rate = ($driverUsage > 0) ? ($allocatedCost / $driverUsage) : 0.0;
                    $activityRates[$activity->id] = $rate; // Store for product calculation

                    $activityReports->push([
                        'activity' => $activity,
                        'department' => $activity->department,
                        'allocated_cost' => $allocatedCost,
                        'driver_usage' => $driverUsage,
                        'activity_rate' => $rate,
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Error processing activity {$activity->id}: " . $e->getMessage());
                    continue;
                }
            }

            // Process each product
            foreach ($products as $product) {
                try {
                    // FIXED: Use consistent date format
                    $productUsages = ProductActivityUsage::where('product_id', $product->id)
                        ->whereDate('usage_date', '>=', $startDateString)
                        ->whereDate('usage_date', '<=', $endDateString)
                        ->with(['activity.primaryCostDriver', 'activity.department'])
                        ->get();

                    $totalProductCost = 0;
                    $productActivityDetails[$product->id] = [];
                    $productDepartmentBreakdown = [];

                    foreach ($productUsages as $usage) {
                        // FIXED: Use stored activity rates for consistency
                        $activityRate = $activityRates[$usage->activity_id] ?? 0.0;
                        $quantityConsumed = (float) ($usage->quantity_consumed ?? 0.0);
                        $allocatedCost = $quantityConsumed * $activityRate;
                        $totalProductCost += $allocatedCost;

                        $activity = $usage->activity ?? Activity::find($usage->activity_id);
                        $department = optional($activity)->department;
                        $costDriver = optional($activity)->primaryCostDriver;

                        $departmentName = $department ? $department->name : 'Tidak Ada Departemen';

                        $productActivityDetails[$product->id][] = [
                            'activity_name' => optional($activity)->name ?? 'Unknown Activity',
                            'department_name' => $departmentName,
                            'cost_driver_name' => optional($costDriver)->name ?? 'Multiple Drivers',
                            'cost_driver_unit' => optional($costDriver)->unit ?? 'Units',
                            'quantity_consumed' => $quantityConsumed,
                            'activity_rate' => $activityRate,
                            'allocated_cost' => $allocatedCost,
                        ];

                        // Aggregate by department
                        if (!isset($productDepartmentBreakdown[$departmentName])) {
                            $productDepartmentBreakdown[$departmentName] = 0.0;
                        }
                        $productDepartmentBreakdown[$departmentName] += $allocatedCost;
                    }

                    // FIXED: Use Production model and consistent date format
                    $productionQty = (float) Production::where('product_id', $product->id)
                        ->whereDate('production_date', '>=', $startDateString)
                        ->whereDate('production_date', '<=', $endDateString)
                        ->sum('quantity') ?? 0.0;

                    $unitCost = ($productionQty > 0) ? ($totalProductCost / $productionQty) : 0.0;

                    $productReports->push([
                        'product' => $product,
                        'total_production_quantity' => $productionQty,
                        'total_cost' => $totalProductCost,
                        'unit_cost' => $unitCost,
                        'department_breakdown' => $productDepartmentBreakdown,
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Error processing product {$product->id}: " . $e->getMessage());
                    continue;
                }
            }

            return view('exports.abc-reports-pdf-complete', [
                'activityReports' => $activityReports,
                'productReports' => $productReports,
                'departmentReports' => $departmentReports,
                'productActivityDetails' => $productActivityDetails,
                'selectedMonth' => $this->month,
                'selectedYear' => $this->year,
                'monthName' => Carbon::create($this->year, $this->month)->monthName, // TAMBAHAN: Consistent with PDF export
            ]);
        } catch (\Exception $e) {
            \Log::error('ABC Report Export Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty view with error message
            return view('exports.abc-reports-pdf-complete', [
                'activityReports' => collect(),
                'productReports' => collect(),
                'departmentReports' => collect(),
                'productActivityDetails' => [],
                'selectedMonth' => $this->month,
                'selectedYear' => $this->year,
                'monthName' => Carbon::create($this->year, $this->month)->monthName,
                'error' => 'Terjadi kesalahan saat memproses data laporan ABC'
            ]);
        }
    }
}
