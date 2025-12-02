
export default function CareerSection() {
    return (
        <section className="py-16">
            <div className="container  mx-auto max-w-7xl px-4  md:px-8 lg:px-20">
                <div className="text-center mb-16">
                    <div className="w-fit mx-auto relative mb-6">
                        <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold block text-center">
                            Skill Grow: Empowering Your<br />Career Growth for the Future Ahead
                        </span>
                        <span className="absolute left-0 right-0 -bottom-1 h-3 md:h-4 bg-primary z-0 rounded"></span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        {/* 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Kurikulum Relevan dan Terupdate</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Materi pelatihan disesuaikan dengan trend industri terbaru, sehingga peserta mendapatkan keterampilan yang dibutuhkan saat ini.
                                </p>
                            </div>
                        </div>
                        {/* 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Fokus pada Skill Praktis</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Tidak hanya membahas materi teoretis, Skill Grow memungkinkan penekanan pada keterampilan langsung yang bisa diterapkan di dunia kerja.
                                </p>
                            </div>
                        </div>
                        {/* 3 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Instruktur Berpengalaman dan Berkompeten</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Dibimbing oleh instruktur profesional atau praktisi industri yang benar-benar memahami dunia kerja nyata saat ini.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        {/* 4 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Akses Fleksibel dan Online Learning</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Jika berbasis online, peserta bisa belajar kapan saja dan di mana saja tanpa harus menghadiri kelas secara langsung.
                                </p>
                            </div>
                        </div>
                        {/* 5 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Sertifikasi yang Diakui</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Menerbitkan sertifikat yang diakui perusahaan atau industri, meningkatkan nilai tambah peserta dalam mencari pekerjaan.
                                </p>
                            </div>
                        </div>
                        {/* 6 */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Komunitas dan Networking</h3>
                                <p className="text-gray-600 leading-relaxed text-base">
                                    Adanya forum, grup diskusi, atau komunitas alumni yang bisa membantu peserta dalam mengembangkan jaringan profesional.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
