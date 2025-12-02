import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BadgeCheck,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    Eye,
    LinkIcon,
    MessageSquare,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: string;
    name: string;
}

interface BootcampSchedule {
    id: string;
    schedule_date: string;
    day: string;
    start_time: string;
    end_time: string;
    recording_url: string | null;
}

interface BootcampAttendance {
    id: string;
    enrollment_bootcamp_id: string;
    bootcamp_schedule_id: string;
    attendance_proof: string;
    verified: boolean;
    notes?: string;
    bootcamp_schedule: BootcampSchedule;
}

interface Bootcamp {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category_id: string;
    start_date: string;
    end_date: string;
    category: Category;
    bootcamp_url: string;
    registration_url: string;
    benefits: string;
    curriculum: string;
    description: string | null;
    short_description: string | null;
    group_url: string | null;
    status: string;
    schedules: BootcampSchedule[];
    user_id: string;
    has_submission_link: boolean;
    created_at: string;
    updated_at: string;
}

interface EnrollmentBootcampItem {
    id: string;
    invoice_id: string;
    bootcamp_id: string;
    bootcamp: Bootcamp;
    progress: number;
    completed_at: string | null;
    attendances: BootcampAttendance[];
    submission?: string | null;
    submission_verified: boolean;
    rating?: number | null;
    review?: string | null;
    reviewed_at?: string | null;
    created_at: string;
    updated_at: string;
}

