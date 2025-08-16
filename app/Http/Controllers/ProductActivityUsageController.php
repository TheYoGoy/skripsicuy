<?php
// sudut-timur-backend/app/Http/Controllers/ProductActivityUsageController.php

namespace App\Http\Controllers;

use App\Models\ProductActivityUsage;
use App\Models\Product;
use App\Models\Activity;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use App\Exports\ProductActivityUsagesExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

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

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'quantity_consumed' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

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

        ProductActivityUsage::create([
            'product_id' => $request->product_id,
            'activity_id' => $request->activity_id,
            'cost_driver_id' => $request->cost_driver_id,
            'quantity_consumed' => $request->quantity_consumed,
            'usage_date' => $request->usage_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('product-activity-usages.index')
                        ->with('success', 'Penggunaan Aktivitas per Produk berhasil ditambahkan!');
    }

    public function update(Request $request, ProductActivityUsage $productActivityUsage)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'quantity_consumed' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

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

        $productActivityUsage->update([
            'product_id' => $request->product_id,
            'activity_id' => $request->activity_id,
            'cost_driver_id' => $request->cost_driver_id,
            'quantity_consumed' => $request->quantity_consumed,
            'usage_date' => $request->usage_date,
            'notes' => $request->notes,
        ]);

        return redirect()->route('product-activity-usages.index')
                        ->with('success', 'Penggunaan Aktivitas per Produk berhasil diperbarui!');
    }

    public function destroy(ProductActivityUsage $productActivityUsage)
    {
        $productActivityUsage->delete();
        return redirect()->route('product-activity-usages.index')
                        ->with('success', 'Penggunaan Aktivitas per Produk berhasil dihapus!');
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