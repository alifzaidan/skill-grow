interface Bootcamp {
    tools?: { name: string; description?: string | null; icon: string | null }[];
}

export default function ToolsSection({ bootcamp }: { bootcamp: Bootcamp }) {
    if (!bootcamp.tools || bootcamp.tools.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4" id="tools">
            <div className="mb-4 text-lg font-semibold text-black">Alat yang Digunakan</div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {bootcamp.tools.map((tool) => (
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
