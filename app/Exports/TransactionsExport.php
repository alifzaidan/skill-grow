<?php

namespace App\Exports;

use App\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class TransactionsExport implements 
    FromQuery, 
    WithHeadings, 
    WithMapping, 
    WithColumnWidths,
    WithStyles
{
    protected $startDate;
    protected $endDate;
    protected $status;
    protected $paymentType;
    protected $productType;
    protected $bootcampId;  
    protected $webinarId;   
    protected $courseId;    

    public function __construct($filters = [])
    {
        $this->startDate = $filters['start_date'] ?? null;
        $this->endDate = $filters['end_date'] ?? null;
        $this->status = $filters['status'] ?? null;
        $this->paymentType = $filters['payment_type'] ?? null;
        $this->productType = $filters['product_type'] ?? null;
        $this->bootcampId = $filters['bootcamp_id'] ?? null;  
        $this->webinarId = $filters['webinar_id'] ?? null;    
        $this->courseId = $filters['course_id'] ?? null;      
    }

    public function query()
    {
        $query = Invoice::with([
            'user',
            'referrer',
            'courseItems.course',
            'bootcampItems.bootcamp',
            'webinarItems.webinar',
            'bundleEnrollments.bundle'
        ]);

        // Apply date filter
        if ($this->startDate && $this->endDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ]);
        }

        // Apply status filter
        if ($this->status) {
            $query->where('status', $this->status);
        }

        // Apply payment type filter
        if ($this->paymentType === 'free') {
            $query->where('nett_amount', 0);
        } elseif ($this->paymentType === 'paid') {
            $query->where('nett_amount', '>', 0);
        }

        // Apply product type filter
        if ($this->productType) {
            switch ($this->productType) {
                case 'course':
                    if ($this->courseId) {
                        // Filter by specific course
                        $query->whereHas('courseItems', function($q) {
                            $q->where('course_id', $this->courseId);
                        });
                    } else {
                        // All courses
                        $query->whereHas('courseItems');
                    }
                    break;
                case 'bootcamp':
                    if ($this->bootcampId) {
                        // Filter by specific bootcamp
                        $query->whereHas('bootcampItems', function($q) {
                            $q->where('bootcamp_id', $this->bootcampId);
                        });
                    } else {
                        // All bootcamps
                        $query->whereHas('bootcampItems');
                    }
                    break;
                case 'webinar':
                    if ($this->webinarId) {
                        // Filter by specific webinar
                        $query->whereHas('webinarItems', function($q) {
                            $q->where('webinar_id', $this->webinarId);
                        });
                    } else {
                        // All webinars
                        $query->whereHas('webinarItems');
                    }
                    break;
                case 'bundle':
                    $query->whereHas('bundleEnrollments');
                    break;
            }
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode Invoice',
            'Nama Pembeli',
            'Email',
            'No. HP',
            'Nama Produk',
            'Jenis Produk',
            'Harga Asli',
            'Diskon',
            'Biaya Admin',
            'Total Bayar',
            'Status',
            'Jenis Pembayaran',
            'Metode Pembayaran',
            'Channel Pembayaran',
            'Afiliasi',
            'Tanggal Pembelian',
            'Tanggal Pembayaran',
        ];
    }

    public function map($invoice): array
    {
        static $index = 0;
        $index++;

        return [
            $index,
            $invoice->invoice_code,
            $invoice->user->name ?? '-',
            $invoice->user->email ?? '-',
            $invoice->user->phone_number ?? '-',
            $this->getProductNames($invoice),
            $this->getProductType($invoice),
            'Rp ' . number_format($invoice->amount, 0, ',', '.'),
            'Rp ' . number_format($invoice->discount_amount ?? 0, 0, ',', '.'),
            'Rp ' . number_format($invoice->transaction_fee ?? 0, 0, ',', '.'),
            'Rp ' . number_format($invoice->nett_amount, 0, ',', '.'),
            ucfirst($invoice->status),
            $invoice->nett_amount === 0 ? 'Gratis' : 'Berbayar',
            $invoice->payment_method ?? '-',
            $invoice->payment_channel ?? '-',
            $invoice->referrer->name ?? '-',
            $invoice->created_at ? $invoice->created_at->format('d M Y, H:i') : '-',
            $invoice->paid_at ? Carbon::parse($invoice->paid_at)->format('d M Y, H:i') : '-',
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,  // No
            'B' => 15, // Kode Invoice
            'C' => 25, // Nama Pembeli
            'D' => 30, // Email
            'E' => 15, // No. HP
            'F' => 40, // Nama Produk
            'G' => 15, // Jenis Produk
            'H' => 15, // Harga Asli
            'I' => 15, // Diskon
            'J' => 12, // Biaya Admin
            'K' => 15, // Total Bayar
            'L' => 10, // Status
            'M' => 15, // Jenis Pembayaran
            'N' => 18, // Metode Pembayaran
            'O' => 18, // Channel Pembayaran
            'P' => 25, // Afiliasi
            'Q' => 20, // Tanggal Pembelian
            'R' => 20, // Tanggal Pembayaran
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style header row
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E0E0E0']
                ],
            ],
        ];
    }

    private function getProductNames($invoice): string
    {
        $names = [];

        if ($invoice->courseItems) {
            foreach ($invoice->courseItems as $item) {
                $names[] = $item->course->title ?? '-';
            }
        }

        if ($invoice->bootcampItems) {
            foreach ($invoice->bootcampItems as $item) {
                $names[] = $item->bootcamp->title ?? '-';
            }
        }

        if ($invoice->webinarItems) {
            foreach ($invoice->webinarItems as $item) {
                $names[] = $item->webinar->title ?? '-';
            }
        }

        if ($invoice->bundleEnrollments) {
            foreach ($invoice->bundleEnrollments as $item) {
                $names[] = $item->bundle->title ?? '-';
            }
        }

        return implode(', ', $names) ?: '-';
    }

    private function getProductType($invoice): string
    {
        if ($invoice->courseItems && $invoice->courseItems->count() > 0) return 'Kelas Online';
        if ($invoice->bootcampItems && $invoice->bootcampItems->count() > 0) return 'Bootcamp';
        if ($invoice->webinarItems && $invoice->webinarItems->count() > 0) return 'Webinar';
        if ($invoice->bundleEnrollments && $invoice->bundleEnrollments->count() > 0) return 'Bundle';
        return '-';
    }
}
