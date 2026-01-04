import { Award, Gift, Sparkles, Star } from 'lucide-react';

interface Bundle {
    description?: string | null;
    benefits?: string | null;
}

interface BenefitsSectionProps {
    bundle: Bundle;
}

export default function BenefitsSection({ bundle }: BenefitsSectionProps) {
    if (!bundle.description && !bundle.benefits) {
        return null;
    }

    return (
        <section className="relative mx-auto w-full max-w-7xl px-4 py-8 md:py-12 lg:py-16">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2">
                <div className="flex gap-8">
                    <div className="h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
                </div>
            </div>

            <div className="relative grid gap-8 lg:grid-cols-2">
                {/* Description Section */}
                {bundle.description && (
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-xl transition-all hover:shadow-2xl md:rounded-3xl md:p-6 lg:p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-primary/10 blur-2xl" />
                        
                        <div className="relative">
                            {/* Header */}
                            <div className="mb-4 md:mb-6">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-secondary md:mb-4 md:px-4 md:py-2 md:text-sm dark:bg-primary/20">
                                    <Sparkles size={14} className="md:h-4 md:w-4" />
                                    Tentang Paket Bundling
                                </div>
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 md:h-14 md:w-14 md:rounded-2xl">
                                        <Star size={24} className="text-primary md:h-7 md:w-7" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-lg font-bold text-gray-900 md:mb-2 md:text-xl lg:text-2xl dark:text-white">
                                            Deskripsi Paket
                                        </h3>
                                        <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">
                                            Kenali lebih dalam tentang paket ini
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-sm max-w-none md:prose-base lg:prose-lg dark:prose-invert">
                                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base dark:text-gray-300">
                                    {bundle.description}
                                </p>
                            </div>
                        </div>

                        {/* Hover Effect Border */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-2 ring-primary transition-opacity group-hover:opacity-100" />
                    </div>
                )}

                {/* Benefits Section */}
                {bundle.benefits && (
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-primary/5 p-5 shadow-xl transition-all hover:shadow-2xl md:rounded-3xl md:p-6 lg:p-8 dark:border-gray-700 dark:from-gray-800 dark:to-primary/10">
                        {/* Decorative Corner */}
                        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-16 translate-y-16 rounded-full bg-secondary/10 blur-2xl" />
                        
                        <div className="relative">
                            {/* Header */}
                            <div className="mb-4 md:mb-6">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 md:mb-4 md:px-4 md:py-2 md:text-sm dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400">
                                    <Gift size={14} className="md:h-4 md:w-4" />
                                    Keuntungan Spesial
                                </div>
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 md:h-14 md:w-14 md:rounded-2xl">
                                        <Award size={24} className="text-green-600 md:h-7 md:w-7 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-lg font-bold text-gray-900 md:mb-2 md:text-xl lg:text-2xl dark:text-white">
                                            Keuntungan yang Anda Dapatkan
                                        </h3>
                                        <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">
                                            Benefit eksklusif untuk Anda
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div 
                                className="prose prose-sm max-w-none md:prose-base lg:prose-lg dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white"
                                dangerouslySetInnerHTML={{ __html: bundle.benefits }} 
                            />
                        </div>

                        {/* Hover Effect Border */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-2 ring-green-500 transition-opacity group-hover:opacity-100" />
                    </div>
                )}
            </div>

            {/* Bottom Decoration */}
            {bundle.description && bundle.benefits && (
                <div className="mt-8 text-center md:mt-10 lg:mt-12">
                    <div className="inline-flex flex-col items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-gray-700 sm:flex-row md:px-6 md:py-3 md:text-sm dark:border-primary/30 dark:bg-primary/10 dark:text-gray-300">
                        <Sparkles size={14} className="text-primary md:h-4 md:w-4" />
                        <span className="text-center">Dapatkan semua keuntungan ini dalam satu paket bundling</span>
                        <Sparkles size={14} className="text-primary md:h-4 md:w-4" />
                    </div>
                </div>
            )}
        </section>
    );
}
