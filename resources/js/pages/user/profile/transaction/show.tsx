import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Calendar, CheckCircle, Clock, CreditCard, ExternalLink, FileText, Home, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CourseItem {
    id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface BootcampItem {
    id: string;
    bootcamp: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface WebinarItem {
    id: string;
    webinar: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface CertificationProgramItem {
    id: string;
    certificationProgram?: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
    certification_program?: {
        id: string;
        title: string;
        slug: string;
        thumbnail: string;
    };
}

interface BundleItem {
    id: string;
    bundle?: {
        id: string;
        title: string;
        slug: string;
        thumbnail?: string | null;
    };
}

interface InstallmentTerm {
    id: string;
    invoice_id?: string;
    child_invoice_id?: string | null;
    term_number?: number;
    installment_number?: number;
    amount: number;
    due_date?: string | null;
    installment_due_date?: string | null;
    status: 'pending' | 'paid' | 'overdue' | string;
    paid_at: string | null;
    invoice_url?: string | null;
    invoice_code?: string;
    invoice?: {
        id: string;
        invoice_code: string;
        invoice_url: string | null;
        status: string;
    };
}

interface Invoice {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    nett_amount: number;
    discount_amount: number;
    status: 'paid' | 'pending' | 'failed' | 'installment_pending' | 'completed';
    paid_at: string | null;
    expires_at: string | null;
    payment_method: string | null;
    payment_channel: string | null;
    is_installment?: boolean;
    access_suspended_at?: string | null;
    parent_invoice_id?: string | null;
    parent_invoice?: Invoice | null;
    parentInvoice?: Invoice | null;
    installment_terms?: InstallmentTerm[];
    installmentTerms?: InstallmentTerm[];
    course_items?: CourseItem[];
    courseItems?: CourseItem[];
    bootcamp_items?: BootcampItem[];
    bootcampItems?: BootcampItem[];
    webinar_items?: WebinarItem[];
    webinarItems?: WebinarItem[];
    certificationProgramItems?: CertificationProgramItem[];
    certification_program_items?: CertificationProgramItem[];
    bundle_enrollments?: BundleItem[];
    bundleEnrollments?: BundleItem[];
}

interface Props {
    invoice: Invoice;
}

export default function TransactionShow({ invoice }: Props) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'en' ? 'en-US' : 'id-ID';
    const [cancelLoading, setCancelLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const isExpired = invoice.expires_at && new Date() > new Date(invoice.expires_at);
    const timeLeft = invoice.expires_at ? new Date(invoice.expires_at).getTime() - new Date().getTime() : 0;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Installment detection & helpers
    const isInstallment = Boolean(
        invoice.is_installment ||
        (invoice.installment_terms && invoice.installment_terms.length > 0) ||
        (invoice.installmentTerms && invoice.installmentTerms.length > 0) ||
        invoice.parent_invoice?.is_installment ||
        invoice.parentInvoice?.is_installment
    );

    const terms: InstallmentTerm[] =
        invoice.installment_terms ||
        invoice.installmentTerms ||
        invoice.parent_invoice?.installment_terms ||
        invoice.parentInvoice?.installmentTerms ||
        [];

    const paidTerms = terms.filter((t) => t.status === 'paid');
    const isFullyPaid = (terms.length > 0 && paidTerms.length === terms.length) || invoice.status === 'paid';
    const isSuspended = Boolean(
        invoice.access_suspended_at ||
        invoice.parent_invoice?.access_suspended_at ||
        invoice.parentInvoice?.access_suspended_at
    );
    const isTerm1Paid = paidTerms.some((t) => (t.installment_number ?? t.term_number) === 1);

    const getProductInfo = () => {
        const target = invoice.parent_invoice || invoice.parentInvoice || invoice;
        const courseItems = target.course_items || target.courseItems;
        const bootcampItems = target.bootcamp_items || target.bootcampItems;
        const webinarItems = target.webinar_items || target.webinarItems;
        const certItems = target.certificationProgramItems || target.certification_program_items;
        const bundleItems = target.bundle_enrollments || target.bundleEnrollments;

        if (courseItems && courseItems.length > 0) {
            const course = courseItems[0].course;
            return {
                type: 'course',
                routeParam: 'course',
                name: course.title,
                slug: course.slug,
                thumbnail: course.thumbnail,
                profileRoute: 'profile.course.detail',
                publicRoute: 'course.detail',
                badge: t('profile.dashboard.typeCourse'),
            };
        } else if (bootcampItems && bootcampItems.length > 0) {
            const bootcamp = bootcampItems[0].bootcamp;
            return {
                type: 'bootcamp',
                routeParam: 'bootcamp',
                name: bootcamp.title,
                slug: bootcamp.slug,
                thumbnail: bootcamp.thumbnail,
                profileRoute: 'profile.bootcamp.detail',
                publicRoute: 'bootcamp.detail',
                badge: t('profile.dashboard.typeBootcamp'),
            };
        } else if (webinarItems && webinarItems.length > 0) {
            const webinar = webinarItems[0].webinar;
            return {
                type: 'webinar',
                routeParam: 'webinar',
                name: webinar.title,
                slug: webinar.slug,
                thumbnail: webinar.thumbnail,
                profileRoute: 'profile.webinar.detail',
                publicRoute: 'webinar.detail',
                badge: t('profile.dashboard.typeWebinar'),
            };
        } else if (certItems && certItems.length > 0) {
            const certItem = certItems[0];
            const certificationProgram = certItem.certificationProgram || certItem.certification_program;
            if (certificationProgram) {
                return {
                    type: 'certification-program',
                    routeParam: 'program',
                    name: certificationProgram.title,
                    slug: certificationProgram.slug,
                    thumbnail: certificationProgram.thumbnail,
                    profileRoute: 'profile.certification-program.detail',
                    publicRoute: 'certification-programs.detail',
                    badge: t('profile.dashboard.typeCertification'),
                };
            }
        } else if (bundleItems && bundleItems.length > 0) {
            const bundleItem = bundleItems[0];
            return {
                type: 'bundle',
                routeParam: 'bundle',
                name: bundleItem.bundle?.title || 'Paket Bundling',
                slug: bundleItem.bundle?.slug || '',
                thumbnail: bundleItem.bundle?.thumbnail || '',
                profileRoute: 'profile.index',
                publicRoute: 'bundle.detail',
                badge: 'Paket Bundling',
            };
        }
        return null;
    };

    const productInfo = getProductInfo();

    const handleCancelConfirm = async () => {
        setCancelLoading(true);
        setDialogOpen(false);

        try {
            const res = await axios.post(route('invoice.cancel', { id: invoice.id }));
            if (res.data?.success) {
                toast.success(t('profile.transactionShow.toastCancelSuccess'));
                window.location.reload();
            } else {
                toast.error(res.data?.message || t('profile.transactionShow.toastCancelFailed'));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || t('profile.transactionShow.toastCancelError'));
            } else {
                toast.error(t('profile.transactionShow.toastCancelError'));
            }
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusIcon = () => {
        if (isInstallment) {
            if (isFullyPaid) {
                return <CheckCircle className="mt-1 h-6 w-6 text-green-500" />;
            }
            if (isSuspended) {
                return <AlertTriangle className="mt-1 h-6 w-6 text-red-500" />;
            }
            if (isTerm1Paid) {
                return <Clock className="mt-1 h-6 w-6 text-indigo-400" />;
            }
            return <Clock className="mt-1 h-6 w-6 text-yellow-500" />;
        }

        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return <CheckCircle className="mt-1 h-6 w-6 text-green-500" />;
            case 'pending':
                return <Clock className="mt-1 h-6 w-6 text-yellow-500" />;
            case 'failed':
                return <XCircle className="mt-1 h-6 w-6 text-red-500" />;
            default:
                return <AlertTriangle className="mt-1 h-6 w-6 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        if (isInstallment) {
            if (isFullyPaid) {
                return t('profile.transactionShow.statusInstallmentPaid');
            }
            if (isSuspended) {
                return t('profile.transactionShow.statusSuspended');
            }
            if (isTerm1Paid) {
                return t('profile.transactionShow.statusActiveInstallment', { paid: paidTerms.length, total: terms.length || 2 });
            }
            return t('profile.transactionShow.statusWaitingDp');
        }

        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return t('profile.transactionShow.statusPaid');
            case 'pending':
                return isExpired ? t('profile.transactionShow.statusExpired') : t('profile.transactionShow.statusPending');
            case 'failed':
                return t('profile.transactionShow.statusCancelled');
            default:
                return t('profile.transactionShow.statusUnknown');
        }
    };

    const getStatusColor = () => {
        if (isInstallment) {
            if (isFullyPaid) {
                return 'text-green-500';
            }
            if (isSuspended) {
                return 'text-red-500';
            }
            if (isTerm1Paid) {
                return 'text-indigo-400';
            }
            return 'text-yellow-500';
        }

        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return 'text-green-500';
            case 'pending':
                return isExpired ? 'text-red-500' : 'text-yellow-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBadgeClass = () => {
        if (isInstallment) {
            if (isFullyPaid) return 'text-green-600 dark:text-green-400';
            if (isSuspended) return 'text-red-600 dark:text-red-400';
            if (isTerm1Paid) return 'text-indigo-600 dark:text-indigo-400';
            return 'text-yellow-600 dark:text-yellow-400';
        }
        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return 'text-green-600 dark:text-green-400';
            case 'pending':
                return isExpired ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400';
            case 'failed':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const canAccessProduct = invoice.status === 'paid' || invoice.status === 'completed' || (isInstallment && isTerm1Paid && !isSuspended);

    return (
        <UserLayout>
            <Head title={t('profile.transactionShow.headTitle', { code: invoice.invoice_code })} />

            <div className="min-h-screen bg-gray-50 py-4 md:py-8 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
                        {/* Header Banner */}
                        <div className="to-primary flex gap-3 bg-gradient-to-tl from-black px-6 py-4 text-white">
                            {getStatusIcon()}
                            <div>
                                <h1 className={`text-xl font-bold md:text-2xl ${getStatusColor()}`}>{getStatusText()}</h1>
                                <p className="mt-1 text-sm text-blue-100 md:text-base">
                                    {t('profile.transactionShow.invoiceNumber', { code: invoice.invoice_code })}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Product Info */}
                            {productInfo && (
                                <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('profile.transactionShow.purchasedProduct')}
                                    </h3>
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={productInfo.thumbnail ? `/storage/${productInfo.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={productInfo.name}
                                            className="h-16 rounded-lg object-cover md:h-20"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{productInfo.name}</h4>
                                            <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                                                {productInfo.badge}
                                            </p>
                                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                                {canAccessProduct && productInfo.profileRoute ? (
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link
                                                            href={
                                                                productInfo.type === 'bundle'
                                                                    ? route('profile.index')
                                                                    : route(productInfo.profileRoute, {
                                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                                      })
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            {t('profile.transactionShow.openInProfile')}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link
                                                            href={
                                                                productInfo.type === 'bundle'
                                                                    ? route('bundle.detail', { bundle: productInfo.slug })
                                                                    : route(productInfo.publicRoute, {
                                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                                      })
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            {t('profile.transactionShow.viewProductDetail')}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Installment Terms Breakdown */}
                            {isInstallment && terms.length > 0 && (
                                <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            {t('profile.transactionShow.installmentSchedule')}
                                        </h3>
                                        <Link
                                            href={route('profile.installments')}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                        >
                                            {t('profile.transactionShow.installmentPageLink')}
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {terms.map((term) => {
                                            const isPaid = term.status === 'paid';
                                            const isOverdue = term.status === 'overdue';
                                            const termNumber = term.installment_number ?? term.term_number ?? 1;
                                            const dueDate = term.installment_due_date ?? term.due_date;
                                            const dueDateFormatted = dueDate
                                                ? new Date(dueDate).toLocaleDateString(dateLocale, {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : '-';
                                            const paidDateFormatted = term.paid_at
                                                ? new Date(term.paid_at).toLocaleDateString(dateLocale, {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : null;
                                            const termInvoiceUrl = term.invoice?.invoice_url || term.invoice_url;

                                            return (
                                                <div
                                                    key={term.id}
                                                    className={`flex flex-col justify-between gap-3 rounded-lg border p-4 transition sm:flex-row sm:items-center ${
                                                        isPaid
                                                            ? 'border-green-200 bg-green-50/60 dark:border-green-800/40 dark:bg-green-950/20'
                                                            : isOverdue
                                                            ? 'border-red-200 bg-red-50/60 dark:border-red-800/40 dark:bg-red-950/20'
                                                            : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800/60'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {t('profile.transactionShow.termNumber', { term: termNumber })} {termNumber === 1 ? t('profile.transactionShow.termDp') : ''}
                                                            </span>
                                                            {isPaid ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                                    <CheckCircle size={12} />
                                                                    {t('profile.transactionShow.termStatusPaid')}
                                                                </span>
                                                            ) : isOverdue ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                                    <AlertTriangle size={12} />
                                                                    {t('profile.transactionShow.termStatusOverdue')}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                                                                    <Clock size={12} />
                                                                    {t('profile.transactionShow.termStatusPending')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {isPaid && paidDateFormatted
                                                                ? t('profile.transactionShow.paidOn', { date: paidDateFormatted })
                                                                : t('profile.transactionShow.dueOn', { date: dueDateFormatted })}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            Rp {Number(term.amount).toLocaleString(dateLocale)}
                                                        </span>
                                                        {!isPaid && (
                                                            <Button asChild size="sm" variant={isOverdue ? 'destructive' : 'default'}>
                                                                {termInvoiceUrl ? (
                                                                    <a href={termInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                                        {t('profile.transactionShow.btnPay')}
                                                                    </a>
                                                                ) : (
                                                                    <Link href={route('profile.installments')}>
                                                                        {t('profile.transactionShow.btnPay')}
                                                                    </Link>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Alert Messages */}
                            {isInstallment && isSuspended && (
                                <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800 dark:text-red-300">
                                        <strong>{t('profile.transactionShow.alertSuspendedBold')}</strong> {t('profile.transactionShow.alertSuspendedText')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isFullyPaid && isTerm1Paid && !isSuspended && (
                                <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-950/20">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <AlertDescription className="text-indigo-800 dark:text-indigo-300">
                                        <strong>{t('profile.transactionShow.alertActiveInstallmentBold')}</strong> {t('profile.transactionShow.alertActiveInstallmentText')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isTerm1Paid && invoice.status !== 'failed' && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800/40 dark:bg-yellow-950/20">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                                        <strong>{t('profile.transactionShow.alertDpNoticeBold')}</strong> {t('profile.transactionShow.alertDpNoticeText')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && !isExpired && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="flex items-center justify-between">
                                            <span>
                                                {t('profile.transactionShow.alertExpiring', { hours: hoursLeft, minutes: minutesLeft })}
                                            </span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && isExpired && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('profile.transactionShow.alertExpired')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {invoice.status === 'failed' && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('profile.transactionShow.alertCancelled')}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Payment Details & Information */}
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('profile.transactionShow.paymentDetailsTitle')}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {invoice.discount_amount > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.originalPrice')}</span>
                                                    <span className="medium">
                                                        Rp {(invoice.discount_amount + invoice.nett_amount)?.toLocaleString(dateLocale)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.discount')}</span>
                                                    <span className="text-gray-500 line-through">
                                                        Rp {invoice.discount_amount?.toLocaleString(dateLocale) || '0'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.subtotal')}</span>
                                            <span className="font-medium">Rp {invoice.nett_amount?.toLocaleString(dateLocale) || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.fee')}</span>
                                            <span className="font-medium">
                                                Rp {((invoice.amount || 0) - (invoice.nett_amount || 0)).toLocaleString(dateLocale)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                            <span>{t('profile.transactionShow.total')}</span>
                                            <span>Rp {invoice.amount?.toLocaleString(dateLocale) || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('profile.transactionShow.paymentInfoTitle')}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.statusLabel')}</span>
                                            <span className={`font-medium ${getStatusBadgeClass()}`}>{getStatusText()}</span>
                                        </div>
                                        {invoice.payment_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.methodLabel')}</span>
                                                <span className="font-medium">{invoice.payment_method}</span>
                                            </div>
                                        )}
                                        {invoice.payment_channel && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.channelLabel')}</span>
                                                <span className="font-medium">{invoice.payment_channel}</span>
                                            </div>
                                        )}
                                        {invoice.paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.paidAtLabel')}</span>
                                                <span className="font-medium">{new Date(invoice.paid_at).toLocaleString(dateLocale)}</span>
                                            </div>
                                        )}
                                        {invoice.expires_at && invoice.status === 'pending' && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('profile.transactionShow.expiresAtLabel')}</span>
                                                <span className="font-medium">{new Date(invoice.expires_at).toLocaleString(dateLocale)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col flex-wrap justify-center gap-4 sm:flex-row">
                                {canAccessProduct && productInfo && (
                                    <Button asChild size="lg" className="w-full sm:w-auto">
                                        <Link
                                            href={
                                                productInfo.type === 'bundle'
                                                    ? route('profile.index')
                                                    : productInfo.profileRoute
                                                    ? route(productInfo.profileRoute, {
                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                      })
                                                    : route(productInfo.publicRoute, {
                                                          [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                      })
                                            }
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            {t('profile.transactionShow.btnAccessProduct', { name: productInfo.badge || 'Produk' })}
                                        </Link>
                                    </Button>
                                )}

                                {isInstallment && (
                                    <Button asChild variant="outline" size="lg" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 sm:w-auto dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30">
                                        <Link href={route('profile.installments')}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            {t('profile.transactionShow.btnManageInstallments')}
                                        </Link>
                                    </Button>
                                )}

                                {(invoice.status === 'paid' || isTerm1Paid) && (
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                        <a href={route('invoice.pdf', { id: invoice.id })} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" />
                                            {t('profile.transactionShow.btnDownloadInvoice')}
                                        </a>
                                    </Button>
                                )}

                                {invoice.status === 'pending' && !isExpired && invoice.invoice_url && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                                                {isInstallment ? t('profile.transactionShow.btnPayTerm1') : t('profile.transactionShow.btnContinuePayment')}
                                            </a>
                                        </Button>

                                        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full border-red-600 text-red-600 hover:bg-red-50 sm:w-auto"
                                                    disabled={cancelLoading}
                                                >
                                                    {cancelLoading ? t('profile.transactionShow.btnCancelling') : t('profile.transactionShow.btnCancelOrder')}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('profile.transactionShow.cancelDialogTitle')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('profile.transactionShow.cancelDialogDesc')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('profile.transactionShow.cancelDialogKeep')}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleCancelConfirm}
                                                        className="border-red-600 bg-red-600 hover:bg-red-700"
                                                    >
                                                        {t('profile.transactionShow.cancelDialogConfirm')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}

                                <Button asChild className="w-full sm:w-auto" variant="outline" size="lg">
                                    <Link href={route('profile.transactions')}>{t('profile.transactionShow.btnViewTransactionHistory')}</Link>
                                </Button>

                                {(invoice.status === 'failed' || (!isInstallment && isExpired)) && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <Link href={route('home')}>
                                                <Home className="mr-2 h-4 w-4" /> {t('profile.transactionShow.btnBackHome')}
                                            </Link>
                                        </Button>
                                        {productInfo && (
                                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                                <Link
                                                    href={
                                                        productInfo.type === 'bundle'
                                                            ? route('bundle.detail', { bundle: productInfo.slug })
                                                            : route(productInfo.publicRoute, {
                                                                  [productInfo.routeParam || productInfo.type]: productInfo.slug,
                                                              })
                                                    }
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    {t('profile.transactionShow.viewProductDetail')}
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
