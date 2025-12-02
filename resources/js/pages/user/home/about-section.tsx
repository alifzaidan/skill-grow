import { SVGProps } from 'react';

export default function AboutSection() {
    return (
        <section className="pt-16 md:pt-20 lg:pt-24 ">
            <div className="relative mx-auto w-full max-w-7xl px-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-bold">Unlock your Potential</h1>
                    <div className="w-fit mx-auto relative md:mt-2">
                        <span className="relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center block">
                            Grow your Skills, Grow your Career
                        </span>
                        <span className="absolute left-2 md:left-4 right-2 md:right-4 -bottom-1 h-4 md:h-6 bg-primary z-0 rounded"></span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-5 lg:gap-10 mt-10 md:px-10 lg:px-20">
                    <div className="relative">
                        <img 
                            src="/assets/images/hero-1.png" 
                            alt="Hero 1"
                            className="mb-8 md:mb-12 lg:mb-18 rounded-lg shadow-lg relative z-10"
                        />
                        <span className="absolute -left-8 right-8 rotate-6 bottom-4 md:bottom-6 h-16 md:h-20 bg-primary z-0 rounded-lg"></span>
                    </div>
                    <div>
                        <img 
                            src="/assets/images/hero-2.png" 
                            alt="Hero 2"
                            className="mt-8 md:mt-12 lg:mt-18 rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="relative">
                        <img 
                            src="/assets/images/hero-3.png" 
                            alt="Hero 3"
                            className="mb-8 md:mb-12 lg:mb-18 rounded-lg shadow-lg relative z-10"
                        />
                        <span className="absolute left-8 -right-8 -rotate-3 bottom-4 md:bottom-10 h-20 md:h-30 bg-primary z-0 rounded-lg"></span>
                    </div>
                </div>
            </div>
        </section>
    );
}
