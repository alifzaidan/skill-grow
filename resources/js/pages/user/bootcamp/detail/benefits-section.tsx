import { BadgeCheck } from 'lucide-react';

interface Bootcamp {
    benefits?: string | null;
    requirements?: string | null;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function BenefitsSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const benefitList = parseList(bootcamp.benefits);
    const requirementList = parseList(bootcamp.requirements);

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Benefits */}
                <div>
                    <div className="mb-4 text-lg font-semibold text-black">Manfaat yang Didapatkan</div>
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

                {/* Requirements */}
                <div>
                    <div className="mb-4 text-lg font-semibold text-black">Persyaratan Peserta</div>
                    <div className="space-y-4">
                        {requirementList.map((req, idx) => (
                            <div
                                key={idx}
                                className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                            >
                                <BadgeCheck className="mt-1 min-w-6 text-green-600" size={24} />
                                <p className="text-gray-700 dark:text-gray-300">{req}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
