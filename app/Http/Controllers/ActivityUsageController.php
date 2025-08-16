<?php
// app/Http/Controllers/ActivityUsageController.php

namespace App\Http\Controllers;

use App\Models\ActivityUsage;
use App\Models\Product;
use App\Models\Activity;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityUsageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = ActivityUsage::with(['product', 'activity', 'costDriver'])
            ->orderBy('usage_date', 'desc');

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('activity', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $usages = $query->paginate($perPage)->appends($request->all());
        $products = Product::all(['id', 'name']);
        $activities = Activity::all(['id', 'name']);
        $costDrivers = CostDriver::all(['id', 'name', 'unit']);

        return Inertia::render('ActivityUsages/Index', [
            'usages' => $usages,
            'products' => $products,
            'activities' => $activities,
            'costDrivers' => $costDrivers,
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
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'usage_quantity' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat
        $existingUsage = ActivityUsage::where('product_id', $request->product_id)
            ->where('activity_id', $request->activity_id)
            ->where('cost_driver_id', $request->cost_driver_id)
            ->where('usage_date', $request->usage_date)
            ->first();

        if ($existingUsage) {
            return redirect()->back()->withErrors([
                'unique_usage' => 'Penggunaan aktivitas ini untuk produk ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        ActivityUsage::create($request->all());

        return redirect()->route('activity-usages.index')
            ->with('success', 'Penggunaan Aktivitas berhasil ditambahkan!');
    }

    public function update(Request $request, ActivityUsage $activityUsage)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'usage_quantity' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat untuk update
        $existingUsage = ActivityUsage::where('product_id', $request->product_id)
            ->where('activity_id', $request->activity_id)
            ->where('cost_driver_id', $request->cost_driver_id)
            ->where('usage_date', $request->usage_date)
            ->where('id', '!=', $activityUsage->id)
            ->first();

        if ($existingUsage) {
            return redirect()->back()->withErrors([
                'unique_usage' => 'Penggunaan aktivitas ini untuk produk ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        $activityUsage->update($request->all());

        return redirect()->route('activity-usages.index')
            ->with('success', 'Penggunaan Aktivitas berhasil diperbarui!');
    }

    public function destroy(ActivityUsage $activityUsage)
    {
        $activityUsage->delete();

        return redirect()->route('activity-usages.index')
            ->with('success', 'Penggunaan Aktivitas berhasil dihapus!');
    }
}