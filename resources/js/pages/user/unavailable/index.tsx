import { Button } from '@/components/ui/button';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

interface UnavailableItem {
    title?: string;
    slug?: string;
    status?: string;
}

export default function UnavailablePage({
    title,
    item,
    message,
    adminWhatsappUrl,
    backUrl,
    backLabel,
}: {
    title?: string;
    item?: UnavailableItem;
    message?: string;
    adminWhatsappUrl: string;
    backUrl?: string;
    backLabel?: string;
}) {
    const pageTitle = title || 'Tidak Tersedia';
    const itemTitle = item?.title ? `"${item.title}"` : 'Halaman ini';

    return (
        <UserLayout>
            <Head title={pageTitle} />

            <section className="to-background from-background via-tertiary dark:via-background dark:to-background relative bg-gradient-to-b py-12 text-gray-900 dark:text-white">
                {/* Glow background seperti halaman lain */}
                <div className="animate-spin-slow pointer-events-none absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-8">
                    <div className="bg-primary h-[260px] w-[260px] rounded-full blur-[180px]" />
                    <div className="bg-secondary h-[260px] w-[260px] rounded-full blur-[180px]" />
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4">
                    <h1 className="mx-auto mb-3 bg-gradient-to-r from-[#71D0F7] via-white to-[#E6834A] bg-clip-text text-center text-3xl font-bold text-transparent italic sm:text-4xl">
                        {pageTitle}
                    </h1>
                    <p className="mb-8 max-w-xl text-center text-sm text-gray-300">
                        {itemTitle} saat ini belum bisa diakses. Jika Anda merasa ini adalah kesalahan, silakan hubungi admin untuk bantuan lebih
                        lanjut.
                    </p>

                    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/90 p-8 text-center shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/85">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                            <AlertTriangle size={40} className="text-yellow-500" />
                        </div>
                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {message || 'Halaman tidak tersedia untuk saat ini.'}
                        </h2>
                        <p className="mb-6 text-xs text-gray-600 dark:text-gray-400">
                            Silakan kembali ke halaman sebelumnya atau hubungi admin untuk informasi lebih lanjut.
                        </p>

                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <Button asChild variant="outline" className="flex-1 border-gray-300 dark:border-zinc-700">
                                {backUrl ? (
                                    <Link href={backUrl}>{backLabel || 'Kembali'}</Link>
                                ) : (
                                    <Link href="/">{backLabel || 'Kembali ke Beranda'}</Link>
                                )}
                            </Button>
                            <Button asChild className="flex-1">
                                <a href={adminWhatsappUrl} target="_blank" rel="noopener noreferrer">
                                    Hubungi Admin
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
