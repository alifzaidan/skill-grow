import { TextScramble } from '@/components/ui/text-scramble';

export default function ProgramSection() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10 md:my-20 mx-auto max-w-7xl px-4">
            <div className="relative hidden md:block col-span-1">
                <img 
                    src="/assets/images/about.png" 
                    alt="About Skill Grow"
                    className="relative z-10 mb-8 h-full rounded-lg object-cover object-right shadow-lg md:mb-12 lg:mb-18"
                />
                <span className="bg-primary absolute -right-8 -bottom-10 left-8 z-0 h-30 -rotate-2 rounded-lg md:h-48"></span>
            </div>
            <div className="z-10 col-span-2 flex flex-col justify-center rounded-lg bg-white p-6 shadow-lg">
                <h2 className="text-forground mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Mengapa Memilih Skill Grow?</h2>
                <p className="text-sm sm:text-sm md:text-md lg:text-base text-gray-600">
                    Skill Grow adalah platform yang dirancang untuk membantu Anda mengembangkan keterampilan dan mencapai tujuan karir Anda. Buka
                    potensi dan kembangkan keterampilan diri bersama para instruktur berkompeten yang mendukung pengembangan karir masa depan!!
                </p>
                <div id="countup-section" className="bg- mt-6 grid grid-cols-1 gap-4 rounded-lg bg-black p-4 text-white md:grid-cols-2">
                    <div className="flex flex-col items-center">
                        <div id="countup-students" className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold" data-value="2507">
                            <TextScramble className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold" characterSet='1234567890' duration={2}>2507</TextScramble>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300">Total Students</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div id="countup-partners" className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold" data-value="28">
                            <TextScramble className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold" characterSet='1234567890' duration={2}>28</TextScramble>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300">Partner Kerjasama</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
