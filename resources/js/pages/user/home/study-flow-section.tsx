export default function StudyFlowSection() {
    return (
        <section className="mt-4 mx-auto max-w-7xl px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center font-bold">Cari Alur Belajar</h1>
            <div className="w-full sm:w-fit mx-auto relative">
                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center block">
                    Yang Sesuai Dengan Kebutuhan Anda.
                </span>
                <span className="absolute left-2 right-2 -bottom-1 h-3 sm:h-4 bg-primary z-0 rounded"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-foreground p-4 sm:p-6 md:p-8 rounded-lg shadow-lg text-white space-y-4 belajar-card">
                    <h3 className="border-2 border-white rounded-full w-fit px-3 py-1 text-sm sm:text-sm md:text-base">Kelas Online</h3>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg">Belajar kapanpun dan dimanapun dengan menggunakan perangkat seperti komputer atau smartphone.</p>
                    <h4 className="text-base sm:text-lg md:text-xl font-semibold">Keunggulan</h4>
                    <ul className="space-y-2 sm:space-y-2">
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Pembelajaran by video learning
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Full akses materi pembelajaran
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Pembelajaran fleksibel
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Akses 24/7
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            E-sertifikat terverifikasi
                        </li>
                    </ul>
                </div>
                <div className="bg-foreground p-4 sm:p-6 md:p-8 rounded-lg shadow-lg text-white space-y-4 belajar-card">
                    <h3 className="border-2 border-white rounded-full w-fit px-3 py-1 text-sm sm:text-sm md:text-base">Kelas Zoom Meeting</h3>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg">Memungkinkan peserta dan instruktur untuk berinteraksi secara langsung melalui video conference.</p>
                    <h4 className="text-base sm:text-lg md:text-xl font-semibold">Keunggulan</h4>
                    <ul className="space-y-2 sm:space-y-2">
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Pengalaman belajar interaktif
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Pembelajaran disampaikan secara realtime
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Free akses recording kelas dan materi pembelajaran
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            Grup diskusi interaktif antar peserta
                        </li>
                        <li className="flex items-center gap-2 text-sm sm:text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
                                </svg>
                            </span>
                            E-sertifikat terverifikasi
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}