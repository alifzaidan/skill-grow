<?php

namespace App\Http\Controllers\User\Profile;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $myTransactions = Invoice::with([
            'courseItems.course',
            'bootcampItems.bootcamp',
            'webinarItems.webinar',
            'certificationProgramItems.certificationProgram',
            'bundleEnrollments.bundle.bundleItems.bundleable',
            'installmentTerms',
            'discountUsage.discountCode',
            'parentInvoice.courseItems.course',
            'parentInvoice.bootcampItems.bootcamp',
            'parentInvoice.webinarItems.webinar',
            'parentInvoice.certificationProgramItems.certificationProgram',
            'parentInvoice.installmentTerms',
        ])
            ->where('user_id', $userId)
            ->whereNull('parent_invoice_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/profile/transaction/index', ['myTransactions' => $myTransactions]);
    }

    public function show($id)
    {
        $invoice = Invoice::with([
            'courseItems.course',
            'bootcampItems.bootcamp',
            'webinarItems.webinar',
            'certificationProgramItems.certificationProgram',
            'bundleEnrollments.bundle.bundleItems.bundleable',
            'installmentTerms',
            'parentInvoice.courseItems.course',
            'parentInvoice.bootcampItems.bootcamp',
            'parentInvoice.webinarItems.webinar',
            'parentInvoice.certificationProgramItems.certificationProgram',
            'parentInvoice.installmentTerms',
        ])->findOrFail($id);

        if ($invoice->user_id !== Auth::id() && (!Auth::user() || !Auth::user()->hasRole('admin'))) {
            abort(403);
        }

        return Inertia::render('user/profile/transaction/show', ['invoice' => $invoice]);
    }
}
