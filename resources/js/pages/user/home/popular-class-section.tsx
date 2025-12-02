import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function PopularClassSection() {
    return (
        <section className="mt-4 mx-auto max-w-7xl px-2 sm:px-4">
            <div className="w-full sm:w-fit relative">
                <h2 className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-3xl w-full sm:w-48 md:w-60 font-bold text-foreground mb-4 text-center sm:text-left">
                    Kelas Populer Untuk Anda
                </h2>
                <span className="absolute left-0 right-0 sm:left-0 sm:right-0 md:left-0 md:right-0 bottom-0 md:-bottom-1 h-3 sm:h-4 bg-primary z-0 rounded"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 group flex flex-col h-full">
                    <img 
                        src="/assets/images/hero-1.png" 
                        alt="Digital Marketing"
                        className="w-full h-40 object-cover rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-forground">Digital Marketing</h3>
                    <p className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-base my-2">
                        Pelajari dasar-dasar email marketing, periklanan PPC, SEO, strategi
                        dan manajemen media sosial untuk mulai karir digital marketing anda yang gemilang.
                    </p>
                    <Link href="/course" className="mt-auto">
                        <Button variant="default" className="w-full">
                            Lihat Kelas
                        </Button>
                    </Link>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 group flex flex-col h-full">
                    <img 
                        src="/assets/images/hero-2.png" 
                        alt="Business & Management"
                        className="w-full h-40 object-cover rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-forground">Business & Management</h3>
                    <p className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-base my-2">
                        Bangun pondasi kuat untuk perencanaan bisnis, strategi manajemen
                        keuangan, dan perilaku organisasi untuk membangun karir sukses dalam bisnis.
                    </p>
                    <Link href="/course" className="mt-auto">
                        <Button variant="default" className="w-full">
                            Lihat Kelas
                        </Button>
                    </Link>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-3 sm:p-4 group flex flex-col h-full">
                    <img 
                        src="/assets/images/hero-4.png" 
                        alt="Information & Technology"
                        className="w-full h-40 object-cover rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-forground">Information & Technology</h3>
                    <p className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-base my-2">
                        Pelajari dasar-dasar ilmu komputer, pengembangan perangkat lunak,
                        jaringan, dan keamanan siber untuk membangun pemahaman kuat tentang lanskap TI.
                    </p>
                    <Link href="/course" className="mt-auto">
                        <Button variant="default" className="w-full">
                            Lihat Kelas
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}