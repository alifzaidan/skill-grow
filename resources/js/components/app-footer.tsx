import { Link } from '@inertiajs/react';

export default function AppFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-5 md:text-left">
                    <div className="col-span-1 flex flex-col items-center md:col-span-2 md:items-start">
                        <img alt="Logo" src="/assets/images/logo-primary.png" className="mx-auto mb-4 h-16 w-auto md:mx-0" />
                        <p className="mb-4 text-sm text-gray-600">💡 Level Up Your Skill | Kursus Online & Pelatihan</p>
                        <div className="flex justify-center space-x-4 md:justify-start">
                            <a href="https://www.instagram.com/skillgrow.id/" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.017 0H7.983C3.591 0 0 3.591 0 7.983v4.034C0 16.409 3.591 20 7.983 20h4.034C16.409 20 20 16.409 20 12.017V7.983C20 3.591 16.409 0 12.017 0zm6.017 12.017c0 3.326-2.691 6.017-6.017 6.017H7.983c-3.326 0-6.017-2.691-6.017-6.017V7.983c0-3.326 2.691-6.017 6.017-6.017h4.034c3.326 0 6.017 2.691 6.017 6.017v4.034z"
                                        clipRule="evenodd"
                                    />
                                    <path d="M10 5.351c-2.565 0-4.649 2.084-4.649 4.649S7.435 14.649 10 14.649s4.649-2.084 4.649-4.649S12.565 5.351 10 5.351zm0 7.666c-1.666 0-3.017-1.351-3.017-3.017S8.334 6.983 10 6.983s3.017 1.351 3.017 3.017S11.666 13.017 10 13.017z" />
                                    <circle cx="14.824" cy="5.176" r="1.126" />
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@skillgrow_id" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Tiktok</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                </svg>
                            </a>
                            <a href="http://www.youtube.com/@SkillGrowID" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Youtube</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Menu</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link href="/course" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Kelas Online
                                </Link>
                            </li>
                            <li>
                                <Link href="/webinar" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Webinar
                                </Link>
                            </li>
                            <li>
                                <Link href="/bootcamp" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Bootcamp
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Lainnya</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/contact" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Kontak
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-and-conditions" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="hover:text-primary text-sm text-gray-600 transition-colors">
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Contact</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-600">
                                <span className="block">Email:</span>
                                <a href="mailto:skillgrow.id@gmail.com" className="hover:text-primary text-gray-600">
                                    skillgrow.id@gmail.com
                                </a>
                            </li>
                            <li className="text-sm text-gray-600">
                                <span className="block">WhatsApp:</span>
                                <a href="https://wa.me/6285184012430" className="hover:text-primary text-gray-600">
                                    +62 851-8401-2430
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-8">
                    <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
                        <div className="order-2 w-full text-gray-600 md:order-1">
                            <span className="font-medium">{new Date().getFullYear()}&copy;</span>
                            <a
                                href="https://skillgrow.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary ml-1 text-gray-800"
                            >
                                Skill Grow
                            </a>
                            <span className="ml-1">- All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
