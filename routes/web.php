<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CostController;
use App\Http\Controllers\CostDriverController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\CostActivityAllocationController;
use App\Http\Controllers\ActivityCostDriverUsageController;
use App\Http\Controllers\ProductActivityUsageController;
use App\Http\Controllers\ABCReportController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Redirect ke login jika akses root
Route::get('/', function () {
    return redirect()->route('login');
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard tunggal
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Users
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);

    // Products
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
    Route::get('/products/export/excel', [ProductController::class, 'exportExcel'])->name('products.export.excel');
    Route::get('/products/export/pdf', [ProductController::class, 'exportPdf'])->name('products.export.pdf');

    // Activities
    Route::resource('activities', ActivityController::class)->except(['create', 'edit', 'show']);
    Route::get('/activities/export/excel', [ActivityController::class, 'exportExcel'])->name('activities.export.excel');
    Route::get('/activities/export/pdf', [ActivityController::class, 'exportPdf'])->name('activities.export.pdf');

    // Costs
    Route::resource('costs', CostController::class)->except(['create', 'edit', 'show']);
    Route::get('/costs/export-excel', [CostController::class, 'exportExcel'])->name('costs.export.excel');
    Route::get('/costs/export-pdf', [CostController::class, 'exportPdf'])->name('costs.export.pdf');

    // Cost Drivers
    Route::resource('cost-drivers', CostDriverController::class)->except(['create', 'edit', 'show']);
    Route::get('/cost-drivers/export-excel', [CostDriverController::class, 'exportExcel'])->name('costDrivers.exportExcel');
    Route::get('/cost-drivers/export-pdf', [CostDriverController::class, 'exportPdf'])->name('costDrivers.exportPdf');

    // Departments
    Route::resource('departments', DepartmentController::class)->except(['create', 'edit', 'show']);
    Route::get('/departments/export-excel', [DepartmentController::class, 'exportExcel'])->name('departments.exportExcel');
    Route::get('/departments/export-pdf', [DepartmentController::class, 'exportPdf'])->name('departments.exportPdf');

    // Productions
    Route::resource('productions', ProductionController::class)->except(['create', 'edit', 'show']);
    Route::get('/productions/export/excel', [ProductionController::class, 'exportExcel'])->name('productions.export.excel');
    Route::get('/productions/export/pdf', [ProductionController::class, 'exportPdf'])->name('productions.export.pdf');

    // Cost Activity Allocations - Route khusus harus diletakkan SEBELUM resource route
    Route::post('/cost-activity-allocations/calculate', [CostActivityAllocationController::class, 'calculate'])->name('cost-activity-allocations.calculate');
    Route::post('/cost-activity-allocations/activities-by-date', [CostActivityAllocationController::class, 'getActivitiesByDate'])->name('cost-activity-allocations.activities-by-date');
    Route::resource('cost-activity-allocations', CostActivityAllocationController::class)->except(['create', 'edit', 'show']);

    // Product Activity Usages
    Route::resource('product-activity-usages', ProductActivityUsageController::class)->except(['create', 'edit', 'show']);
    Route::get('/product-activity-usages/export/excel', [ProductActivityUsageController::class, 'exportExcel'])->name('product-activity-usages.export.excel');
    Route::get('/product-activity-usages/export/pdf', [ProductActivityUsageController::class, 'exportPdf'])->name('product-activity-usages.export.pdf');

    // Activity Cost Driver Usages
    Route::resource('activity-cost-driver-usages', ActivityCostDriverUsageController::class)->except(['create', 'edit', 'show']);
    Route::get('/activity-cost-driver-usages/export/excel', [ActivityCostDriverUsageController::class, 'exportExcel'])->name('activity-cost-driver-usages.export.excel');
    Route::get('/activity-cost-driver-usages/export/pdf', [ActivityCostDriverUsageController::class, 'exportPdf'])->name('activity-cost-driver-usages.export.pdf');

    // ABC Reports
    Route::get('/abc-reports', [ABCReportController::class, 'index'])->name('abc-reports.index');
    Route::get('/abc-reports/export/pdf', [ABCReportController::class, 'exportPdf'])->name('abc-reports.export.pdf');
    Route::get('/abc-reports/export/excel', [ABCReportController::class, 'exportExcel'])->name('abc-reports.export.excel');
});

// Fallback route for 404
Route::fallback(function () {
    return Inertia::render('Errors/NotFound');
});

require __DIR__ . '/auth.php';