import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, ChartArea, Clock, GraduationCap, Hash, MapPin, Users } from 'lucide-react';

interface CertificationProgram {
    title: string;
    category?: { name: string };
    thumbnail?: string | null;
    short_description?: string | null;
    type: 'regular' | 'scholarship';
    registration_deadline?: string;
    batch?: string | null;
    schedules?: { schedule_date?: string; start_date?: string; day?: string; start_time?: string; end_time?: string }[];
}

export default function HeroSection({ program }: { program: CertificationProgram }) {
    const deadlineDate = program.registration_deadline ? new Date(program.registration_deadline) : null;
    
    // Calculate duration based on schedules
    let diffDays = 0;
    let totalWeeks = 0;
    let firstDate = null;
    let lastDate = null;

    if (program.schedules && program.schedules.length > 0) {
        const getDate = (s: any) => s.schedule_date || s.start_date || '';
        const validSchedules = program.schedules.filter(s => getDate(s));
        
        if (validSchedules.length > 0) {
            firstDate = new Date(getDate(validSchedules[0]));
            lastDate = new Date(getDate(validSchedules[validSchedules.length - 1]));
            
            const diffMs = lastDate.getTime() - firstDate.getTime();
            diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1;
            totalWeeks = Math.ceil(diffDays / 7);
        }
    }

    return (
        <section className="to-background from-background via-tertiary dark:via-background dark:to-background relative bg-gradient-to-b py-12 text-gray-900 dark:text-white">
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 animate-spin items-center gap-8 duration-[10s]">
                <div className="bg-primary h-[300px] w-[300px] rounded-full blur-[200px]" />
                <div className="bg-secondary h-[300px] w-[300px] rounded-full blur-[200px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="col-span-2 space-y-6">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {program.category && (
                                    <span className="text-secondary border-secondary bg-background inline-block rounded-full border bg-gradient-to-t from-[#FED6AD] to-white px-3 py-1 text-sm font-medium shadow-xs hover:text-[#FF925B]">
                                        {program.category.name}
                                    </span>
                                )}
                                <Badge className={`border-0 ${program.type === 'scholarship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <GraduationCap size={14} className="mr-1" />
                                    {program.type === 'scholarship' ? 'Beasiswa' : 'Reguler'}
                                </Badge>
                                {program.batch && (
                                    <Badge variant="outline" className="border-gray-300">
                                        Batch {program.batch}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="mb-4 text-4xl leading-tight font-bold italic sm:text-5xl">{program.title}</h1>

                            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                                {program.short_description ||
                                    'Bergabunglah dengan program sertifikasi kami untuk meningkatkan keterampilan Anda.'}
                            </p>

                            <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Calendar size={20} className="text-primary dark:text-secondary" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Batas Pendaftaran</p>
                                        <p className="text-sm font-semibold">
                                            {deadlineDate ? `${format(deadlineDate, 'dd MMMM yyyy, HH:mm', { locale: id })} WIB` : 'Tidak ada batas'}
                                        </p>
                                    </div>
                                </div>
                                {program.schedules && program.schedules.length > 0 && (
                                    <div className="border-t border-gray-200 pt-3 dark:border-zinc-700">
                                        <div className="flex items-start gap-3">
                                            <Clock size={20} className="text-primary dark:text-secondary mt-1" />
                                            <div className="flex-1">
                                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Jadwal Pertemuan</p>
                                                <div className="space-y-1">
                                                    {program.schedules.slice(0, 3).map((schedule, idx) => {
                                                        const scheduleDate = schedule.schedule_date || schedule.start_date;
                                                        return (
                                                            <p key={idx} className="text-sm capitalize">
                                                                {schedule.day || (scheduleDate ? format(new Date(scheduleDate), 'EEEE', { locale: id }) : '')},{' '}
                                                                {scheduleDate ? format(new Date(scheduleDate), 'dd MMM yyyy', { locale: id }) : ''}
                                                                {schedule.start_time && ` - ${schedule.start_time.slice(0, 5)} s/d ${schedule.end_time?.slice(0, 5)} WIB`}
                                                            </p>
                                                        );
                                                    })}
                                                    {program.schedules.length > 3 && (
                                                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                                                            Dan {program.schedules.length - 3} pertemuan lainnya...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <a href="#register">
                                    <Button size="lg">Daftar Sekarang</Button>
                                </a>
                                <a href="https://wa.me/+6285167541152" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="lg">Hubungi Kami</Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <img
                            src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                            alt={program.title}
                            className="aspect-video w-full rounded-xl object-cover shadow-lg hidden lg:block"
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
                                    <p className="text-sm font-semibold">Batch {program.batch || '1'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <Users size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tipe</p>
                                    <p className="text-sm font-semibold capitalize">{program.type === 'scholarship' ? 'Beasiswa' : 'Reguler'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-md dark:bg-zinc-800">
                                <ChartArea size={20} className="text-primary dark:text-secondary" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                    <p className="text-sm font-semibold">
                                        {diffDays > 0 ? (diffDays < 7 ? `${diffDays} Hari` : `${totalWeeks} Minggu`) : '-'}
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
