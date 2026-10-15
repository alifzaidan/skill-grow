import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AboutSection from './about-section';
import CtaSection from './cta-section';
import GrowSection from './grow-section';
import PopularClassSection from './popular-class-section';
import ProgramSection from './program-section';
import StudyFlowSection from './study-flow-section';
import TestimonySection from './testimony-section';

export default function Home() {
    const { t } = useTranslation('common');

    return (
        <UserLayout>
            <Head title={t('nav.home', 'Beranda')} />
            <AboutSection />
            <ProgramSection />
            <PopularClassSection />
            <GrowSection />
            <StudyFlowSection />
            <TestimonySection />
            <CtaSection />

            <a
                href="https://wa.me/+6285167541152?text=Halo%20Admin%20Skillgrow,%20saya%20ingin%20bertanya%20tentang%20kelas%20online."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed right-4 bottom-18 z-50 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-green-100 shadow-lg transition duration-1000 hover:bg-green-200 md:right-10 md:h-16 md:w-16 lg:bottom-6"
                aria-label="Chat WhatsApp"
            >
                <img src="/assets/images/icon-wa.svg" alt="WhatsApp" className="h-8 w-8 md:h-12 md:w-12" />
            </a>
        </UserLayout>
    );
}
