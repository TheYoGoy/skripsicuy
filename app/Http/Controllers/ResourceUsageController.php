<?php
// app/Http/Controllers/ResourceUsageController.php

namespace App\Http\Controllers;

use App\Models\ResourceUsage;
use App\Models\Activity;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResourceUsageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = ResourceUsage::with(['activity', 'costDriver'])
            ->orderBy('usage_date', 'desc');

        if ($search) {
            $query->whereHas('activity', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('costDriver', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $usages = $query->paginate($perPage)->appends($request->all());
        $activities = Activity::all(['id', 'name']);
        $costDrivers = CostDriver::all(['id', 'name', 'unit']);

        return Inertia::render('ResourceUsages/Index', [
            'usages' => $usages,
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
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'usage_quantity' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat
        $existingUsage = ResourceUsage::where('activity_id', $request->activity_id)
            ->where('cost_driver_id', $request->cost_driver_id)
            ->where('usage_date', $request->usage_date)
            ->first();

        if ($existingUsage) {
            return redirect()->back()->withErrors([
                'unique_usage' => 'Penggunaan sumber daya ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        ResourceUsage::create($request->all());

        return redirect()->route('resource-usages.index')
            ->with('success', 'Penggunaan Sumber Daya berhasil ditambahkan!');
    }

    public function update(Request $request, ResourceUsage $resourceUsage)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
            'usage_quantity' => 'required|numeric|min:0',
            'usage_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Cek duplikat untuk update
        $existingUsage = ResourceUsage::where('activity_id', $request->activity_id)
            ->where('cost_driver_id', $request->cost_driver_id)
            ->where('usage_date', $request->usage_date)
            ->where('id', '!=', $resourceUsage->id)
            ->first();

        if ($existingUsage) {
            return redirect()->back()->withErrors([
                'unique_usage' => 'Penggunaan sumber daya ini pada tanggal tersebut sudah ada.'
            ])->withInput();
        }

        $resourceUsage->update($request->all());

        return redirect()->route('resource-usages.index')
            ->with('success', 'Penggunaan Sumber Daya berhasil diperbarui!');
    }

    public function destroy(ResourceUsage $resourceUsage)
    {
        $resourceUsage->delete();

        return redirect()->route('resource-usages.index')
            ->with('success', 'Penggunaan Sumber Daya berhasil dihapus!');
    }
}