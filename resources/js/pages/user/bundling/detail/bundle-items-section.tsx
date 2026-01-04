import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rupiahFormatter } from '@/lib/utils';
import { BookText, ExternalLink, MonitorPlay, Presentation, Package, TrendingDown } from 'lucide-react';

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
    bundleable_id: string;
    bundleable: Product;
    price: number;
}

interface GroupedItems {
    courses: BundleItem[];
    bootcamps: BundleItem[];
    webinars: BundleItem[];
}

interface Bundle {
    bundle_items_count: number;
    price: number;
}

interface BundleItemsSectionProps {
    bundle: Bundle;
    groupedItems: GroupedItems;
    totalOriginalPrice: number;
}

export default function BundleItemsSection({ bundle, groupedItems, totalOriginalPrice }: BundleItemsSectionProps) {
    const getProductUrl = (type: string, slug: string) => {
        switch (type) {
            case 'course':
                return route('course.detail', slug);
            case 'bootcamp':
                return route('bootcamp.detail', slug);
            case 'webinar':
                return route('webinar.detail', slug);
            default:
                return '#';
        }
    };

    const discountPercentage = Math.round(((totalOriginalPrice - bundle.price) / totalOriginalPrice) * 100);
    const savingsAmount = totalOriginalPrice - bundle.price;

    const renderItems = (items: BundleItem[], type: 'course' | 'bootcamp' | 'webinar') => {
        if (items.length === 0) return null;

        const config = {
            course: {
                icon: BookText,
                label: 'KELAS ONLINE',
                badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
                iconColor: 'text-blue-600 dark:text-blue-400',
                cardBorder: 'border-blue-200 dark:border-blue-800',
            },
            bootcamp: {
                icon: Presentation,
                label: 'BOOTCAMP',
                badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400',
                iconColor: 'text-purple-600 dark:text-purple-400',
                cardBorder: 'border-purple-200 dark:border-purple-800',
            },
            webinar: {
                icon: MonitorPlay,
                label: 'WEBINAR',
                badgeClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
                iconColor: 'text-green-600 dark:text-green-400',
                cardBorder: 'border-green-200 dark:border-green-800',
            },
        };

        const { icon: Icon, label, badgeClass, iconColor, cardBorder } = config[type];

        return (
            <div className="mb-6 md:mb-8">
                <div className="mb-4 flex items-center gap-3 md:mb-6 md:gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md md:h-12 md:w-12 ${
                        type === 'course' ? 'from-blue-500 to-blue-600' : 
                        type === 'bootcamp' ? 'from-purple-500 to-purple-600' : 
                        'from-green-500 to-green-600'
                    }`}>
                        <Icon className="h-5 w-5 text-white md:h-6 md:w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">{label}</h3>
                        <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">{items.length} Program tersedia</p>
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                        const productUrl = getProductUrl(type, item.bundleable.slug);

                        return (
                            <div
                                key={item.id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-40 w-full overflow-hidden sm:h-44 md:h-48">
                                    <img
                                        src={
                                            item.bundleable.thumbnail ? `/storage/${item.bundleable.thumbnail}` : '/assets/images/placeholder.png'
                                        }
                                        alt={item.bundleable.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    
                                    {/* Badge */}
                                    <div className="absolute top-2 left-2 md:top-3 md:left-3">
                                        <Badge className={`${badgeClass} border-none shadow-lg`}>
                                            {type === 'course' ? 'Course' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Badge>
                                    </div>

                                    {/* External Link */}
                                    <a 
                                        href={productUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white md:top-3 md:right-3 md:h-9 md:w-9 dark:bg-gray-800/95 dark:hover:bg-gray-800"
                                    >
                                        <ExternalLink size={14} className="text-gray-700 md:h-4 md:w-4 dark:text-gray-300" />
                                    </a>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-4 md:p-5">
                                    <h4 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900 md:mb-3 md:min-h-[3rem] md:text-base dark:text-white">
                                        {item.bundleable.title}
                                    </h4>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Nilai Program</span>
                                        </div>
                                        <p className="mt-1 text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                                            {rupiahFormatter.format(item.price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover Ring */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-primary transition-opacity group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12 lg:py-16">
            {/* Header */}
            <div className="mb-8 text-center md:mb-12">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-secondary md:px-5 md:py-2 md:text-sm dark:border-primary/50 dark:bg-primary/20">
                    <Package size={14} className="md:h-4 md:w-4" />
                    Isi Paket Bundling
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900 italic sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl dark:text-white">
                    {bundle.bundle_items_count} Program Pembelajaran Lengkap
                </h2>
                <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base md:text-lg dark:text-gray-400">
                    Akses semua program pembelajaran berkualitas ini dalam satu paket dengan harga spesial
                </p>
            </div>

            {/* Items */}
            <div className="mb-8 md:mb-12 lg:mb-16">
                {renderItems(groupedItems.courses, 'course')}
                {renderItems(groupedItems.bootcamps, 'bootcamp')}
                {renderItems(groupedItems.webinars, 'webinar')}
            </div>

            {/* Price Summary */}
            <div className="mx-auto max-w-4xl">
                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-white via-primary/5 to-primary/10 p-4 shadow-2xl md:rounded-3xl md:p-6 lg:p-8 dark:from-gray-900 dark:via-primary/10 dark:to-primary/5">
                    {/* Decorative Circles */}
                    <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
                    
                    <div className="relative">
                        {/* Header */}
                        <div className="mb-6 text-center md:mb-8">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary md:mb-3 md:px-4 md:py-2 md:text-sm dark:bg-primary/20">
                                <TrendingDown size={14} className="md:h-4 md:w-4" />
                                Hemat hingga {discountPercentage}%
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">Ringkasan Harga</h3>
                            <p className="mt-1 text-xs text-gray-600 md:text-sm dark:text-gray-400">Bandingkan dan lihat penghematanmu</p>
                        </div>

                        <div className="space-y-4">
                            {/* Original Price */}
                            <div className="flex flex-col gap-2 rounded-xl bg-white/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:rounded-2xl md:p-6 dark:bg-gray-800/60">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 md:text-sm dark:text-gray-400">Harga Normal</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">Jika dibeli terpisah ({bundle.bundle_items_count} program)</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xl font-bold text-gray-400 line-through md:text-2xl dark:text-gray-500">
                                        {rupiahFormatter.format(totalOriginalPrice)}
                                    </p>
                                </div>
                            </div>

                            {/* Savings */}
                            <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between md:rounded-2xl md:p-6 dark:from-green-900/20 dark:to-emerald-900/20">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500 md:h-10 md:w-10">
                                        <TrendingDown size={18} className="text-white md:h-5 md:w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-700 md:text-base dark:text-green-400">Total Penghematan</p>
                                        <p className="text-xs text-green-600 dark:text-green-500">Hemat {discountPercentage}% dari harga normal</p>
                                    </div>
                                </div>
                                <p className="text-xl font-bold text-green-600 md:text-2xl dark:text-green-400">
                                    {rupiahFormatter.format(savingsAmount)}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-gradient-to-br from-white via-primary/5 to-primary/10 px-4 text-sm font-medium text-gray-500 dark:from-gray-900 dark:via-primary/10 dark:to-primary/5 dark:text-gray-400">
                                        Harga Final
                                    </span>
                                </div>
                            </div>

                            {/* Bundle Price */}
                            <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-4 md:rounded-2xl md:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="mb-1 text-base font-bold text-gray-900 md:text-lg dark:text-white">Harga Paket Bundling</p>
                                        <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">Bayar sekali, akses selamanya</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-2xl font-bold text-primary md:text-3xl lg:text-4xl">
                                            {rupiahFormatter.format(bundle.price)}
                                        </p>
                                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 md:px-3 md:py-1 dark:bg-green-900/40">
                                            <TrendingDown size={12} className="text-green-600 dark:text-green-400" />
                                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                                Hemat {discountPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
