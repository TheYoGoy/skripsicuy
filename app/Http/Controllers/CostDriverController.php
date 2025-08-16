<?php
// sudut-timur-backend/app/Http/Controllers/CostDriverController.php

namespace App\Http\Controllers;

use App\Models\CostDriver;
use Illuminate\Http\Request;
use App\Exports\CostDriversExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia; // Import Inertia

class CostDriverController extends Controller
{
    /**
     * Display a listing of the cost drivers and render the Inertia page.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = CostDriver::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('unit', 'like', "%{$search}%");
            });
        }

        $costDrivers = $query->latest()
            ->paginate($perPage)
            ->appends($request->all());
        // Pass cost driver data directly to the React component via Inertia props
        return Inertia::render('CostDrivers/Index', [
            'costDrivers' => $costDrivers,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created cost driver in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        CostDriver::create($request->all());

        // Redirect back to the cost drivers page after successful storage
        return redirect()->route('cost-drivers.index')->with('success', 'Driver Biaya berhasil ditambahkan!');
    }

    /**
     * Update the specified cost driver in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CostDriver  $costDriver
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, CostDriver $costDriver)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $costDriver->update($request->all());

        return redirect()->route('cost-drivers.index')->with('success', 'Driver Biaya berhasil diperbarui!');
    }

    /**
     * Remove the specified cost driver from storage.
     *
     * @param  \App\Models\CostDriver  $costDriver
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(CostDriver $costDriver)
{
    try {
        $costDriver->delete();

        return redirect()
            ->route('cost-drivers.index')
            ->with('success', 'Driver Biaya berhasil dihapus!');
    } catch (\Exception $e) {
        \Log::error('Gagal menghapus cost driver: ' . $e->getMessage());

        return redirect()
            ->route('cost-drivers.index')
            ->with('error', 'Terjadi kesalahan saat menghapus driver biaya.');
    }
}



    public function exportExcel()
    {
        return Excel::download(new CostDriversExport, 'biaya-driver.xlsx');
    }

    // Export PDF
    public function exportPdf()
    {
        $costDrivers = CostDriver::all(); // Ambil semua data biaya driver
        $pdf = Pdf::loadView('exports.cost-drivers', compact('costDrivers'));

        return $pdf->stream('biaya-driver.pdf');
    }
}
