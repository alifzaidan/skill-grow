import { BookOpen, CheckCircle2 } from 'lucide-react';

interface Bootcamp {
    curriculum?: string | null;
}

function parseCurriculum(curriculum?: string | null): string[] {
    if (!curriculum) return [];
    const matches = curriculum.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function TimelineSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const curriculumList = parseCurriculum(bootcamp.curriculum);

    if (curriculumList.length === 0) {
        return null;
    }

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
                    <div className="mb-4 text-lg font-semibold text-white">Manfaat yang Didapatkan</div>
                    <h2 className="mb-4 bg-gradient-to-r from-[#fccd22] via-white to-[#200cf5] bg-clip-text text-3xl font-bold text-transparent italic sm:text-4xl">
                        Materi yang akan kamu pelajari
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-300">
                        Kurikulum terstruktur yang dirancang untuk membawa Anda dari pemula hingga mahir
                    </p>
                </div>

                {/* Timeline Grid */}
                <div className="relative space-y-6">
                    {curriculumList.map((curriculum, idx) => (
                        <div key={idx} className="group relative">
                            {/* Connector Line */}
                            {idx < curriculumList.length - 1 && (
                                <div className="absolute top-14 left-6 h-full w-0.5 bg-gradient-to-b from-[#fccd22] to-[#200cf5] opacity-30" />
                            )}

                            {/* Card */}
                            <div className="relative flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10">
                                {/* Number Badge */}
                                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] font-bold text-white shadow-lg">
                                    {idx + 1}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] opacity-0 blur-md transition group-hover:opacity-50" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <BookOpen size={18} className="text-[#fccd22]" />
                                        <span className="text-xs font-medium tracking-wide text-[#fccd22] uppercase">Modul {idx + 1}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{curriculum}</h3>
                                </div>

                                {/* Check Icon */}
                                <CheckCircle2 size={20} className="flex-shrink-0 text-green-400 opacity-0 transition group-hover:opacity-100" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 backdrop-blur-sm">
                        <BookOpen size={20} className="text-[#fccd22]" />
                        <span className="text-white">
                            <span className="font-semibold">{curriculumList.length} Modul</span> pembelajaran terstruktur
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
