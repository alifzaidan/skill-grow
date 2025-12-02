export default function FeatureSection() {
    return (
        <section className="mx-auto mt-16 mb-10 max-w-7xl px-4">
            <div className="relative mx-auto mb-6 w-fit">
                <span className="relative z-10 block text-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
                    Belajar Tak Harus Rumit, Bersama Skillgrow
                </span>
                <span className="bg-primary absolute right-0 -bottom-1 left-0 z-0 h-3 rounded md:h-4"></span>
            </div>

            <p className="mx-auto mt-6 max-w-5xl text-center text-sm text-gray-600 md:text-base">
                Skill Grow hadir sebagai partner terbaik untuk upgrade skill di bidang Business & Management, Digital Marketing, dan Information &
                Technology. Dapatkan pelatihan berkualitas, materi relevan industri, dan bimbingan dari para ahli untuk mendorong kariermu ke level
                berikutnya.
            </p>
            <div className="mx-2 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <img
                    src="/assets/images/hero-1.png"
                    alt="Image hero-1 1"
                    className="h-48 w-full rounded-t-lg object-cover md:rounded-tl-lg md:rounded-tr-none lg:rounded-l-lg lg:rounded-tr-none lg:rounded-br-none"
                />
                <img
                    src="/assets/images/hero-2.png"
                    alt="Image hero-1 2"
                    className="hidden h-48 w-full object-cover md:block md:rounded-tr-lg lg:rounded-none"
                />
                <img src="/assets/images/hero-3.png" alt="Image hero-1 3" className="h-48 w-full object-cover md:rounded-bl-lg lg:rounded-none" />
                <img
                    src="/assets/images/hero-4.png"
                    alt="Image hero-1 4"
                    className="h-48 w-full rounded-b-lg object-cover md:rounded-br-lg md:rounded-bl-none lg:rounded-r-lg lg:rounded-tr-lg lg:rounded-bl-none"
                />
            </div>
        </section>
    );
}
