import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
    const { i18n } = useTranslation();
    const isEn = i18n.language === 'en';

    return (
        <UserLayout>
            <Head title={isEn ? 'Privacy Policy' : 'Kebijakan Privasi'} />

            <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                                {isEn ? 'Privacy Policy' : 'Kebijakan Privasi'}
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
                                        Skill Grow ("we", "us", or "Skill Grow") is committed to protecting your privacy and personal data. This Privacy Policy outlines how we collect, use, store, and safeguard your personal information when using our learning and training services.
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        By accessing and using Skill Grow services, you acknowledge and agree to our data practices described in this Privacy Policy. If you do not agree with this policy, please refrain from using our services.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Information We Collect</h2>

                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">2.1 Information You Provide Directly</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Full name</li>
                                                <li>Email address</li>
                                                <li>Phone number</li>
                                                <li>Date of birth</li>
                                                <li>Domicile / Address</li>
                                                <li>Occupation and educational background</li>
                                                <li>Profile picture (optional)</li>
                                                <li>Payment information</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">2.2 Automatically Collected Information</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>IP address and approximate location</li>
                                                <li>Device type and operating system</li>
                                                <li>Browser type</li>
                                                <li>Platform usage activity</li>
                                                <li>Access duration and timestamps</li>
                                                <li>Pages visited</li>
                                                <li>Learning progress</li>
                                                <li>Interactions with materials and features</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">2.3 Information from Third Parties</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Social media account data (if you sign in with social providers)</li>
                                                <li>Payment provider information</li>
                                                <li>Data from official partners and affiliates of Skill Grow</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Purposes of Using Information</h2>
                                    <p className="mb-3 text-gray-700 dark:text-gray-300">We use your personal data to:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Provide and manage educational services</li>
                                        <li>Process registrations and payment transactions</li>
                                        <li>Provide customer support and assistance</li>
                                        <li>Communicate program updates and service notifications</li>
                                        <li>Personalize the user learning experience</li>
                                        <li>Analyze and enhance service quality</li>
                                        <li>Prevent abuse, fraud, and harmful activities</li>
                                        <li>Comply with applicable legal and regulatory obligations</li>
                                        <li>Deliver promotional materials (with user consent)</li>
                                        <li>Conduct research and product development</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Information Sharing</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <p>
                                            Skill Grow does not sell or trade user personal data. Information may only be shared under the following conditions:
                                        </p>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.1 Supporting Service Providers</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Payment gateway and processor providers</li>
                                                <li>Cloud hosting and infrastructure services</li>
                                                <li>Email and communication providers</li>
                                                <li>Analytics and performance technology partners</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.2 Legal Obligations</h3>
                                            <p>When required by laws, regulations, court orders, or official governmental requests.</p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.3 Rights and Security Protection</h3>
                                            <p>To safeguard the rights, assets, and security of Skill Grow, its users, and the public.</p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.4 Business Transactions</h3>
                                            <p>In the event of a merger, acquisition, or asset transfer.</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Data Security</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>
                                            We employ reasonable technical and organizational safeguards to protect your personal data, including:
                                        </p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Data encryption in transit and at rest</li>
                                            <li>Strict access controls and authorization</li>
                                            <li>System security monitoring</li>
                                            <li>Security training for internal staff</li>
                                            <li>Periodic security assessments</li>
                                            <li>Regular data backups</li>
                                        </ul>
                                        <p>
                                            However, no online system is completely risk-free. Users are advised to protect their account credentials and maintain strong passwords.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. Data Storage and Retention</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Personal data is retained based on service necessity and the following terms:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>As long as the user account remains active</li>
                                            <li>Transaction records: up to 10 years following the last transaction</li>
                                            <li>Communication data: up to 3 years</li>
                                            <li>System logs: up to 1 year</li>
                                            <li>Marketing data: until consent is withdrawn</li>
                                        </ul>
                                        <p>
                                            Upon retention period expiration, data will be safely removed unless legally required otherwise.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. User Rights over Personal Data</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Users have the right to:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Access personal data held by us</li>
                                            <li>Correct inaccurate or incomplete data</li>
                                            <li>Request deletion of personal data</li>
                                            <li>Restrict processing of personal data</li>
                                            <li>Request data portability</li>
                                            <li>Object to specific processing activities</li>
                                            <li>Withdraw consent previously provided</li>
                                        </ul>
                                        <p>
                                            Requests regarding these rights can be submitted via official Skill Grow contact channels.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">8. Cookies and Similar Technologies</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <p>We use cookies to:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Maintain login sessions</li>
                                            <li>Save user preferences</li>
                                            <li>Analyze platform usage patterns</li>
                                            <li>Deliver relevant content</li>
                                            <li>Enhance system security</li>
                                        </ul>
                                        <p>
                                            Cookie types include essential, analytical, functional, and marketing cookies. You may manage cookie settings through your browser preferences.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. International Data Transfers</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Personal data may be stored or processed on servers located outside Indonesia. We ensure any international transfer is protected by appropriate safeguards in compliance with applicable legislation.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Children's Data Protection</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Skill Grow services are not intended for individuals under 13 years of age. We do not knowingly collect personal data from minors. Any such data discovered will be promptly deleted upon notice.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Changes to Privacy Policy</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Skill Grow reserves the right to revise this Privacy Policy periodically. Notice of changes will be posted on the platform or sent via official communications, effective as of the revision date.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">12. Legal Basis for Processing</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">Processing of personal data is founded upon:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>User consent</li>
                                            <li>Execution of service agreements</li>
                                            <li>Legal obligations</li>
                                            <li>Legitimate interests of Skill Grow</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">13. Contact Us</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">
                                            If you have questions, requests, or concerns regarding this Privacy Policy, please contact Skill Grow through our official contact channels on the website.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="prose prose-gray dark:prose-invert max-w-none text-justify">
                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Pendahuluan</h2>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                                        Skill Grow ("kami", "kita", atau "Skill Grow") berkomitmen untuk menjaga privasi serta melindungi keamanan data pribadi pengguna. Kebijakan Privasi ini menjelaskan cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan pembelajaran yang kami sediakan.
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Dengan mengakses dan menggunakan layanan Skill Grow, Anda menyatakan setuju terhadap praktik pengelolaan data sebagaimana diatur dalam Kebijakan Privasi ini. Apabila Anda tidak menyetujui kebijakan ini, mohon untuk tidak menggunakan layanan kami.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">2. Informasi yang Kami Kumpulkan</h2>

                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <h3 className="mb-2 font-semibold">2.1 Informasi yang Anda Berikan Secara Langsung</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Nama lengkap</li>
                                                <li>Alamat email</li>
                                                <li>Nomor telepon</li>
                                                <li>Tanggal lahir</li>
                                                <li>Alamat domisili</li>
                                                <li>Pekerjaan dan latar belakang pendidikan</li>
                                                <li>Foto profil (opsional)</li>
                                                <li>Informasi pembayaran</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">2.2 Informasi yang Dikumpulkan Secara Otomatis</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Alamat IP dan perkiraan lokasi</li>
                                                <li>Jenis perangkat dan sistem operasi</li>
                                                <li>Browser yang digunakan</li>
                                                <li>Aktivitas penggunaan platform</li>
                                                <li>Waktu dan durasi akses</li>
                                                <li>Halaman yang dikunjungi</li>
                                                <li>Progres pembelajaran</li>
                                                <li>Interaksi dengan materi dan fitur</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">2.3 Informasi dari Pihak Ketiga</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Data dari akun media sosial (jika Anda memilih login melalui media sosial)</li>
                                                <li>Informasi dari penyedia layanan pembayaran</li>
                                                <li>Data dari mitra atau rekanan resmi Skill Grow</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">3. Tujuan Penggunaan Informasi</h2>
                                    <p className="mb-3 text-gray-700 dark:text-gray-300">Informasi pribadi Anda kami gunakan untuk:</p>
                                    <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Menyediakan dan mengelola layanan pembelajaran</li>
                                        <li>Memproses pendaftaran dan transaksi pembayaran</li>
                                        <li>Memberikan layanan dukungan dan bantuan pengguna</li>
                                        <li>Menyampaikan informasi terkait layanan dan program</li>
                                        <li>Menyesuaikan pengalaman belajar pengguna</li>
                                        <li>Menganalisis serta meningkatkan kualitas layanan</li>
                                        <li>Mencegah penyalahgunaan dan aktivitas yang merugikan</li>
                                        <li>Memenuhi kewajiban hukum dan regulasi</li>
                                        <li>Mengirimkan materi promosi (dengan persetujuan pengguna)</li>
                                        <li>Melakukan riset dan pengembangan produk</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">4. Pembagian Informasi</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <p>
                                            Skill Grow tidak menjual atau memperdagangkan data pribadi pengguna. Namun, informasi dapat dibagikan dalam kondisi berikut:
                                        </p>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.1 Penyedia Layanan Pendukung</h3>
                                            <ul className="ml-4 list-inside list-disc space-y-1">
                                                <li>Penyedia sistem pembayaran</li>
                                                <li>Layanan cloud dan hosting</li>
                                                <li>Layanan email dan komunikasi</li>
                                                <li>Layanan analitik dan teknologi pendukung</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.2 Kewajiban Hukum</h3>
                                            <p>Apabila diwajibkan oleh peraturan perundang-undangan, putusan pengadilan, atau permintaan resmi dari otoritas berwenang.</p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.3 Perlindungan Hak dan Keamanan</h3>
                                            <p>Untuk melindungi hak, aset, keamanan Skill Grow, pengguna, maupun kepentingan publik.</p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">4.4 Transaksi Bisnis</h3>
                                            <p>Dalam hal terjadi penggabungan usaha, akuisisi, atau pengalihan aset perusahaan.</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">5. Keamanan Data</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>
                                            Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data pribadi pengguna, antara lain:
                                        </p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Enkripsi data saat pengiriman dan penyimpanan</li>
                                            <li>Pembatasan dan kontrol akses</li>
                                            <li>Pemantauan keamanan sistem</li>
                                            <li>Pelatihan keamanan bagi tim internal</li>
                                            <li>Audit keamanan berkala</li>
                                            <li>Pencadangan data secara rutin</li>
                                        </ul>
                                        <p>
                                            Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko. Pengguna diimbau untuk menjaga keamanan akun dan menggunakan kata sandi yang kuat.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">6. Penyimpanan dan Retensi Data</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Data pribadi disimpan sesuai kebutuhan dan ketentuan berikut:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Selama akun pengguna aktif</li>
                                            <li>Data transaksi: hingga 10 tahun setelah transaksi terakhir</li>
                                            <li>Data komunikasi: hingga 3 tahun</li>
                                            <li>Log sistem: hingga 1 tahun</li>
                                            <li>Data pemasaran: hingga persetujuan dicabut</li>
                                        </ul>
                                        <p>
                                            Setelah masa retensi berakhir, data akan dihapus secara aman kecuali diwajibkan lain oleh hukum.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">7. Hak Pengguna atas Data Pribadi</h2>
                                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                        <p>Pengguna berhak untuk:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Mengakses data pribadi yang kami simpan</li>
                                            <li>Memperbaiki data yang tidak akurat</li>
                                            <li>Meminta penghapusan data</li>
                                            <li>Membatasi pemrosesan data</li>
                                            <li>Meminta pemindahan data</li>
                                            <li>Menyampaikan keberatan atas pemrosesan tertentu</li>
                                            <li>Menarik kembali persetujuan yang telah diberikan</li>
                                        </ul>
                                        <p>
                                            Permintaan terkait hak tersebut dapat diajukan melalui kontak resmi Skill Grow.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">8. Cookies dan Teknologi Serupa</h2>
                                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                        <p>Kami menggunakan cookies untuk:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Menjaga sesi login</li>
                                            <li>Menyimpan preferensi pengguna</li>
                                            <li>Menganalisis penggunaan platform</li>
                                            <li>Menyajikan konten yang relevan</li>
                                            <li>Meningkatkan keamanan sistem</li>
                                        </ul>
                                        <p>
                                            Jenis cookies yang digunakan meliputi cookies esensial, analitik, fungsional, dan pemasaran. Pengguna dapat mengatur preferensi cookies melalui pengaturan browser, dengan catatan bahwa pembatasan tertentu dapat memengaruhi fungsi layanan.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">9. Transfer Data Internasional</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Data pribadi dapat disimpan atau diproses di server yang berada di luar Indonesia. Kami memastikan setiap transfer data dilakukan dengan perlindungan yang memadai sesuai dengan peraturan yang berlaku.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">10. Perlindungan Data Anak</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Layanan Skill Grow tidak ditujukan bagi anak di bawah usia 13 tahun. Kami tidak secara sengaja mengumpulkan data pribadi anak. Apabila diketahui terdapat data anak yang tersimpan, kami akan segera menghapusnya setelah menerima pemberitahuan.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">11. Perubahan Kebijakan Privasi</h2>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Skill Grow dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan akan diumumkan melalui platform atau media komunikasi resmi, dan berlaku sejak tanggal pembaruan yang tercantum.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">12. Dasar Hukum Pemrosesan Data</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">Pemrosesan data pribadi dilakukan berdasarkan:</p>
                                        <ul className="ml-4 list-inside list-disc space-y-1">
                                            <li>Persetujuan pengguna</li>
                                            <li>Pelaksanaan perjanjian layanan</li>
                                            <li>Kewajiban hukum</li>
                                            <li>Kepentingan sah Skill Grow</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-8">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">13. Hubungi Kami</h2>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        <p className="mb-3">
                                            Jika Anda memiliki pertanyaan, permintaan, atau keluhan terkait Kebijakan Privasi ini, silakan menghubungi Skill Grow melalui kontak resmi yang tersedia di website.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isEn
                                    ? 'By using Skill Grow services, you agree to the privacy policy above.'
                                    : 'Dengan menggunakan layanan Skill Grow, Anda menyetujui kebijakan privasi di atas.'}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {isEn ? 'Also read our ' : 'Baca juga '}
                                <Link href={route('terms-and-conditions')} className="text-blue-600 underline hover:text-blue-800">
                                    {isEn ? 'Terms and Conditions' : 'Syarat dan Ketentuan'}
                                </Link>
                                {isEn ? '.' : ' kami.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
