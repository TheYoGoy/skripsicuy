<?php 
// sudut-timur-backend/app/Models/ActivityCostDriverUsage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityCostDriverUsage extends Model
{
    use HasFactory;

    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'activity_id',
        'cost_driver_id',
        'usage_quantity',
        'usage_date',
        'notes',
    ];

    // Cast 'usage_quantity' to float for easier handling
    protected $casts = [
        'usage_quantity' => 'float',
        'usage_date' => 'date',
    ];

    // Define relationships
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function costDriver()
    {
        return $this->belongsTo(CostDriver::class);
    }

    // PERBAIKAN: Hapus atau perbaiki relationship product jika tidak diperlukan
    // Jika tabel ini tidak punya kolom product_id, hapus method ini
    // public function product() {
    //     return $this->belongsTo(Product::class);
    // }
}