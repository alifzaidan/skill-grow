export default function DigmarSection() {
    return (
        <section className="py-16 bg-gray-100 mx-auto max-w-7xl px-4">
            <div className="container mx-auto px-4 md:px-8 lg:px-20">
                <div className="mb-16">
                    <div className="w-fit relative mb-6">
                        <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold block">
                            Digital Marketing
                        </span>
                        <span className="absolute left-0 right-0 -bottom-1 h-3 md:h-4 bg-primary z-0 rounded"></span>
                    </div>
                    <div className="text-gray-600 text-sm sm:text-sm md:text-md lg:text-lg leading-relaxed max-w-4xl">
                        <p>
                            Ketahui berbagai teknik dan strategi pemasaran digital yang dapat digunakan untuk meningkatkan brand awareness, menghasilkan leads, dan mengoptimalkan konversi.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    <div style={{ backgroundColor: '#f0f0f0' }} className="rounded-xl p-6">
                        <div className="w-full mb-4">
                            <img src="/assets/images/smm.png" alt="Social Media Marketing" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-md text-center font-bold text-gray-800 mb-3">Social Media Marketing</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Pengelolaan konten dan kampanye iklan berbayar di media sosial; Meningkatkan engagement dan interaksi dengan audiens.
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#f0f0f0' }} className="rounded-xl p-6">
                        <div className="w-full mb-4">
                            <img src="/assets/images/seo.png" alt="Search Engine Optimization" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-md text-center font-bold text-gray-800 mb-3">Search Engine Optimization</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Optimasi SEO untuk meningkatkan visibilitas website melalui strategi on-page dan off-page, riset keyword, dan analisis kompetitor.
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#f0f0f0' }} className="rounded-xl p-6">
                        <div className="w-full mb-4">
                            <img src="/assets/images/pcc.png" alt="Pay-Per-Click Advertising" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-md text-center font-bold text-gray-800 mb-3">Pay-Per-Click Advertising</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Pemanfaatan Google Ads untuk kampanye PPC yang efektif, optimasi anggaran, serta tracking dan analisis hasil iklan.
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#f0f0f0' }} className="rounded-xl p-6">
                        <div className="w-full mb-4">
                            <img src="/assets/images/email-marketing.png" alt="Email Marketing" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-md text-center font-bold text-gray-800 mb-3">E-Mail Marketing</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Dasar email marketing: membangun daftar, menyusun kampanye efektif, segmentasi & personalisasi, serta automasi dan analisis.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}