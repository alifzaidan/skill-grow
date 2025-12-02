import { InfiniteSlider } from '@/components/ui/infinite-slider';

export default function GrowSection() {
    const companies = [
        'PT Bious Inovasi Indonesia',
        'PT Berau Karya Bersama',
        'PT Beautindo Prima',
        'PT Usaha Yakin Bisa',
        'PT Cakrawala Automotif Rabasha',
        'PT Berkat Usaha Jaya Banjarbaru',
        'Gowsindo Law Firm',
        'Jaga Planet Indonesia',
        'Marachel Design Academy',
        'PT Far East Conmix',
        'Barusa',
        'PT Tawon Mas Sukses Surabaya',
        'PT Sinar Jaya Elektrikal',
        'PT Berkah Ridho Cinta Indonesia',
        'Atlas Copco Indonesia',
        'PT Sugi Harti',
    ];

    const companies2 = [
        'PT Berkat Usaha Jaya Banjarbaru',
        'Gowsindo Law Firm',
        'Jaga Planet Indonesia',
        'Marachel Design Academy',
        'PT Far East Conmix',
        'PT Berkat Usaha Jaya Banjarbaru',
        'Gowsindo Law Firm',
        'Jaga Planet Indonesia',
        'Marachel Design Academy',
        'PT Far East Conmix',
    ];
    const companies3 = [
        'Barusa',
        'PT Tawon Mas Sukses Surabaya',
        'PT Sinar Jaya Elektrikal',
        'PT Berkah Ridho Cinta Indonesia',
        'Atlas Copco Indonesia',
        'PT Sugi Harti',
        'Barusa',
        'PT Tawon Mas Sukses Surabaya',
        'PT Sinar Jaya Elektrikal',
        'PT Berkah Ridho Cinta Indonesia',
        'Atlas Copco Indonesia',
        'PT Sugi Harti',
    ];

    return (
        <section className="mt-10 mb-10 mx-auto w-full px-2 sm:px-4 max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center font-bold">Grow Your Skills,</h1>
            <div className="w-full sm:w-fit mx-auto relative">
                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center block">
                    Shape Your Future!
                </span>
                <span className="absolute left-2 right-2 -bottom-1 h-4 bg-primary z-0 rounded"></span>
            </div>
            <p className="text-center text-sm sm:text-sm md:text-md lg:text-base text-gray-600 mt-4 sm:mt-6 w-full sm:w-[90%] md:w-[700px] mx-auto">
                Bangga berkontribusi dalam perjalanan pengembangan karir ribuan peserta yang berasal dari berbagai bidang perusahaan
            </p>
            <div className="mt-6">
                <InfiniteSlider gap={8} speed={60} className="sm:gap-8 md:gap-12 lg:gap-16">
                    {companies.map((name, idx) => (
                        <span
                            key={idx}
                            className="mx-4 sm:mx-8 text-sm sm:text-sm md:text-md lg:text-base font-medium text-forground whitespace-nowrap"
                        >
                            {name}
                        </span>
                    ))}
                </InfiniteSlider>
            </div>
            <div className="mt-6">
                <InfiniteSlider gap={8} speed={60} reverse className="sm:gap-8 md:gap-12 lg:gap-16">
                    {companies2.map((name, idx) => (
                        <span
                            key={idx}
                            className="mx-4 sm:mx-8 text-sm sm:text-sm md:text-md lg:text-base font-medium text-forground whitespace-nowrap"
                        >
                            {name}
                        </span>
                    ))}
                </InfiniteSlider>
            </div>
            <div className="mt-6">
                <InfiniteSlider gap={8} speed={60} className="sm:gap-8 md:gap-12 lg:gap-16">
                    {companies3.map((name, idx) => (
                        <span
                            key={idx}
                            className="mx-4 sm:mx-8 text-sm sm:text-sm md:text-md lg:text-base font-medium text-forground whitespace-nowrap"
                        >
                            {name}
                        </span>
                    ))}
                </InfiniteSlider>
            </div>
        </section>
    );
}