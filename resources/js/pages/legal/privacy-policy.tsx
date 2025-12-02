import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <UserLayout>
            <Head title="Kebijakan Privasi" />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Kebijakan Privasi</h1>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    SkillGrow ("Kami") berkomitmen menjaga kerahasiaan dan keamanan data pribadi setiap pengguna ("Anda") yang
                                    mengakses layanan melalui situs maupun aplikasi SkillGrow. Dokumen ini menjelaskan bagaimana Kami mengelola,
                                    menggunakan, serta melindungi informasi pribadi yang dikumpulkan. Dengan menggunakan layanan SkillGrow, berarti
                                    Anda memahami dan menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini. Kebijakan ini berlaku untuk
                                    seluruh produk, fitur, maupun layanan yang terhubung dengan platform Kami.
                                </p>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">A. Informasi Otomatis</h2>
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    Ketika Anda mengakses atau menggunakan platform, sistem kami dapat mengumpulkan data teknis tertentu secara
                                    otomatis, antara lain:
                                </p>
                                <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>
                                        Informasi pribadi: seperti nama, alamat email, nomor telepon, atau detail akun yang Anda berikan saat
                                        registrasi.
                                    </li>
                                    <li>
                                        Data penggunaan: termasuk aktivitas Anda saat mengakses platform, materi yang dipelajari, serta interaksi
                                        dengan fitur-fitur kami.
                                    </li>
                                    <li>
                                        Informasi teknis: seperti alamat IP, jenis perangkat, browser yang digunakan, dan data log lainnya untuk
                                        mendukung keamanan serta peningkatan layanan.
                                    </li>
                                </ul>
                                <p className="mt-4 text-gray-700 dark:text-gray-300">
                                    Kami menggunakan cookies dan teknologi serupa untuk menyimpan serta menganalisis informasi tersebut dengan tujuan
                                    meningkatkan kualitas layanan, menjaga keamanan, serta menyajikan konten dan iklan yang relevan bagi pengguna.
                                </p>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                                    B. Informasi yang Diberikan Secara Sukarela
                                </h2>
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    Kami juga menerima data pribadi yang Anda sampaikan secara langsung melalui formulir, pendaftaran akun, maupun
                                    interaksi lain, seperti:
                                </p>
                                <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>Nama lengkap</li>
                                    <li>Alamat email</li>
                                    <li>Nomor telepon</li>
                                    <li>Informasi tambahan yang mendukung penggunaan layanan</li>
                                </ul>
                                <p className="mt-4 text-gray-700 dark:text-gray-300">
                                    Informasi ini digunakan untuk menyediakan layanan, melakukan komunikasi, dan menyampaikan informasi yang relevan
                                    sesuai kebutuhan Anda.
                                </p>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">C. Penggunaan Informasi</h2>
                                <p className="mb-3 text-gray-700 dark:text-gray-300">Informasi yang Kami kumpulkan akan dipergunakan untuk:</p>
                                <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                    <li>Menyediakan, mengelola, dan meningkatkan layanan SkillGrow</li>
                                    <li>Melakukan analisis, penelitian, serta pemeliharaan keamanan sistem</li>
                                    <li>Memberikan pengalaman pengguna yang lebih baik dan personal</li>
                                    <li>Menyediakan informasi mengenai layanan, produk, maupun penawaran yang relevan</li>
                                    <li>Memenuhi kewajiban hukum dan kepatuhan peraturan yang berlaku</li>
                                </ul>
                            </section>{' '}
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Hak Pengguna dan Penghapusan Data</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p>
                                        Anda memiliki hak untuk meminta akses, koreksi, maupun penghapusan data pribadi yang tersimpan pada sistem
                                        Kami. Permintaan dapat diajukan dengan mengirimkan email ke{' '}
                                        <span className="text-bold text-blue-700">info@skillgrow.id</span>
                                    </p>
                                    <p>
                                        Apabila penghapusan akun disetujui, akses Anda terhadap layanan Kami akan dihentikan, dan Kami akan menghapus
                                        data sesuai kebijakan internal serta ketentuan hukum yang berlaku.
                                    </p>
                                </div>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Cookies</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p>
                                        Platform Kami menggunakan cookies untuk membantu mengidentifikasi pengguna, meningkatkan kinerja situs, serta
                                        menyesuaikan pengalaman layanan. Anda dapat mengatur atau menonaktifkan cookies melalui pengaturan browser.
                                        Namun, hal ini dapat memengaruhi fungsi optimal layanan.
                                    </p>
                                </div>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Perubahan Kebijakan</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <p>
                                        Kebijakan Privasi ini dapat diperbarui sewaktu-waktu untuk menyesuaikan dengan perkembangan layanan maupun
                                        ketentuan hukum. Versi terbaru akan selalu tersedia di situs resmi SkillGrow dan pengguna disarankan untuk
                                        meninjaunya secara berkala.
                                    </p>
                                </div>
                            </section>
                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Hubungi Kami</h2>
                                <div className="text-gray-700 dark:text-gray-300">
                                    <p className="mb-3">
                                        Apabila Anda memiliki pertanyaan atau permintaan terkait Kebijakan Privasi ini, silakan hubungi Kami melalui:
                                    </p>
                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                        <p>
                                            <strong>SkillGrow</strong>
                                        </p>
                                        <p>Permata Permadani Residence</p>
                                        <p>3HRP+R38, Pendem, Kec. Junrejo, Kota Batu, Jawa Timur</p>
                                        <p>info@skillgrow.id</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dengan menggunakan layanan SkillGrow, Anda menyetujui kebijakan privasi di atas.
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Baca juga{' '}
                                <Link href={route('terms-and-conditions')} className="text-blue-600 underline hover:text-blue-800">
                                    Syarat dan Ketentuan
                                </Link>{' '}
                                kami.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
