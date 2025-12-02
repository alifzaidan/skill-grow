import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { InfinityIcon, Presentation, Smartphone, TvMinimalPlay } from 'lucide-react';

interface Course {
    title: string;
    thumbnail?: string | null;
    strikethrough_price: number;
    price: number;
    registration_url: string;
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            video_url?: string | null;
        }[];
    }[];
}

export default function RegisterSection({ course }: { course: Course }) {
    const { auth } = usePage<SharedData>().props;
    const totalLessons = course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    if (!isLoggedIn) {
        registrationUrl = course.registration_url;
        buttonText = 'Login untuk Mendaftar';
        warningMessage = 'Anda harus login terlebih dahulu!';
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = 'Lengkapi Profil untuk Mendaftar';
        warningMessage = 'Profil Anda belum lengkap!';
    } else {
        registrationUrl = course.registration_url;
        buttonText = 'Gabung Sekarang';
        warningMessage = null;
    }

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4" id="register">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-3xl font-bold text-gray-900 italic md:text-4xl">
                Daftar & Mulai Explore Wawasanmu!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">Jangan sampai kelewatan ya!</p>
            <div className="mt-4 flex flex-col items-stretch gap-6 md:flex-row">
                <div className="flex h-full w-full flex-col items-center gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md md:flex-row dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                        src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={course.title}
                        className="mb-4 h-72 w-full rounded-lg border border-gray-200 object-cover shadow-md md:mb-0 md:w-64"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <h5 className="mb-4 text-base font-semibold text-black">
                                Miliki kelas Premium secara permanen dan bangun sebuah projek nyata
                            </h5>
                            <div className="mb-2 flex flex-col items-end">
                                {course.strikethrough_price > 0 && (
                                    <span className="mb-1 text-sm text-red-500 line-through">
                                        Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                    </span>
                                )}
                                {course.price > 0 ? (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">
                                        Rp {course.price.toLocaleString('id-ID')}
                                    </span>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">GRATIS</span>
                                )}
                            </div>
                            <Separator className="my-4" />
                            <ul className="mb-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <TvMinimalPlay size="16" className="text-primary dark:text-secondary" />
                                    <p>{totalLessons} Materi</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Presentation size="16" className="text-primary dark:text-secondary" />
                                    <p>Free Konsultasi</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <InfinityIcon size="16" className="text-primary dark:text-secondary" />
                                    <p>Akses Selamanya</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Smartphone size="16" className="text-primary dark:text-secondary" />
                                    <p>Materi On Demand</p>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-auto">
                            {warningMessage && <p className="mb-2 text-center text-sm text-red-500">{warningMessage}</p>}
                            <Button className="w-full" asChild>
                                <Link href={registrationUrl}>{buttonText}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
