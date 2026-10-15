import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Crown, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CourseItem {
    course: { title: string; slug: string; thumbnail: string };
}
interface BootcampItem {
    bootcamp: { title: string; slug: string; thumbnail: string };
}
interface WebinarItem {
    webinar: { title: string; slug: string; thumbnail: string };
}
interface CertificationProgramItem {
    certification_program: { title: string; slug: string; thumbnail: string; group_url?: string | null };
}

interface Invoice {
    id: string;
    invoice_code: string;
    amount: number;
    course_items?: CourseItem[];
    bootcamp_items?: BootcampItem[];
    webinar_items?: WebinarItem[];
    certification_program_items?: CertificationProgramItem[];
}

interface InvoiceProps {
    invoice: Invoice;
}

export default function CheckoutSuccess({ invoice }: InvoiceProps) {
    const { t } = useTranslation('user');
    const courseItems = invoice.course_items ?? [];
    const bootcampItems = invoice.bootcamp_items ?? [];
    const webinarItems = invoice.webinar_items ?? [];
    const certificationProgramItems = invoice.certification_program_items ?? [];

    let title = '';
    let link = '';
    let label = '';

    if (courseItems.length > 0) {
        title = t('checkoutSuccess.courseTitle', { title: courseItems[0].course.title });
        link = `/profile/my-courses/${courseItems[0].course.slug}`;
        label = t('checkoutSuccess.accessCourse', 'Akses Kelas');
    } else if (bootcampItems.length > 0) {
        title = t('checkoutSuccess.bootcampTitle', { title: bootcampItems[0].bootcamp.title });
        link = `/profile/my-bootcamps/${bootcampItems[0].bootcamp.slug}`;
        label = t('checkoutSuccess.accessBootcamp', 'Akses Bootcamp');
    } else if (webinarItems.length > 0) {
        title = t('checkoutSuccess.webinarTitle', { title: webinarItems[0].webinar.title });
        link = `/profile/my-webinars/${webinarItems[0].webinar.slug}`;
        label = t('checkoutSuccess.accessWebinar', 'Akses Webinar');
    } else if (certificationProgramItems.length > 0) {
        title = t('checkoutSuccess.certificationTitle', { title: certificationProgramItems[0].certification_program.title });
        link = `/profile/my-certification-programs/${certificationProgramItems[0].certification_program.slug}`;
        label = t('checkoutSuccess.accessCertification', 'Akses Sertifikasi');
    } else {
        title = t('checkoutSuccess.title', 'Checkout Berhasil!');
        link = '/profile';
        label = t('checkoutSuccess.viewProfile', 'Lihat Profil');
    }

    return (
        <UserLayout>
            <Head title={t('checkoutSuccess.purchaseSuccessful', 'Checkout Berhasil')} />
            <section className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-16">
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
                    {/* Success Icon */}
                    <div className="mb-6 rounded-full bg-green-100 p-4">
                        <CheckCircle2 className="h-18 w-18 text-green-600" />
                    </div>

                    {/* Title */}
                    <h2 className="mb-4 max-w-3xl text-center text-3xl font-bold text-gray-900 italic sm:text-4xl">{title}</h2>

                    {/* Success Card */}
                    <div className="mb-8 w-full max-w-2xl rounded-2xl border-2 border-green-200 bg-white p-8 shadow-xl">
                        <div className="mb-6 text-center">
                            <div className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-2">
                                <span className="text-sm font-semibold text-green-700">{t('checkoutSuccess.paymentSuccess', 'Pembayaran Berhasil')}</span>
                            </div>
                            <p className="text-gray-600">
                                {t('checkoutSuccess.description', 'Terima kasih telah menyelesaikan pembayaran. Anda sekarang dapat mengakses produk yang telah dibeli.')}
                            </p>
                        </div>

                        {/* Invoice Info */}
                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('checkoutSuccess.totalPayment', 'Total Pembayaran')}</span>
                                <span className="text-xl font-bold text-gray-900">Rp {invoice.amount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600">{t('checkoutSuccess.invoiceId', 'Invoice ID')}</span>
                                <span className="font-mono text-sm text-gray-900">{invoice.invoice_code}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button className="w-full" asChild>
                                <Link href={link}>
                                    <Crown className="mr-2 h-4 w-4" />
                                    {label}
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <a href={route('invoice.pdf', { id: invoice.id })} target="_blank" rel="noopener noreferrer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('checkoutSuccess.downloadInvoice', 'Unduh Invoice')}
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            {t('checkoutSuccess.customerSupport', 'Jika ada pertanyaan, silakan hubungi customer support kami di')}{' '}
                            <a
                                href="https://wa.me/6285167541152"
                                className="bg-primary rounded-full px-2 py-1 font-medium text-gray-600 transition-colors hover:text-gray-900"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                +62 851-8401-2430
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
