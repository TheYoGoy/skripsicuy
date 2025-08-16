<?php
// sudut-timur-backend/app/Http/Controllers/DepartmentController.php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\DepartmentsExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;// Import Inertia

class DepartmentController extends Controller
{
    /**
     * Display a listing of the departments and render the Inertia page.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search');

        $query = Department::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $departments = $query->latest()
            ->paginate($perPage)
            ->appends($request->all());

        // Pass department data directly to the React component via Inertia props
        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created department in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Department::create($request->all());

        // Redirect back to the departments page after successful storage
        return redirect()->route('departments.index')->with('success', 'Departemen berhasil ditambahkan!');
    }

    /**
     * Update the specified department in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Department $department)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department->update($request->all());

        return redirect()->route('departments.index')->with('success', 'Departemen berhasil diperbarui!');
    }

    /**
     * Remove the specified department from storage.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Department $department)
    {
        $department->delete();

        return redirect()->route('departments.index')->with('success', 'Departemen berhasil dihapus!');
    }

    public function exportExcel()
    {
        return Excel::download(new DepartmentsExport, 'departemen.xlsx');
    }

    // Export PDF
    public function exportPdf()
    {
        $departments = Department::all();
        $pdf = Pdf::loadView('exports.departments', compact('departments'));

        return $pdf->stream('departemen.pdf');
    }
}
