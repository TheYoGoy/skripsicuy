<?php
// app/Http/Controllers/ProductionRecordController.php

namespace App\Http\Controllers;

use App\Models\ProductionRecord;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductionRecordController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = ProductionRecord::with('product')
            ->orderBy('production_date', 'desc');

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $records = $query->paginate($perPage)->appends($request->all());
        $products = Product::all(['id', 'name']);

        return Inertia::render('ProductionRecords/Index', [
            'records' => $records,
            'products' => $products,
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
            'quantity_produced' => 'required|numeric|min:0',
            'production_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        ProductionRecord::create($request->all());

        return redirect()->route('production-records.index')
            ->with('success', 'Catatan Produksi berhasil ditambahkan!');
    }

    public function update(Request $request, ProductionRecord $productionRecord)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity_produced' => 'required|numeric|min:0',
            'production_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $productionRecord->update($request->all());

        return redirect()->route('production-records.index')
            ->with('success', 'Catatan Produksi berhasil diperbarui!');
    }

    public function destroy(ProductionRecord $productionRecord)
    {
        $productionRecord->delete();

        return redirect()->route('production-records.index')
            ->with('success', 'Catatan Produksi berhasil dihapus!');
    }
}