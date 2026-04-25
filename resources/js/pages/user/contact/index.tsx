import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { Instagram, Mail, Phone } from 'lucide-react';

export default function Contact() {
    return (
        <UserLayout>
            <Head title="Contact" />
            <section className="mt-10 flex min-h-[80vh] w-full flex-col items-center justify-center px-2 md:px-4">
                <div className="w-full max-w-7xl rounded-2xl border border-gray-100 bg-white/90 p-4 px-4 shadow-2xl md:p-10">
                    <h1 className="mb-10 bg-black bg-clip-text text-center text-3xl font-extrabold text-transparent drop-shadow-lg md:text-4xl">
                        Hubungi Kami
                    </h1>
                    <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="to-black-50 flex cursor-pointer flex-col items-center rounded-xl border bg-gradient-to-br from-yellow-100 p-6 text-center shadow-md">
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=skillgrow.id@gmail.com"
                                target="_blank"
                                rel="noopener"
                                className="flex flex-col items-center gap-2 text-black hover:underline"
                            >
                                <Mail className="h-14 w-14" />
                                <span className="text-lg font-semibold">Email</span>
                            </a>
                            <p className="mt-2 text-gray-600">Hubungi kami melalui Email</p>
                        </div>
                        <div className="to-black-50 flex cursor-pointer flex-col items-center rounded-xl border bg-gradient-to-br from-yellow-100 p-6 text-center shadow-md">
                            <a
                                href="https://wa.me/6285167541152"
                                target="_blank"
                                rel="noopener"
                                className="flex flex-col items-center gap-2 text-black hover:underline"
                            >
                                <Phone className="h-14 w-14" />
                                <span className="text-lg font-semibold">WhatsApp</span>
                            </a>
                            <p className="mt-2 text-gray-600">Hubungi kami melalui WhatsApp</p>
                        </div>
                        <div className="to-black-50 flex cursor-pointer flex-col items-center rounded-xl border bg-gradient-to-br from-yellow-100 p-6 text-center shadow-md">
                            <a
                                href="https://instagram.com/skillgrow.id"
                                target="_blank"
                                rel="noopener"
                                className="flex flex-col items-center gap-2 text-black hover:underline"
                            >
                                <Instagram className="h-14 w-14" />
                                <span className="text-lg font-semibold">Instagram</span>
                            </a>
                            <p className="mt-2 text-gray-600">Hubungi kami melalui Instagram</p>
                        </div>
                    </div>
                    <div className="flex w-full justify-center">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.8766733733237!2d112.58517119999999!3d-7.9079502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e788100640d3e11%3A0x7ae5c08aa2805398!2sBIINSPIRA%20GROUP!5e0!3m2!1sid!2sid!4v1755670855156!5m2!1sid!2sid"
                            width="100%"
                            height="350"
                            style={{ border: 0, borderRadius: '1rem', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Lokasi BIINSPIRA GROUP"
                        ></iframe>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
