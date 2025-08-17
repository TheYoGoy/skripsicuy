<?php
// app/Models/ProductActivityUsage.php - FIXED VERSION

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductActivityUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'activity_id',
        'cost_driver_id',
        'quantity_consumed',
        'allocated_amount',  // ✅ FIXED: Added missing field
        'usage_date',
        'notes',
    ];

    protected $casts = [
        'quantity_consumed' => 'float',
        'allocated_amount' => 'float',  // ✅ FIXED: Added casting
        'usage_date' => 'date',
    ];

    // Define relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function costDriver()
    {
        return $this->belongsTo(CostDriver::class);
    }

    // ✅ FIXED: Scope untuk period filtering
    public function scopeForPeriod($query, $year, $month)
    {
        return $query->whereYear('usage_date', $year)
            ->whereMonth('usage_date', $month);
    }

    // ✅ FIXED: Scope untuk product filtering
    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }
}
