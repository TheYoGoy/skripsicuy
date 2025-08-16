<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductActivityUsage;
use App\Models\Production;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'code',
        'description',
    ];

    // === METHOD YANG SUDAH ADA ===
    public static function generateProductCode()
    {
        $lastProduct = self::orderBy('id', 'desc')->first();

        if ($lastProduct && preg_match('/PRD-(\d+)/', $lastProduct->code, $matches)) {
            $lastNumber = (int) $matches[1];
        } else {
            $lastNumber = 0;
        }

        return 'PRD-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }

    // === RELATIONSHIPS YANG SUDAH ADA ===
    public function productions() 
    {
        return $this->hasMany(Production::class); 
    }

    public function productActivityUsages()
    {
        return $this->hasMany(ProductActivityUsage::class);
    }

    // === TAMBAHKAN RELATIONSHIPS BARU DI SINI ===
    public function activityUsages()
    {
        return $this->hasMany(ActivityUsage::class);
    }

    public function productionRecords()
    {
        return $this->hasMany(ProductionRecord::class);
    }

    public function productCostAllocations()
    {
        return $this->hasMany(ProductCostAllocation::class);
    }
}