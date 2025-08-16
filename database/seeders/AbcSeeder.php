<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Product, Production};
use Carbon\Carbon;

class AbcSeeder extends Seeder
{
    public function run(): void
    {
        // === PRODUK KOPI SUDUT TIMUR ===
        $products = [
            // Single Origin Series
            [
                'code' => 'ST-ARA-001', 
                'name' => 'Sudut Timur Arabika Aceh Gayo', 
                'type' => 'Biji Utuh', 
                'description' => 'Single origin premium dari dataran tinggi Aceh'
            ],
            [
                'code' => 'ST-ARA-002', 
                'name' => 'Sudut Timur Arabika Toraja', 
                'type' => 'Biji Utuh', 
                'description' => 'Kopi arabika asli Tana Toraja'
            ],
            [
                'code' => 'ST-ARA-003', 
                'name' => 'Sudut Timur Arabika Kintamani', 
                'type' => 'Biji Utuh', 
                'description' => 'Arabika dari lereng Gunung Batur, Bali'
            ],
            [
                'code' => 'ST-ROB-001', 
                'name' => 'Sudut Timur Robusta Lampung', 
                'type' => 'Biji Utuh', 
                'description' => 'Robusta berkualitas dari Lampung'
            ],
            
            // Ground Coffee Series
            [
                'code' => 'ST-GRD-001', 
                'name' => 'Sudut Timur Medium Roast Ground', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Kopi bubuk roasting sedang untuk drip'
            ],
            [
                'code' => 'ST-GRD-002', 
                'name' => 'Sudut Timur Dark Roast Ground', 
                'type' => 'Bubuk Halus', 
                'description' => 'Kopi bubuk roasting gelap untuk espresso'
            ],
            [
                'code' => 'ST-GRD-003', 
                'name' => 'Sudut Timur French Press Ground', 
                'type' => 'Bubuk Kasar', 
                'description' => 'Kopi bubuk kasar untuk french press'
            ],
            
            // Blend Series
            [
                'code' => 'ST-BLD-001', 
                'name' => 'Sudut Timur House Blend', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Signature blend arabika-robusta 70:30'
            ],
            [
                'code' => 'ST-BLD-002', 
                'name' => 'Sudut Timur Morning Blend', 
                'type' => 'Bubuk Sedang', 
                'description' => 'Blend ringan untuk pagi hari'
            ],
            [
                'code' => 'ST-BLD-003', 
                'name' => 'Sudut Timur Espresso Blend', 
                'type' => 'Bubuk Halus', 
                'description' => 'Blend khusus untuk espresso dan latte'
            ],
            
            // Premium Series
            [
                'code' => 'ST-PRM-001', 
                'name' => 'Sudut Timur Premium Gold', 
                'type' => 'Biji Utuh', 
                'description' => 'Grade AAA premium selection'
            ],
            [
                'code' => 'ST-PRM-002', 
                'name' => 'Sudut Timur Luwak Coffee', 
                'type' => 'Biji Utuh', 
                'description' => 'Kopi luwak asli Jawa Timur'
            ],
            
            // Instant Series
            [
                'code' => 'ST-INS-001', 
                'name' => 'Sudut Timur Instant Classic', 
                'type' => 'Instant', 
                'description' => 'Kopi instan rasa klasik'
            ],
            [
                'code' => 'ST-INS-002', 
                'name' => 'Sudut Timur 3in1 Original', 
                'type' => 'Instant', 
                'description' => 'Kopi instan dengan gula dan krimer'
            ],
            [
                'code' => 'ST-INS-003', 
                'name' => 'Sudut Timur 3in1 Less Sugar', 
                'type' => 'Instant', 
                'description' => 'Kopi instan rendah gula'
            ],
        ];

        $createdProducts = [];
        foreach ($products as $productData) {
            $createdProducts[$productData['code']] = Product::firstOrCreate(
                ['code' => $productData['code']],
                [
                    'name' => $productData['name'],
                    'type' => $productData['type'],
                    'description' => $productData['description'],
                ]
            );
        }

        echo "✅ " . count($createdProducts) . " produk berhasil dibuat!\n";

        // === DATA PRODUKSI UNTUK 6 BULAN TERAKHIR ===
        $productionPattern = [
            // Single Origin Series - produksi terbatas (50-80 kg per bulan)
            'ST-ARA-001' => ['min' => 50, 'max' => 80, 'trend' => 'stable'],
            'ST-ARA-002' => ['min' => 45, 'max' => 75, 'trend' => 'increase'],
            'ST-ARA-003' => ['min' => 40, 'max' => 70, 'trend' => 'stable'],
            'ST-ROB-001' => ['min' => 80, 'max' => 120, 'trend' => 'increase'],
            
            // Ground Coffee Series - volume menengah (100-200 kg per bulan)
            'ST-GRD-001' => ['min' => 120, 'max' => 180, 'trend' => 'increase'],
            'ST-GRD-002' => ['min' => 100, 'max' => 160, 'trend' => 'stable'],
            'ST-GRD-003' => ['min' => 80, 'max' => 140, 'trend' => 'decrease'],
            
            // Blend Series - volume tinggi (150-300 kg per bulan)
            'ST-BLD-001' => ['min' => 200, 'max' => 300, 'trend' => 'stable'],
            'ST-BLD-002' => ['min' => 150, 'max' => 250, 'trend' => 'increase'],
            'ST-BLD-003' => ['min' => 180, 'max' => 280, 'trend' => 'stable'],
            
            // Premium Series - volume sangat terbatas (20-50 kg per bulan)
            'ST-PRM-001' => ['min' => 25, 'max' => 45, 'trend' => 'stable'],
            'ST-PRM-002' => ['min' => 15, 'max' => 30, 'trend' => 'increase'],
            
            // Instant Series - volume sangat tinggi (300-500 kg per bulan)
            'ST-INS-001' => ['min' => 300, 'max' => 450, 'trend' => 'increase'],
            'ST-INS-002' => ['min' => 350, 'max' => 500, 'trend' => 'stable'],
            'ST-INS-003' => ['min' => 200, 'max' => 350, 'trend' => 'increase'],
        ];

        // Generate data untuk 6 bulan terakhir (Maret - Agustus 2025)
        $months = [
            ['month' => 3, 'name' => 'Maret', 'factor' => 0.9],
            ['month' => 4, 'name' => 'April', 'factor' => 1.0],
            ['month' => 5, 'name' => 'Mei', 'factor' => 1.1],
            ['month' => 6, 'name' => 'Juni', 'factor' => 1.2],
            ['month' => 7, 'name' => 'Juli', 'factor' => 1.0],
            ['month' => 8, 'name' => 'Agustus', 'factor' => 0.95],
        ];

        $totalProductions = 0;

        foreach ($months as $monthIndex => $monthData) {
            echo "📅 Membuat data produksi untuk {$monthData['name']} 2025...\n";
            
            // Generate 10-15 hari produksi per bulan
            $productionDays = rand(10, 15);
            
            for ($day = 1; $day <= $productionDays; $day++) {
                $productionDate = Carbon::create(2025, $monthData['month'], rand(1, 28));
                
                // Pilih 3-8 produk yang diproduksi di hari tersebut
                $productsToday = array_rand($productionPattern, rand(3, 8));
                if (!is_array($productsToday)) {
                    $productsToday = [$productsToday];
                }
                
                foreach ($productsToday as $productCode) {
                    $pattern = $productionPattern[$productCode];
                    $product = $createdProducts[$productCode];
                    
                    // Hitung quantity berdasarkan trend dan seasonal factor
                    $baseQuantity = rand($pattern['min'], $pattern['max']);
                    
                    // Apply trend
                    $trendFactor = 1.0;
                    switch ($pattern['trend']) {
                        case 'increase':
                            $trendFactor = 1.0 + ($monthIndex * 0.05); // 5% increase per month
                            break;
                        case 'decrease':
                            $trendFactor = 1.0 - ($monthIndex * 0.03); // 3% decrease per month
                            break;
                        case 'stable':
                        default:
                            $trendFactor = 1.0 + (rand(-10, 10) / 100); // ±10% random variation
                            break;
                    }
                    
                    // Apply seasonal factor
                    $finalQuantity = round($baseQuantity * $trendFactor * $monthData['factor']);
                    
                    // Pastikan quantity minimal 1
                    $finalQuantity = max(1, $finalQuantity);
                    
                    // Generate catatan yang bervariasi
                    $notes = $this->generateProductionNotes($productCode, $monthData['name'], $finalQuantity);
                    
                    // Buat record produksi (hanya jika belum ada di tanggal yang sama)
                    $existingProduction = Production::where('product_id', $product->id)
                        ->whereDate('production_date', $productionDate->format('Y-m-d'))
                        ->first();
                    
                    if (!$existingProduction) {
                        Production::create([
                            'product_id' => $product->id,
                            'production_date' => $productionDate,
                            'quantity' => $finalQuantity,
                            'notes' => $notes,
                        ]);
                        
                        $totalProductions++;
                    }
                }
            }
            
            echo "   ✓ {$monthData['name']} selesai\n";
        }

        echo "\n🎉 Seeder Production Sudut Timur Coffee selesai!\n";
        echo "📊 Total Produk: " . count($createdProducts) . "\n";
        echo "📈 Total Record Produksi: " . $totalProductions . "\n";
        echo "📅 Periode: Maret - Agustus 2025\n";
        echo "💡 Data menggunakan pola yang realistis dengan tren dan variasi musiman\n";
    }

