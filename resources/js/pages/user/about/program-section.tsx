import { TextScramble } from '@/components/ui/text-scramble';

export default function ProgramSection() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10 md:my-20 mx-auto max-w-7xl px-4">
            <div className="relative hidden md:block col-span-1">
                <img 
                    src="/assets/images/about.png" 
                    alt="About Skill Grow"
                    className="mb-8 md:mb-12 h-full object-cover object-right lg:mb-18 rounded-lg shadow-lg relative z-10"
                />
                <span className="absolute left-8 -right-8 -rotate-2 -bottom-10 h-30 md:h-48 bg-primary z-0 rounded-lg"></span>
            </div>
            <div className="col-span-2 p-6 bg-white shadow-lg rounded-lg z-10 flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl font-bold text-forground mb-4">Mengapa Memilih Skill Grow?</h2>
                <p className="text-gray-600 text-sm md:text-base">
                    Skill Grow adalah platform yang dirancang untuk membantu Anda mengembangkan
                    keterampilan dan mencapai tujuan karir Anda. Buka potensi dan kembangkan keterampilan diri bersama para
                    instruktur berkompeten yang mendukung pengembangan karir masa depan!!
                </p>
                <div id="countup-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg- p-4 rounded-lg bg-black text-white">
                    <div className="flex flex-col items-center">
                        <div id="countup-students" className="text-4xl font-bold" data-value="2507">
                            <TextScramble className=" text-4xl font-bold" characterSet='1234567890' duration={2}>2507</TextScramble>
                        </div>
                        <p className="text-sm text-gray-300">Total Students</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div id="countup-partners" className="text-4xl font-bold" data-value="28">
                            <TextScramble className=" text-4xl font-bold" characterSet='1234567890' duration={2}>28</TextScramble>
                        </div>
                        <p className="text-sm text-gray-300">Partner Kerjasama</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
