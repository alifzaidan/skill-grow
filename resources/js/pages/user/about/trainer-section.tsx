export default function TrainerSection() {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-20">
                <div className="mb-16 text-center">
                    <div className="relative mx-auto mb-6 w-fit">
                        <span className="relative z-10 block text-center text-2xl font-bold sm:text-3xl md:text-4xl">Say Hi 👋 to Our Trainer</span>
                        <span className="bg-secondary absolute right-0 -bottom-1 left-0 z-0 h-3 rounded md:h-4"></span>
                    </div>
                    <div className="mx-auto max-w-4xl text-base leading-relaxed text-gray-600 md:text-lg">
                        <p>Tim instruktur berpengalaman kami siap membimbing Anda dalam perjalanan pembelajaran dan pengembangan karir.</p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-1.png"
                                alt="Fikri Zuldarefa"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Fikri Zuldarefa</h3>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-2.png"
                                alt="Nurul Fatimah"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Nurul Fatimah</h3>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-3.png"
                                alt="Mochammad Angga Hartanto"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Mochammad Angga Hartanto</h3>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-4.png"
                                alt="Salwa Shabuha Yanuar"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Dwi Cahya Ningsih</h3>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-5.png"
                                alt="Dwi Cahya Ningsih"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Salwa Shabuha Yanuar</h3>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
                            <img
                                src="/assets/images/trainer-6.png"
                                alt="Ayu Rinelisa Prabandari"
                                className="h-80 w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="p-4 text-center">
                                <h3 className="text-lg font-bold text-gray-800">Ayu Rinelisa Prabandari</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
