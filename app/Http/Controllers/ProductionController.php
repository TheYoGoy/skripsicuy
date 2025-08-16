<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Exports\ProductionExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;

class ProductionController extends Controller
{
    /**
     * Display a listing of the productions and render the Inertia page.
     * Also passes the list of products for selection.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Ambil parameter pencarian dan pagination
        $search = $request->get('search');
        $perPage = $request->get('perPage', 10);

        // Query dengan eager loading
        $query = Production::with('product');

        // Aplikasikan filter pencarian jika ada
        if ($search) {
            $query->whereHas('product', function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })
            ->orWhere('notes', 'like', '%' . $search . '%')
            ->orWhere('quantity', 'like', '%' . $search . '%');
        }

        // Urutkan berdasarkan created_at terbaru dan gunakan pagination
        $productions = $query->orderBy('created_at', 'desc')
                            ->paginate($perPage)
                            ->withQueryString();

        // Ambil semua produk untuk dropdown
        $products = Product::all(['id', 'name']);

        return Inertia::render('Productions/Index', [
            'productions' => $productions,
            'products' => $products,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created production record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'production_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        Production::create($request->all());

        return redirect()->route('productions.index')->with('success', 'Catatan produksi berhasil ditambahkan!');
    }

    /**
     * Update the specified production record in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Production  $production
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Production $production)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'production_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $production->update($request->all());

        return redirect()->route('productions.index')->with('success', 'Catatan produksi berhasil diperbarui!');
    }

    /**
     * Remove the specified production record from storage.
     *
     * @param  \App\Models\Production  $production
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Production $production)
    {
        $production->delete();

        return redirect()->route('productions.index')->with('success', 'Catatan produksi berhasil dihapus!');
    }

    /**
     * Export productions to Excel
     */
    public function exportExcel(Request $request)
    {
        $search = $request->get('search');
        return Excel::download(new ProductionExport($search), 'productions.xlsx');
    }

    /**
     * Export productions to PDF
     */
    public function exportPdf(Request $request)
    {
        $search = $request->get('search');
        
        $query = Production::with(['product']);
        
        if ($search) {
            $query->whereHas('product', function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })
            ->orWhere('notes', 'like', '%' . $search . '%')
            ->orWhere('quantity', 'like', '%' . $search . '%');
        }
        
        $productions = $query->orderBy('created_at', 'desc')->get();

        $pdf = Pdf::loadView('exports.productions-pdf', compact('productions', 'search'))
                  ->setPaper('a4', 'landscape');
                  
        return $pdf->stream('productions.pdf');
    }
}