import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BadgeCheck, Lock, PlayCircle } from 'lucide-react';

interface Course {
    title: string;
    description?: string | null;
    key_points?: string | null;
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            is_free?: boolean;
        }[];
    }[];
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

import { useState } from 'react';

export default function AboutSection({ course }: { course: Course }) {
    const keyPoints = parseList(course.key_points);
    const [expanded, setExpanded] = useState<React.Key | null>('0');
    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8" id="about">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left: Deskripsi & Poin Utama */}
                <div>
                    <div className="mb-4 text-lg font-semibold text-black">Tentang Kelas</div>
                    <p className="mb-6 text-justify text-gray-600 dark:text-gray-400">{course.description}</p>
                    <div className="mb-4 text-lg font-semibold text-black">Poin Utama</div>
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-1">
                        {keyPoints.map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                <BadgeCheck className="mt-1 min-w-12 text-green-600" />
                                <p dangerouslySetInnerHTML={{ __html: req }} />
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Right: Modul Scrollable */}
                <div>
                    <div className="mb-4 text-lg font-semibold text-black">Daftar Isi</div>
                    <div className="custom-scrollbar max-h-[420px] overflow-y-auto pr-2">
                        <Accordion
                            className="flex w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-700"
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            expandedValue={expanded}
                            onValueChange={setExpanded}
                        >
                            {course.modules?.map((module, idx) => (
                                <AccordionItem key={idx} value={String(idx)} className="rounded-lg border-2 border-gray-300 p-4">
                                    <AccordionTrigger className="w-full text-left text-zinc-950 hover:cursor-pointer dark:text-zinc-50">
                                        <div className="flex items-center gap-2">
                                            <div className="border-primary bg-primary/20 text-primary dark:text-primary-foreground rounded-full border px-3 py-1 text-sm font-medium dark:bg-zinc-800">
                                                <p>{idx + 1}</p>
                                            </div>
                                            <p className="md:text-lg">{module.title}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="mt-2 text-sm text-zinc-500 md:text-base dark:text-zinc-400">
                                            {module.lessons?.length ? (
                                                module.lessons.map((lesson, lidx) => (
                                                    <li key={lidx} className="ms-8 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {lesson.is_free ? (
                                                                <PlayCircle size="14" className="text-green-500" />
                                                            ) : (
                                                                <Lock size="14" />
                                                            )}
                                                            <p>{lesson.title}</p>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="ms-8 text-zinc-400">Belum ada materi</li>
                                            )}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
}
