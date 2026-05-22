import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { Link } from '@inertiajs/react';
import { BadgeCheck, Star } from 'lucide-react';

interface Mentor {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
}

interface CertificationProgram {
    description?: string | null;
    benefits?: string | null;
    terms_conditions?: string | null;
    scholarship_flow?: string | null;
    type: 'regular' | 'scholarship';
    mentors: Mentor[];
}

function sanitizeListText(value: string): string {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseList(items?: string | null): string[] {
    if (!items) return [];

    const normalized = items.replace(/<br\s*\/?>/gi, '\n').trim();
    const liMatches = normalized.match(/<li[^>]*>[\s\S]*?<\/li>/gi);

    if (liMatches?.length) {
        return liMatches.map((li) => sanitizeListText(li.replace(/<\/?li[^>]*>/gi, ''))).filter(Boolean);
    }

    return normalized
        .split(/\r?\n/)
        .map((line) => line.replace(/^(?:[\s•*-]+|✔(?:️)?|✅|☑(?:️)?)+/gu, '').trim())
        .map((line) => sanitizeListText(line))
        .filter(Boolean)
        .filter((line) => !line.endsWith(':'));
}

export default function KeyPointsSection({ program }: { program: CertificationProgram }) {
    const getInitials = useInitials();
    const benefitList = parseList(program.benefits);
    const termsList = parseList(program.terms_conditions);
    const flowList = parseList(program.scholarship_flow);

    return (
        <div className="space-y-8 pb-8">
            {/* Benefits & Terms */}
            {(benefitList.length > 0 || termsList.length > 0) && (
                <section className="mx-auto mt-8 w-full max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {benefitList.length > 0 && (
                            <div>
                                <div className="mb-4 text-lg font-semibold text-black">Manfaat Program</div>
                                <div className="space-y-4">
                                    {benefitList.map((benefit, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                                        >
                                            <BadgeCheck className="mt-1 min-w-6 text-green-600" size={24} />
                                            <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {termsList.length > 0 && (
                            <div>
                                <div className="mb-4 text-lg font-semibold text-black">Syarat & Ketentuan</div>
                                <div className="space-y-4">
                                    {termsList.map((term, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                                        >
                                            <BadgeCheck className="mt-1 min-w-6 text-green-600" size={24} />
                                            <p className="text-gray-700 dark:text-gray-300">{term}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Scholarship Flow */}
            {program.type === 'scholarship' && flowList.length > 0 && (
                <section className="mx-auto w-full max-w-7xl px-4 mt-8">
                    <div className="mb-4 text-lg font-semibold text-black">Alur Beasiswa</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {flowList.map((flow, idx) => (
                            <div
                                key={idx}
                                className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                    {idx + 1}
                                </div>
                                <p className="mt-1 text-gray-700 dark:text-gray-300">{flow}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Description */}
            {program.description && (
                <section className="mx-auto w-full max-w-7xl px-4 mt-8">
                    <div className="mb-4 text-lg font-semibold text-black">Tentang Program</div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: program.description }} />
                    </div>
                </section>
            )}

            {/* Mentors */}
            {program.mentors && program.mentors.length > 0 && (
                <section className="mx-auto mt-8 w-full max-w-7xl px-4">
                    <div className="mb-4 text-lg font-semibold text-black">Mentor Program</div>
                    <div className="space-y-4">
                        {program.mentors.map((mentor) => (
                            <Link
                                key={mentor.id}
                                href={`/mentor/${mentor.id}`}
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <div className="flex w-full items-center gap-4">
                                    <Avatar className="ring-primary/20 h-12 w-12 ring-4 md:h-16 md:w-16">
                                        <AvatarImage src={mentor.avatar ? `/storage/${mentor.avatar}` : undefined} alt={mentor.name} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold md:text-3xl">
                                            {getInitials(mentor.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{mentor.name}</h3>
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{mentor.bio}</p>
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
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
