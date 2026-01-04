<?php

namespace App\Http\Controllers;

use App\Models\AffiliateEarning;
use App\Models\Bootcamp;
use App\Models\Bundle;
use App\Models\Certificate;
use App\Models\CertificateParticipant;
use App\Models\Course;
use App\Models\DiscountUsage;
use App\Models\EnrollmentBootcamp;
use App\Models\EnrollmentBundle;
use App\Models\EnrollmentCourse;
use App\Models\EnrollmentWebinar;
use App\Models\FreeEnrollmentRequirement;
use App\Models\Invoice;
use App\Models\User;
use App\Models\Webinar;
use App\Services\DokuService;
use App\Traits\WablasTrait;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Haruncpi\LaravelIdGenerator\IdGenerator;
use Illuminate\Support\Facades\Log;

use Xendit\Configuration;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Invoice\InvoiceApi;

class InvoiceController extends Controller
{
    use WablasTrait;

    protected $dokuService;

    public function __construct(DokuService $dokuService)
    {
        $this->dokuService = $dokuService;
    }

    public function index()
    {
        $invoices = Invoice::with([
            'user.referrer',
            'courseItems.course',
            'bootcampItems.bootcamp',
            'webinarItems.webinar',
            'bundleEnrollments.bundle'
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        // ✅ Calculate Statistics
        $totalTransactions = $invoices->count();
        $paidTransactions = $invoices->where('status', 'paid')->count();
        $pendingTransactions = $invoices->where('status', 'pending')->count();
        $failedTransactions = $invoices->where('status', 'failed')->count();

        // Revenue statistics
        $totalRevenue = $invoices->where('status', 'paid')->sum('nett_amount');
        $totalGross = $invoices->where('status', 'paid')->sum('amount');
        $totalDiscount = $invoices->where('status', 'paid')->sum('discount_amount');

        // Free vs Paid
        $freeEnrollments = $invoices->where('status', 'paid')->where('nett_amount', 0)->count();
        $paidEnrollments = $invoices->where('status', 'paid')->where('nett_amount', '>', 0)->count();

        // Product Type Breakdown
        $courseTransactions = $invoices->filter(fn($inv) => $inv->courseItems->count() > 0)->count();
        $bootcampTransactions = $invoices->filter(fn($inv) => $inv->bootcampItems->count() > 0)->count();
        $webinarTransactions = $invoices->filter(fn($inv) => $inv->webinarItems->count() > 0)->count();
        $bundleTransactions = $invoices->filter(fn($inv) => $inv->bundleEnrollments->count() > 0)->count();

        // Affiliate statistics
        $affiliateTransactions = $invoices->filter(fn($inv) => $inv->user && $inv->user->referrer)->count();
        $affiliateRevenue = $invoices
            ->where('status', 'paid')
            ->filter(fn($inv) => $inv->user && $inv->user->referrer)
            ->sum('nett_amount');

        // Today's statistics
        $todayTransactions = $invoices->filter(function ($inv) {
            return Carbon::parse($inv->created_at)->isToday();
        })->count();

        $todayRevenue = $invoices
            ->where('status', 'paid')
            ->filter(function ($inv) {
                return Carbon::parse($inv->paid_at)->isToday();
            })
            ->sum('nett_amount');

        // This month statistics
        $thisMonthTransactions = $invoices->filter(function ($inv) {
            return Carbon::parse($inv->created_at)->isCurrentMonth();
        })->count();

        $thisMonthRevenue = $invoices
            ->where('status', 'paid')
            ->filter(function ($inv) {
                return Carbon::parse($inv->paid_at)->isCurrentMonth();
            })
            ->sum('nett_amount');

        // Average transaction value
        $averageTransactionValue = $paidEnrollments > 0
            ? $totalRevenue / $paidEnrollments
            : 0;

        // Success rate
        $successRate = $totalTransactions > 0
            ? ($paidTransactions / $totalTransactions) * 100
            : 0;

        $statistics = [
            'overview' => [
                'total_transactions' => $totalTransactions,
                'paid_transactions' => $paidTransactions,
                'pending_transactions' => $pendingTransactions,
                'failed_transactions' => $failedTransactions,
                'success_rate' => round($successRate, 1),
            ],
            'revenue' => [
                'total_revenue' => $totalRevenue,
                'total_gross' => $totalGross,
                'total_discount' => $totalDiscount,
                'average_transaction' => round($averageTransactionValue, 0),
            ],
            'enrollment_type' => [
                'free_enrollments' => $freeEnrollments,
                'paid_enrollments' => $paidEnrollments,
            ],
            'product_breakdown' => [
                'course' => $courseTransactions,
                'bootcamp' => $bootcampTransactions,
                'webinar' => $webinarTransactions,
                'bundle' => $bundleTransactions,
            ],
            'period' => [
                'today_transactions' => $todayTransactions,
                'today_revenue' => $todayRevenue,
                'month_transactions' => $thisMonthTransactions,
                'month_revenue' => $thisMonthRevenue,
            ],
        ];

        return Inertia::render('admin/transactions/index', [
            'invoices' => $invoices,
            'statistics' => $statistics,
        ]);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'type' => 'required|in:course,bootcamp,webinar',
                'id' => 'required|string',
                'discount_amount' => 'nullable|numeric|min:0',
                'nett_amount' => 'required|numeric|min:0',
                'transaction_fee' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'discount_code_id' => 'nullable|string|exists:discount_codes,id',
                'discount_code_amount' => 'nullable|numeric|min:0',
            ]);

            $user = Auth::user();
            $type = $validated['type'];
            $productId = $validated['id'];

            // Check if user has pending invoice for this product
            $existingInvoice = Invoice::where('user_id', $user->id)
                ->where('status', 'pending')
                ->where(function ($query) use ($type, $productId) {
                    if ($type === 'course') {
                        $query->whereHas('courseItems', function ($q) use ($productId) {
                            $q->where('course_id', $productId);
                        });
                    } elseif ($type === 'bootcamp') {
                        $query->whereHas('bootcampItems', function ($q) use ($productId) {
                            $q->where('bootcamp_id', $productId);
                        });
                    } elseif ($type === 'webinar') {
                        $query->whereHas('webinarItems', function ($q) use ($productId) {
                            $q->where('webinar_id', $productId);
                        });
                    }
                })
                ->first();

            if ($existingInvoice && $existingInvoice->invoice_url) {
                DB::rollBack();
                return response()->json([
                    'success' => true,
                    'payment_url' => $existingInvoice->invoice_url,
                    'message' => 'Invoice sudah ada, silakan lanjutkan pembayaran.'
                ], 200);
            }

            // Generate unique invoice code
            $invoiceCode = IdGenerator::generate([
                'table' => 'invoices',
                'field' => 'invoice_code',
                'length' => 20,
                'prefix' => 'INV-' . date('Ymd') . '-',
                'reset_on_prefix_change' => true
            ]);

            // Get product details
            if ($type === 'course') {
                $product = Course::findOrFail($productId);
                $itemName = $product->title;
            } elseif ($type === 'bootcamp') {
                $product = Bootcamp::findOrFail($productId);
                $itemName = $product->title;
            } elseif ($type === 'webinar') {
                $product = Webinar::findOrFail($productId);
                $itemName = $product->title;
            }

            // Validate pricing
            $discountCodeAmount = isset($validated['discount_code_amount']) ? $validated['discount_code_amount'] : 0;
            $expectedNettAmount = $product->price - $discountCodeAmount;
            $expectedTotal = $expectedNettAmount > 0 ? $expectedNettAmount + $validated['transaction_fee'] : 0;

            if ($validated['nett_amount'] != $expectedNettAmount) {
                throw new \Exception('Harga nett tidak sesuai');
            }

            if ($validated['total_amount'] != $expectedTotal) {
                throw new \Exception('Total amount tidak sesuai');
            }

            // Create invoice
            $invoice = Invoice::create([
                'id' => Str::uuid(),
                'invoice_code' => $invoiceCode,
                'user_id' => $user->id,
                'discount_amount' => isset($validated['discount_amount']) ? $validated['discount_amount'] : 0,
                'amount' => $validated['total_amount'],
                'nett_amount' => $validated['nett_amount'],
                'status' => 'pending',
                'expires_at' => now()->addHour(),
            ]);

            // Create invoice item
            if ($type === 'course') {
                $invoice->courseItems()->create([
                    'id' => Str::uuid(),
                    'course_id' => $productId,
                    'price' => $product->price,
                ]);
            } elseif ($type === 'bootcamp') {
                $invoice->bootcampItems()->create([
                    'id' => Str::uuid(),
                    'bootcamp_id' => $productId,
                    'price' => $product->price,
                ]);
            } elseif ($type === 'webinar') {
                $invoice->webinarItems()->create([
                    'id' => Str::uuid(),
                    'webinar_id' => $productId,
                    'price' => $product->price,
                ]);
            }

            // Handle discount code
            if (isset($validated['discount_code_id']) && !empty($validated['discount_code_id'])) {
                $discountCode = \App\Models\DiscountCode::find($validated['discount_code_id']);

                if ($discountCode && $discountCode->isValid() && $discountCode->canBeUsedByUser($user->id)) {
                    DiscountUsage::create([
                        'id' => Str::uuid(),
                        'discount_code_id' => $discountCode->id,
                        'invoice_id' => $invoice->id,
                        'user_id' => $user->id,
                        'discount_amount' => $validated['discount_code_amount'],
                    ]);

                    $discountCode->increment('used_count');
                }
            }

            // Add to certificate participants
            $this->addToCertificateParticipants($type, $productId, $user->id);

            // Create DOKU payment
            try {
                $customerData = [
                    'customer_id' => 'USER-' . $user->id,
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                    'customer_phone' => $user->phone_number,
                    'item_name' => $itemName,
                    'item_description' => ucfirst($type) . ' - ' . $itemName,
                ];

                Log::info('Creating DOKU checkout', [
                    'invoice_code' => $invoiceCode,
                    'amount' => $validated['total_amount'],
                    'customer' => $customerData
                ]);

                $dokuResponse = $this->dokuService->createCheckout(
                    $invoiceCode,
                    (int) $validated['total_amount'],
                    $customerData
                );

                Log::info('DOKU Response received', [
                    'invoice_code' => $invoiceCode,
                    'response' => $dokuResponse
                ]);

                // Parse payment URL from DOKU response
                $paymentUrl = null;
                if (isset($dokuResponse['response']['payment']['url'])) {
                    $paymentUrl = $dokuResponse['response']['payment']['url'];
                } elseif (isset($dokuResponse['payment']['url'])) {
                    $paymentUrl = $dokuResponse['payment']['url'];
                } elseif (isset($dokuResponse['url'])) {
                    $paymentUrl = $dokuResponse['url'];
                }

                if (!$paymentUrl) {
                    throw new \Exception('Payment URL not found in DOKU response: ' . json_encode($dokuResponse));
                }

                // Update invoice with payment URL
                $invoice->update([
                    'invoice_url' => $paymentUrl,
                ]);

                DB::commit();

                Log::info('Invoice created successfully', [
                    'invoice_code' => $invoiceCode,
                    'payment_url' => $paymentUrl
                ]);

                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'invoice_code' => $invoiceCode,
                ], 200);
            } catch (\Exception $e) {
                // Rollback transaction jika DOKU gagal
                DB::rollBack();

                Log::error('DOKU Payment Creation Failed', [
                    'invoice_code' => $invoiceCode,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat pembayaran: ' . $e->getMessage(),
                ], 400);
            }
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Invoice Store Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 400);
        }
    }

    public function storeBundle(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'bundle_id' => 'required|string|exists:bundles,id',
                'discount_amount' => 'nullable|numeric|min:0',
                'nett_amount' => 'required|numeric|min:0',
                'transaction_fee' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
            ]);

            $user = Auth::user();
            $bundleId = $validated['bundle_id'];

            $bundle = Bundle::with('bundleItems.bundleable')->findOrFail($bundleId);

            // Validate bundle availability
            if (!$bundle->isAvailable()) {
                throw new \Exception('Bundle tidak tersedia untuk pembelian');
            }

            if ($bundle->price === 0) {
                throw new \Exception('Bundle ini gratis, tidak perlu checkout');
            }

            if ($bundle->isPurchasedByUser($user->id)) {
                throw new \Exception('Anda sudah membeli bundle ini');
            }

            $existingInvoice = Invoice::where('user_id', $user->id)
                ->where('status', 'pending')
                ->whereHas('bundleEnrollments', function ($q) use ($bundleId) {
                    $q->where('bundle_id', $bundleId);
                })
                ->first();

            if ($existingInvoice && $existingInvoice->invoice_url) {
                DB::rollBack();
                return response()->json([
                    'success' => true,
                    'payment_url' => $existingInvoice->invoice_url,
                    'message' => 'Invoice sudah ada, silakan lanjutkan pembayaran.'
                ], 200);
            }

            $expectedNettAmount = $bundle->price;
            $expectedTotal = $expectedNettAmount + $validated['transaction_fee'];

            if ($validated['nett_amount'] != $expectedNettAmount) {
                throw new \Exception('Harga nett tidak sesuai');
            }

            if ($validated['total_amount'] != $expectedTotal) {
                throw new \Exception('Total amount tidak sesuai');
            }

            $invoiceCode = IdGenerator::generate([
                'table' => 'invoices',
                'field' => 'invoice_code',
                'length' => 20,
                'prefix' => 'INV-' . date('Ymd') . '-',
                'reset_on_prefix_change' => true
            ]);

            $invoice = Invoice::create([
                'id' => Str::uuid(),
                'invoice_code' => $invoiceCode,
                'user_id' => $user->id,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'amount' => $validated['total_amount'],
                'nett_amount' => $validated['nett_amount'],
                'status' => 'pending',
                'expires_at' => now()->addHours(24),
            ]);

            EnrollmentBundle::create([
                'id' => Str::uuid(),
                'invoice_id' => $invoice->id,
                'bundle_id' => $bundle->id,
                'price' => $validated['nett_amount'],
            ]);

            foreach ($bundle->bundleItems as $bundleItem) {
                $type = $this->getBundleItemType($bundleItem->bundleable_type);
                if ($type && $bundleItem->bundleable) {
                    $this->addToCertificateParticipants($type, $bundleItem->bundleable->id, $user->id);
                }
            }

            // Create DOKU payment
            try {
                $customerData = [
                    'customer_id' => 'USER-' . $user->id,
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                    'customer_phone' => $user->phone_number,
                    'item_name' => $bundle->title,
                    'item_description' => 'Paket Bundling - ' . $bundle->title . ' (' . $bundle->bundle_items_count . ' Program)',
                ];

                Log::info('Creating DOKU checkout for bundle', [
                    'invoice_code' => $invoiceCode,
                    'bundle_id' => $bundle->id,
                    'amount' => $validated['total_amount'],
                    'customer' => $customerData
                ]);

                $dokuResponse = $this->dokuService->createCheckout(
                    $invoiceCode,
                    (int) $validated['total_amount'],
                    $customerData
                );

                Log::info('DOKU Response received for bundle', [
                    'invoice_code' => $invoiceCode,
                    'response' => $dokuResponse
                ]);

                $paymentUrl = null;
                if (isset($dokuResponse['response']['payment']['url'])) {
                    $paymentUrl = $dokuResponse['response']['payment']['url'];
                } elseif (isset($dokuResponse['payment']['url'])) {
                    $paymentUrl = $dokuResponse['payment']['url'];
                } elseif (isset($dokuResponse['url'])) {
                    $paymentUrl = $dokuResponse['url'];
                }

                if (!$paymentUrl) {
                    throw new \Exception('Payment URL not found in DOKU response: ' . json_encode($dokuResponse));
                }

                // Update invoice with payment URL
                $invoice->update([
                    'invoice_url' => $paymentUrl,
                ]);

                DB::commit();

                Log::info('Bundle invoice created successfully', [
                    'invoice_code' => $invoiceCode,
                    'bundle_id' => $bundle->id,
                    'payment_url' => $paymentUrl
                ]);

                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'invoice_code' => $invoiceCode,
                    'invoice_id' => $invoice->id
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('DOKU Payment Creation Failed for Bundle', [
                    'invoice_code' => $invoiceCode,
                    'bundle_id' => $bundle->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat pembayaran: ' . $e->getMessage(),
                ], 400);
            }
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bundle Invoice Store Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function enrollFree(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id();
            $type = $request->input('type', 'course');
            $itemId = $request->input('id');

            $item = null;
            $enrollmentTable = null;
            $enrollmentField = null;

            if ($type === 'course') {
                $item = Course::findOrFail($itemId);
                $enrollmentTable = EnrollmentCourse::class;
                $enrollmentField = 'course_id';
            } elseif ($type === 'bootcamp') {
                $item = Bootcamp::findOrFail($itemId);
                $enrollmentTable = EnrollmentBootcamp::class;
                $enrollmentField = 'bootcamp_id';
            } elseif ($type === 'webinar') {
                $item = Webinar::findOrFail($itemId);
                $enrollmentTable = EnrollmentWebinar::class;
                $enrollmentField = 'webinar_id';
            } else {
                throw new \Exception('Tipe pendaftaran tidak valid');
            }

            if ($item->price > 0) {
                throw new \Exception('Item ini tidak gratis');
            }

            $existingEnrollment = $enrollmentTable::where($enrollmentField, $item->id)
                ->whereHas('invoice', function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->where('status', 'paid');
                })
                ->first();

            if ($existingEnrollment) {
                throw new \Exception('Anda sudah terdaftar untuk item ini');
            }

            $invoice_code = IdGenerator::generate([
                'table' => 'invoices',
                'field' => 'invoice_code',
                'length' => 11,
                'reset_on_prefix_change'  => true,
                'prefix' => 'SGW-' . date('y')
            ]);

            $invoice = Invoice::create([
                'user_id' => $userId,
                'invoice_code' => $invoice_code,
                'discount_amount' => 0,
                'amount' => 0,
                'nett_amount' => 0,
                'status' => 'paid',
                'paid_at' => Carbon::now('Asia/Jakarta'),
                'payment_method' => 'FREE',
                'payment_channel' => 'FREE_ENROLLMENT',
                'expires_at' => null,
            ]);

            $enrollment = $enrollmentTable::create([
                'invoice_id' => $invoice->id,
                $enrollmentField => $item->id,
                'price' => 0,
                'completed_at' => null,
                'progress' => 0,
            ]);

            if ($type === 'webinar' || $type === 'bootcamp') {
                $requirementData = [
                    'enrollment_type' => $type,
                    'enrollment_id' => $enrollment->id
                ];

                if ($request->hasFile('ig_follow_proof')) {
                    $requirementData['ig_follow_proof'] = $request->file('ig_follow_proof')
                        ->store('free-requirements/ig', 'public');
                }

                if ($request->hasFile('tiktok_follow_proof')) {
                    $requirementData['tiktok_follow_proof'] = $request->file('tiktok_follow_proof')
                        ->store('free-requirements/tiktok', 'public');
                }

                if ($request->hasFile('tag_friend_proof')) {
                    $requirementData['tag_friend_proof'] = $request->file('tag_friend_proof')
                        ->store('free-requirements/tag', 'public');
                }

                FreeEnrollmentRequirement::create($requirementData);
            }

            $this->addToCertificateParticipants($type, $item->id, $userId);

            // $this->sendWhatsAppFreeEnrollment($invoice, $type, $item);

            DB::commit();

            return redirect()->route('invoice.show', ['id' => $invoice->id])
                ->with('success', 'Pendaftaran gratis berhasil! Anda akan segera menerima konfirmasi.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('Free enrollment failed', [
                'error' => $th->getMessage(),
                'user_id' => Auth::id(),
                'type' => $request->input('type'),
                'id' => $request->input('id')
            ]);

            return back()->withErrors(['message' => $th->getMessage()]);
        }
    }

    public function show($id)
    {
        $invoice = Invoice::with(['courseItems.course', 'bootcampItems.bootcamp', 'webinarItems.webinar'])->findOrFail($id);
        return Inertia::render('user/checkout/success', ['invoice' => $invoice]);
    }

    /**
     * Cancel invoice manually (both in database and Xendit)
     */
    public function cancel($id)
    {
        DB::beginTransaction();
        try {
            $isAdmin = Auth::user() && Auth::user()->hasRole('admin');

            $query = Invoice::with('discountUsage.discountCode')
                ->where('id', $id)
                ->where('status', 'pending');

            if (!$isAdmin) {
                $query->where('user_id', Auth::id());
            }

            $invoice = $query->firstOrFail();

            // $this->expireInvoiceInXendit($invoice->invoice_code);

            if ($invoice->discountUsage) {
                $discountCode = $invoice->discountUsage->discountCode;
                if ($discountCode) {
                    $discountCode->decrement('used_count');
                }
                $invoice->discountUsage->delete();
            }

            if ($invoice->courseItems->count() > 0) {
                EnrollmentCourse::where('invoice_id', $invoice->id)->delete();
            }

            if ($invoice->bootcampItems->count() > 0) {
                EnrollmentBootcamp::where('invoice_id', $invoice->id)->delete();
            }

            if ($invoice->webinarItems->count() > 0) {
                EnrollmentWebinar::where('invoice_id', $invoice->id)->delete();
            }

            $userId = $invoice->user_id;

            foreach ($invoice->courseItems as $courseItem) {
                $certificate = Certificate::where('course_id', $courseItem->course_id)->first();
                if ($certificate) {
                    $hasOtherPaidEnrollment = EnrollmentCourse::where('course_id', $courseItem->course_id)
                        ->whereHas('invoice', function ($query) use ($userId) {
                            $query->where('user_id', $userId)
                                ->where('status', 'paid');
                        })
                        ->exists();

                    if (!$hasOtherPaidEnrollment) {
                        CertificateParticipant::where('certificate_id', $certificate->id)
                            ->where('user_id', $userId)
                            ->delete();
                    }
                }
            }

            foreach ($invoice->bootcampItems as $bootcampItem) {
                $certificate = Certificate::where('bootcamp_id', $bootcampItem->bootcamp_id)->first();
                if ($certificate) {
                    $hasOtherPaidEnrollment = EnrollmentBootcamp::where('bootcamp_id', $bootcampItem->bootcamp_id)
                        ->whereHas('invoice', function ($query) use ($userId) {
                            $query->where('user_id', $userId)
                                ->where('status', 'paid');
                        })
                        ->exists();

                    if (!$hasOtherPaidEnrollment) {
                        CertificateParticipant::where('certificate_id', $certificate->id)
                            ->where('user_id', $userId)
                            ->delete();
                    }
                }
            }

            foreach ($invoice->webinarItems as $webinarItem) {
                $certificate = Certificate::where('webinar_id', $webinarItem->webinar_id)->first();
                if ($certificate) {
                    $hasOtherPaidEnrollment = EnrollmentWebinar::where('webinar_id', $webinarItem->webinar_id)
                        ->whereHas('invoice', function ($query) use ($userId) {
                            $query->where('user_id', $userId)
                                ->where('status', 'paid');
                        })
                        ->exists();

                    if (!$hasOtherPaidEnrollment) {
                        CertificateParticipant::where('certificate_id', $certificate->id)
                            ->where('user_id', $userId)
                            ->delete();
                    }
                }
            }

            $invoice->update(['status' => 'failed']);

            DB::commit();

            return redirect()->back()->with('success', 'Invoice berhasil dibatalkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membatalkan invoice. ' . $e->getMessage(),
                'success' => false
            ], 400);
        }
    }

    public function expireOldInvoices()
    {
        $expiredInvoices = Invoice::where('status', 'pending')
            ->where('expires_at', '<', Carbon::now())
            ->get();

        foreach ($expiredInvoices as $invoice) {
            // Cancel expired invoices in DOKU if needed
            // $this->dokuService->cancelInvoice($invoice->invoice_code);
            $invoice->update(['status' => 'failed']);
        }

        return response()->json([
            'message' => count($expiredInvoices) . ' invoices expired and updated.',
            'expired_count' => count($expiredInvoices)
        ]);
    }

    public function dokuReturn(Request $request)
    {
        $invoiceCode = $request->query('invoice_number')
            ?? $request->query('order_id')
            ?? $request->query('TRANSIDMERCHANT')
            ?? $request->query('invoice_code');

        if (!$invoiceCode) {
            return redirect('/')->with('warning', 'Invoice tidak ditemukan.');
        }

        $invoice = Invoice::where('invoice_code', $invoiceCode)->first();
        if (!$invoice) {
            return redirect('/')->with('warning', 'Invoice tidak ditemukan.');
        }

        return redirect()->route('invoice.show', ['id' => $invoice->id]);
    }

    /**
     * DOKU Payment Callback
     */
    public function callbackDoku(Request $request)
    {
        try {
            $invoiceCode =
                $request->input('TRANSIDMERCHANT')
                ?? $request->input('invoice_number')
                ?? $request->input('order_id')
                ?? data_get($request->all(), 'order.invoice_number')
                ?? data_get($request->all(), 'response.order.invoice_number')
                ?? data_get($request->all(), 'result.order.invoice_number');

            $status =
                $request->input('RESULTMSG')
                ?? $request->input('status')
                ?? $request->input('payment_status')
                ?? $request->input('transaction_status')
                ?? data_get($request->all(), 'transaction.status')
                ?? data_get($request->all(), 'response.transaction.status');

            $channel =
                $request->input('PAYMENTCHANNEL')
                ?? data_get($request->all(), 'payment.channel')
                ?? data_get($request->all(), 'transaction.payment_method.code')
                ?? data_get($request->all(), 'channel.id')
                ?? 'DOKU';

            if (!$invoiceCode) {
                Log::error('DOKU Callback: Invoice code not found in request');
                return response('SUCCESS', 200);
            }

            $invoice = Invoice::with([
                'user',
                'courseItems.course',
                'bootcampItems.bootcamp',
                'webinarItems.webinar',
                'bundleEnrollments.bundle.bundleItems.bundleable'
            ])->where('invoice_code', $invoiceCode)->first();

            if (!$invoice) {
                Log::error('DOKU Callback: Invoice not found', ['invoice_code' => $invoiceCode]);
                return response('SUCCESS', 200);
            }

            $successStatuses = ['SUCCESS', 'PAID', 'COMPLETED'];
            $isSuccess = in_array(strtoupper((string)$status), $successStatuses);

            if ($isSuccess && $invoice->status === 'pending') {
                $invoice->update([
                    'paid_at'         => Carbon::now('Asia/Jakarta'),
                    'status'          => 'paid',
                    'payment_method'  => $channel,
                    'payment_channel' => $channel,
                ]);

                // Record affiliate commission
                $this->recordAffiliateCommission($invoice);

                // Add enrollment to certificate participants
                $this->addEnrollmentToCertificateParticipants($invoice);

                // Handle bundle enrollment - create individual enrollments
                if ($invoice->hasBundle()) {
                    $this->createIndividualEnrollmentsFromBundle($invoice);
                }

                Log::info('DOKU Callback: Payment successful', [
                    'invoice_code' => $invoiceCode,
                    'invoice_id'   => $invoice->id,
                    'type'         => $invoice->getInvoiceType(),
                ]);
            } elseif (!$isSuccess && $invoice->status === 'pending') {
                $invoice->update(['status' => 'failed']);
                Log::info('DOKU Callback: Payment failed', [
                    'invoice_code' => $invoiceCode,
                    'status'       => $status,
                ]);
            }

            return response('SUCCESS', 200);
        } catch (\Exception $e) {
            Log::error('DOKU Callback Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response('SUCCESS', 200);
        }
    }

    /**
     * Create individual enrollments from bundle items after payment success
     */
    private function createIndividualEnrollmentsFromBundle(Invoice $invoice)
    {
        try {
            foreach ($invoice->bundleEnrollments as $bundleEnrollment) {
                $bundle = $bundleEnrollment->bundle;

                if (!$bundle) {
                    continue;
                }

                foreach ($bundle->bundleItems as $bundleItem) {
                    if (!$bundleItem->bundleable) {
                        continue;
                    }

                    $type = $this->getBundleItemType($bundleItem->bundleable_type);

                    if ($type === 'course') {
                        // Check if enrollment already exists
                        $existingEnrollment = EnrollmentCourse::where('invoice_id', $invoice->id)
                            ->where('course_id', $bundleItem->bundleable_id)
                            ->first();

                        if (!$existingEnrollment) {
                            EnrollmentCourse::create([
                                'id' => Str::uuid(),
                                'invoice_id' => $invoice->id,
                                'course_id' => $bundleItem->bundleable_id,
                                'price' => $bundleItem->price,
                                'progress' => 0,
                            ]);
                        }
                    } elseif ($type === 'bootcamp') {
                        $existingEnrollment = EnrollmentBootcamp::where('invoice_id', $invoice->id)
                            ->where('bootcamp_id', $bundleItem->bundleable_id)
                            ->first();

                        if (!$existingEnrollment) {
                            EnrollmentBootcamp::create([
                                'id' => Str::uuid(),
                                'invoice_id' => $invoice->id,
                                'bootcamp_id' => $bundleItem->bundleable_id,
                                'price' => $bundleItem->price,
                                'progress' => 0,
                            ]);
                        }
                    } elseif ($type === 'webinar') {
                        $existingEnrollment = EnrollmentWebinar::where('invoice_id', $invoice->id)
                            ->where('webinar_id', $bundleItem->bundleable_id)
                            ->first();

                        if (!$existingEnrollment) {
                            EnrollmentWebinar::create([
                                'id' => Str::uuid(),
                                'invoice_id' => $invoice->id,
                                'webinar_id' => $bundleItem->bundleable_id,
                                'price' => $bundleItem->price,
                            ]);
                        }
                    }
                }
            }

            Log::info('Individual enrollments created from bundle', [
                'invoice_id' => $invoice->id,
                'invoice_code' => $invoice->invoice_code
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create individual enrollments from bundle', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function getBundleItemType(string $bundleableType): ?string
    {
        if (str_contains($bundleableType, 'Course')) {
            return 'course';
        } elseif (str_contains($bundleableType, 'Bootcamp')) {
            return 'bootcamp';
        } elseif (str_contains($bundleableType, 'Webinar')) {
            return 'webinar';
        }
        return null;
    }

    /**
     * Kirim notifikasi WhatsApp setelah pembayaran berhasil
     *
     * @param Invoice $invoice
     * @return void
     */
    // private function sendWhatsAppNotification(Invoice $invoice)
    // {
    //     try {
    //         $user = $invoice->user;

    //         if (!$user->phone_number) {
    //             Log::warning('User does not have phone number', ['user_id' => $user->id, 'invoice_code' => $invoice->invoice_code]);
    //             return;
    //         }

    //         $phoneNumber = $this->formatPhoneNumber($user->phone_number);
    //         $message = $this->createWhatsAppMessage($invoice);

    //         $waData = [
    //             [
    //                 'phone' => $phoneNumber,
    //                 'message' => $message,
    //                 'isGroup' => 'false'
    //             ]
    //         ];

    //         $sent = self::sendText($waData);

    //         if ($sent) {
    //             Log::info('WhatsApp notification sent successfully', [
    //                 'invoice_code' => $invoice->invoice_code,
    //                 'user_id' => $user->id,
    //                 'phone' => $phoneNumber
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send WhatsApp notification', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }

    /**
     * Kirim notifikasi WhatsApp untuk pembayaran gagal
     *
     * @param Invoice $invoice
     * @return void
     */
    // private function sendWhatsAppPaymentFailed(Invoice $invoice)
    // {
    //     try {
    //         $user = $invoice->user;

    //         if (!$user->phone_number) {
    //             return;
    //         }

    //         $phoneNumber = $this->formatPhoneNumber($user->phone_number);

    //         $itemType = 'Program';
    //         if ($invoice->courseItems->count() > 0) {
    //             $itemType = 'Kelas Online';
    //         } elseif ($invoice->bootcampItems->count() > 0) {
    //             $itemType = 'Bootcamp';
    //         } elseif ($invoice->webinarItems->count() > 0) {
    //             $itemType = 'Webinar';
    //         }

    //         $message = "*[SkillGrow - Pembayaran {$itemType} Gagal]*\n\n";
    //         $message .= "Hai *{$user->name}*,\n\n";
    //         $message .= "Maaf, pembayaran {$itemType} untuk invoice *{$invoice->invoice_code}* tidak berhasil atau telah kadaluarsa.\n\n";
    //         $message .= "Silakan melakukan pembelian ulang jika Anda masih berminat.\n\n";
    //         $message .= "Terima kasih atas perhatiannya.\n\n";
    //         $message .= "*Araska - Customer Support*";

    //         $waData = [
    //             [
    //                 'phone' => $phoneNumber,
    //                 'message' => $message,
    //                 'isGroup' => 'false'
    //             ]
    //         ];

    //         self::sendText($waData);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send WhatsApp payment failed notification', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }

    /**
     * Buat pesan WhatsApp berdasarkan item yang dibeli
     *
     * @param Invoice $invoice
     * @return string
     */
    // private function createWhatsAppMessage(Invoice $invoice): string
    // {
    //     $user = $invoice->user;
    //     $loginUrl = route('login');
    //     $profileUrl = route('profile.index');

    //     $invoice->load('discountUsage.discountCode');

    //     $itemType = null;
    //     $itemData = null;
    //     $typeInfo = null;

    //     if ($invoice->bundleEnrollments->count() > 0) {
    //         $itemType = 'bundle';
    //         $bundleEnrollment = $invoice->bundleEnrollments->first();
    //         $bundle = $bundleEnrollment->bundle;

    //         $typeInfo = [
    //             'icon' => '📦',
    //             'name' => 'Paket Bundling',
    //             'menu' => 'Dashboard',
    //             'title' => $bundle->title,
    //             'item' => $bundle
    //         ];
    //     } elseif ($invoice->courseItems->count() > 0) {
    //         $itemType = 'course';
    //         $itemData = $invoice->courseItems->first();
    //         $typeInfo = [
    //             'icon' => '📚',
    //             'name' => 'Kelas Online',
    //             'menu' => 'Kelas Saya',
    //             'title' => $itemData->course->title,
    //             'item' => $itemData->course
    //         ];
    //     } elseif ($invoice->bootcampItems->count() > 0) {
    //         $itemType = 'bootcamp';
    //         $itemData = $invoice->bootcampItems->first();
    //         $typeInfo = [
    //             'icon' => '🎯',
    //             'name' => 'Bootcamp',
    //             'menu' => 'Bootcamp Saya',
    //             'title' => $itemData->bootcamp->title,
    //             'item' => $itemData->bootcamp
    //         ];
    //     } elseif ($invoice->webinarItems->count() > 0) {
    //         $itemType = 'webinar';
    //         $itemData = $invoice->webinarItems->first();
    //         $typeInfo = [
    //             'icon' => '📺',
    //             'name' => 'Webinar',
    //             'menu' => 'Webinar Saya',
    //             'title' => $itemData->webinar->title,
    //             'item' => $itemData->webinar
    //         ];
    //     }

    //     $isFreePurchase = $invoice->amount == 0;

    //     if ($isFreePurchase) {
    //         $message = "*[SkillGrow - Pendaftaran {$typeInfo['name']} Berhasil]* ✅\n\n";
    //         $message .= "Hai *{$user->name}*,\n\n";
    //         $message .= "Selamat! Anda telah berhasil mendaftar untuk {$typeInfo['name']} GRATIS.\n\n";
    //     } else {
    //         $message = "*[SkillGrow - Pembayaran {$typeInfo['name']} Berhasil]* ✅\n\n";
    //         $message .= "Hai *{$user->name}*,\n\n";
    //         $message .= "Terima kasih! Pembayaran {$typeInfo['name']} Anda telah berhasil diproses.\n\n";
    //     }

    //     $message .= "*Detail " . ($isFreePurchase ? 'Pendaftaran' : 'Pembelian') . ":*\n";
    //     $message .= "🧾 " . ($isFreePurchase ? 'Kode' : 'Invoice') . ": *{$invoice->invoice_code}*\n";
    //     $message .= "{$typeInfo['icon']} {$typeInfo['name']}: *{$typeInfo['title']}*\n";

    //     if ($itemType === 'bundle') {
    //         $bundle = $typeInfo['item'];
    //         $message .= "📦 Berisi: *{$bundle->bundle_items_count} Program*\n";
    //     }

    //     if ($isFreePurchase) {
    //         $message .= "💰 Biaya: *GRATIS* 🎉\n";
    //     } else {
    //         if ($invoice->discountUsage && $invoice->discountUsage->discountCode) {
    //             $discountCode = $invoice->discountUsage->discountCode;
    //             $message .= "🏷️ Kode Promo: *{$discountCode->code}* (-Rp " . number_format($invoice->discountUsage->discount_amount, 0, ',', '.') . ")\n";
    //         }
    //         $message .= "💰 Total: *Rp " . number_format($invoice->amount, 0, ',', '.') . "*\n";
    //     }

    //     $message .= "📅 " . ($isFreePurchase ? 'Terdaftar' : 'Dibayar') . ": " . Carbon::parse($invoice->paid_at)->format('d M Y H:i') . "\n\n";

    //     $message .= "*Cara Mengakses:*\n";
    //     $message .= "1. Login ke akun Anda: {$loginUrl}\n";
    //     $message .= "2. Kunjungi dashboard: {$profileUrl}\n";
    //     if ($itemType === 'bundle') {
    //         $message .= "3. Semua program sudah bisa diakses dari menu masing-masing\n";
    //         $message .= "4. Mulai belajar dan raih sertifikat untuk setiap program! 🎓\n\n";
    //     } else {
    //         $message .= "3. Pilih menu '{$typeInfo['menu']}'\n";
    //         $message .= "4. Mulai belajar dan raih sertifikat! 🎓\n\n";
    //     }

    //     if ($itemType === 'webinar') {
    //         $webinar = $typeInfo['item'];
    //         $startTime = Carbon::parse($webinar->start_time);
    //         $message .= "*Jadwal Webinar:*\n";
    //         $message .= "📅 {$startTime->format('d M Y')}\n";
    //         $message .= "🕐 {$startTime->format('H:i')} WIB\n\n";

    //         if (!empty($webinar->group_url)) {
    //             $message .= "*Join Group Webinar:*\n";
    //             $message .= "👥 {$webinar->group_url}\n\n";
    //             $message .= "⚠️ *Penting:* \n";
    //             $message .= "• Bergabung dengan group untuk update terbaru\n";
    //             $message .= "• Jangan lupa attend sesuai jadwal!\n\n";
    //         } else {
    //             $message .= "⚠️ *Penting:* Jangan lupa bergabung sesuai jadwal!\n\n";
    //         }
    //     } elseif ($itemType === 'bootcamp') {
    //         $bootcamp = $typeInfo['item'];
    //         $startDate = Carbon::parse($bootcamp->start_date);
    //         $endDate = Carbon::parse($bootcamp->end_date);
    //         $message .= "*Periode Bootcamp:*\n";
    //         $message .= "📅 {$startDate->format('d M Y')} - {$endDate->format('d M Y')}\n\n";

    //         if (!empty($bootcamp->group_url)) {
    //             $message .= "*Join Group Bootcamp:*\n";
    //             $message .= "👥 {$bootcamp->group_url}\n\n";
    //             $message .= "⚠️ *Penting:* \n";
    //             $message .= "• Bergabung dengan group untuk mendapatkan info penting dan diskusi\n";
    //             $message .= "• Aktif mengikuti seluruh kegiatan bootcamp\n\n";
    //         }
    //     }

    //     if ($isFreePurchase) {
    //         $message .= "Terima kasih telah bergabung dengan SkillGrow! 🚀\n\n";
    //     } else {
    //         $message .= "Jika ada pertanyaan, jangan ragu untuk menghubungi kami.\n\n";
    //         $message .= "Selamat belajar! 🚀\n\n";
    //     }

    //     $message .= "*Araska - Customer Support*";

    //     return $message;
    // }

    /**
     * Kirim notifikasi WhatsApp untuk pendaftaran gratis
     *
     * @param Invoice $invoice
     * @param string $type
     * @param mixed $item
     * @return void
     */
    // private function sendWhatsAppFreeEnrollment(Invoice $invoice, string $type, $item)
    // {
    //     try {
    //         $user = $invoice->user;

    //         if (!$user->phone_number) {
    //             Log::warning('User does not have phone number for free enrollment', [
    //                 'user_id' => $user->id,
    //                 'invoice_code' => $invoice->invoice_code
    //             ]);
    //             return;
    //         }

    //         $phoneNumber = $this->formatPhoneNumber($user->phone_number);
    //         $message = $this->createWhatsAppMessage($invoice);

    //         $waData = [
    //             [
    //                 'phone' => $phoneNumber,
    //                 'message' => $message,
    //                 'isGroup' => 'false'
    //             ]
    //         ];

    //         $sent = self::sendText($waData);

    //         if ($sent) {
    //             Log::info('WhatsApp free enrollment notification sent successfully', [
    //                 'invoice_code' => $invoice->invoice_code,
    //                 'user_id' => $user->id,
    //                 'phone' => $phoneNumber,
    //                 'type' => $type
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send WhatsApp free enrollment notification', [
    //             'invoice_code' => $invoice->invoice_code,
    //             'type' => $type,
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }

    /**
     * Format nomor HP ke format WhatsApp (62...)
     *
     * @param string $phoneNumber
     * @return string
     */
    // private function formatPhoneNumber(string $phoneNumber): string
    // {
    //     // Hapus semua karakter non-digit
    //     $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

    //     // Jika dimulai dengan 0, ganti dengan 62
    //     if (substr($phoneNumber, 0, 1) == '0') {
    //         $phoneNumber = '62' . substr($phoneNumber, 1);
    //     }

    //     // Jika belum dimulai dengan 62, tambahkan 62
    //     if (substr($phoneNumber, 0, 2) != '62') {
    //         $phoneNumber = '62' . $phoneNumber;
    //     }

    //     return $phoneNumber;
    // }

    /**
     * Mencatat komisi untuk afiliasi jika ada.
     *
     * @param Invoice $invoice
     * @return void
     */
    private function recordAffiliateCommission(Invoice $invoice)
    {
        $buyer = $invoice->user;

        // Cek apakah pembeli ini direferensikan oleh seseorang
        if ($buyer && $buyer->referred_by_user_id) {
            $affiliate = User::find($buyer->referred_by_user_id);

            // Memastikan afiliasi ada, aktif, dan memiliki rate komisi
            if ($affiliate && $affiliate->affiliate_status === 'Active' && $affiliate->commission > 0) {
                $commissionAmount = $invoice->nett_amount * ($affiliate->commission / 100);

                AffiliateEarning::create([
                    'affiliate_user_id' => $affiliate->id,
                    'invoice_id' => $invoice->id,
                    'amount' => $commissionAmount,
                    'rate' => $affiliate->commission,
                    'status' => 'approved',
                ]);
            }
        }

        $this->recordMentorCommission($invoice);
    }

    /**
     * Mencatat komisi untuk mentor dari penjualan kelas mereka
     *
     * @param Invoice $invoice
     * @return void
     */
    private function recordMentorCommission(Invoice $invoice)
    {
        $invoice->load(['courseItems.course.user']);

        foreach ($invoice->courseItems as $courseItem) {
            $course = $courseItem->course;
            $mentor = $course->user;

            if ($mentor && $mentor->hasRole('mentor') && $mentor->affiliate_status === 'Active' && $mentor->commission > 0) {
                $commissionAmount = $courseItem->price * ($mentor->commission / 100);

                AffiliateEarning::create([
                    'affiliate_user_id' => $mentor->id,
                    'invoice_id' => $invoice->id,
                    'amount' => $commissionAmount,
                    'rate' => $mentor->commission,
                    'status' => 'approved',
                    'type' => 'mentor_course',
                    'course_id' => $course->id,
                ]);
            }
        }
    }

    /**
     * Menambahkan peserta ke certificate participants berdasarkan tipe program
     *
     * @param string $type
     * @param string $itemId
     * @param string $userId
     * @return void
     */
    private function addToCertificateParticipants($type, $itemId, $userId)
    {
        $certificate = null;

        // Cari sertifikat berdasarkan tipe program
        switch ($type) {
            case 'course':
                $certificate = Certificate::where('course_id', $itemId)->first();
                break;
            case 'bootcamp':
                $certificate = Certificate::where('bootcamp_id', $itemId)->first();
                break;
            case 'webinar':
                $certificate = Certificate::where('webinar_id', $itemId)->first();
                break;
        }

        if ($certificate) {
            $existingParticipant = CertificateParticipant::where('certificate_id', $certificate->id)
                ->where('user_id', $userId)
                ->first();

            if (!$existingParticipant) {
                CertificateParticipant::create([
                    'certificate_id' => $certificate->id,
                    'user_id' => $userId,
                ]);
            }
        }
    }

    /**
     * Menambahkan enrollment ke certificate participants dari invoice yang dibayar
     *
     * @param Invoice $invoice
     * @return void
     */
    private function addEnrollmentToCertificateParticipants(Invoice $invoice)
    {
        $invoice->load([
            'courseItems',
            'bootcampItems',
            'webinarItems',
            'bundleEnrollments.bundle.bundleItems.bundleable'
        ]);

        // Direct enrollments
        foreach ($invoice->courseItems as $courseItem) {
            $this->addToCertificateParticipants('course', $courseItem->course_id, $invoice->user_id);
        }

        foreach ($invoice->bootcampItems as $bootcampItem) {
            $this->addToCertificateParticipants('bootcamp', $bootcampItem->bootcamp_id, $invoice->user_id);
        }

        foreach ($invoice->webinarItems as $webinarItem) {
            $this->addToCertificateParticipants('webinar', $webinarItem->webinar_id, $invoice->user_id);
        }

        foreach ($invoice->bundleEnrollments as $bundleEnrollment) {
            $bundle = $bundleEnrollment->bundle;

            if (!$bundle) {
                continue;
            }

            foreach ($bundle->bundleItems as $bundleItem) {
                if (!$bundleItem->bundleable) {
                    continue;
                }

                $type = $this->getBundleItemType($bundleItem->bundleable_type);

                if ($type) {
                    $this->addToCertificateParticipants($type, $bundleItem->bundleable->id, $invoice->user_id);
                }
            }
        }
    }

    public function generatePDF($id)
    {
        $invoice = Invoice::with([
            'user',
            'courseItems.course',
            'bootcampItems.bootcamp',
            'webinarItems.webinar'
        ])->findOrFail($id);

        if ($invoice->status !== 'paid') {
            abort(403, 'Invoice belum dibayar');
        }

        $data = [
            'invoice' => $invoice,
            'company' => [
                'name' => 'SkillGrow',
                'address' => 'Perumahan Permata Permadani, Blok B1. Kel. Pendem Kec. Junrejo Kota Batu Prov. Jawa Timur, 65324',
                'phone' => '+6285184012430',
                'email' => 'skillgrow.id@gmail.com',
                'website' => 'www.skillgrow.id'
            ]
        ];

        $pdf = PDF::loadView('invoices.pdf', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream("invoice-{$invoice->invoice_code}.pdf");
    }
}
