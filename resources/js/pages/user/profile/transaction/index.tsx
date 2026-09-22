import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Course {
    id: string;
    title: string;
    slug: string;
}
interface Bootcamp {
    id: string;
    title: string;
    slug: string;
}
interface Webinar {
    id: string;
    title: string;
    slug: string;
}
interface CertificationProgram {
    id: string;
    title: string;
    slug: string;
}
interface Bundle {
    id: string;
    title: string;
    slug: string;
}

interface EnrollmentCourse {
    id: string;
    course: Course;
    price: number;
}
interface EnrollmentBootcamp {
    id: string;
    bootcamp: Bootcamp;
    price: number;
}
interface EnrollmentWebinar {
    id: string;
    webinar: Webinar;
    price: number;
}
interface EnrollmentCertificationProgram {
    id: string;
    certificationProgram?: CertificationProgram;
    certification_program?: CertificationProgram;
    price: number;
    is_scholarship: boolean;
}
interface EnrollmentBundle {
    id: string;
    bundle?: Bundle;
    price?: number;
}

interface InstallmentTerm {
    id: string;
    installment_number: number;
    amount: number;
    status: 'paid' | 'pending';
    installment_due_date: string | null;
    paid_at: string | null;
    payment_channel?: string | null;
    payment_method?: string | null;
}

interface Invoice {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    status: 'paid' | 'pending' | 'expired' | 'failed' | 'completed' | 'installment_pending';
    is_installment?: boolean;
    access_suspended_at?: string | null;
    installment_terms?: InstallmentTerm[];
    installmentTerms?: InstallmentTerm[];
    paid_at: string | null;
    payment_channel: string | null;
    payment_method: string | null;
    course_items?: EnrollmentCourse[];
    courseItems?: EnrollmentCourse[];
    bootcamp_items?: EnrollmentBootcamp[];
    bootcampItems?: EnrollmentBootcamp[];
    webinar_items?: EnrollmentWebinar[];
    webinarItems?: EnrollmentWebinar[];
    certificationProgramItems?: EnrollmentCertificationProgram[];
    certification_program_items?: EnrollmentCertificationProgram[];
    bundle_enrollments?: EnrollmentBundle[];
    bundleEnrollments?: EnrollmentBundle[];
    created_at: string;
}

interface TransactionItem {
    type: 'Course' | 'Bootcamp' | 'Webinar' | 'Bundle' | 'Certification Program';
    title: string;
    slug: string;
    price: number;
    invoice_id: string;
    invoice_status: Invoice['status'];
    invoice_code: string;
    invoice_url?: string;
    paid_at: string | null;
    payment_channel: string | null;
    payment_method: string | null;
    created_at: string;
    is_scholarship?: boolean;
    is_installment?: boolean;
    paid_terms?: number;
    total_terms?: number;
    is_fully_paid?: boolean;
    is_suspended?: boolean;
    latest_paid_at?: string | null;
}

interface Props {
    myTransactions: Invoice[];
}

