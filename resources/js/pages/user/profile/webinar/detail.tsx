import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, BadgeCheck, Calendar, CheckCircle, Clock, Download, Eye, MessageSquare, Upload, Users, X, Youtube } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: string;
    name: string;
}

interface Webinar {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category_id: string;
    category: Category;
    start_time: string;
    end_time: string;
    webinar_url: string;
    registration_url: string;
    recording_url: string | null;
    benefits: string;
    description: string | null;
    short_description: string | null;
    group_url: string | null;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

interface EnrollmentWebinarItem {
    id: string;
    invoice_id: string;
    webinar_id: string;
    webinar: Webinar;
    progress: number;
    completed_at: string | null;
    attendance_proof?: string | null;
    attendance_verified: boolean;
    review?: string | null;
    rating?: number | null;
    created_at: string;
    updated_at: string;
}

interface WebinarProps {
    id: string;
    invoice_code: string;
    invoice_url: string;
    amount: number;
    status: string;
    paid_at: string | null;
    user_id: string;
    webinar_items: EnrollmentWebinarItem[];
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

interface DetailWebinarProps {
    webinar: WebinarProps;
    certificate?: Certificate | null;
    certificateParticipant?: CertificateParticipant | null;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

function getYoutubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
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

export default function DetailMyWebinar({ webinar, certificate, certificateParticipant }: DetailWebinarProps) {
    const webinarItem = webinar.webinar_items?.[0];
    const webinarData = webinarItem?.webinar;
    const webinarInvoiceStatus = webinar.status;
    const benefitList = parseList(webinarData?.benefits);
    const [isLoading, setIsLoading] = useState(true);

    const [submittingForm, setSubmittingForm] = useState(false);
    const [showCombinedForm, setShowCombinedForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            setSelectedFile(file);
        }
    };

    const handleSubmitForm = async () => {
        if (!selectedFile || !reviewText.trim() || rating === 0 || !webinarItem) {
            alert('Mohon lengkapi semua field: upload bukti kehadiran, review, dan rating');
            return;
        }

        setSubmittingForm(true);

        const formData = new FormData();
        formData.append('attendance_proof', selectedFile);
        formData.append('review', reviewText);
        formData.append('rating', rating.toString());
        formData.append('enrollment_id', webinarItem.id);

        router.post(route('profile.webinar.attendance-review.submit'), formData, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setShowCombinedForm(false);
                resetForm();
            },
            onError: (errors) => {
                console.error('Submit errors:', errors);
                alert('Gagal mengirim data');
            },
            onFinish: () => {
                setSubmittingForm(false);
            },
        });
    };

    const resetForm = () => {
        setSelectedFile(null);
        setReviewText('');
        setRating(0);
    };

