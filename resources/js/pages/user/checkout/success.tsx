import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Crown, FileText } from 'lucide-react';

interface CourseItem {
    course: { title: string; slug: string; thumbnail: string };
}
interface BootcampItem {
    bootcamp: { title: string; slug: string; thumbnail: string };
}
interface WebinarItem {
    webinar: { title: string; slug: string; thumbnail: string };
}

interface Invoice {
    id: string;
    invoice_code: string;
    amount: number;
    course_items?: CourseItem[];
    bootcamp_items?: BootcampItem[];
    webinar_items?: WebinarItem[];
}

interface InvoiceProps {
    invoice: Invoice;
}

export default function CheckoutSuccess({ invoice }: InvoiceProps) {
    const courseItems = invoice.course_items ?? [];
    const bootcampItems = invoice.bootcamp_items ?? [];
    const webinarItems = invoice.webinar_items ?? [];

    let title = '';
    let link = '';
    let label = '';

    if (courseItems.length > 0) {
        title = `Checkout Kelas "${courseItems[0].course.title}" Berhasil!`;
        link = `/profile/my-courses/${courseItems[0].course.slug}`;
        label = 'Akses Kelas';
    } else if (bootcampItems.length > 0) {
        title = `Checkout Bootcamp "${bootcampItems[0].bootcamp.title}" Berhasil!`;
        link = `/profile/my-bootcamps/${bootcampItems[0].bootcamp.slug}`;
        label = 'Akses Bootcamp';
    } else if (webinarItems.length > 0) {
        title = `Checkout Webinar "${webinarItems[0].webinar.title}" Berhasil!`;
        link = `/profile/my-webinars/${webinarItems[0].webinar.slug}`;
        label = 'Akses Webinar';
    } else {
        title = 'Checkout Berhasil!';
        link = '/profile';
        label = 'Lihat Profil';
    }

    return (
        <UserLayout>
            <Head title="Checkout Berhasil" />
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
                                <span className="text-sm font-semibold text-green-700">Pembayaran Berhasil</span>
                            </div>
                            <p className="text-gray-600">
                                Terima kasih telah menyelesaikan pembayaran. Anda sekarang dapat mengakses produk yang telah dibeli.
                            </p>
                        </div>

                        {/* Invoice Info */}
                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Pembayaran</span>
                                <span className="text-xl font-bold text-gray-900">Rp {invoice.amount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Invoice ID</span>
                                <span className="font-mono text-sm text-gray-900">{invoice.invoice_code}</span>
                            </div>
                        </div>

                        {/* Notification Info */}
                        {/* <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-center text-sm text-blue-800">📱 Invoice telah dikirimkan ke nomor WhatsApp Anda</p>
                        </div> */}

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
                                    Unduh Invoice
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Jika ada pertanyaan, silakan hubungi customer support kami di{' '}
                            <a
                                href="https://wa.me/6285184012430"
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
