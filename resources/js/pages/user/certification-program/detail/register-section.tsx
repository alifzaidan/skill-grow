import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, CalendarDays, GraduationCap, Users } from 'lucide-react';

interface Mentor {
    id: string;
    name: string;
}

interface Schedule {
    id: string;
    schedule_date?: string;
    start_date?: string;
}

interface CertificationProgram {
    id: string;
    title: string;
    slug: string;
    type: 'regular' | 'scholarship';
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    registration_deadline?: string;
    socialization_registration_deadline?: string;
    thumbnail?: string | null;
    mentors: Mentor[];
    schedules: Schedule[];
    document_required?: boolean;
    document_description?: string | null;
}

interface RegisterSectionProps {
    program: CertificationProgram;
    isEnrolled: boolean;
    scholarshipApplication?: { status: string } | null;
}

export default function RegisterSection({ program, isEnrolled, scholarshipApplication }: RegisterSectionProps) {
    const { auth } = usePage<SharedData>().props;

    // Regular program deadline
    const regularDeadline = program.registration_deadline ? new Date(program.registration_deadline) : null;
    const isRegularRegistrationOpen = regularDeadline ? new Date() < regularDeadline : true;

    // Check if scholarship is approved (only matters for scholarship programs)
    const isScholarshipApproved = program.type === 'scholarship' ? scholarshipApplication?.status === 'approved' : true;
    const isScholarshipNotApproved = program.type === 'scholarship' && !isScholarshipApproved;
    const canRegisterRegular = isRegularRegistrationOpen && !isEnrolled && isScholarshipApproved;

    // Scholarship program deadline
    const scholarshipDeadline = program.socialization_registration_deadline ? new Date(program.socialization_registration_deadline) : null;
    const isScholarshipRegistrationOpen = scholarshipDeadline ? new Date() < scholarshipDeadline : true;
    const canRegisterScholarship = isScholarshipRegistrationOpen && !isEnrolled;

    const displayPrice = isScholarshipNotApproved ? 0 : (program.type === 'scholarship' ? (program.scholarship_price ?? program.price) : program.price);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const firstSchedule = program.schedules.length > 0 ? getDate(program.schedules[0]) : null;
    const lastSchedule = program.schedules.length > 0 ? getDate(program.schedules[program.schedules.length - 1]) : null;

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4" id="register">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-3xl font-bold text-gray-900 italic md:text-4xl">
                Lokasi, Jadwal, dan Biaya Program
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
                Daftar sekarang dan tingkatkan kompetensi profesional Anda melalui program sertifikasi bersama para ahli.
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-6 md:flex-row">
                <div className="flex h-full w-full flex-col items-center gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md md:flex-row dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                        src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={program.title}
                        className="mb-4 h-72 w-full rounded-lg border border-gray-200 object-cover shadow-md md:mb-0 md:w-64"
                    />
                    <div className="flex flex-1 flex-col justify-between w-full">
                        <div>
                            <h5 className="mb-4 text-base font-semibold text-black dark:text-white">
                                Daftar sekarang dan dapatkan sertifikat profesional yang diakui industri
                            </h5>
                            
                            <div className="mb-2 flex flex-col items-end">
                                {!isScholarshipNotApproved && program.strikethrough_price && program.strikethrough_price > 0 && (
                                    <span className="mb-1 text-sm text-red-500 line-through">
                                        {formatRupiah(program.strikethrough_price)}
                                    </span>
                                )}
                                {displayPrice > 0 ? (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">
                                        {formatRupiah(displayPrice)}
                                    </span>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">GRATIS</span>
                                )}
                                {!isScholarshipNotApproved && program.type === 'scholarship' && program.scholarship_price !== undefined && program.scholarship_price > 0 && (
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Harga Beasiswa</p>
                                )}
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <ul className="mb-4 space-y-2">
                                {firstSchedule && lastSchedule && (
                                    <li className="flex items-center gap-2 text-sm">
                                        <CalendarDays size="16" className="text-primary dark:text-secondary flex-shrink-0" />
                                        <p>
                                            {format(new Date(firstSchedule), 'dd MMMM yyyy', { locale: id })} —{' '}
                                            {format(new Date(lastSchedule), 'dd MMMM yyyy', { locale: id })}
                                        </p>
                                    </li>
                                )}

                                <li className="flex items-center gap-2 text-sm">
                                    <GraduationCap size="16" className="text-primary dark:text-secondary" />
                                    <p>
                                        Total Pertemuan: <span className="font-medium">{program.schedules.length} sesi</span>
                                    </p>
                                </li>
                            </ul>
                            
                            {program.type === 'scholarship' ? (
                                scholarshipDeadline && (
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        Batas Pengisian Form Beasiswa:{' '}
                                        {format(scholarshipDeadline, 'dd MMMM yyyy, HH:mm', { locale: id })} WIB
                                    </p>
                                )
                            ) : (
                                regularDeadline && (
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        Batas Pendaftaran Program:{' '}
                                        {format(regularDeadline, 'dd MMMM yyyy, HH:mm', { locale: id })} WIB
                                    </p>
                                )
                            )}

                            {program.document_required && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                                    <p className="font-semibold">Dokumen Pendukung Wajib</p>
                                    <p className="mt-1 whitespace-pre-line text-amber-800 dark:text-amber-200">
                                        {program.document_description ?? 'Peserta wajib mengunggah dokumen pendukung sebelum pendaftaran dapat diproses.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 flex flex-col gap-2">
                            {isEnrolled && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-800 dark:bg-green-900/20">
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">✓ Anda sudah terdaftar di program ini</p>
                                </div>
                            )}

                            {auth ? (
                                <>
                                    {!isEnrolled && program.type === 'scholarship' && !isScholarshipApproved ? null : (
                                        <Button asChild className="w-full" disabled={!canRegisterRegular}>
                                            <Link href={route('certification-programs.register', program.slug)}>
                                                {isEnrolled
                                                    ? '✓ Sudah Terdaftar'
                                                    : canRegisterRegular
                                                      ? 'Daftar Program Reguler'
                                                      : 'Pendaftaran Reguler Ditutup'}
                                            </Link>
                                        </Button>
                                    )}
                                    {program.type === 'scholarship' && !isScholarshipApproved && (
                                        <Button
                                            asChild
                                            disabled={!canRegisterScholarship}
                                            className={`w-full ${!canRegisterScholarship ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <Link href={canRegisterScholarship ? route('certification-programs.register', { program: program.slug, scholarship: 1 }) : '#'}>
                                                <GraduationCap className="mr-1 h-4 w-4" />
                                                {canRegisterScholarship ? 'Ajukan Beasiswa' : 'Pendaftaran Beasiswa Ditutup'}
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button asChild className="w-full">
                                    <Link href={route('certification-programs.register', program.slug)}>Daftar Sekarang</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
