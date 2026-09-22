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
                badge: 'Kelas Online',
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
                badge: 'Bootcamp',
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
                badge: 'Webinar',
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
                    badge: 'Sertifikasi Program',
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
                toast.success('Pesanan berhasil dibatalkan dan invoice telah dinonaktifkan.');
                window.location.reload();
            } else {
                toast.error(res.data?.message || 'Gagal membatalkan pesanan.');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || 'Terjadi kesalahan saat membatalkan pesanan.');
            } else {
                toast.error('Terjadi kesalahan saat membatalkan pesanan.');
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
                return 'Cicilan Lunas';
            }
            if (isSuspended) {
                return 'Akses Dibekukan (Jatuh Tempo Terlewati)';
            }
            if (isTerm1Paid) {
                return `Cicilan Aktif (${paidTerms.length}/${terms.length || 2} Termin)`;
            }
            return 'Menunggu Pembayaran DP (Termin 1)';
        }

        switch (invoice.status) {
            case 'paid':
            case 'completed':
                return 'Pembayaran Berhasil';
            case 'pending':
                return isExpired ? 'Pembayaran Kedaluwarsa' : 'Menunggu Pembayaran';
            case 'failed':
                return 'Pembayaran Dibatalkan';
            default:
                return 'Status Tidak Diketahui';
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
            <Head title={`Invoice ${invoice.invoice_code}`} />

            <div className="min-h-screen bg-gray-50 py-4 md:py-8 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
                        {/* Header Banner */}
                        <div className="to-primary flex gap-3 bg-gradient-to-tl from-black px-6 py-4 text-white">
                            {getStatusIcon()}
                            <div>
                                <h1 className={`text-xl font-bold md:text-2xl ${getStatusColor()}`}>{getStatusText()}</h1>
                                <p className="mt-1 text-sm text-blue-100 md:text-base">Invoice #{invoice.invoice_code}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Product Info */}
                            {productInfo && (
                                <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Produk yang Dibeli</h3>
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={productInfo.thumbnail ? `/storage/${productInfo.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={productInfo.name}
                                            className="h-16 rounded-lg object-cover md:h-20"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{productInfo.name}</h4>
                                            <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                                                {productInfo.badge
                                                    ? productInfo.badge
                                                    : productInfo.type === 'course'
                                                      ? 'Kelas Online'
                                                      : productInfo.type === 'bootcamp'
                                                        ? 'Bootcamp'
                                                        : productInfo.type === 'webinar'
                                                          ? 'Webinar'
                                                          : 'Paket Bundling'}
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
                                                            Buka di Profile
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
                                                            Lihat Detail Produk
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
                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            Jadwal & Status Cicilan
                                        </h3>
                                        <Link
                                            href={route('profile.installments')}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                        >
                                            Halaman Cicilan &rarr;
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {terms.map((term) => {
                                            const isPaid = term.status === 'paid';
                                            const isOverdue = term.status === 'overdue';
                                            const termNumber = term.installment_number ?? term.term_number ?? 1;
                                            const dueDate = term.installment_due_date ?? term.due_date;
                                            const dueDateFormatted = dueDate
                                                ? new Date(dueDate).toLocaleDateString('id-ID', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : '-';
                                            const paidDateFormatted = term.paid_at
                                                ? new Date(term.paid_at).toLocaleDateString('id-ID', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric',
                                                  })
                                                : null;
                                            const termInvoiceUrl = term.invoice?.invoice_url || term.invoice_url;

                                            return (
                                                <div
                                                    key={term.id}
                                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border transition ${
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
                                                                Termin {termNumber} {termNumber === 1 ? '(DP)' : ''}
                                                            </span>
                                                            {isPaid ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                                    <CheckCircle size={12} />
                                                                    Lunas
                                                                </span>
                                                            ) : isOverdue ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                                    <AlertTriangle size={12} />
                                                                    Jatuh Tempo
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                                                                    <Clock size={12} />
                                                                    Belum Lunas
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {isPaid && paidDateFormatted
                                                                ? `Dibayar pada ${paidDateFormatted}`
                                                                : `Jatuh tempo: ${dueDateFormatted}`}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            Rp {Number(term.amount).toLocaleString('id-ID')}
                                                        </span>
                                                        {!isPaid && (
                                                            <Button asChild size="sm" variant={isOverdue ? 'destructive' : 'default'}>
                                                                {termInvoiceUrl ? (
                                                                    <a href={termInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                                        Bayar
                                                                    </a>
                                                                ) : (
                                                                    <Link href={route('profile.installments')}>
                                                                        Bayar
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
                                        <strong>Akses Belajar Sedang Dibekukan:</strong> Termin cicilan Anda telah melewati tanggal jatuh tempo. Silakan segera lunasi termin yang tertagih untuk membuka dan memulihkan kembali akses belajar Anda.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isFullyPaid && isTerm1Paid && !isSuspended && (
                                <Alert className="mb-6 border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-950/20">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    <AlertDescription className="text-indigo-800 dark:text-indigo-300">
                                        <strong>Skema Cicilan Aktif:</strong> Akses program Anda telah aktif. Pastikan untuk melunasi termin berikutnya sebelum tanggal jatuh tempo agar proses belajar tidak terganggu.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isInstallment && !isTerm1Paid && invoice.status !== 'failed' && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800/40 dark:bg-yellow-950/20">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                                        <strong>Segera Selesaikan Pembayaran DP (Termin 1)!</strong> Setelah pembayaran Termin 1 berhasil, akses materi dan jadwal pembayaran termin cicilan berikutnya akan langsung aktif secara otomatis.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && !isExpired && (
                                <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="flex items-center justify-between">
                                            <span>
                                                Pembayaran akan kedaluwarsa dalam {hoursLeft} jam {minutesLeft} menit.
                                            </span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isInstallment && invoice.status === 'pending' && isExpired && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Invoice ini sudah kedaluwarsa dan tidak dapat dibayar lagi. Silakan buat pesanan baru.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {invoice.status === 'failed' && (
                                <Alert className="mb-6 border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Invoice ini telah dibatalkan dan tidak dapat dibayar lagi. Silakan buat pesanan baru jika masih ingin membeli.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Payment Details & Information */}
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Detail Pembayaran</h3>
                                    <div className="space-y-2 text-sm">
                                        {invoice.discount_amount > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Harga Asli:</span>
                                                    <span className="medium">
                                                        Rp {(invoice.discount_amount + invoice.nett_amount)?.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Diskon:</span>
                                                    <span className="text-gray-500 line-through">
                                                        Rp {invoice.discount_amount?.toLocaleString('id-ID') || '0'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                            <span className="font-medium">Rp {invoice.nett_amount?.toLocaleString('id-ID') || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Biaya Transaksi:</span>
                                            <span className="font-medium">
                                                Rp {((invoice.amount || 0) - (invoice.nett_amount || 0)).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                                            <span>Total:</span>
                                            <span>Rp {invoice.amount?.toLocaleString('id-ID') || '0'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Informasi Pembayaran</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${getStatusBadgeClass()}`}>{getStatusText()}</span>
                                        </div>
                                        {invoice.payment_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Metode:</span>
                                                <span className="font-medium">{invoice.payment_method}</span>
                                            </div>
                                        )}
                                        {invoice.payment_channel && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Channel:</span>
                                                <span className="font-medium">{invoice.payment_channel}</span>
                                            </div>
                                        )}
                                        {invoice.paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Dibayar pada:</span>
                                                <span className="font-medium">{new Date(invoice.paid_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {invoice.expires_at && invoice.status === 'pending' && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Kedaluwarsa:</span>
                                                <span className="font-medium">{new Date(invoice.expires_at).toLocaleString('id-ID')}</span>
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
                                            Akses {productInfo.badge || 'Produk'}
                                        </Link>
                                    </Button>
                                )}

                                {isInstallment && (
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30">
                                        <Link href={route('profile.installments')}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Kelola & Jadwal Cicilan
                                        </Link>
                                    </Button>
                                )}

                                {(invoice.status === 'paid' || isTerm1Paid) && (
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                        <a href={route('invoice.pdf', { id: invoice.id })} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Unduh Invoice
                                        </a>
                                    </Button>
                                )}

                                {invoice.status === 'pending' && !isExpired && invoice.invoice_url && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                                                {isInstallment ? 'Bayar Termin 1 (DP)' : 'Lanjutkan Pembayaran'}
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
                                                    {cancelLoading ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Batalkan Pesanan?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Apakah Anda yakin ingin membatalkan pesanan ini? Invoice akan dinonaktifkan dan tidak dapat
                                                        dibayar lagi. Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Tidak, Pertahankan</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleCancelConfirm}
                                                        className="border-red-600 bg-red-600 hover:bg-red-700"
                                                    >
                                                        Ya, Batalkan Pesanan
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}

                                <Button asChild className="w-full sm:w-auto" variant="outline" size="lg">
                                    <Link href={route('profile.transactions')}>Lihat Riwayat Transaksi</Link>
                                </Button>

                                {(invoice.status === 'failed' || (!isInstallment && isExpired)) && (
                                    <>
                                        <Button asChild size="lg" className="w-full sm:w-auto">
                                            <Link href={route('home')}>
                                                <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
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
                                                    Lihat Detail Produk
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
