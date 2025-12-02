export default function AboutSection() {
    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4">
            <div className="mb-4 text-lg font-semibold text-black">Kenapa Harus Ikut?</div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">Pembicara Ahli</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        Belajar langsung dari para ahli dan praktisi berpengalaman di bidangnya untuk mendapatkan wawasan mendalam.
                    </p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-yellow-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">Sesi Interaktif</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        Manfaatkan sesi tanya jawab langsung untuk berdiskusi, mengklarifikasi keraguan, dan memperluas pemahaman Anda.
                    </p>
                </div>
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-green-200 to-transparent opacity-50 transition group-hover:scale-110" />
                    <h3 className="relative z-10 mb-2 text-2xl font-bold italic">Wawasan Terkini</h3>
                    <p className="text-muted-foreground relative z-10 text-sm">
                        Dapatkan pemahaman mendalam tentang tren dan teknologi terbaru yang relevan dengan perkembangan karir Anda.
                    </p>
                </div>
            </div>
        </section>
    );
}
