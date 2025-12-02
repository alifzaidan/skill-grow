import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useEffect, useRef } from 'react';

export default function TestimonySection() {
    const testimonials = [
        {
            text: "Pelatihannya sangat informatif dan terstruktur dengan baik. Instruktur menjelaskan materi dengan jelas dan memberikan banyak contoh praktis. Saya merasa jauh lebih percaya diri setelah mengikuti pelatihan ini.",
            name: "Fitria Nur Utami",
            image: "/assets/images/testi-1.png"
        },
        {
            text: "Pengalaman ini memberikan nilai tambah, tidak hanya dari sisi keahlian teknis tetapi juga meningkatkan daya saing di dunia kerja, terutama untuk posisi yang memerlukan pemahaman akuntansi modern dan aplikasi perangkat lunak.",
            name: "Rizaldy Kamal Fadhillah",
            image: "/assets/images/testi-2.png"
        },
        {
            text: "Video learning sangat membantu karna pelatihan dapat diikuti dengan menyesuaikan waktu luang masing masing, kemudian mentor memberikan pelatihan di setiap materinya yang mudah dipahami dan jelas.",
            name: "Ardhini Khaerunnida",
            image: "/assets/images/testi-3.png"
        },
        {
            text: "Mengikuti Brevet di skillgrow memberikan kesan yang sangat baik dan positif, terutama dalam peningkatan kemampuan dan pengetahuan. Modul pembelajaran yang lengkap dan pengajar yang profesional.",
            name: "Iknatia Clarentina Naibaho",
            image: "/assets/images/ansel.jpg"
        },
        {
            text: "Materi yang disampaikan sangat mudah dipahami dan instruktur memberikan penjelasan yang jelas dan detail. Praktik langsung membantu saya lebih cepat menguasai.",
            name: "I Gusti Ayu Agung Citra Dewi",
            image: "/assets/images/testimonial-1.png"
        },
        {
            text: "Tutornya menjelaskan dengan detail dan runtut dari awal hingga akhir proses pencatatan. Saat ada peserta pelatihan yang ketinggalan, tutornya juga langsung memberikan arahan kembali.",
            name: "Desy Safitri",
            image: "/assets/images/testi-5.jpg"
        },
        {
            text: "Pelatihnya super sabar dalam menjawab pertanyaan, lalu memberikan penjelasan yang informatif. Dari segi pelayanan admin grup juga baik dan memuaskan, responsif dalam menjawab pertanyaan .",
            name: "Zhahira Adriyani",
            image: "/assets/images/testi-6.jpg"
        },
        {
            text: "Selama mengikuti pelatihan pemberian modul pembelajaran, tugas pelatihan dan materi sangat baik. Instruktur juga memberikan penjelasan yang sangat detail sehingga mudah dimengerti..",
            name: "Noeroel Nabilah, S.Kom, CAP",
            image: "/assets/images/testi-7.jpg"
        },
        {
            text: "Saya mengikuti pelatihan akuntansi untuk meningkatkan pengetahuan akuntansi saya khusunya untuk perusahaan dagang. Kesan mengikuti pelatihannya sangat seru, diajarkan dengan studi kasus langsung dan kita juga praktik langsung .",
            name: "Nadia Fujianti",
            image: "/assets/images/testi-8.jpg"
        },
        {
            text: "alhamdulillah bisa lulus dengan nilai yang cukup tinggi. modul latihan yang diberikan sangat membantu untuk mempersiapkan diri sebelum mengikuti ujian sertifikasi.",
            name: "Sherina Arifani, CAP",
            image: "/assets/images/testi-9.jpg"
        },
        {
            text: "Anak PWK ngulik akuntansi? Siapa takut. Awalnya ngira bakal mumet, eh ternyata seru juga! Sertifikasi Accurate bikin saya ngerti cara mainin angka dan software keuangan, jadi nambah senjata buat ngelamar kerja.",
            name: "Erma Annisa Dzakirah, CAP",
            image: "/assets/images/testi-10.jpg"
        },
        {
            text: "Pelatihan ini sangat bermanfaat, terutama bagi yang ingin memahami Accurate secara praktis. Materinya jelas, pendampingnya suportif, dan meskipun online, penyampaiannya tetap efektif.",
            name: "Windi Suarni, CAP",
            image: "/assets/images/testi-11.jpg"
        },
        {
            text: "Saya ingin menambah wawasan dibidang perpajakan, dan saat saya bergabung di pelatihan brevet pajak di smartcounting ini saya senang karena bisa mendapatkan wawasan baru dan bisa gabung komunitas yg positif.",
            name: "Handry Susanto",
            image: "/assets/images/testi-12.jpg"
        },
        {
            text: "Ikut Brevet Pajak AB di Smartcounting Academy benar-benar worth it. Materinya lengkap banget, mulai dari dasar sampai studi kasus. Harganya juga sangat affordable, dan banyak voucher diskon bagi para alumni pelatihannya.",
            name: "Rahayu Dian Rahmani",
            image: "/assets/images/testi-13.jpg"
        },
        {
            text: "Saya mengikuti pelatihan ini untuk meningkatkan pemahaman dan keterampilan dalam bidang akuntansi yang sangat dibutuhkan dalam pekerjaan saya. Pelatihannya sangat bermanfaat, materi disampaikan dengan jelas.",
            name: "Eka Winda Yulianti",
            image: "/assets/images/testi-15.jpg"
        }
    ];

    const carouselRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const total = testimonials.length;
    const currentIndex = useRef(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        let observer: IntersectionObserver | null = null;

        function startAutoSlide() {
            if (interval) return;
            interval = setInterval(() => {
                currentIndex.current = (currentIndex.current + 1) % total;
                if (carouselRef.current) {
                    const content = carouselRef.current.querySelector('[data-carousel-content]');
                    if (content) {
                        const items = content.querySelectorAll('[data-carousel-item]');
                        if (items.length > 0) {
                            const target = items[currentIndex.current];
                            if (target && target.scrollIntoView) {
                                target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                            }
                        }
                    }
                }
            }, 3000);
        }

        function stopAutoSlide() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }

        if (sectionRef.current) {
            observer = new window.IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        startAutoSlide();
                    } else {
                        stopAutoSlide();
                    }
                },
                { threshold: 0.2 },
            );
            observer.observe(sectionRef.current);
        }

        return () => {
            stopAutoSlide();
            if (observer && sectionRef.current) observer.unobserve(sectionRef.current);
        };
    }, [total]);

    return (
        <section ref={sectionRef} className="mx-auto mt-10 mb-10 w-full px-2 sm:px-4 max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            <div className="relative mx-auto mb-8 sm:mb-12 w-full sm:w-fit">
                <span className="relative z-10 block text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Apa Kata Mereka Tentang Skill Grow</span>
                <span className="bg-primary absolute right-2 -bottom-1 left-2 z-0 h-3 sm:h-4 rounded"></span>
            </div>

            <Carousel opts={{ align: 'start' }} className="w-full" ref={carouselRef}>
                <CarouselContent data-carousel-content>
                    {testimonials.map((testimonial, idx) => (
                        <CarouselItem
                            key={idx}
                            className="basis-full sm:basis-1/1 md:basis-1/2 lg:basis-1/3 px-1 sm:px-2"
                            data-carousel-item
                        >
                            <div className="h-full px-2">
                                <Card className="w-full h-full rounded-lg sm:rounded-xl px-4 md:rounded-2xl shadow-sm sm:shadow-md md:shadow-lg border border-gray-200">
                                    <CardContent className="flex h-full flex-col justify-between p-2 sm:p-2 md:p-4 lg:p-6">
                                        <p className="mb-2 sm:mb-4 md:mb-6 text-justify text-sm sm:text-sm md:text-md lg:text-base  leading-relaxed">"{testimonial.text}"</p>
                                        <div className="mt-4 flex items-center gap-2 ">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="border-primary h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 object-cover"
                                            />
                                            <span className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">{testimonial.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
