interface Webinar {
    tools?: { name: string; description?: string | null; icon: string | null }[];
}

export default function ToolsSection({ webinar }: { webinar: Webinar }) {
    if (!webinar.tools || webinar.tools.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto mt-2 w-full max-w-7xl px-4 sm:mt-8" id="tools">
            <p className="text-primary border-primary bg-background mb-4 w-fit rounded-full border bg-gradient-to-t from-[#D9E5FF] to-white px-4 py-1 text-sm font-medium shadow-xs">
                Alat yang Digunakan
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {webinar.tools.map((tool) => (
                    <div
                        key={tool.name}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 shadow-md dark:bg-zinc-800"
                    >
                        <img src={tool.icon ? `/storage/${tool.icon}` : '/assets/images/placeholder.png'} alt={tool.name} className="w-16" />
                        <h3 className="text-center text-sm font-semibold md:text-base">{tool.name}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
}
