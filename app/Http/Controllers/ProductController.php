<?php
// sudut-timur-backend/app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia; // Import Inertia

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = Product::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $generatedCode = Product::generateProductCode();

        $products = $query->latest()
            ->paginate($perPage)
            ->appends($request->all());

        return Inertia::render('Products/Index', [
            'products' => $products,
            'generatedCode' => $generatedCode,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        $lastProduct = Product::orderBy('id', 'desc')->first();

        if ($lastProduct && preg_match('/PRD-(\d+)/', $lastProduct->code, $matches)) {
            $lastNumber = (int) $matches[1];
        } else {
            $lastNumber = 0;
        }

        $newCode = 'PRD-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Product/Create', [
            'generatedCode' => $newCode,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            // Hapus validasi 'required' dan 'unique' untuk 'code' karena kita generate otomatis
            'type' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Generate kode otomatis
        $lastProduct = Product::latest('id')->first();
        $nextNumber = $lastProduct ? ((int) substr($lastProduct->code, -3)) + 1 : 1;
        $generatedCode = 'PRD-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // Gabungkan input dengan kode yang dihasilkan
        $data = $request->all();
        $data['code'] = $generatedCode;

        // Simpan data
        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan!');
    }


    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return redirect()->route('products.index')->with('error', 'Produk tidak ditemukan.');
        }

        return Inertia::render('Products/Show', [ // Anda bisa membuat komponen Products/Show.jsx
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
{
    $product = Product::find($id);

    if (!$product) {
        return redirect()->route('products.index')->with('error', 'Produk tidak ditemukan.');
    }

    $request->validate([
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:50|unique:products,code,' . $product->id,
        'type' => 'nullable|string|max:255',
        'description' => 'nullable|string',
    ]);

    $product->update([
        'name' => $request->name,
        'code' => $request->code,
        'type' => $request->type,
        'description' => $request->description,
    ]);

    return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui!');
}


    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return redirect()->route('products.index')->with('error', 'Produk tidak ditemukan.');
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus!');
    }

    public function exportExcel()
    {
        return Excel::download(new ProductsExport, 'produk.xlsx');
    }

    public function exportPdf()
    {
        $products = Product::all(); // atau data yang ingin kamu kirim
        $pdf = Pdf::loadView('exports.products', compact('products'));

        return $pdf->stream('produk.pdf');
    }
}
