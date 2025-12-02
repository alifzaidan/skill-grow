
export default function CategoriesSection() {
    return (
        <section className="py-16  mx-auto max-w-7xl px-4">
                <div className="text-center mb-6">
                    <div className="w-fit mx-auto relative mb-6">
                        <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold block">
                            Kategori Kelas Online
                        </span>
                        <span className="absolute left-0 right-0 -bottom-1 h-3 md:h-4 bg-primary z-0 rounded"></span>
                    </div>
                    <div className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-lg leading-relaxed max-w-4xl mx-auto">
                        <p>
                            Program Kelas Online dirancang untuk pembelajaran mendalam dengan proyek nyata, studi kasus, dan bimbingan instruktur profesional di bidangnya.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group min-h-[270px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v1M7 4V3a1 1 0 011-1v0M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4h10M9 9h6m-6 4h6"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm xs:text-base sm:text-xl font-bold text-gray-800 mb-1 xs:mb-2 sm:mb-3">Digital Marketing</h3>
                        <p className="text-gray-600 leading-relaxed text-sm xs:text-sm md:text-base flex-1">
                            Pelajari tentang strategi pemasaran melalui media sosial, optimasi mesin pencari (SEO), iklan berbayar (PPC), email marketing, serta analisis data untuk mengukur dan meningkatkan kinerja kampanye digital.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group min-h-[270px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm xs:text-base sm:text-xl font-bold text-gray-800 mb-1 xs:mb-2 sm:mb-3">Business Management</h3>
                        <p className="text-gray-600 leading-relaxed text-sm xs:text-sm md:text-base flex-1">
                            Pelajari cara merancang rencana bisnis yang efektif, mengelola sumber daya, membuat keputusan strategis, serta memimpin tim untuk mencapai tujuan perusahaan.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group min-h-[270px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-sm xs:text-base sm:text-xl font-bold text-gray-800 mb-1 xs:mb-2 sm:mb-3">Information Technology</h3>
                        <p className="text-gray-600 leading-relaxed text-sm xs:text-sm md:text-base flex-1">
                            Pelajari berbagai aspek penting, mulai dari dasar-dasar sistem komputer, jaringan, keamanan siber, hingga perkembangan teknologi terkini seperti cloud computing, big data, dan kecerdasan buatan.
                        </p>
                    </div>
                </div>
        </section>
    );
}
