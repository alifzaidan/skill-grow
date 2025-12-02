import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Clock, Hourglass, MapPin, Users } from 'lucide-react';

interface Webinar {
    title: string;
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_time: string;
    end_time: string;
    registration_deadline: string;
    registration_url: string;
    thumbnail?: string | null;
}

export default function RegisterSection({ webinar }: { webinar: Webinar }) {
    const { auth } = usePage<SharedData>().props;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    if (!isLoggedIn) {
        registrationUrl = webinar.registration_url;
        buttonText = 'Login untuk Mendaftar';
        warningMessage = 'Anda harus login terlebih dahulu!';
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = 'Lengkapi Profil untuk Mendaftar';
        warningMessage = 'Profil Anda belum lengkap!';
    } else {
        registrationUrl = webinar.registration_url;
        buttonText = 'Gabung Sekarang';
        warningMessage = null;
    }

    const deadline = new Date(webinar.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4" id="register">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-3xl font-bold text-gray-900 italic md:text-4xl">
                Daftar & Mulai Explore Wawasanmu!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">Jangan sampai kelewatan ya!</p>
            <div className="mt-4 flex flex-col items-stretch gap-6 md:flex-row">
                <div className="flex h-full w-full flex-col items-center gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md md:flex-row dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                        src={webinar.thumbnail ? `/storage/${webinar.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={webinar.title}
                        className="mb-4 h-72 w-full rounded-lg border border-gray-200 object-cover shadow-md md:mb-0 md:w-64"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <h5 className="mb-4 text-base font-semibold text-black dark:text-white">
                                Daftar Webinar Skill Grow dan dapatkan kesempatan belajar dari para ahli
                            </h5>
                            <div className="mb-2 flex flex-col items-end">
                                {webinar.strikethrough_price > 0 && (
                                    <span className="mb-1 text-sm text-red-500 line-through">
                                        Rp {webinar.strikethrough_price.toLocaleString('id-ID')}
                                    </span>
                                )}
                                {webinar.price > 0 ? (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">
                                        Rp {webinar.price.toLocaleString('id-ID')}
                                    </span>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">GRATIS</span>
                                )}
                            </div>
                            <Separator className="my-4" />
                            <ul className="mb-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <MapPin size="16" className="text-primary dark:text-secondary" />
                                    <p>Google Meet/Zoom</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Hourglass size="16" className="text-primary dark:text-secondary" />
                                    <p>Batch {webinar.batch}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Users size="16" className="text-primary dark:text-secondary" />
                                    <p>Kuota {webinar.quota ? `${webinar.quota} Peserta` : 'Tidak Terbatas'}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <CalendarDays size="16" className="text-primary dark:text-secondary" />
                                    <p>
                                        {new Date(webinar.start_time).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Clock size="16" className="text-primary dark:text-secondary" />
                                    <p>
                                        {new Date(webinar.start_time).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                        {' - '}
                                        {new Date(webinar.end_time).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </li>
                            </ul>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                Terakhir pendaftaran:{' '}
                                {new Date(webinar.registration_deadline).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="mt-auto">
                            {warningMessage && <p className="mb-2 text-center text-sm text-red-500">{warningMessage}</p>}
                            {isRegistrationOpen ? (
                                <Button className="w-full" asChild>
                                    <Link href={registrationUrl}>{buttonText}</Link>
                                </Button>
                            ) : (
                                <Button className="w-full" disabled>
                                    Pendaftaran Ditutup
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
