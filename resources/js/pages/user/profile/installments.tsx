import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { rupiahFormatter } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import { AlertTriangle, BanknoteIcon, CalendarClock, CheckCircle2, Clock, CreditCard, FileText, Lock, Package, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface InstallmentTermDetail {
    id: string;
    installment_number: number;
    invoice_code: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    installment_due_date: string | null;
    paid_at: string | null;
    payment_method: string | null;
    payment_channel: string | null;
    is_overdue: boolean;
}

interface NextUnpaidTerm {
    id: string;
    installment_number: number;
    amount: number;
    installment_due_date: string | null;
    status: string;
    is_overdue: boolean;
}

interface Installment {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    is_access_suspended: boolean;
    access_suspended_at: string | null;
    created_at: string;
    product_type: string;
    product_name: string;
    paid_terms: number;
    total_terms: number;
    next_unpaid_term: NextUnpaidTerm | null;
    terms: InstallmentTermDetail[];
}

interface InstallmentsProps {
    installments: Installment[];
}

function TermStatusBadge({ status, isOverdue }: { status: string; isOverdue?: boolean }) {
    const { t } = useTranslation();

    if (status === 'paid') return (
        <Badge className="border-green-200 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" /> {t('profile.installments.statusPaid')}
        </Badge>
    );
    if (isOverdue) return (
        <Badge className="border-red-200 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" /> {t('profile.installments.statusOverdue')}
        </Badge>
    );
    if (status === 'failed') return (
        <Badge variant="destructive">{t('profile.installments.statusFailed')}</Badge>
    );
    return (
        <Badge className="border-yellow-200 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="mr-1 h-3 w-3" /> {t('profile.installments.statusPending')}
        </Badge>
    );
}

function InstallmentCard({ item }: { item: Installment }) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'en' ? enUS : idLocale;
    const [isPayingTerm, setIsPayingTerm] = useState(false);

    async function handlePayTerm() {
        setIsPayingTerm(true);
        try {
            const res = await axios.post(`/installment/${item.id}/pay`);
            if (res.data.success && res.data.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                toast.error(res.data.message || t('profile.installments.toastErrorInvoice'));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('profile.installments.toastErrorGeneral'));
        } finally {
            setIsPayingTerm(false);
        }
    }

    const progressPercent = item.total_terms > 0 ? (item.paid_terms / item.total_terms) * 100 : 0;
    const isFullyPaid = item.status === 'paid';
    const isNextOverdue = item.next_unpaid_term?.is_overdue ?? false;
    const isSuspended = item.is_access_suspended && !isFullyPaid;

    return (
        <div className={`overflow-hidden rounded-xl border bg-card transition-all ${isSuspended ? 'border-red-300 dark:border-red-800' : isNextOverdue ? 'border-orange-300 dark:border-orange-800' : 'border-border'}`}>
            {/* Header */}
            <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isFullyPaid ? 'bg-green-100 dark:bg-green-900/30' : isSuspended ? 'bg-red-100 dark:bg-red-900/30' : isNextOverdue ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {isFullyPaid
                            ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            : isSuspended
                                ? <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                                : isNextOverdue
                                    ? <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    : <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        }
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold text-foreground">{item.product_name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">{item.product_type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{item.invoice_code}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-foreground">{rupiahFormatter.format(item.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                            {t('profile.installments.paidTermsCount', { paid: item.paid_terms, total: item.total_terms })}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t('profile.installments.paymentProgress')}</span>
                        <span className="text-xs font-medium">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full transition-all ${isFullyPaid ? 'bg-green-500' : isSuspended ? 'bg-red-500' : isNextOverdue ? 'bg-orange-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Overdue warning (before suspended) */}
                {isNextOverdue && !isSuspended && !isFullyPaid && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 dark:border-orange-800 dark:bg-orange-950/20">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        <p className="text-xs text-orange-700 dark:text-orange-400">
                            {t('profile.installments.overdueWarning', { term: item.next_unpaid_term?.installment_number })}
                        </p>
                    </div>
                )}

                {/* Suspended warning */}
                {isSuspended && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/20">
                        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                        <p className="text-xs text-red-600 dark:text-red-400">
                            {isNextOverdue
                                ? t('profile.installments.suspendedWarningOverdue')
                                : t('profile.installments.suspendedWarningPending')}
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {!isFullyPaid && item.next_unpaid_term && (
                        isNextOverdue ? (
                            <Button
                                size="sm"
                                disabled
                                variant="outline"
                                className="cursor-not-allowed gap-2 border-orange-300 text-orange-700 opacity-60 dark:border-orange-700 dark:text-orange-400"
                                id={`btn-pay-term-overdue-${item.id}`}
                            >
                                <BanknoteIcon className="h-4 w-4" />
                                {t('profile.installments.btnPayOverdue', { term: item.next_unpaid_term.installment_number })}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handlePayTerm}
                                disabled={isPayingTerm}
                                className="gap-2"
                                id={`btn-pay-term-${item.id}`}
                            >
                                <CreditCard className="h-4 w-4" />
                                {isPayingTerm
                                    ? t('profile.installments.btnProcessing')
                                    : t('profile.installments.btnPayTerm', {
                                          term: item.next_unpaid_term.installment_number,
                                          amount: rupiahFormatter.format(item.next_unpaid_term.amount),
                                      })}
                            </Button>
                        )
                    )}
                    {isFullyPaid && (
                        <Badge className="border-green-200 bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {t('profile.installments.allTermsPaid')}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Term details — always visible */}
            <div className="border-t border-border bg-muted/20">
                <div className="px-4 py-3 sm:px-5">
                    <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('profile.installments.termDetailsTitle')}</p>
                    <div className="space-y-2">
                        {item.terms.map((term) => (
                            <div
                                key={term.id}
                                className={`flex items-start gap-3 rounded-lg border bg-background p-3 ${term.is_overdue ? 'border-orange-200 dark:border-orange-800' : term.status === 'paid' ? 'border-green-200 dark:border-green-800' : 'border-border'}`}
                            >
                                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${term.status === 'paid' ? 'bg-green-500' : term.is_overdue ? 'bg-orange-500' : 'bg-slate-400'}`}>
                                    {term.installment_number}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium">{t('profile.installments.termNumber', { term: term.installment_number })}</p>
                                        <TermStatusBadge status={term.status} isOverdue={term.is_overdue} />
                                        {term.installment_number === 1 && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">{t('profile.installments.badgeDp')}</Badge>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        {term.installment_due_date && (
                                            <p className={`text-xs ${term.is_overdue ? 'font-medium text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                                                <CalendarClock className="mr-1 -mt-0.5 inline-block h-3 w-3" />
                                                {t('profile.installments.dueDate', {
                                                    date: format(parseISO(term.installment_due_date), 'dd MMMM yyyy', { locale: dateLocale }),
                                                })}
                                                {term.is_overdue && t('profile.installments.overdueTag')}
                                            </p>
                                        )}
                                        {term.paid_at ? (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="mr-1 -mt-0.5 inline-block h-3 w-3" />
                                                {t('profile.installments.paidAt', {
                                                    date: format(parseISO(term.paid_at), 'dd MMMM yyyy, HH:mm', { locale: dateLocale }),
                                                })}
                                                {term.payment_channel && t('profile.installments.viaChannel', { channel: term.payment_channel })}
                                            </p>
                                        ) : term.status === 'pending' && !term.is_overdue && (
                                            <p className="text-xs text-muted-foreground">
                                                <Clock className="mr-1 -mt-0.5 inline-block h-3 w-3" />
                                                {t('profile.installments.notPaid')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-0.5 flex-shrink-0 text-right">
                                    <p className="text-sm font-semibold">
                                        {rupiahFormatter.format(term.amount)}
                                    </p>
                                    {term.status !== 'paid' && (
                                        <p className="text-[10px] text-muted-foreground">{t('profile.installments.includesAdminFee')}</p>
                                    )}
                                    {term.status === 'paid' && (
                                        <div className="mt-1">
                                            <Button asChild size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
                                                <a href={route('invoice.pdf', { id: term.id })} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {t('profile.installments.btnInvoice')}
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Installments({ installments }: InstallmentsProps) {
    const { t } = useTranslation();

    return (
        <UserLayout>
            <Head title={t('profile.installments.headTitle')} />
            <ProfileLayout>
                <div className="space-y-6">
                    <Heading
                        title={t('profile.installments.title')}
                        description={t('profile.installments.description')}
                    />

                    {installments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Package className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="mb-1 font-semibold text-foreground">{t('profile.installments.emptyTitle')}</h3>
                            <p className="max-w-xs text-sm text-muted-foreground">
                                {t('profile.installments.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {installments.map((item) => (
                                <InstallmentCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
