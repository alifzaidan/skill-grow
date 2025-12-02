import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { Calendar, ChartArea, Clock, Hash, MapPin, Star, Users } from 'lucide-react';

interface Bootcamp {
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    start_date: string;
    end_date: string;
    batch?: string | null;
    quota: number;
    schedules?: { schedule_date: string; day: string; start_time: string; end_time: string }[];
    user?: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
}

export default function HeroSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const getInitials = useInitials();
    const start = new Date(bootcamp.start_date);
    const end = new Date(bootcamp.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(diffDays / 7);

    return (
        <section className="to-background from-background via-tertiary dark:via-background dark:to-background relative bg-gradient-to-b py-12 text-gray-900 dark:text-white">
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 animate-spin items-center gap-8 duration-[10s]">
                <div className="bg-primary h-[300px] w-[300px] rounded-full blur-[200px]" />
                <div className="bg-secondary h-[300px] w-[300px] rounded-full blur-[200px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: Image & Quick Info */}

                    {/* Right: Main Content */}
                    <div className="col-span-2 space-y-6">
                        <div>
                            <h1 className="mb-4 text-4xl leading-tight font-bold italic sm:text-5xl">{bootcamp.title}</h1>

                            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                                {bootcamp.description ||
                                    'Bergabunglah dengan bootcamp kami untuk meningkatkan keterampilan Anda dalam bidang teknologi. Pelajari dari para ahli dan tingkatkan karir Anda dengan pengetahuan praktis yang relevan.'}
                            </p>

                            {/* Date & Schedule Info */}
                            <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Calendar size={20} className="text-primary dark:text-secondary" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Periode Bootcamp</p>
                                        <p className="text-sm font-semibold">
                                            {new Date(bootcamp.start_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}{' '}
                                            -{' '}
                                            {new Date(bootcamp.end_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {bootcamp.schedules && bootcamp.schedules.length > 0 && (
                                    <div className="border-t border-gray-200 pt-3 dark:border-zinc-700">
                                        <div className="flex items-start gap-3">
                                            <Clock size={20} className="text-primary dark:text-secondary mt-1" />
                                            <div className="flex-1">
                                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Jadwal Pertemuan</p>
                                                <div className="space-y-1">
                                                    {bootcamp.schedules.map((schedule, idx) => (
                                                        <p key={idx} className="text-sm capitalize">
                                                            {schedule.day} - {schedule.start_time.slice(0, 5)} s/d {schedule.end_time.slice(0, 5)} WIB
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mentor Card in Hero */}
                            {bootcamp.user && (
                                <Link
                                    href={`/mentor/${bootcamp.user.id}`}
                                    className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 rounded-tl-full bg-gradient-to-tl from-yellow-300 to-transparent opacity-40" />
                                    <Avatar className="ring-primary/20 relative z-10 h-16 w-16 ring-4">
                                        <AvatarImage src={bootcamp.user.avatar} alt={bootcamp.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                            {getInitials(bootcamp.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="relative z-10 flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Mentor Bootcamp</p>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bootcamp.user.name}</h3>
                                        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{bootcamp.user.bio}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className="text-yellow-500" fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <a href="#register">
                                    <Button size="lg">Daftar Sekarang</Button>
                                </a>
                                <a href="https://wa.me/+6285142505794" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="lg">
                                        Hubungi Kami
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <img
                            src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                            alt={bootcamp.title}
                            className="aspect-video w-full rounded-xl object-cover shadow-lg"
                        />

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <MapPin size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Lokasi</p>
                                    <p className="text-sm font-semibold">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <Hash size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Batch</p>
                                    <p className="text-sm font-semibold">Batch {bootcamp.batch || '1'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <Users size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                                    <p className="text-sm font-semibold">Pemula</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <ChartArea size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                    <p className="text-sm font-semibold">{diffDays < 7 ? `${diffDays} Hari` : `${totalWeeks} Minggu`}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
