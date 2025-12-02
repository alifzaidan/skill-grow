import RatingDialog from '@/components/rating-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, BadgeCheck, CheckCircle, Download, Eye, PlayCircle, Star } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: string;
    name: string;
}

interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    level: string;
    category_id: string;
    category: Category;
    course_url: string;
    registration_url: string;
    key_points: string;
    description: string | null;
    short_description: string | null;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface EnrollmentCourseItem {
    id: string;
    invoice_id: string;
    course_id: string;
    course: Course;
    progress: number;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface CourseProps {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    status: string;
    paid_at: string | null;
    user_id: string;
    course_items: EnrollmentCourseItem[];
    created_at: string;
    updated_at: string;
}

interface CourseRating {
    id: string;
    user_id: string;
    course_id: string;
    rating: number;
    review: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

interface Certificate {
    id: string;
    title: string;
    certificate_number: string;
    description?: string;
}

interface CertificateParticipant {
    id: string;
    certificate_code: string;
    certificate_number: number;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function DetailMyCourse({
    course,
    courseRating,
    certificate,
    certificateParticipant,
}: {
    course: CourseProps | null;
    courseRating: CourseRating | null;
    certificate?: Certificate | null;
    certificateParticipant?: CertificateParticipant | null;
}) {
    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

    if (!course) {
        return (
            <UserLayout>
                <Head title="Kelas Tidak Ditemukan" />
                <ProfileLayout>
                    <div className="flex h-screen items-center justify-center">
                        <div className="text-center">
                            <p className="mb-4">Detail kelas tidak dapat ditemukan.</p>
                            <Button asChild>
                                <Link href="/profile">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali Ke Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </ProfileLayout>
            </UserLayout>
        );
    }

    const courseItem = course.course_items?.[0];
    const courseData = courseItem?.course;
    const courseInvoiceStatus = course.status;
    const keyPointList = parseList(courseData?.key_points);
    const isCompleted = courseItem?.progress === 100;
    const hasCertificate = certificate && isCompleted && courseRating && courseInvoiceStatus === 'paid';

    const renderCertificateSection = () => {
        if (!courseItem || courseItem.progress !== 100) return null;

        if (!courseRating) {
            return (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 shadow-lg transition hover:shadow-xl dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-blue-300 to-transparent opacity-30 transition group-hover:scale-110" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] shadow-lg">
                                <Star className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🎉 Selamat! Anda telah menyelesaikan kelas ini</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Berikan rating dan review untuk mendapatkan sertifikat kelulusan
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setIsRatingDialogOpen(true)}>
                            <Star className="mr-2 h-4 w-4" />
                            Beri Rating
                        </Button>
                    </div>
                </div>
            );
        }

        if (courseRating && !hasCertificate) {
            return (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-100 p-6 shadow-lg dark:border-yellow-700 dark:from-yellow-900/20 dark:to-yellow-800/20">
                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-yellow-300 to-transparent opacity-30 transition group-hover:scale-110" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🎉 Terima kasih atas rating Anda!</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {!certificate ? 'Sertifikat belum dibuat untuk course ini.' : 'Sertifikat sedang diproses.'}
                                </p>
                                <div className="mt-2 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= courseRating.rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className="ml-1 text-sm text-gray-600">({courseRating.rating}/5)</span>
                                </div>
                            </div>
                        </div>
                        <Button disabled variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            {!certificate ? 'Sertifikat Belum Tersedia' : 'Menunggu Sertifikat'}
                        </Button>
                    </div>
                </div>
            );
        }

        if (hasCertificate) {
            return (
                <div className="group relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6 shadow-lg dark:border-green-700 dark:from-green-900/20 dark:to-emerald-800/20">
                    <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-green-300 to-transparent opacity-30 transition group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🎉 Sertifikat Kelulusan Tersedia!</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Anda telah berhasil menyelesaikan kelas ini dan sertifikat sudah siap diunduh
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {certificateParticipant && (
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        No. Sertifikat: {String(certificateParticipant.certificate_number).padStart(4, '0')}/
                                        {certificate.certificate_number}
                                    </p>
                                    <Link
                                        href={route('certificate.participant.detail', {
                                            code: certificateParticipant.certificate_code,
                                        })}
                                        className="text-sm text-green-600 underline hover:text-green-800 dark:text-green-400"
                                    >
                                        Lihat Detail Sertifikat
                                    </Link>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button asChild>
                                    <a href={route('profile.course.certificate', { course: courseData.slug })} target="_blank">
                                        <Download size={16} className="mr-2" />
                                        Unduh
                                    </a>
                                </Button>

                                <Button variant="outline" asChild>
                                    <a href={route('profile.course.certificate.preview', { course: courseData.slug })} target="_blank">
                                        <Eye size={16} className="mr-2" />
                                        Preview
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <UserLayout>
            <Head title={courseData?.title || 'Detail Kelas'} />
            <ProfileLayout>
                {!courseData ? (
                    <div className="flex h-screen items-center justify-center">
                        <div className="text-center">
                            <p className="mb-4">Detail kelas tidak dapat ditemukan.</p>
                            <Button asChild>
                                <Link href="/profile">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali Ke Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold italic">{courseData.title}</h1>
                                <p className="text-muted-foreground">Detail progres dan sertifikat kelas Anda</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/profile">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                        </div>

                        {/* Payment Warning */}
                        {courseInvoiceStatus !== 'paid' && (
                            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-lg dark:border-red-700 dark:from-red-900/20 dark:to-pink-900/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-900 dark:text-red-100">
                                            Status Pembayaran: {courseInvoiceStatus.toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {courseInvoiceStatus === 'failed'
                                                ? 'Pembayaran gagal atau dibatalkan. Silakan lakukan pembelian ulang.'
                                                : 'Selesaikan pembayaran untuk mengakses kelas.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Certificate Section */}
                        {renderCertificateSection()}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Content */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Progress Card */}
                                <div className="rounded-2xl border bg-white p-6 shadow-lg dark:bg-zinc-800">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] p-2">
                                            <PlayCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold italic">Progres Pembelajaran</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progres Kamu</span>
                                                <span className="text-lg font-bold">{courseItem?.progress || 0}%</span>
                                            </div>
                                            <Progress value={courseItem?.progress || 0} className="h-3" />
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 dark:bg-zinc-700">
                                            <span className="text-sm font-medium">Status Penyelesaian:</span>
                                            <div className="flex items-center gap-2">
                                                {courseItem?.completed_at ? (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                        <span className="font-semibold text-green-600">Selesai</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                                                        <span className="font-semibold text-gray-600">Sedang Berlangsung</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {courseItem?.completed_at && (
                                            <p className="text-xs text-gray-500">
                                                Diselesaikan pada:{' '}
                                                {new Date(courseItem.completed_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Key Points Card */}
                                <div className="rounded-2xl border bg-white p-6 shadow-lg dark:bg-zinc-800">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-full bg-gradient-to-br from-green-400 to-emerald-600 p-2">
                                            <BadgeCheck className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold italic">Poin Utama</h2>
                                    </div>
                                    <ul className="space-y-3">
                                        {keyPointList.map((keyPoint, idx) => (
                                            <li key={idx} className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                                <BadgeCheck size={18} className="mt-0.5 min-w-5 flex-shrink-0 text-green-600" />
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{keyPoint}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6 rounded-2xl border bg-white p-6 shadow-lg dark:bg-zinc-800">
                                    <h3 className="mb-4 text-center font-semibold">{courseData.title}</h3>
                                    <div className="group relative overflow-hidden rounded-xl">
                                        <img
                                            src={courseData.thumbnail ? `/storage/${courseData.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={courseData.title}
                                            className="aspect-video w-full object-cover shadow-lg transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                    <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">{courseData.short_description}</p>

                                    <Button
                                        className="mt-4 w-full"
                                        onClick={() => router.get(route('learn.course.detail', { course: courseData.slug }))}
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        {isCompleted ? 'Lihat Kembali Materi' : 'Lanjutkan Belajar'}
                                    </Button>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Level:</span>
                                            <span className="font-semibold capitalize">{courseData.level}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Kategori:</span>
                                            <span className="font-semibold">{courseData.category.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Terdaftar:</span>
                                            <span className="font-semibold">
                                                {new Date(courseItem.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ProfileLayout>

            {courseData && (
                <RatingDialog
                    isOpen={isRatingDialogOpen}
                    onClose={() => setIsRatingDialogOpen(false)}
                    course={{
                        id: courseData.id,
                        title: courseData.title,
                        thumbnail: courseData.thumbnail,
                        description: courseData.description || courseData.short_description || '',
                    }}
                />
            )}
        </UserLayout>
    );
}
