<?php
// app/Http/Controllers/ActivityController.php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\CostDriver;
use App\Models\Department;
use App\Exports\ActivitiesExport; // TAMBAHAN: Import export class
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $perPage = $request->get('perPage', 10);

        $activities = Activity::with(['primaryCostDriver', 'department'])
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('department', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $costDrivers = CostDriver::orderBy('name')->get();
        $departments = Department::orderBy('name')->get();

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'costDrivers' => $costDrivers,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:activities,name',
            'description' => 'nullable|string|max:1000',
            'department_id' => 'required|exists:departments,id',
            'primary_cost_driver_id' => 'nullable|exists:cost_drivers,id',
        ]);

        Activity::create($validated);

        return redirect()->route('activities.index')->with('success', 'Aktivitas berhasil ditambahkan!');
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('activities', 'name')->ignore($activity->id)
            ],
            'description' => 'nullable|string|max:1000',
            'department_id' => 'required|exists:departments,id',
            'primary_cost_driver_id' => 'nullable|exists:cost_drivers,id',
        ]);

        $activity->update($validated);

        return redirect()->route('activities.index')->with('success', 'Aktivitas berhasil diperbarui!');
    }

    public function destroy(Activity $activity)
    {
        try {
            $activity->delete();
            return redirect()->route('activities.index')->with('success', 'Aktivitas berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->route('activities.index')->with('error', 'Gagal menghapus aktivitas. Data mungkin sedang digunakan.');
        }
    }

    // PERBAIKAN: Menggunakan Export Class
    public function exportExcel()
    {
        return Excel::download(new ActivitiesExport, 'daftar-aktivitas-' . date('Y-m-d') . '.xlsx');
    }

    // PERBAIKAN: Include department relationship
    public function exportPdf()
    {
        $activities = Activity::with(['primaryCostDriver', 'department'])->latest()->get();

        $pdf = Pdf::loadView('exports.activities', compact('activities'));

        return $pdf->stream('laporan-aktivitas-' . date('Y-m-d') . '.pdf');
    }
}