    if (!webinarData || !webinarItem) {
        return (
            <UserLayout>
                <Head title="Webinar Tidak Ditemukan" />
                <ProfileLayout>
                    <div className="flex h-screen items-center justify-center">
                        <div className="text-center">
                            <p className="mb-4">Detail webinar tidak dapat ditemukan.</p>
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

    const webinarEndDate = new Date(webinarData.end_time);
    const isWebinarFinished = new Date() > webinarEndDate;
    const isCompleted = isWebinarFinished;
    const hasRecording = webinarData.recording_url && getYoutubeEmbedUrl(webinarData.recording_url);
    const isAttendanceVerified = webinarItem.attendance_verified;
    const hasReview = webinarItem.review && webinarItem.rating;
    const hasCertificate = certificate && isCompleted && webinarInvoiceStatus === 'paid' && isAttendanceVerified && hasReview;

    return (
        <UserLayout>
            <Head title={webinarData.title} />
            <ProfileLayout>
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold italic">{webinarData.title}</h1>
                            <p className="text-muted-foreground">Detail kehadiran dan sertifikat webinar Anda</p>
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
                {webinarInvoiceStatus !== 'paid' && (
                    <div className="mb-6 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 shadow-lg dark:border-red-700 dark:from-red-900/20 dark:to-pink-900/20">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">
                                    Status Pembayaran: {webinarInvoiceStatus.toUpperCase()}
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">Selesaikan pembayaran untuk bergabung dengan webinar ini.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completion Message */}
                {isCompleted && (
                    <div className="relative mb-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6 shadow-lg dark:border-green-700 dark:from-green-900/20 dark:to-emerald-800/20">
                        <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-green-300 to-transparent opacity-30" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🎉 Terima Kasih Telah Berpartisipasi!</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Semoga ilmu yang didapat bermanfaat untuk pengembangan karir dan skill Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Recording Section */}
                        {isWebinarFinished && hasRecording && (
                            <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-red-400 to-pink-600 p-2">
                                        <Youtube className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold italic">🎥 Recording Webinar</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tonton kembali materi webinar kapan saja</p>
                                    </div>
                                </div>

                                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                                    <iframe
                                        className="h-full w-full"
                                        src={getYoutubeEmbedUrl(webinarData.recording_url!)!}
                                        title="Rekaman Webinar"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">✨ Akses selamanya untuk materi webinar ini</p>
                            </div>
                        )}

                        {/* No Recording Yet */}
                        {isWebinarFinished && !hasRecording && (
                            <div className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg dark:border-yellow-700 dark:from-yellow-900/20 dark:to-orange-900/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
                                        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">⏳ Recording Sedang Diproses</h2>
                                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Mohon tunggu, recording akan tersedia dalam 1-2 hari
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schedule Section */}
                        <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-2">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold italic">{isWebinarFinished ? 'Detail Webinar' : 'Jadwal Webinar'}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
                                        <Calendar size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                            {new Date(webinarData.start_time).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Clock size={14} className="text-blue-600" />
                                            <p className="font-medium text-blue-700 dark:text-blue-300">
                                                {new Date(webinarData.start_time).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}{' '}
                                                -{' '}
                                                {new Date(webinarData.end_time).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}{' '}
                                                WIB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Benefits Section */}
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
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                            {/* Upload Form for Certificate */}
                            {isCompleted && webinarInvoiceStatus === 'paid' && !hasReview && (
                                <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-2">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold italic">Lengkapi Data Sertifikat</h2>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Upload bukti kehadiran dan review</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                        <p className="text-center text-sm text-purple-800 dark:text-purple-200">
                                            🎯 Upload bukti kehadiran dan berikan review untuk mendapatkan sertifikat
                                        </p>
                                    </div>

                                    {!showCombinedForm ? (
                                        <Button onClick={() => setShowCombinedForm(true)} className="w-full">
                                            <Upload size={16} className="mr-2" />
                                            Lengkapi Data
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 rounded-lg border p-4 dark:border-zinc-700">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium">Formulir Sertifikat</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowCombinedForm(false);
                                                        resetForm();
                                                    }}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>

                                            {/* File Upload */}
                                            <div className="space-y-2">
                                                <Label htmlFor="attendance_proof">
                                                    Screenshot Kehadiran <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="attendance_proof"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
                                                />
                                                <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP. Maksimal 5MB.</p>
                                            </div>

                                            {selectedFile && (
                                                <div className="text-center">
                                                    <img
                                                        src={URL.createObjectURL(selectedFile)}
                                                        alt="Preview"
                                                        className="mx-auto max-h-32 rounded-lg border shadow-sm"
                                                    />
                                                    <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                                                </div>
                                            )}

                                            {/* Rating */}
                                            <div className="space-y-2">
                                                <Label>
                                                    Rating <span className="text-red-500">*</span>
                                                </Label>
                                                <StarRating rating={rating} onRatingChange={setRating} />
                                                <p className="text-xs text-gray-500">Berikan rating 1-5 bintang</p>
                                            </div>

                                            {/* Review */}
                                            <div className="space-y-2">
                                                <Label htmlFor="review">
                                                    Review <span className="text-red-500">*</span>
                                                </Label>
                                                <textarea
                                                    id="review"
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    placeholder="Bagikan pengalaman Anda..."
                                                    className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700"
                                                    rows={4}
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-500">Maksimal 500 karakter ({reviewText.length}/500)</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowCombinedForm(false);
                                                        resetForm();
                                                    }}
                                                    className="flex-1"
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    onClick={handleSubmitForm}
                                                    disabled={!selectedFile || !reviewText.trim() || rating === 0 || submittingForm}
                                                    className="flex-1"
                                                >
                                                    {submittingForm ? 'Mengirim...' : 'Kirim Data'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Review Already Submitted */}
                            {hasReview && (
                                <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-green-800 dark:text-green-200">✅ Data Telah Lengkap</h2>
                                            <p className="text-xs text-green-600 dark:text-green-400">Terima kasih atas review Anda!</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-green-100 p-3 dark:bg-green-800/50">
                                            <div className="mb-2">
                                                <StarRating rating={webinarItem.rating || 0} readonly />
                                            </div>
                                            <p className="text-sm text-green-800 dark:text-green-200">"{webinarItem.review}"</p>
                                        </div>

                                        {webinarItem.attendance_proof && (
                                            <div className="text-center">
                                                <img
                                                    src={`/storage/${webinarItem.attendance_proof}`}
                                                    alt="Bukti Kehadiran"
                                                    className="mx-auto max-h-32 rounded-lg border shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Certificate Card */}
                            <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 p-2">
                                        <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold italic">Sertifikat</h3>
                                </div>

                                {isLoading && hasCertificate ? (
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
                                ) : null}

                                <div className="relative">
                                    {hasCertificate ? (
                                        <div className={`group ${isLoading ? 'absolute opacity-0' : 'relative opacity-100'}`}>
                                            <iframe
                                                src={`${route('profile.webinar.certificate.preview', { webinar: webinarData.slug })}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
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
                                            Unduh sertifikat sebagai bukti keikutsertaan
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
                                                <a href={route('profile.webinar.certificate', { webinar: webinarData.slug })} target="_blank">
                                                    <Download size={16} className="mr-2" />
                                                    Unduh Sertifikat
                                                </a>
                                            </Button>

                                            <Button variant="outline" className="w-full" asChild>
                                                <a href={route('profile.webinar.certificate.preview', { webinar: webinarData.slug })} target="_blank">
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
                                                ? 'Sertifikat belum dibuat untuk webinar ini.'
                                                : webinarInvoiceStatus !== 'paid'
                                                  ? 'Selesaikan pembayaran untuk mendapatkan sertifikat.'
                                                  : !hasReview
                                                    ? 'Lengkapi bukti kehadiran dan review untuk mendapatkan sertifikat.'
                                                    : 'Sertifikat akan tersedia setelah webinar selesai.'}
                                        </p>
                                        <Button variant="outline" className="mt-3 w-full" disabled>
                                            <Download size={16} className="mr-2" />
                                            {!certificate
                                                ? 'Sertifikat Belum Tersedia'
                                                : webinarInvoiceStatus !== 'paid'
                                                  ? 'Selesaikan Pembayaran'
                                                  : !hasReview
                                                    ? 'Lengkapi Data Diperlukan'
                                                    : 'Menunggu Webinar Selesai'}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Webinar Info Card (for upcoming webinars) */}
                            {!isWebinarFinished && (
                                <div className="rounded-2xl border bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                    <h3 className="mb-4 text-center font-semibold">{webinarData.title}</h3>
                                    <div className="group relative">
                                        <img
                                            src={webinarData.thumbnail ? `/storage/${webinarData.thumbnail}` : '/assets/images/placeholder.png'}
                                            alt={webinarData.title}
                                            className="aspect-video rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                    <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">{webinarData.short_description}</p>
                                    <Button
                                        className="mt-4 w-full"
                                        disabled={webinarInvoiceStatus !== 'paid'}
                                        onClick={() => window.open(webinarData.group_url ?? undefined, '_blank')}
                                    >
                                        <Users size={16} className="mr-2" />
                                        Gabung Grup WA
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