    /**
     * Generate catatan produksi yang bervariasi
     */
    private function generateProductionNotes($productCode, $monthName, $quantity): string
    {
        $productType = explode('-', $productCode)[1];
        
        $qualityNotes = [
            'ARA' => ['Kualitas biji premium', 'Sortir manual ketat', 'Aroma khas arabika', 'Single origin terpilih'],
            'ROB' => ['Biji robusta pilihan', 'Karakteristik kuat', 'Body tebal', 'Proses optimal'],
            'GRD' => ['Grind size konsisten', 'Roasting sempurna', 'Ready to brew', 'Kemasan kedap udara'],
            'BLD' => ['Blend ratio optimal', 'Rasa seimbang', 'Konsistensi terjaga', 'Formula house blend'],
            'PRM' => ['Grade AAA', 'Limited edition', 'Hand picked', 'Premium quality'],
            'INS' => ['Instant process', 'Dissolve perfect', 'Convenience pack', 'Mass production'],
        ];

        $processNotes = [
            'Produksi normal', 'Target tercapai', 'Kualitas terjaga', 'Proses lancar',
            'Batch premium', 'Quality control ketat', 'Standard tinggi', 'Hasil optimal'
        ];

        $seasonNotes = [
            'Maret' => 'Awal musim panen',
            'April' => 'Musim panen utama',
            'Mei' => 'Puncak musim panen',
            'Juni' => 'Akhir musim panen',
            'Juli' => 'Post harvest processing',
            'Agustus' => 'Inventory buildup'
        ];

        $notes = [];
        
        // Add quality note based on product type
        if (isset($qualityNotes[$productType])) {
            $notes[] = $qualityNotes[$productType][array_rand($qualityNotes[$productType])];
        }
        
        // Add process note
        $notes[] = $processNotes[array_rand($processNotes)];
        
        // Add seasonal context
        if (isset($seasonNotes[$monthName])) {
            $notes[] = $seasonNotes[$monthName];
        }
        
        // Add quantity context for large batches
        if ($quantity > 200) {
            $notes[] = 'Batch besar untuk stok';
        } elseif ($quantity < 30) {
            $notes[] = 'Batch terbatas';
        }

        return implode(' - ', $notes);
    }
}