interface BootcampProps {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    status: string;
    paid_at: string | null;
    user_id: string;
    bootcamp_items: EnrollmentBootcampItem[];
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

interface DetailBootcampProps {
    bootcamp: BootcampProps;
    certificate?: Certificate | null;
    certificateParticipant?: CertificateParticipant | null;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
}

const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
}: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
}) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRatingChange?.(star)}
                    className={`text-2xl transition-colors ${
                        star <= rating ? 'text-yellow-400' : readonly ? 'text-gray-300' : 'text-gray-300 hover:text-yellow-300'
                    } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default function DetailMyBootcamp({ bootcamp, certificate, certificateParticipant }: DetailBootcampProps) {
    const bootcampItem = bootcamp.bootcamp_items?.[0];
    const bootcampData = bootcampItem?.bootcamp;
    const bootcampInvoiceStatus = bootcamp.status;
    const benefitList = parseList(bootcampData?.benefits);
    const curriculumList = parseList(bootcampData?.curriculum);
    const [isLoading, setIsLoading] = useState(true);

    const [showUploadForms, setShowUploadForms] = useState<{ [key: string]: boolean }>({});
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [submissionUrl, setSubmissionUrl] = useState(bootcampItem?.submission || '');
    const [submittingSubmission, setSubmittingSubmission] = useState(false);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewText, setReviewText] = useState(bootcampItem?.review || '');
    const [rating, setRating] = useState(bootcampItem?.rating || 0);
    const [submittingReview, setSubmittingReview] = useState(false);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleFileSelect = (scheduleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Format file harus berupa gambar (JPG, PNG, WEBP)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB');
                return;
            }

            setSelectedFiles((prev) => ({ ...prev, [scheduleId]: file }));
        }
    };

    const handleUploadAttendance = (scheduleId: string) => {
        const file = selectedFiles[scheduleId];
        if (!file || !bootcampItem) return;

        setUploading((prev) => ({ ...prev, [scheduleId]: true }));

        const formData = new FormData();
        formData.append('attendance_proof', file);
        formData.append('enrollment_id', bootcampItem.id);
        formData.append('schedule_id', scheduleId);
        formData.append('notes', notes[scheduleId] || '');

        router.post(route('profile.bootcamp.attendance.upload'), formData, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setShowUploadForms((prev) => ({ ...prev, [scheduleId]: false }));
                setSelectedFiles((prev) => ({ ...prev, [scheduleId]: null }));
                setNotes((prev) => ({ ...prev, [scheduleId]: '' }));
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                alert('Gagal mengupload bukti kehadiran');
            },
            onFinish: () => {
                setUploading((prev) => ({ ...prev, [scheduleId]: false }));
            },
        });
    };

    const getAttendanceForSchedule = (scheduleId: string) => {
        return bootcampItem?.attendances?.find((att) => att.bootcamp_schedule_id === scheduleId);
    };

    const handleSubmitSubmission = () => {
        if (!submissionUrl.trim() || !bootcampItem) {
            alert('Mohon isi link submission');
            return;
        }

        setSubmittingSubmission(true);

        router.post(
            route('profile.bootcamp.submission.submit'),
            {
                submission: submissionUrl,
                enrollment_id: bootcampItem.id,
            },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setShowSubmissionForm(false);
                },
                onError: (errors) => {
                    console.error('Submit errors:', errors);
                    alert('Gagal mengirim submission');
                },
                onFinish: () => {
                    setSubmittingSubmission(false);
                },
            },
        );
    };

    const handleSubmitReview = () => {
        if (!reviewText.trim() || rating === 0 || !bootcampItem) {
            alert('Mohon lengkapi rating dan review');
            return;
        }

        setSubmittingReview(true);

        router.post(
            route('profile.bootcamp.review.submit'),
            {
                rating: rating,
                review: reviewText,
                enrollment_id: bootcampItem.id,
            },
            {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setShowReviewForm(false);
                },
                onError: (errors) => {
                    console.error('Submit errors:', errors);
                    alert('Gagal mengirim review');
                },
                onFinish: () => {
                    setSubmittingReview(false);
                },
            },
        );
    };

    if (!bootcampData || !bootcampItem) {
        return (
            <UserLayout>
                <Head title="Bootcamp Tidak Ditemukan" />
                <ProfileLayout>
                    <div className="flex h-screen items-center justify-center">
                        <div className="text-center">
                            <p className="mb-4">Detail bootcamp tidak dapat ditemukan.</p>
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

    const bootcampEndDate = new Date(bootcampData.end_date);
    bootcampEndDate.setHours(23, 59, 59, 999);
    const lastSchedule = bootcampData.schedules?.[bootcampData.schedules.length - 1];
    const isCompleted = lastSchedule ? new Date(`${lastSchedule.schedule_date}T${lastSchedule.end_time}`) < new Date() : bootcampEndDate < new Date();

    const totalSchedules = bootcampData.schedules?.length || 0;
    const verifiedAttendances = bootcampItem.attendances?.filter((att) => att.verified).length || 0;
    const allAttendanceVerified = totalSchedules > 0 && verifiedAttendances === totalSchedules;

    const needsSubmission = bootcampData.has_submission_link;
    const hasSubmission = bootcampItem.submission && bootcampItem.submission_verified;

    const hasReview = bootcampItem.rating && bootcampItem.review;

    const hasCertificate =
        certificate && isCompleted && bootcampInvoiceStatus === 'paid' && allAttendanceVerified && (!needsSubmission || hasSubmission) && hasReview;

    return (
        <UserLayout>
            <Head title={bootcampData.title} />
            <ProfileLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold italic">{bootcampData.title}</h1>
                            <p className="text-muted-foreground">Detail progres dan sertifikat bootcamp Anda</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/profile">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Payment Warning */}
                {bootcampInvoiceStatus !== 'paid' && (
                    <div className="mb-6 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-lg dark:border-red-700 dark:from-red-900/20 dark:to-pink-900/20">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">
                                    Status Pembayaran: {bootcampInvoiceStatus.toUpperCase()}
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">Selesaikan pembayaran untuk bergabung dengan bootcamp ini.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completion Message */}
                {isCompleted && hasCertificate && (
                    <div className="relative mb-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-100 p-8 shadow-lg dark:border-green-700 dark:from-green-900/20 dark:to-emerald-800/20">
                        <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-green-300 to-transparent opacity-30" />
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                                    <Award className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎉 Selamat!</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Terima kasih telah menyelesaikan bootcamp "{bootcampData.title}"
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Dedikasi dan konsistensi Anda dalam mengikuti seluruh sesi pembelajaran sungguh luar biasa! Kami berharap ilmu dan
                                pengalaman yang telah Anda dapatkan dapat bermanfaat untuk pengembangan karir dan skill Anda ke depannya.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Attendance Section with Recording */}
                        {bootcampInvoiceStatus === 'paid' && bootcampData.schedules && bootcampData.schedules.length > 0 && (
                            <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-2">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold italic">Bukti Kehadiran & Rekaman</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Upload bukti kehadiran per pertemuan ({verifiedAttendances}/{totalSchedules} terverifikasi)
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {bootcampData.schedules.map((schedule, idx) => {
                                        const attendance = getAttendanceForSchedule(schedule.id);
                                        const showForm = showUploadForms[schedule.id];
                                        const isUploading = uploading[schedule.id];
                                        const scheduleDate = new Date(schedule.schedule_date);
                                        const isPast = scheduleDate < new Date();
                                        const videoId = schedule.recording_url ? getYoutubeId(schedule.recording_url) : '';
                                        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

                                        return (
                                            <div
                                                key={schedule.id}
                                                className={`rounded-lg border p-4 transition ${
                                                    attendance?.verified
                                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                        : attendance
                                                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                                                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="text-purple-600" />
                                                                <span className="font-medium">Pertemuan {idx + 1}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} className="text-gray-500" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {scheduleDate.toLocaleDateString('id-ID', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}{' '}
                                                                    | {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} WIB
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {attendance && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                {attendance.verified ? (
                                                                    <span className="flex items-center gap-1 text-sm text-green-600">
                                                                        <CheckCircle size={14} />
                                                                        Terverifikasi
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                                                                        <Clock size={14} />
                                                                        Menunggu Verifikasi
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {attendance?.verified ? (
                                                            <Button size="sm" variant="outline" disabled>
                                                                <CheckCircle size={14} className="mr-1" />
                                                                Verified
                                                            </Button>
                                                        ) : attendance ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setShowUploadForms((prev) => ({
                                                                        ...prev,
                                                                        [schedule.id]: !showForm,
                                                                    }))
                                                                }
                                                            >
                                                                <Upload size={14} className="mr-1" />
                                                                Edit Bukti
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                disabled={!isPast}
                                                                onClick={() =>
                                                                    setShowUploadForms((prev) => ({
                                                                        ...prev,
                                                                        [schedule.id]: !showForm,
                                                                    }))
                                                                }
                                                            >
                                                                <Upload size={14} className="mr-1" />
                                                                {isPast ? 'Upload Bukti' : 'Belum Dimulai'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Recording Video Section */}
                                                {schedule.recording_url && embedUrl && (
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                                                            <ExternalLink size={14} />
                                                            <span>Rekaman Pertemuan</span>
                                                        </div>
                                                        <div className="w-full">
                                                            <iframe
                                                                className="aspect-video w-full rounded-lg border"
                                                                src={embedUrl}
                                                                title={`Recording Pertemuan ${idx + 1}`}
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                        <a
                                                            href={schedule.recording_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                        >
                                                            <ExternalLink size={12} />
                                                            Buka di YouTube
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Upload Form */}
                                                {showForm && (
                                                    <div className="mt-4 space-y-3 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="font-medium">Upload Bukti Kehadiran</h5>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setShowUploadForms((prev) => ({
                                                                        ...prev,
                                                                        [schedule.id]: false,
                                                                    }))
                                                                }
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`file_${schedule.id}`}>
                                                                Screenshot/Foto Kehadiran <span className="text-red-500">*</span>
                                                            </Label>
                                                            <Input
                                                                id={`file_${schedule.id}`}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileSelect(schedule.id, e)}
                                                                className="file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
                                                            />
                                                            <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP. Maksimal 5MB.</p>
                                                        </div>

                                                        {selectedFiles[schedule.id] && (
                                                            <div className="text-center">
                                                                <img
                                                                    src={URL.createObjectURL(selectedFiles[schedule.id]!)}
                                                                    alt="Preview"
                                                                    className="mx-auto max-h-32 rounded-lg border shadow-sm"
                                                                />
                                                                <p className="mt-2 text-sm text-gray-600">{selectedFiles[schedule.id]?.name}</p>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <Label htmlFor={`notes_${schedule.id}`}>Catatan (Opsional)</Label>
                                                            <textarea
                                                                id={`notes_${schedule.id}`}
                                                                value={notes[schedule.id] || ''}
                                                                onChange={(e) => setNotes((prev) => ({ ...prev, [schedule.id]: e.target.value }))}
                                                                placeholder="Tambahkan catatan jika diperlukan..."
                                                                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                rows={2}
                                                                maxLength={500}
                                                            />
                                                            <p className="text-xs text-gray-500">
                                                                Maksimal 500 karakter ({(notes[schedule.id] || '').length}/500)
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setShowUploadForms((prev) => ({
                                                                        ...prev,
                                                                        [schedule.id]: false,
                                                                    }))
                                                                }
                                                                className="flex-1"
                                                            >
                                                                Batal
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleUploadAttendance(schedule.id)}
                                                                disabled={!selectedFiles[schedule.id] || isUploading}
                                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                            >
                                                                {isUploading ? 'Mengupload...' : 'Upload Bukti'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Show existing attendance proof */}
                                                {attendance && !showForm && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={`/storage/${attendance.attendance_proof}`}
                                                            alt="Bukti Kehadiran"
                                                            className="mx-auto max-h-24 rounded border shadow-sm"
                                                        />
                                                        {attendance.notes && (
                                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                                Catatan: {attendance.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress Bar */}
                                {totalSchedules > 0 && (
                                    <div className="mt-4 rounded-lg border bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                                Progress Kehadiran: {verifiedAttendances}/{totalSchedules}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-32 rounded-full bg-purple-200 dark:bg-purple-700">
                                                    <div
                                                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                                        style={{ width: `${(verifiedAttendances / totalSchedules) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                                    {Math.round((verifiedAttendances / totalSchedules) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submission Section */}
                        {bootcampInvoiceStatus === 'paid' && needsSubmission && allAttendanceVerified && isCompleted && (
                            <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 p-2">
                                        <LinkIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold italic">Submission Project</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload link project akhir bootcamp</p>
                                    </div>
                                </div>

                                {hasSubmission ? (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                            <div className="mb-2 flex items-center gap-2">
                                                <CheckCircle size={20} className="text-green-600" />
                                                <span className="font-medium text-green-800 dark:text-green-200">✅ Submission Terverifikasi</span>
                                            </div>
                                            <a
                                                href={bootcampItem.submission!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm break-all text-blue-600 hover:underline"
                                            >
                                                {bootcampItem.submission}
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/50">
                                            <p className="text-center text-blue-800 dark:text-blue-200">
                                                📦 Upload link project akhir bootcamp untuk melanjutkan.
                                            </p>
                                        </div>

                                        {!showSubmissionForm ? (
                                            <Button onClick={() => setShowSubmissionForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                                                <Upload size={16} className="mr-2" />
                                                Upload Link Project
                                            </Button>
                                        ) : (
                                            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Formulir Submission</h4>
                                                    <Button variant="ghost" size="sm" onClick={() => setShowSubmissionForm(false)}>
                                                        <X size={16} />
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="submission_url">
                                                        Link Project <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="submission_url"
                                                        type="url"
                                                        value={submissionUrl}
                                                        onChange={(e) => setSubmissionUrl(e.target.value)}
                                                        placeholder="https://link-project-anda"
                                                        className="w-full"
                                                    />
                                                    <p className="text-xs text-gray-500">Pastikan link dapat diakses secara publik</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="outline" onClick={() => setShowSubmissionForm(false)} className="flex-1">
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        onClick={handleSubmitSubmission}
                                                        disabled={!submissionUrl.trim() || submittingSubmission}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {submittingSubmission ? 'Mengirim...' : 'Kirim'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Schedule */}
                        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-2">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold italic">{isCompleted ? 'Periode Bootcamp' : 'Jadwal Bootcamp'}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                    <Calendar size={16} className="text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            {new Date(bootcampData.start_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}{' '}
                                            -{' '}
                                            {new Date(bootcampData.end_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Durasi Program</p>
                                    </div>
                                </div>

                                {bootcampData.schedules && bootcampData.schedules.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Jadwal Sesi:</p>
                                        {bootcampData.schedules.map((schedule, idx) => (
                                            <div key={idx} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-zinc-700">
                                                <Clock size={16} className="text-green-600" />
                                                <span className="font-medium text-gray-900 capitalize dark:text-white">{schedule.day},</span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {new Date(schedule.schedule_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}{' '}
                                                    | {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} WIB
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-br from-green-400 to-emerald-600 p-2">
                                    <BadgeCheck className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold italic">Fasilitas yang Tersedia</h3>
                            </div>
                            <div className="space-y-3">
                                {benefitList.map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                        <BadgeCheck size={18} className="mt-1 min-w-6 text-green-600" />
                                        <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-2">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold italic">Kurikulum</h3>
                            </div>
                            <div className="space-y-3">
                                {curriculumList.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-800 dark:text-purple-300">
                                            {idx + 1}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                            {/* Certificate Card */}
                            <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 p-2">
                                        <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold italic">Sertifikat</h3>
                                </div>

                                {isLoading && hasCertificate && (
                                    <div className="space-y-3">
                                        <Skeleton className="h-[250px] w-full rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton className="mx-auto h-3 w-3/4" />
                                            <Skeleton className="mx-auto h-3 w-1/2" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="mx-auto h-8 w-full" />
                                            <Skeleton className="mx-auto h-8 w-full" />
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    {hasCertificate ? (
                                        <div className={`group ${isLoading ? 'absolute opacity-0' : 'relative opacity-100'}`}>
                                            <iframe
                                                src={`${route('profile.bootcamp.certificate.preview', { bootcamp: bootcampData.slug })}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                className="h-[238px] w-full rounded-lg border shadow-lg dark:border-zinc-700"
                                                title="Preview Sertifikat"
                                                onLoad={handleIframeLoad}
                                            />
                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <img
                                                src={'/assets/images/placeholder.png'}
                                                alt="Sertifikat"
                                                className="aspect-video rounded-lg border object-cover shadow-lg transition-transform group-hover:scale-105 dark:border-zinc-700"
                                            />
                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    )}
                                </div>

                                {hasCertificate ? (
                                    <div className={`${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            Unduh sertifikat sebagai bukti kelulusan dari bootcamp ini.
                                        </p>
                                        {certificateParticipant && (
                                            <div className="mt-2 text-center">
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    No. Sertifikat: {String(certificateParticipant.certificate_number).padStart(4, '0')}/
                                                    {certificate!.certificate_number}
                                                </p>
                                                <Link
                                                    href={route('certificate.participant.detail', {
                                                        code: certificateParticipant.certificate_code,
                                                    })}
                                                    className="text-xs text-green-600 underline hover:text-green-800"
                                                >
                                                    Lihat Detail Sertifikat
                                                </Link>
                                            </div>
                                        )}
                                        <div className="mt-3 space-y-2">
                                            <Button className="w-full" asChild>
                                                <a href={route('profile.bootcamp.certificate', { bootcamp: bootcampData.slug })} target="_blank">
                                                    <Download size={16} className="mr-2" />
                                                    Unduh Sertifikat
                                                </a>
                                            </Button>

                                            <Button variant="outline" className="w-full" asChild>
                                                <a
                                                    href={route('profile.bootcamp.certificate.preview', { bootcamp: bootcampData.slug })}
                                                    target="_blank"
                                                >
                                                    <Eye size={16} className="mr-2" />
                                                    Lihat Preview
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            {!certificate
                                                ? 'Sertifikat belum dibuat untuk bootcamp ini.'
                                                : bootcampInvoiceStatus !== 'paid'
                                                  ? 'Selesaikan pembayaran untuk mendapatkan sertifikat.'
                                                  : !allAttendanceVerified
                                                    ? `Lengkapi bukti kehadiran (${verifiedAttendances}/${totalSchedules} terverifikasi).`
                                                    : needsSubmission && !hasSubmission
                                                      ? 'Upload link submission project terlebih dahulu.'
                                                      : !hasReview
                                                        ? 'Berikan rating dan review untuk mendapatkan sertifikat.'
                                                        : 'Sertifikat akan tersedia setelah bootcamp selesai.'}
                                        </p>
                                        <Button className="mt-3 w-full" disabled>
                                            <Download size={16} className="mr-2" />
                                            {!certificate
                                                ? 'Sertifikat Belum Tersedia'
                                                : bootcampInvoiceStatus !== 'paid'
                                                  ? 'Selesaikan Pembayaran'
                                                  : !allAttendanceVerified
                                                    ? 'Lengkapi Kehadiran'
                                                    : needsSubmission && !hasSubmission
                                                      ? 'Upload Submission'
                                                      : !hasReview
                                                        ? 'Berikan Review'
                                                        : 'Menunggu Bootcamp Selesai'}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Review Section */}
                            {bootcampInvoiceStatus === 'paid' && allAttendanceVerified && (!needsSubmission || hasSubmission) && isCompleted && (
                                <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-2">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold italic">Rating & Review</h3>
                                    </div>

                                    {hasReview ? (
                                        <div className="space-y-4">
                                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-green-600" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Review Terkirim</span>
                                                </div>
                                                <div className="mb-2">
                                                    <StarRating rating={bootcampItem.rating || 0} readonly />
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">"{bootcampItem.review}"</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                                                <p className="text-center text-sm text-amber-800 dark:text-amber-200">
                                                    🎯 Berikan rating dan review untuk mendapatkan sertifikat!
                                                </p>
                                            </div>

                                            {!showReviewForm ? (
                                                <Button onClick={() => setShowReviewForm(true)} className="w-full bg-amber-600 hover:bg-amber-700">
                                                    <MessageSquare size={16} className="mr-2" />
                                                    Beri Rating & Review
                                                </Button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium">Formulir Review</h4>
                                                        <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
                                                            <X size={16} />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm">
                                                            Rating <span className="text-red-500">*</span>
                                                        </Label>
                                                        <StarRating rating={rating} onRatingChange={setRating} />
                                                        <p className="text-xs text-gray-500">Berikan rating 1-5 bintang</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="review" className="text-sm">
                                                            Review <span className="text-red-500">*</span>
                                                        </Label>
                                                        <textarea
                                                            id="review"
                                                            value={reviewText}
                                                            onChange={(e) => setReviewText(e.target.value)}
                                                            placeholder="Bagikan pengalaman Anda..."
                                                            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            rows={3}
                                                            maxLength={500}
                                                        />
                                                        <p className="text-xs text-gray-500">Maksimal 500 karakter ({reviewText.length}/500)</p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowReviewForm(false)}
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button
                                                            onClick={handleSubmitReview}
                                                            disabled={!reviewText.trim() || rating === 0 || submittingReview}
                                                            size="sm"
                                                            className="flex-1 bg-amber-600 hover:bg-amber-700"
                                                        >
                                                            {submittingReview ? 'Mengirim...' : 'Kirim'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
