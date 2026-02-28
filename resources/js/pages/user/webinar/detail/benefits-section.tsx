import { BadgeCheck } from 'lucide-react';

interface Webinar {
    benefits?: string | null;
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

export default function BenefitsSection({ webinar }: { webinar: Webinar }) {
    const benefitList = parseList(webinar.benefits);

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4">
            <div className="mb-4 text-lg font-semibold text-black">Manfaat yang Didapatkan</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </section>
    );
}
