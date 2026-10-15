import { useTranslation } from 'react-i18next';

export default function AboutSection() {
    const { t } = useTranslation('user');

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4">
            <div className="mb-4 text-lg font-semibold text-black dark:text-white">{t('bootcamp.detail.whyJoin')}</div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">{t('bootcamp.detail.curriculumModern')}</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        {t('bootcamp.detail.curriculumModernDesc')}
                    </p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-yellow-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">{t('bootcamp.detail.careerReady')}</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        {t('bootcamp.detail.careerReadyDesc')}
                    </p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-green-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">{t('bootcamp.detail.fullSupport')}</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        {t('bootcamp.detail.fullSupportDesc')}
                    </p>
                </div>
            </div>
        </section>
    );
}
