import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';

export default function TermsAndConditions() {
    return (
        <UserLayout>
            <Head title="Syarat dan Ketentuan" />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Syarat dan Ketentuan</h1>
                            <p className="text-gray-600 dark:text-gray-400">Terakhir diperbarui: 26 Agustus 2025</p>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <section className="mb-8">
                                <p className="mb-4 text-gray-700 dark:text-gray-300">
                                    Skill Grow adalah platform pengembangan keterampilan profesional yang telah digunakan oleh jutaan pengguna di
                                    Indonesia. Kami berkomitmen membantu setiap individu untuk mengembangkan potensi diri, Kami percaya bahwa setiap
                                    orang berhak memiliki kesempatan untuk mengembangkan keterampilan dan membuka jalan menuju karier yang lebih baik
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Syarat dan Ketentuan ini menjelaskan aturan penggunaan situs, layanan, serta seluruh konten yang tersedia di Skill
                                    Grow. Dengan mengakses, mendaftar, atau menggunakan layanan, Kamu menyatakan telah membaca, memahami, dan
                                    menyetujui untuk mematuhi seluruh ketentuan yang berlaku.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">A. Ketentuan Umum</h2>

                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="mb-2 font-semibold">1. Perjanjian Penggunaan</h3>
                                        <p>
                                            Dokumen ini adalah perjanjian resmi antara pengguna ("Kamu") dan "Skill Grow" atau ("Kami"). Ketentuan ini
                                            berlaku untuk semua layanan, fitur, dan konten di dalam platform Skill Grow. Dengan mendaftar atau
                                            menggunakan layanan, berarti Kamu menyetujui Syarat dan Ketentuan ini, termasuk Kebijakan Privasi,
                                            Kebijakan Pengembalian Dana, serta segala bentuk perubahan atau pembaruan yang akan diberlakukan kemudian.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">2. Perubahan Ketentuan</h3>
                                        <p>
                                            Skill Grow berhak melakukan penyesuaian, pembaruan, atau penambahan isi Syarat dan Ketentuan tanpa
                                            pemberitahuan langsung. Setiap perubahan berlaku efektif sejak dipublikasikan, dan tetap mengikat seluruh
                                            pengguna. Karena itu, kami menyarankan agar Kamu rutin memeriksa halaman ini.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">3. Pendaftaran Pengguna</h3>
                                        <p>
                                            Situs Skill Grow dapat diakses oleh semua pengunjung. Namun, untuk menikmati layanan penuh, pengguna
                                            diwajibkan melakukan pendaftaran menggunakan alamat email yang valid. Semua informasi pribadi yang
                                            diberikan akan dikelola sesuai dengan Kebijakan Privasi dan peraturan yang berlaku di Indonesia.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-semibold">4. Perubahan Layanan</h3>
                                        <p>
                                            Skill Grow berhak menambahkan, memperbarui, atau menghentikan layanan maupun fitur tertentu kapan saja.
                                            Setiap pembaruan akan diinformasikan melalui halaman ini.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">B. Tanggung Jawab Pengguna</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <p>Dalam menggunakan layanan Skill Grow, pengguna tidak diperkenankan untuk:</p>
                                    <ol className="ml-4 list-decimal space-y-2">
                                        <li>
                                            Mengakses sistem, server, atau akun lain secara ilegal, termasuk melalui peretasan atau metode tidak sah.
                                        </li>
                                        <li>Menyalin, mendistribusikan, atau membagikan konten edukasi tanpa izin resmi.</li>
                                        <li>Memindahtangankan, menyewakan, atau meminjamkan akun kepada pihak lain.</li>
                                        <li>Membuat tiruan situs, fitur, atau konten milik Skill Grow.</li>
                                        <li>Melanggar hak cipta, merek dagang, atau hak kekayaan intelektual lainnya.</li>
                                    </ol>
                                    <p>Penggunaan layanan hanya diperbolehkan untuk tujuan yang sah dan sesuai hukum yang berlaku.</p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">C. Pelanggaran</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Skill Grow berhak mencabut atau membatasi akses pengguna yang melanggar aturan ini, baik sementara maupun
                                    permanen. Pencabutan akses tidak memberikan hak bagi pengguna untuk meminta pengembalian biaya yang sudah
                                    dibayarkan.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">D. Pemesanan & Pembayaran</h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="mb-2 font-semibold">1. Pemesanan</h3>
                                        <p>
                                            Setiap langganan layanan akan dikonfirmasi melalui email resmi, termasuk detail pembayaran yang harus
                                            diselesaikan.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">2. Pembayaran</h3>
                                        <p>
                                            Pesanan dianggap valid setelah pembayaran diverifikasi oleh sistem. Pembayaran dilakukan melalui penyedia
                                            layanan pihak ketiga yang aman dan terpercaya.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">3. Harga & Pengembalian Dana</h3>
                                        <p>
                                            Harga layanan dapat berubah sewaktu-waktu. Pengembalian dana hanya berlaku jika terjadi gangguan teknis
                                            yang berasal dari sistem Skill Grow, bukan akibat kesalahan pengguna.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">4. Kode Promo</h3>
                                        <p>Kode promo atau diskon hanya berlaku untuk akun penerima dan tidak dapat dipindahtangankan.</p>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-semibold">5. Hak Akses</h3>
                                        <p>
                                            Hak akses ke layanan hanya berlaku selama periode berlangganan, terbatas untuk penggunaan pribadi, dan
                                            tidak dapat dipindahtangankan.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">E. Hak dan Lisensi</h2>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                    <ol className="ml-4 list-decimal space-y-2">
                                        <li>
                                            Seluruh konten dalam Skill Grow, termasuk teks, gambar, video, audio, desain, dan kode, dilindungi hak
                                            cipta dan merupakan milik Skill Grow.
                                        </li>
                                        <li>
                                            Konten hanya boleh digunakan untuk tujuan pribadi, bukan untuk tujuan komersial tanpa izin tertulis dari
                                            Skill Grow.
                                        </li>
                                        <li>
                                            Pengguna bertanggung jawab menjaga keamanan akun, termasuk username dan password, dan dilarang
                                            membagikannya kepada pihak lain.
                                        </li>
                                    </ol>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">F. Batasan Tanggung Jawab</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Skill Grow selalu berusaha memberikan layanan dan pengalaman terbaik. Namun, kami tidak dapat menjamin layanan
                                    bebas dari gangguan teknis, bug, atau virus. Kami tidak bertanggung jawab atas kerugian langsung maupun tidak
                                    langsung yang mungkin timbul akibat penggunaan layanan di luar kendali kami.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">G. Hukum yang Berlaku</h2>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Seluruh Syarat dan Ketentuan ini tunduk pada hukum Indonesia. Jika terjadi perselisihan, penyelesaian akan
                                    diupayakan melalui musyawarah dalam waktu 60 (enam puluh) hari sebelum menempuh jalur hukum lebih lanjut.
                                </p>
                            </section>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dengan menggunakan layanan Skill Grow, Anda menyetujui syarat dan ketentuan di atas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