export default function Transactions({ myTransactions }: Props) {
    const [search, setSearch] = useState('');

    const getCertificationProgram = (item: EnrollmentCertificationProgram) => {
        return item.certificationProgram || item.certification_program;
    };

    const getItemHref = (type: TransactionItem['type'], slug: string, item: TransactionItem) => {
        if (!slug) return '#';

        if (item.is_suspended) {
            return route('profile.installments');
        }

        const hasAccess =
            item.invoice_status === 'paid' ||
            item.invoice_status === 'completed' ||
            (item.is_installment && (item.paid_terms ?? 0) > 0);

        if (!hasAccess) {
            // Jika belum berstatus paid/aktif, arahkan ke halaman publik produk agar tidak 404
            switch (type) {
                case 'Course':
                    return route('course.detail', { course: slug });
                case 'Bootcamp':
                    return route('bootcamp.detail', { bootcamp: slug });
                case 'Webinar':
                    return route('webinar.detail', { webinar: slug });
                case 'Certification Program':
                    return route('certification-programs.detail', { program: slug });
                case 'Bundle':
                    return route('bundle.detail', { bundle: slug });
                default:
                    return '#';
            }
        }

        // Paid / Completed / Active installment -> Route ke user LMS / Profile area
        switch (type) {
            case 'Certification Program':
                return route('profile.certification-program.detail', { program: slug });
            case 'Bundle':
                return route('profile.index');
            case 'Course':
                return route('profile.course.detail', { course: slug });
            case 'Bootcamp':
                return route('profile.bootcamp.detail', { bootcamp: slug });
            case 'Webinar':
                return route('profile.webinar.detail', { webinar: slug });
            default:
                return '#';
        }
    };

    // Gabungkan semua items dari semua invoice menjadi satu array bertipe TransactionItem
    const allItems: TransactionItem[] = myTransactions.flatMap((invoice) => {
        const terms = invoice.installment_terms || invoice.installmentTerms || [];
        const paidTerms = [...terms]
            .filter((t) => t.status === 'paid')
            .sort((a, b) => a.installment_number - b.installment_number);
        const latestPaidTerm = paidTerms.length > 0 ? paidTerms[paidTerms.length - 1] : undefined;
        const isInstallment = Boolean(invoice.is_installment || invoice.status === 'installment_pending' || terms.length > 0);
        const isFullyPaid = invoice.status === 'paid' || (terms.length > 0 && paidTerms.length === terms.length);
        const isSuspended = Boolean(invoice.access_suspended_at);
        const effectivePaidAt = invoice.paid_at || latestPaidTerm?.paid_at || null;
        const effectiveChannel = invoice.payment_channel || latestPaidTerm?.payment_channel || null;
        const effectiveMethod = invoice.payment_method || latestPaidTerm?.payment_method || null;

        const commonProps = {
            invoice_id: invoice.id,
            invoice_status: invoice.status,
            invoice_code: invoice.invoice_code,
            invoice_url: invoice.invoice_url,
            paid_at: effectivePaidAt,
            payment_channel: effectiveChannel,
            payment_method: effectiveMethod,
            created_at: invoice.created_at,
            is_installment: isInstallment,
            paid_terms: paidTerms.length,
            total_terms: terms.length,
            is_fully_paid: isFullyPaid,
            is_suspended: isSuspended,
            latest_paid_at: latestPaidTerm?.paid_at || null,
        };

        const courseItems = invoice.course_items || invoice.courseItems || [];
        const bootcampItems = invoice.bootcamp_items || invoice.bootcampItems || [];
        const webinarItems = invoice.webinar_items || invoice.webinarItems || [];
        const bundleItems = invoice.bundle_enrollments || invoice.bundleEnrollments || [];
        const certificationItems = invoice.certificationProgramItems || invoice.certification_program_items || [];

        return [
            ...courseItems.map((item) => ({
                ...commonProps,
                type: 'Course' as const,
                title: item.course?.title || 'Kelas Online',
                slug: item.course?.slug || '',
                price: item.price,
            })),
            ...bootcampItems.map((item) => ({
                ...commonProps,
                type: 'Bootcamp' as const,
                title: item.bootcamp?.title || 'Bootcamp',
                slug: item.bootcamp?.slug || '',
                price: item.price,
            })),
            ...webinarItems.map((item) => ({
                ...commonProps,
                type: 'Webinar' as const,
                title: item.webinar?.title || 'Webinar',
                slug: item.webinar?.slug || '',
                price: item.price,
            })),
            ...bundleItems.map((item) => ({
                ...commonProps,
                type: 'Bundle' as const,
                title: item.bundle?.title || 'Paket Bundling',
                slug: item.bundle?.slug || '',
                price: item.price ?? invoice.amount,
            })),
            ...certificationItems.flatMap((item) => {
                const certificationProgram = getCertificationProgram(item);
                if (!certificationProgram) return [];
                return [
                    {
                        ...commonProps,
                        type: 'Certification Program' as const,
                        title: certificationProgram.title,
                        slug: certificationProgram.slug,
                        price: item.price,
                        is_scholarship: item.is_scholarship,
                    },
                ];
            }),
        ];
    });

    const filteredItems = allItems.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

    const getStatusComponent = (item: TransactionItem) => {
        if (item.is_installment) {
            if (item.is_fully_paid || item.invoice_status === 'paid' || item.invoice_status === 'completed') {
                return <span className="font-medium text-green-600 dark:text-green-400">Cicilan Lunas</span>;
            }
            if (item.is_suspended) {
                return <span className="font-medium text-red-600 dark:text-red-400">Akses Dibekukan (Jatuh Tempo)</span>;
            }
            if ((item.paid_terms ?? 0) > 0) {
                return (
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        Cicilan Aktif ({item.paid_terms}/{item.total_terms} Termin)
                    </span>
                );
            }
            return <span className="font-medium text-yellow-600 dark:text-yellow-400">Menunggu DP (Termin 1)</span>;
        }

        if (item.invoice_status === 'paid' || item.invoice_status === 'completed') {
            return <span className="font-medium text-green-600 dark:text-green-400">Sudah Dibayar</span>;
        }
        if (item.invoice_status === 'pending') {
            return <span className="font-medium text-yellow-600 dark:text-yellow-400">Menunggu Pembayaran</span>;
        }
        return <span className="font-medium text-red-600 dark:text-red-400">Gagal/Kedaluwarsa</span>;
    };

    return (
        <UserLayout>
            <Head title="Transaksi Saya" />
            <ProfileLayout>
                <Heading title="Transaksi Saya" description="Lihat riwayat transaksi Anda di sini" />
                <div className="mb-4 flex justify-between gap-2">
                    <Input type="search" placeholder="Cari judul transaksi..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-zinc-800">
                            <tr className="text-left">
                                <th className="p-2 font-medium">Judul</th>
                                <th className="p-2 font-medium">Tipe</th>
                                <th className="p-2 font-medium">Status</th>
                                <th className="p-2 font-medium">Metode Pembayaran</th>
                                <th className="p-2 font-medium">Kode Invoice</th>
                                <th className="p-2 font-medium">Dibayar Pada</th>
                                <th className="p-2 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        Belum ada transaksi.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => (
                                    <tr key={idx} className="border-t dark:border-zinc-800">
                                        <td className="p-2">
                                            <Link href={getItemHref(item.type, item.slug, item)} className="text-primary hover:underline font-medium">
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="p-2">
                                            {item.type === 'Course'
                                                ? 'Kelas Online'
                                                : item.type === 'Certification Program'
                                                  ? 'Sertifikasi Program'
                                                  : item.type === 'Bundle'
                                                    ? 'Paket Bundling'
                                                    : item.type}
                                        </td>
                                        <td className="p-2">{getStatusComponent(item)}</td>
                                        <td className="p-2">
                                            {item.price === 0 ? (
                                                <span className="font-semibold text-green-600">GRATIS</span>
                                            ) : (
                                                item.payment_channel || item.payment_method || '-'
                                            )}
                                        </td>
                                        <td className="p-2">{item.invoice_code}</td>
                                        <td className="p-2">
                                            {item.is_installment ? (
                                                item.latest_paid_at ? (
                                                    <div>
                                                        <div>{new Date(item.latest_paid_at).toLocaleString('id-ID')}</div>
                                                        <div className="text-xs text-muted-foreground">Termin {item.paid_terms} terbayar</div>
                                                    </div>
                                                ) : (
                                                    <Button asChild size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 font-medium">
                                                        <Link href={route('profile.installments')}>Bayar DP</Link>
                                                    </Button>
                                                )
                                            ) : item.invoice_status === 'pending' && item.invoice_url ? (
                                                <Button asChild size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 font-medium">
                                                    <a href={item.invoice_url} target="_blank" rel="noopener noreferrer">
                                                        Lanjutkan Bayar
                                                    </a>
                                                </Button>
                                            ) : item.paid_at ? (
                                                new Date(item.paid_at).toLocaleString('id-ID')
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-1.5">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={route('profile.transaction.detail', { invoice: item.invoice_id })}>Detail</Link>
                                                </Button>
                                                {item.is_installment && !item.is_fully_paid && (
                                                    <Button asChild size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30">
                                                        <Link href={route('profile.installments')}>Cicilan</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
