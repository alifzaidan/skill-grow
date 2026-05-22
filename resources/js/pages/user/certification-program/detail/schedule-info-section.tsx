import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface Schedule {
    id: string;
    title?: string | null;
    schedule_date?: string;
    start_date?: string;
    day?: string;
    start_time?: string;
    end_time?: string;
}

interface CertificationProgram {
    schedules: Schedule[];
    socializationSchedules?: Schedule[];
    type: 'regular' | 'scholarship';
}

export default function ScheduleInfoSection({ program }: { program: CertificationProgram }) {
    const schedules = program.schedules ?? [];
    if (schedules.length === 0) return null;
    const socializationSchedules =
        program.socializationSchedules ?? (program as CertificationProgram & { socialization_schedules?: Schedule[] }).socialization_schedules ?? [];

    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const getDayLabel = (s: Schedule) => {
        if (s.day?.trim()) {
            return s.day;
        }

        const dateValue = getDate(s);
        if (!dateValue) {
            return '';
        }

        return format(new Date(dateValue), 'EEEE', { locale: id });
    };

    const formatDate = (value: string) => format(new Date(value), 'dd MMMM yyyy', { locale: id });
    const formatTime = (value?: string) => (value ? value.slice(0, 5) : '');

    return (
        <section className="relative mt-8 w-full overflow-hidden bg-gradient-to-br from-[#200cf5] via-[#1a0acc] to-[#0f0580] px-4 py-12">
            {/* Decorative Background Elements */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-[#fccd22] blur-3xl" />
                <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-[#200cf5] blur-3xl" />
            </div>

            <div className="relative mx-auto my-8 w-full max-w-7xl px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-white">
                        <Calendar className="h-5 w-5" />
                        Jadwal Pelaksanaan
                    </div>
                    <h2 className="mb-4 bg-gradient-to-r from-[#fccd22] via-white to-[#200cf5] bg-clip-text text-3xl font-bold text-transparent italic sm:text-4xl">
                        Rangkaian sesi program per hari
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-300">
                        Detail jadwal sesi yang akan dilaksanakan dari hari pertama hingga terakhir.
                    </p>
                </div>

                {/* Timeline Grid */}
                <div className="relative space-y-6">
                    {schedules.map((schedule, index) => {
                        const dateValue = getDate(schedule);
                        const startTime = formatTime(schedule.start_time);
                        const endTime = formatTime(schedule.end_time);

                        return (
                            <div key={schedule.id} className="group relative">
                                {/* Connector Line */}
                                {index < schedules.length - 1 && (
                                    <div className="absolute top-14 left-6 h-full w-0.5 bg-gradient-to-b from-[#fccd22] to-[#200cf5] opacity-30" />
                                )}

                                {/* Card */}
                                <div className="relative flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10">
                                    {/* Number Badge */}
                                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] font-bold text-white shadow-lg">
                                        {index + 1}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] opacity-0 blur-md transition group-hover:opacity-50" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <BookOpen size={18} className="text-[#fccd22]" />
                                            <span className="text-xs font-medium tracking-wide text-[#fccd22] uppercase">
                                                Sesi {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {schedule.title || (dateValue ? formatDate(dateValue) : `Sesi ${index + 1}`)}
                                        </h3>
                                        
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                                            {dateValue && (
                                                <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                                                    <Calendar className="h-4 w-4 text-[#fccd22]" />
                                                    <span className="capitalize">{getDayLabel(schedule)}</span>, {formatDate(dateValue)}
                                                </div>
                                            )}
                                            {(startTime || endTime) && (
                                                <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                                                    <Clock className="h-4 w-4 text-[#fccd22]" />
                                                    {startTime || '--:--'} {endTime ? `- ${endTime}` : ''} WIB
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Check Icon */}
                                    <CheckCircle2 size={20} className="flex-shrink-0 text-green-400 opacity-0 transition group-hover:opacity-100" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer CTA */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 backdrop-blur-sm">
                        <Calendar size={20} className="text-[#fccd22]" />
                        <span className="text-white">
                            <span className="font-semibold">{schedules.length} Sesi</span> program terjadwal
                        </span>
                    </div>
                </div>

                {/* Socialization Schedules for Scholarship */}
                {program.type === 'scholarship' && socializationSchedules.length > 0 && (
                    <div className="mt-12">
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Jadwal Sosialisasi Beasiswa</h3>
                            <p className="text-gray-300">Tahapan awal sebelum proses seleksi utama dimulai.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {socializationSchedules.map((schedule, index) => {
                                const dateValue = getDate(schedule);
                                const startTime = formatTime(schedule.start_time);
                                const endTime = formatTime(schedule.end_time);

                                return (
                                    <div key={schedule.id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className="bg-[#fccd22] text-black hover:bg-[#e5b81f]">
                                                {schedule.title || `Tahap ${index + 1}`}
                                            </Badge>
                                            <span className="text-[#fccd22] text-xs font-semibold uppercase tracking-wider">Sosialisasi</span>
                                        </div>
                                        <div className="text-white font-medium mb-2">
                                            {getDayLabel(schedule) && <span className="capitalize">{getDayLabel(schedule)}, </span>}
                                            {dateValue ? formatDate(dateValue) : 'Tanggal belum tersedia'}
                                        </div>
                                        {(startTime || endTime) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Clock className="h-4 w-4 text-[#fccd22]" />
                                                {startTime || '--:--'} {endTime ? `- ${endTime}` : ''} WIB
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
