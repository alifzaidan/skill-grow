<?php

namespace App\Services;

use App\Models\User;
use App\Models\Invoice;
use App\Models\Setting;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RewardService
{
    protected $pointService;

    public function __construct(PointService $pointService)
    {
        $this->pointService = $pointService;
    }

    /**
     * Proses reward referral setelah pembayaran berhasil.
     * Kolom referral di invoice: 'referral_user_id'.
     */
    public function processReferralReward(Invoice $invoice): void
    {
        Log::info('processReferralReward started', [
            'invoice_code'     => $invoice->invoice_code,
            'status'           => $invoice->status,
            'referral_user_id' => $invoice->referral_user_id,
        ]);

        $lockKey = "referral_reward_invoice_{$invoice->id}";
        $lock = Cache::lock($lockKey, 15);

        try {
            $lock->block(5, function () use ($invoice) {
                DB::transaction(function () use ($invoice) {
                    $lockedInvoice = Invoice::where('id', $invoice->id)->lockForUpdate()->first();

                    if (!$lockedInvoice) {
                        Log::warning('processReferralReward skipped: invoice not found', [
                            'invoice_id' => $invoice->id
                        ]);
                        return;
                    }

                    if ($lockedInvoice->status !== 'paid') {
                        Log::warning('processReferralReward skipped: not paid', ['invoice_code' => $lockedInvoice->invoice_code]);
                        return;
                    }

                    if (!$lockedInvoice->referral_user_id) {
                        Log::warning('processReferralReward skipped: no referral_user_id', ['invoice_code' => $lockedInvoice->invoice_code]);
                        return;
                    }

                    $rewardExists = PointTransaction::where('reference_type', Invoice::class)
                        ->where('reference_id', $lockedInvoice->id)
                        ->where('source', 'referral')
                        ->exists();

                    if ($rewardExists) {
                        Log::info('Referral reward already processed', ['invoice_code' => $lockedInvoice->invoice_code]);
                        return;
                    }

                    $buyer    = User::find($lockedInvoice->user_id);
                    $referrer = User::find($lockedInvoice->referral_user_id);

                    if (!$buyer || !$referrer) {
                        Log::error('processReferralReward: buyer or referrer not found');
                        return;
                    }

                    $onlyFirstPurchase = Setting::get('referral_only_first_purchase', true);
                    if ($onlyFirstPurchase) {
                        $paidInvoicesCount = Invoice::where('user_id', $buyer->id)->where('status', 'paid')->count();
                        if ($paidInvoicesCount > 1) {
                            Log::info('Referral reward skipped: not first purchase', ['buyer_id' => $buyer->id]);
                            return;
                        }
                    }

                    // Get product type and corresponding referral settings
                    $productType = $lockedInvoice->getInvoiceType();
                    $programSettings = Setting::getReferralProgramSettings();
                    $programConfig = $programSettings[$productType] ?? null;

                    // If referral is disabled for this program type, skip processing
                    if ($programConfig && empty($programConfig['is_enabled'])) {
                        Log::info('Referral reward skipped: referral disabled for program', [
                            'invoice_code' => $lockedInvoice->invoice_code,
                            'product_type' => $productType
                        ]);
                        return;
                    }

                    // Calculate Referrer reward
                    $referrerRewardType = $programConfig['referrer_reward_type'] ?? 'fixed';
                    $referrerRate = (int) ($programConfig['referrer_rate'] ?? Setting::get('referral_reward', 5000));
                    $referrerMaxReward = !empty($programConfig['referrer_max_reward']) ? (int) $programConfig['referrer_max_reward'] : null;

                    if ($referrerRewardType === 'percentage') {
                        $referrerRewardAmount = (int) round($lockedInvoice->nett_amount * ($referrerRate / 100));
                        if ($referrerMaxReward !== null && $referrerRewardAmount > $referrerMaxReward) {
                            $referrerRewardAmount = $referrerMaxReward;
                        }
                    } else {
                        $referrerRewardAmount = $referrerRate;
                    }
                    $referrerRewardAmount = max(0, $referrerRewardAmount);

                    // Calculate Buyer reward
                    $buyerRewardType = $programConfig['buyer_reward_type'] ?? 'fixed';
                    $buyerRate = (int) ($programConfig['buyer_rate'] ?? Setting::get('buyer_reward', 2000));
                    $buyerMaxReward = !empty($programConfig['buyer_max_reward']) ? (int) $programConfig['buyer_max_reward'] : null;

                    if ($buyerRewardType === 'percentage') {
                        $buyerRewardAmount = (int) round($lockedInvoice->nett_amount * ($buyerRate / 100));
                        if ($buyerMaxReward !== null && $buyerRewardAmount > $buyerMaxReward) {
                            $buyerRewardAmount = $buyerMaxReward;
                        }
                    } else {
                        $buyerRewardAmount = $buyerRate;
                    }
                    $buyerRewardAmount = max(0, $buyerRewardAmount);

                    if ($referrerRewardAmount > 0) {
                        $this->pointService->addTransaction(
                            $referrer,
                            $referrerRewardAmount,
                            'reward',
                            'referral',
                            "Bonus referral dari pembelian pertama oleh {$buyer->name}",
                            Invoice::class,
                            $lockedInvoice->id
                        );
                    }

                    if ($buyerRewardAmount > 0) {
                        $this->pointService->addTransaction(
                            $buyer,
                            $buyerRewardAmount,
                            'reward',
                            'referral',
                            "Bonus pembelian menggunakan kode referral dari {$referrer->name}",
                            Invoice::class,
                            $lockedInvoice->id
                        );
                    }

                    Log::info('Referral reward processed successfully', [
                        'invoice_code'    => $lockedInvoice->invoice_code,
                        'product_type'    => $productType,
                        'referrer'        => $referrer->name,
                        'referrer_amount' => $referrerRewardAmount,
                        'buyer'           => $buyer->name,
                        'buyer_amount'    => $buyerRewardAmount,
                    ]);
                });
            });
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Referral reward skipped: lock acquisition timed out', [
                'invoice_code' => $invoice->invoice_code,
                'message'      => $e->getMessage(),
            ]);
        }
    }
}
