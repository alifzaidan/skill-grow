import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, Hash, MapPin, Star } from 'lucide-react';

interface Webinar {
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    start_time: string;
    end_time: string;
    batch?: string | null;
    quota: number;
    user?: {
        id: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
}

export default function HeroSection({ webinar }: { webinar: Webinar }) {
    const getInitials = useInitials();

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
                            <h1 className="mb-4 text-4xl leading-tight font-bold italic sm:text-5xl">{webinar.title}</h1>

                            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                                {webinar.description ||
                                    'Ikuti webinar kami untuk mendapatkan wawasan mendalam tentang topik terkini. Daftar sekarang dan jangan lewatkan kesempatan untuk belajar dari para ahli di bidangnya.'}
                            </p>

                            {/* Mentor Card in Hero */}
                            {webinar.user && (
                                <Link
                                    href={`/mentor/${webinar.user.id}`}
                                    className="relative mb-6 flex items-center gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 rounded-tl-full bg-gradient-to-tl from-yellow-300 to-transparent opacity-40" />
                                    <Avatar className="ring-primary/20 relative z-10 h-16 w-16 ring-4">
                                        <AvatarImage src={webinar.user.avatar} alt={webinar.user.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                            {getInitials(webinar.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="relative z-10 flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Dibawakan oleh</p>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{webinar.user.name}</h3>
                                        <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{webinar.user.bio}</p>
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
                            src={webinar.thumbnail ? `/storage/${webinar.thumbnail}` : '/assets/images/placeholder.png'}
                            alt={webinar.title}
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
                                    <p className="text-sm font-semibold">Batch {webinar.batch || '1'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <Calendar size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal</p>
                                    <p className="text-sm font-semibold">
                                        {new Date(webinar.start_time).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <Clock size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Waktu</p>
                                    <p className="text-sm font-semibold">
                                        {new Date(webinar.start_time).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
