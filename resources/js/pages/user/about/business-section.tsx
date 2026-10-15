
import { useTranslation } from 'react-i18next';

export default function BusinessSection() {
    const { t } = useTranslation('user');

    return (
        <section className="py-16 mx-auto max-w-7xl px-4">
            <div className="container mx-auto px-4 md:px-8 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className="relative order-2 lg:order-1">
                        <img src="/assets/images/about-2.png" alt="Business Management"
                            className="rounded-lg shadow-lg relative z-10 w-full" />
                        <span className="absolute -left-6 right-6 -rotate-2 bottom-3 h-16 md:h-20 bg-secondary z-0 rounded-lg"></span>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-fit relative mb-6">
                            <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold block">
                                {t('aboutPage.business.title', 'Business Management')}
                            </span>
                            <span className="absolute left-0 right-0 -bottom-1 h-3 md:h-4 bg-secondary z-0 rounded"></span>
                        </div>
                        <div className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-lg leading-relaxed space-y-4">
                            <p>
                                {t('aboutPage.business.desc1')}
                            </p>
                            <p>
                                {t('aboutPage.business.desc2')}
                            </p>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                <span className="text-gray-700 text-sm sm:text-sm md:text-md lg:text-lg">{t('aboutPage.business.p1')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                <span className="text-gray-700 text-sm sm:text-sm md:text-md lg:text-lg">{t('aboutPage.business.p2')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                <span className="text-gray-700 text-sm sm:text-sm md:text-md lg:text-lg">{t('aboutPage.business.p3')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                <span className="text-gray-700 text-sm sm:text-sm md:text-md lg:text-lg">{t('aboutPage.business.p4')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}