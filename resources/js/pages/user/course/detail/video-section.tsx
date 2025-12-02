import { Button } from '@/components/ui/button';
import { TransitionPanel } from '@/components/ui/transition-panel';
import { useState } from 'react';

import { Link } from '@inertiajs/react';
import { Star, User } from 'lucide-react';

interface Course {
    title: string;
    short_description?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at: string;
    updated_at: string;
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
    user?: { id: string; name: string; bio: string | null };
}

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
}

export default function VideoSection({ course }: { course: Course }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const items =
        course.modules
            ?.flatMap((module) =>
                (module.lessons?.filter((lesson) => lesson.type === 'video') || []).map((lesson) => ({
                    title: lesson.title,
                    videoUrl: lesson.video_url,
                })),
            )
            .slice(0, 2) || [];

    // Simulate certificate/consultation logic as in hero-section
    const courseCertificate = 'yes' as 'yes' | 'no';
    const courseConsultation = 'yes' as 'yes' | 'no';

    return (
        <section className="to-background from-background via-tertiary dark:via-background dark:to-background relative bg-gradient-to-b py-12 text-gray-900 dark:text-white">
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 animate-spin items-center gap-8 duration-[10s]">
                <div className="bg-primary h-[300px] w-[300px] rounded-full blur-[200px]" />
                <div className="bg-secondary h-[300px] w-[300px] rounded-full blur-[200px]" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <TransitionPanel
                        activeIndex={activeIndex}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        variants={{
                            enter: { opacity: 0, y: -50, filter: 'blur(4px)' },
                            center: { opacity: 1, y: 0, filter: 'blur(0px)' },
                            exit: { opacity: 0, y: 50, filter: 'blur(4px)' },
                        }}
                        className="col-span-2 aspect-video h-full w-full overflow-hidden rounded-xl bg-white shadow"
                    >
                        {items.map((item, index) => (
                            <div key={index} className="aspect-video w-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={
                                        item?.videoUrl?.includes('youtube.com') || item?.videoUrl?.includes('youtu.be')
                                            ? `https://www.youtube.com/embed/${getYoutubeId(item.videoUrl)}`
                                            : ''
                                    }
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full rounded-xl"
                                ></iframe>
                            </div>
                        ))}
                    </TransitionPanel>
                    <div className="col-span-1 flex h-full flex-col gap-6 rounded-xl bg-white p-6 shadow dark:bg-zinc-800">
                        {/* Course Info Panel */}
                        <div>
                            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
                            <p className="mb-4 line-clamp-4 text-sm text-gray-700 dark:text-gray-300">
                                {course.short_description || 'Deskripsi singkat kelas ini.'}
                            </p>
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Rilis:</span>
                                <span>{new Date(course.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="mb-2 flex items-center gap-2 text-xs">
                                <span
                                    className={
                                        course.level === 'beginner'
                                            ? 'rounded bg-green-100 px-2 py-1 font-semibold text-green-700 dark:bg-zinc-800 dark:text-green-300'
                                            : course.level === 'intermediate'
                                              ? 'rounded bg-yellow-100 px-2 py-1 font-semibold text-yellow-700 dark:bg-zinc-800 dark:text-yellow-300'
                                              : 'rounded bg-red-100 px-2 py-1 font-semibold text-red-700 dark:bg-zinc-800 dark:text-red-300'
                                    }
                                >
                                    {course.level === 'beginner' && 'Level Beginner'}
                                    {course.level === 'intermediate' && 'Level Intermediate'}
                                    {course.level === 'advanced' && 'Level Advanced'}
                                </span>
                            </div>
                            <div className="mb-2 flex items-center gap-2 text-xs">
                                <span
                                    className={
                                        courseCertificate === 'yes'
                                            ? 'rounded bg-green-100 px-2 py-1 font-semibold text-green-700 dark:bg-zinc-800 dark:text-green-300'
                                            : 'rounded bg-red-100 px-2 py-1 font-semibold text-red-700 dark:bg-zinc-800 dark:text-red-300'
                                    }
                                >
                                    {courseCertificate === 'yes' ? 'Sertifikat Tersedia' : 'Sertifikat Tidak Tersedia'}
                                </span>
                            </div>
                            <div className="mb-6 flex items-center gap-2 text-xs">
                                <span
                                    className={
                                        courseConsultation === 'yes'
                                            ? 'rounded bg-green-100 px-2 py-1 font-semibold text-green-700 dark:bg-zinc-800 dark:text-green-300'
                                            : 'rounded bg-red-100 px-2 py-1 font-semibold text-red-700 dark:bg-zinc-800 dark:text-red-300'
                                    }
                                >
                                    {courseConsultation === 'yes' ? 'Konsultasi Tersedia' : 'Konsultasi Tidak Tersedia'}
                                </span>
                            </div>
                            <Link
                                href={`/mentor/${course.user?.id}`}
                                className="relative mb-16 flex items-center justify-between gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                {/* Gradient bottom right */}
                                <div className="pointer-events-none absolute right-0 bottom-0 h-27 w-24 rounded-bl-full bg-gradient-to-br from-transparent to-yellow-300 opacity-60" />
                                <div className="relative z-10 flex w-full items-center gap-4">
                                    <div className="rounded-full bg-gray-200 p-2">
                                        <User className="h-10 w-10 text-gray-500" />
                                    </div>
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.user?.name}</h3>
                                        </div>
                                        <p className="mb- text-sm text-gray-600 dark:text-gray-400">{course.user?.bio}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Star size={18} className="text-yellow-500" fill="currentColor" />
                                                <Star size={18} className="text-yellow-500" fill="currentColor" />
                                                <Star size={18} className="text-yellow-500" fill="currentColor" />
                                                <Star size={18} className="text-yellow-500" fill="currentColor" />
                                                <Star size={18} className="text-yellow-500" fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <a href="#register" className="mt-auto w-full">
                                <Button className="w-full">Gabung Sekarang</Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
