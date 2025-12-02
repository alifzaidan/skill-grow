import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

export default function HeroSection() {
    return (
        <section className="pt-8 w-full mx-auto max-w-7xl px-4">
            <div className="container mx-auto px-4 md:px-8 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="w-fit relative mb-6">
                            <span className="relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold block">
                                Why Skill Grow ???
                            </span>
                            <span className="absolute left-0 right-0 -bottom-1 h-4 md:h-6 bg-primary z-0 rounded"></span>
                        </div>
                        <div className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-lg leading-relaxed space-y-4 pb-4">
                            <p>
                                Kami berdedikasi untuk membantu para profesional dan pencari kerja dalam meningkatkan kompetensi mereka melalui pelatihan berkualitas tinggi yang dirancang oleh para ahli industri.
                            </p>
                        </div>
                        <Link href="/course">
                        <Button>
                            <span>Kembangkan Karirmu</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </Button>
                        </Link>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="md:gap-6">
                            <div className="relative">
                                <img src="/assets/images/about-1.png" alt="Learning Experience"
                                    className="rounded-lg shadow-lg relative z-10 w-full" />
                                <span className="absolute -left-4 right-4 rotate-3 bottom-2 h-12 md:h-16 bg-primary z-0 rounded-lg"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
