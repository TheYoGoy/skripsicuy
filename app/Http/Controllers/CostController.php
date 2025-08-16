<?php
// sudut-timur-backend/app/Http/Controllers/CostController.php

namespace App\Http\Controllers;

use App\Models\Cost;
use App\Models\CostDriver;
use Illuminate\Http\Request;
use App\Exports\CostsExcel;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class CostController extends Controller
{
    /**
     * ✅ PERBAIKAN: Fungsi parsing yang lebih robust dengan logging yang benar
     */
    private function parseAmount($amount)
{
    \Log::info('parseAmount called', [
        'input' => $amount,
        'type' => gettype($amount)
    ]);

    if (empty($amount) || $amount === null) {
        \Log::info('parseAmount: empty input, returning 0');
        return 0;
    }

    // ✅ PERBAIKAN: Jika sudah berupa integer/number, langsung return
    if (is_numeric($amount) && !is_string($amount)) {
        \Log::info('parseAmount: already numeric, returning as is', [
            'value' => (int) $amount
        ]);
        return (int) $amount;
    }

    // Convert to string dan bersihkan hanya jika diperlukan
    $amountStr = (string) $amount;
    \Log::info('parseAmount converted to string', ['value' => $amountStr]);

    // Hapus semua karakter kecuali digit
    $cleanAmount = preg_replace('/[^\d]/', '', $amountStr);
    \Log::info('parseAmount after regex', ['value' => $cleanAmount]);

    $result = $cleanAmount ? (int) $cleanAmount : 0;
    \Log::info('parseAmount final result', ['value' => $result]);

    return $result;
}


    /**
     * Display a listing of the costs and render the Inertia page.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = Cost::query()->with('driver');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $costs = $query->latest()
            ->paginate($perPage)
            ->appends($request->all());

        $costDrivers = CostDriver::all(['id', 'name', 'unit']);

        return Inertia::render('Costs/Index', [
            'costs' => $costs,
            'costDrivers' => $costDrivers,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created cost in storage.
     * ✅ PERBAIKAN: Gunakan parseAmount yang aman
     */
    public function store(Request $request)
    {
        // Debug: Log data yang diterima
        \Log::info('Data received in store method', $request->all());

        // ✅ PERBAIKAN: Gunakan fungsi parsing yang lebih aman
        $parsedAmount = $this->parseAmount($request->input('amount'));
        
        // Debug: Log parsed amount
        \Log::info('Amount parsing result', [
            'original' => $request->input('amount'),
            'parsed' => $parsedAmount
        ]);
        
        $request->merge([
            'amount' => $parsedAmount
        ]);

        // Validasi data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'cost_driver_id' => 'required|exists:cost_drivers,id',
        ]);

        // Debug: Log validated data
        \Log::info('Validated data', $validated);

        try {
            // Create the cost
            $cost = Cost::create($validated);
            
            // Debug: Log created cost
            \Log::info('Cost created', $cost->toArray());

            // ✅ PERBAIKAN: Untuk request AJAX/Inertia, return back dengan success message
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return back()->with('success', 'Biaya berhasil ditambahkan!');
            }

            // Fallback untuk request biasa
            return redirect()->route('costs.index')->with('success', 'Biaya berhasil ditambahkan!');
            
        } catch (\Exception $e) {
            // Debug: Log error
            \Log::error('Error creating cost', ['error' => $e->getMessage()]);
            
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return back()->withErrors(['error' => 'Gagal menambahkan biaya: ' . $e->getMessage()]);
            }
            
            return redirect()->back()->withErrors(['error' => 'Gagal menambahkan biaya.'])->withInput();
        }
    }

    /**
     * Update the specified cost in storage.
     * ✅ PERBAIKAN: Gunakan parseAmount yang aman dan logging yang benar
     */
    // sudut-timur-backend/app/Http/Controllers/CostController.php

public function update(Request $request, Cost $cost)
{
    // Cek jika amount sudah numerik. Ini akan true jika frontend mengirim angka murni.
    if (is_numeric($request->input('amount'))) {
        $parsedAmount = (int) $request->input('amount');
    } else {
        // Jika tidak, baru lakukan parsing untuk menghilangkan pemisah ribuan
        $parsedAmount = $this->parseAmount($request->input('amount'));
    }

    $request->merge([
        'amount' => $parsedAmount
    ]);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'amount' => 'required|numeric|min:0',
        'cost_driver_id' => 'required|exists:cost_drivers,id',
    ]);

    try {
        $cost->update($validated);
        return back()->with('success', 'Biaya berhasil diperbarui!');
    } catch (\Exception $e) {
        \Log::error('Error updating cost', ['error' => $e->getMessage()]);
        return back()->withErrors(['error' => 'Gagal memperbarui biaya.']);
    }
}


    /**
     * Remove the specified cost from storage.
     * ✅ PERBAIKAN: Return proper response untuk Inertia.js
     */
    public function destroy(Cost $cost)
    {
        try {
            // Debug: Log cost to be deleted
            \Log::info('Deleting cost', $cost->toArray());
            
            $cost->delete();

            // ✅ PERBAIKAN: Consistent response handling
            return back()->with('success', 'Biaya berhasil dihapus!');
            
        } catch (\Exception $e) {
            // Debug: Log error
            \Log::error('Error deleting cost', ['error' => $e->getMessage()]);
            
            return back()->withErrors(['error' => 'Gagal menghapus biaya: ' . $e->getMessage()]);
        }
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new CostsExcel($request->search), 'costs.xlsx');
    }

    public function exportPdf()
    {
        $costs = Cost::all();
        $pdf = Pdf::loadView('exports.costs', compact('costs'));

        return $pdf->stream('costs.pdf');
    }
}