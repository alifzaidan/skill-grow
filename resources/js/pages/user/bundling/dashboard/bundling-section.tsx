import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Magnetic } from '@/components/ui/magnetic';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, GalleryVerticalEnd } from 'lucide-react';
import { useState } from 'react';

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable: {
        id: string;
        title: string;
        slug: string;
    };
    price: number;
}

interface Bundle {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    thumbnail: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline: string | null;
    status: 'draft' | 'published' | 'archived';
    bundle_items: BundleItem[];
    bundle_items_count: number;
}

interface BundlingSectionProps {
    bundles: Bundle[];
}

export default function BundlingSection({ bundles }: BundlingSectionProps) {
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);

    const filteredBundles = bundles.filter((bundle) => {
        const matchSearch = bundle.title.toLowerCase().includes(search.toLowerCase());
        return matchSearch && bundle.status === 'published';
    });

    const visibleBundles = filteredBundles.slice(0, visibleCount);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateDiscount = (original: number, discounted: number) => {
        if (original === 0) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-12" id="bundles">
            <div className="mb-8 text-center">
                <h2 className="dark:text-primary-foreground mx-auto mb-4 max-w-3xl text-3xl font-bold text-gray-900 italic md:text-4xl">
                    Pilih Paket Bundling Terbaik Untukmu
                </h2>
                <p className="mx-auto text-gray-600 dark:text-gray-400">Hemat lebih banyak dengan membeli paket bundling program pembelajaran.</p>
            </div>

            <div className="mb-6">
                <Input
                    type="search"
                    placeholder="Cari paket bundling..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mx-auto max-w-md"
                />
            </div>

            <div className="mb-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleBundles.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt="Paket Bundling Belum Tersedia" className="w-48" />
                        <div className="text-center text-gray-500">
                            {search ? 'Tidak ada paket bundling yang sesuai dengan pencarian.' : 'Belum ada paket bundling yang tersedia saat ini.'}
                        </div>
                    </div>
                ) : (
                    visibleBundles.map((bundle) => {
                        const discount = calculateDiscount(bundle.strikethrough_price, bundle.price);
                        const hasDeadline = bundle.registration_deadline;

                        return (
                            <Link
                                key={bundle.id}
                                href={route('bundle.detail', bundle.slug)}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={bundle.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Discount Badge */}
                                    {discount > 0 && (
                                        <div className="absolute top-3 left-3">
                                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
                                                Hemat {discount}%
                                            </span>
                                        </div>
                                    )}

                                    {/* Items Count Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-primary rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
                                            {bundle.bundle_items_count} Program
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col justify-between p-5">
                                    <div>
                                        <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{bundle.title}</h2>
                                        {bundle.short_description && (
                                            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{bundle.short_description}</p>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {bundle.price === 0 ? (
                                                    <span className="font-bold text-green-600 dark:text-green-400">Gratis</span>
                                                ) : (
                                                    <div>
                                                        {bundle.strikethrough_price > 0 && (
                                                            <span className="mr-1 text-xs text-red-400 line-through">
                                                                {formatRupiah(bundle.strikethrough_price)}
                                                            </span>
                                                        )}
                                                        <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                                                            {formatRupiah(bundle.price)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Deadline */}
                                        {/* {hasDeadline && (
                                            <div className="mt-3 border-t pt-3">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <Calendar size={14} className="text-red-500" />
                                                    <span>
                                                        Daftar sebelum:{' '}
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {format(new Date(bundle.registration_deadline!), 'dd MMM yyyy', { locale: id })}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>

                                <div className="ring-primary pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 transition-opacity group-hover:opacity-100"></div>
                            </Link>
                        );
                    })
                )}
            </div>

            {visibleCount < filteredBundles.length && (
                <div className="flex justify-center">
                    <Magnetic>
                        <Button type="button" className="mt-4 hover:cursor-pointer" onClick={() => setVisibleCount((prev) => prev + 6)}>
                            Lihat Lebih Banyak <GalleryVerticalEnd />
                        </Button>
                    </Magnetic>
                </div>
            )}
        </section>
    );
}
