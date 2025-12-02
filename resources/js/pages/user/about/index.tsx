import FakeNotifications from '@/components/fake-notifications';
import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import BusinessSection from './business-section';
import CareerSection from './career-section';
import CategoriesSection from './categories-section';
import DigmarSection from './digmar-section';
import HeroSection from './hero';
import TechnologySection from './technology-section';
import TestimonySection from './testimony-section';
import TrainerSection from './trainer-section';

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    title: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    start_date?: string;
    end_date?: string;
    start_time?: string;
    category: Category;
    type: 'course' | 'bootcamp' | 'webinar';
    created_at: string;
}

interface MyProductIds {
    courses: string[];
    bootcamps: string[];
    webinars: string[];
}

interface HomeProps {
    tools: Tool[];
    latestProducts: Product[];
    myProductIds: MyProductIds;
    allProducts: Array<{
        id: string;
        title: string;
        type: 'course' | 'bootcamp' | 'webinar';
        price: number;
    }>;
}

export default function Home({ allProducts }: HomeProps) {
    return (
        <UserLayout>
            <Head title="Beranda" />
            <HeroSection />
            <CategoriesSection />
            <DigmarSection />
            <BusinessSection />
            <TechnologySection />
            <CareerSection />
            <TrainerSection />
            <TestimonySection />

            {typeof window !== 'undefined' && window.innerWidth >= 1024 && <FakeNotifications products={allProducts} />}

            <a
                href="https://wa.me/+6285142505794?text=Halo%20Admin%Skillgrow,%20saya%20ingin%20bertanya%20tentang%20kelas%20online."
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
