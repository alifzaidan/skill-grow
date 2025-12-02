import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function CtaSection() {
    return (
        <section className="mt-2 mx-auto max-w-7xl w-full px-4 ">
            <div className="bg-primary rounded-xl shadow-lg py-12 px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="ttext-xl sm:text-2xl md:text-3xl lg:text-4xl text-center lg:text-left font-bold text-foreground mb-2">
                        Tertarik Mengikuti Kelas Kami?
                    </h2>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg text-foreground text-center lg:text-left">
                        Gabung sekarang dan mulai perjalanan pengembangan skill bersama Skill Grow!
                    </p>
                </div>
                <Link href="/course">
                    <Button variant="outline" className="text-xs sm:text-sm md:text-base">
                        Lihat Kelas
                    </Button>
                </Link>
            </div>
        </section>
    );
}
