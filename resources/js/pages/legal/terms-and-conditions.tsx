import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function TermsAndConditions() {
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    return (
        <UserLayout>
            <Head title={isEn ? 'Terms and Conditions' : 'Syarat dan Ketentuan'} />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                                {isEn ? 'Terms and Conditions' : 'Syarat dan Ketentuan'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {isEn ? 'Last updated: July 12, 2025' : 'Terakhir diperbarui: 12 Juli 2025'}
                            </p>
                        </div>

                        {isEn ? (
                            <div className="prose prose-gray dark:prose-invert max-w-none text-justify">
                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">1. Introduction</h2>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                                        Welcome to Skill Grow. These Terms and Conditions govern your access to and use of all learning services provided by Skill Grow ("we", "us", or "Skill Grow").
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        By accessing and utilizing the Skill Grow platform, you acknowledge that you have read, understood, and agreed to all applicable provisions. If you do not agree with these terms, we advise you to discontinue use of our services.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Definitions</h2>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>
                                            <strong>Platform:</strong> The website and/or learning management system of Skill Grow
                                        </li>
                                        <li>
                                            <strong>User:</strong> Any individual accessing or utilizing Skill Grow services
                                        </li>
                                        <li>
                                            <strong>Online Course:</strong> Digital learning programs accessible on-demand via the platform
                                        </li>
                                        <li>
                                            <strong>Bootcamp:</strong> Intensive training programs with specific schedules and durations
                                        </li>
                                        <li>
                                            <strong>Webinar:</strong> Interactive live online seminar sessions scheduled at designated dates and times
                                        </li>
                                        <li>
                                            <strong>Content:</strong> All instructional materials, including videos, written modules, presentations, and supplementary assets
                                        </li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Skill Grow Services</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.1 Online Course</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Learning access provided in accordance with purchased program terms</li>
                                                <li>Materials become accessible immediately upon payment confirmation</li>
                                                <li>Content updates are provided periodically per Skill Grow policies</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.2 Bootcamp</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Intensive cohort learning with defined schedules and durations</li>
                                                <li>Mentored and guided by experienced instructors and practitioners</li>
                                                <li>Certificates awarded to participants meeting graduation requirements</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.3 Webinar</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Held online on designated dates and times</li>
                                                <li>Participants can engage in interactive Q&amp;A sessions</li>
                                                <li>Webinar recordings may be provided based on specific program policies</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Payment and Refund Policy</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">4.1 Payment</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>All payments are transacted in Indonesian Rupiah (IDR)</li>
                                                <li>Payment methods follow available checkout options on the platform</li>
                                                <li>Access to services is granted upon successful payment confirmation</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">4.2 Refund Policy</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Refund requests may be submitted within a maximum of 7 days following purchase</li>
                                                <li>Eligibility criterion: less than 20% of program content has been accessed</li>
                                                <li>For Bootcamps and Webinars, full refunds apply only if cancellation occurs before the program start date</li>
                                                <li>Refund processing takes approximately 7–14 business days</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Intellectual Property Rights</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>
                                            All content on the Skill Grow platform is the property of Skill Grow or third parties who have officially licensed it to us.
                                        </p>
                                        <p>Users are strictly prohibited from:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Copying, distributing, or republishing content without prior written permission</li>
                                            <li>Using content for commercial purposes or monetization</li>
                                            <li>Modifying, altering, or translating learning materials</li>
                                            <li>Sharing account login credentials with third parties</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. User Obligations and Restrictions</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Users must:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Use the platform solely for legitimate learning purposes</li>
                                            <li>Respect the rights, dignity, and learning environment of other participants</li>
                                            <li>Avoid any action that degrades the system integrity or reputation of Skill Grow</li>
                                            <li>Comply with all applicable statutory laws and regulations</li>
                                        </ul>
                                        <p>Users are strictly forbidden from:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Using the platform for any illegal or fraudulent activities</li>
                                            <li>Uploading harmful, defamatory, or unlawful materials</li>
                                            <li>Spamming, disrupting, or interfering with system operations</li>
                                            <li>Attempting unauthorized access to internal systems</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. Privacy and Data Protection</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Management of personal user data is regulated under the Skill Grow Privacy Policy. By utilizing our services, you consent to data collection and usage according to that policy.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">8. Limitation of Liability</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Skill Grow shall not be held liable for:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Technical interruptions, server maintenance, or internet network issues</li>
                                            <li>Data loss resulting from user negligence or security failures</li>
                                            <li>Direct or indirect damages resulting from use of the platform</li>
                                            <li>Information originated by third parties outside of our control</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. Changes to Terms and Conditions</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Skill Grow reserves the right to amend these Terms and Conditions at any time. Changes become effective immediately upon platform publication, and users are encouraged to review them periodically.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Governing Law</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        These Terms and Conditions shall be governed by and construed under the laws of the Republic of Indonesia. Any disputes shall be resolved through competent courts in Indonesia.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Contact Us</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">
                                            If you have any questions concerning these Terms and Conditions, please contact the Skill Grow team via the official channels listed on our website.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="prose prose-gray dark:prose-invert max-w-none text-justify">
                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">1. Pendahuluan</h2>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                                        Selamat datang di Skill Grow. Syarat dan Ketentuan ini mengatur penggunaan seluruh layanan pembelajaran yang disediakan oleh Skill Grow ("kami", "kita", atau "Skill Grow").
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Dengan mengakses dan menggunakan platform Skill Grow, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku. Apabila Anda tidak menyetujui ketentuan ini, kami menyarankan untuk tidak melanjutkan penggunaan layanan kami.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Definisi</h2>
                                    <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>
                                            <strong>Platform:</strong> Situs web dan/atau sistem pembelajaran Skill Grow
                                        </li>
                                        <li>
                                            <strong>Pengguna:</strong> Setiap individu yang mengakses atau menggunakan layanan Skill Grow
                                        </li>
                                        <li>
                                            <strong>Kelas Online:</strong> Program pembelajaran digital yang dapat diakses melalui platform
                                        </li>
                                        <li>
                                            <strong>Bootcamp:</strong> Program pelatihan intensif dengan durasi dan jadwal tertentu
                                        </li>
                                        <li>
                                            <strong>Webinar:</strong> Kegiatan seminar daring interaktif dengan waktu pelaksanaan terjadwal
                                        </li>
                                        <li>
                                            <strong>Konten:</strong> Seluruh materi pembelajaran, termasuk video, modul tertulis, presentasi, dan file pendukung
                                        </li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Layanan Skill Grow</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.1 Kelas Online</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Akses pembelajaran sesuai ketentuan program yang dibeli</li>
                                                <li>Materi dapat diakses setelah pembayaran terkonfirmasi</li>
                                                <li>Pembaruan materi dilakukan secara berkala sesuai kebijakan Skill Grow</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.2 Bootcamp</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Program pembelajaran intensif dengan jadwal dan durasi tertentu</li>
                                                <li>Dipandu oleh instruktur atau praktisi berpengalaman</li>
                                                <li>Sertifikat diberikan kepada peserta yang memenuhi ketentuan kelulusan</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">3.3 Webinar</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Diselenggarakan secara daring sesuai jadwal yang ditentukan</li>
                                                <li>Peserta dapat mengikuti sesi interaktif dan tanya jawab</li>
                                                <li>Rekaman webinar dapat diberikan sesuai kebijakan program</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Pembayaran dan Pengembalian Dana</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">4.1 Pembayaran</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Seluruh pembayaran menggunakan mata uang Rupiah (IDR)</li>
                                                <li>Metode pembayaran disesuaikan dengan opsi yang tersedia</li>
                                                <li>Akses layanan diberikan setelah pembayaran dikonfirmasi</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 font-semibold">4.2 Kebijakan Pengembalian Dana</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Pengajuan pengembalian dana dapat dilakukan maksimal 7 hari setelah pembelian</li>
                                                <li>Syarat pengembalian dana: materi belum diakses lebih dari 20%</li>
                                                <li>Untuk Bootcamp dan Webinar, pengembalian dana penuh berlaku apabila pembatalan dilakukan sebelum program dimulai</li>
                                                <li>Proses pengembalian dana membutuhkan waktu 7–14 hari kerja</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Hak Kekayaan Intelektual</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Seluruh konten yang tersedia di platform Skill Grow merupakan milik Skill Grow atau pihak ketiga yang memberikan lisensi resmi kepada kami.</p>
                                        <p>Pengguna dilarang untuk:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Menyalin, menyebarluaskan, atau mendistribusikan konten tanpa izin</li>
                                            <li>Menggunakan konten untuk kepentingan komersial</li>
                                            <li>Mengubah atau memodifikasi materi pembelajaran</li>
                                            <li>Memberikan akses akun kepada pihak lain</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. Kewajiban dan Larangan Pengguna</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Pengguna wajib:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Menggunakan platform sesuai tujuan pembelajaran</li>
                                            <li>Menghormati hak dan kenyamanan pengguna lain</li>
                                            <li>Tidak melakukan tindakan yang merugikan sistem atau reputasi Skill Grow</li>
                                            <li>Mematuhi peraturan perundang-undangan yang berlaku</li>
                                        </ul>
                                        <p>Pengguna dilarang:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Menggunakan platform untuk tujuan yang melanggar hukum</li>
                                            <li>Mengunggah konten yang bersifat ilegal atau merugikan</li>
                                            <li>Melakukan spam, gangguan, atau penyalahgunaan sistem</li>
                                            <li>Mengakses sistem tanpa izin resmi</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. Privasi dan Perlindungan Data</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Pengelolaan data pribadi pengguna diatur dalam Kebijakan Privasi Skill Grow. Dengan menggunakan layanan ini, pengguna menyetujui pengumpulan dan penggunaan data sesuai kebijakan tersebut.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">8. Pembatasan Tanggung Jawab</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Skill Grow tidak bertanggung jawab atas:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Gangguan teknis, pemeliharaan sistem, atau kendala jaringan</li>
                                            <li>Kehilangan data akibat kelalaian pengguna</li>
                                            <li>Kerugian langsung maupun tidak langsung yang timbul dari penggunaan platform</li>
                                            <li>Informasi yang berasal dari pihak ketiga di luar kendali kami</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. Perubahan Syarat dan Ketentuan</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Skill Grow berhak melakukan perubahan terhadap Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif setelah dipublikasikan di platform, dan pengguna dianjurkan untuk meninjaunya secara berkala.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Hukum yang Berlaku</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di Republik Indonesia. Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Hubungi Kami</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">
                                            Apabila Anda memiliki pertanyaan terkait Syarat dan Ketentuan ini, silakan menghubungi tim Skill Grow melalui kontak resmi yang tersedia di website.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isEn
                                    ? 'By using Skill Grow services, you agree to the terms and conditions above.'
                                    : 'Dengan menggunakan layanan Skill Grow, Anda menyetujui syarat dan ketentuan di atas.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
