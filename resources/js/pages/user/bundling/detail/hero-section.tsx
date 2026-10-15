import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { Calendar, Package, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable: Product;
}

interface Bundle {
    title: string;
    thumbnail?: string | null;
    short_description?: string | null;
    registration_deadline?: string | null;
    batch?: string | null;
    bundle_items_count: number;
    bundle_items: BundleItem[];
}

interface HeroSectionProps {
    bundle: Bundle;
    discountPercentage: number;
}

export default function HeroSection({ bundle, discountPercentage }: HeroSectionProps) {
    const { t, i18n } = useTranslation('user');
    const deadlineDate = bundle.registration_deadline ? new Date(bundle.registration_deadline) : null;

    // Get first 2 thumbnails from bundle items
    const displayThumbnails = bundle.bundle_items
        .slice(0, 2)
        .map((item) => (item.bundleable.thumbnail ? `/storage/${item.bundleable.thumbnail}` : '/assets/images/placeholder.png'));

    return (
        <section className="to-background from-background via-primary/5 dark:via-primary/10 relative bg-gradient-to-b pt-20 pb-6 text-gray-900 dark:text-white">
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 animate-spin items-center gap-8 duration-[10s]">
                <div className="bg-primary h-[300px] w-[300px] rounded-full blur-[200px]" />
                <div className="bg-secondary h-[300px] w-[300px] rounded-full blur-[200px]" />
            </div>

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
                <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="text-primary border-primary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                            <Sparkles size={14} className="mr-1" />
                            {t('bundling.detail.hero.badge')}
                        </span>
                        {bundle.batch && (
                            <span className="text-secondary border-secondary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#FED6AD] to-white px-4 py-1 text-sm font-medium shadow-xs">
                                <Calendar size={14} className="mr-1" />
                                {bundle.batch.toLowerCase().includes('batch') ? bundle.batch : t('bundling.detail.hero.batch', { batch: bundle.batch })}
                            </span>
                        )}
                        {discountPercentage > 0 && (
                            <span className="text-secondary border-secondary bg-background mb-4 inline-flex w-fit items-center rounded-full border bg-gradient-to-t from-[#FED6AD] to-white px-3 py-1 text-sm font-medium shadow-xs hover:text-[#FF925B]">
                                {t('bundling.detail.hero.savePercent', { percent: discountPercentage })}
                            </span>
                        )}
                        <span className="text-primary border-primary bg-background mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                            <Package size={14} className="mr-1" />
                            {t('bundling.detail.hero.programsCount', { count: bundle.bundle_items_count })}
                        </span>
                    </div>

                    <h1 className="mb-4 text-4xl leading-tight font-bold italic sm:text-5xl">{bundle.title}</h1>

                    {bundle.short_description && <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">{bundle.short_description}</p>}

                    {deadlineDate && (
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            {t('bundling.detail.hero.registerBefore', {
                                date: format(deadlineDate, 'dd MMMM yyyy, HH:mm', { locale: i18n.language === 'en' ? enUS : id }),
                            })}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        <a href="#register">
                            <Button size="lg">
                                <Package className="mr-2 h-4 w-4" />
                                {t('bundling.detail.hero.btnRegisterNow')}
                            </Button>
                        </a>
                        <a href="https://wa.me/+6285167541152" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline">
                                {t('bundling.detail.hero.btnContactUs')}
                            </Button>
                        </a>
                    </div>
                </div>

                <div className="relative hidden h-80 items-center justify-center lg:flex">
                    {displayThumbnails.length >= 2 ? (
                        <>
                            {/* Thumbnail kedua (belakang) */}
                            <div className="absolute top-8 right-0 z-0 w-64 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105 hover:rotate-6">
                                <img src={displayThumbnails[1]} alt="Product 2" className="h-auto w-full object-contain" />
                            </div>

                            {/* Thumbnail pertama (depan) */}
                            <div className="relative z-10 w-72 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105 hover:-rotate-6">
                                <img src={displayThumbnails[0]} alt="Product 1" className="h-auto w-full object-contain" />

                                {/* Overlay gradient untuk efek depth */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </>
                    ) : displayThumbnails.length === 1 ? (
                        <div className="relative z-10 w-72 overflow-hidden rounded-2xl shadow-2xl">
                            <img src={displayThumbnails[0]} alt="Product 1" className="h-auto w-full object-contain" />
                        </div>
                    ) : (
                        <div className="relative z-10 w-72 overflow-hidden rounded-2xl shadow-2xl">
                            <img src="/assets/images/placeholder.png" alt="Placeholder" className="h-auto w-full object-contain" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
