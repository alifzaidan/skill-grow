import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Magnetic } from '@/components/ui/magnetic';
import { Link } from '@inertiajs/react';
import { GalleryVerticalEnd, Star } from 'lucide-react';
import { useRef, useState } from 'react';

type Category = {
    id: string;
    name: string;
};

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: Category;
}

interface CourseProps {
    categories: Category[];
    courses: Course[];
    myCourseIds: string[];
}

export default function CoursesSection({ categories, courses, myCourseIds }: CourseProps) {
    const [level, setLevel] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    const categoryRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (categoryRef.current?.offsetLeft ?? 0);
        scrollLeft.current = categoryRef.current?.scrollLeft ?? 0;
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !categoryRef.current) return;
        e.preventDefault();
        const x = e.pageX - categoryRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; // scroll speed
        categoryRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const filteredCourses = courses.filter((course) => {
        const matchSearch = course.title.toLowerCase().includes(search.toLowerCase());
        const matchLevel = level === 'all' ? true : course.level === level;
        const matchCategory = selectedCategory === null ? true : course.category.id === selectedCategory;
        return matchSearch && matchLevel && matchCategory;
    });

    const visibleCourses = filteredCourses.slice(0, visibleCount);

    return (
        <section className="mx-auto w-full max-w-7xl px-4" id="course">
            <div className="bg-primary my-10 rounded-lg p-8 shadow-lg">
                <h2 className="mx-auto mb-4 max-w-4xl text-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
                    Temukan Kelas yang Sesuai dengan Minat dan Tujuan Kariermu
                </h2>
                <p className="mx-auto max-w-4xl text-center text-sm text-gray-600 md:text-base">
                    Di Skill Grow, kamu bisa pilih kelas online yang paling cocok buat kamu. Belajar jadi lebih seru karena sesuai dengan apa yang
                    kamu suka!
                </p>
            </div>

            <div className="mb-4 flex justify-between gap-2">
                <Input type="search" placeholder="Cari kelas..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Filter Tingkat Kesulitan</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Pilih Tingkat Kesulitan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={level} onValueChange={setLevel}>
                            <DropdownMenuRadioItem value="all">Semua</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="beginner">Beginner</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="intermediate">Intermediate</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="advanced">Advanced</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div
                className="mb-4 overflow-x-auto"
                ref={categoryRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ scrollbarWidth: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
            >
                <div className="flex w-max flex-nowrap gap-2 select-none">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className={`rounded-xl border px-4 py-2 text-sm transition hover:cursor-pointer ${
                            selectedCategory === null
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'hover:bg-accent dark:hover:bg-primary/10 bg-background border-gray-300 text-gray-800 dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                        } `}
                    >
                        Semua Kategori
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`rounded-xl border px-4 py-2 text-sm transition hover:cursor-pointer ${
                                selectedCategory === category.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'hover:bg-accent dark:hover:bg-primary/10 bg-background border-gray-300 text-gray-800 dark:border-zinc-100/20 dark:bg-zinc-800 dark:text-zinc-100'
                            } `}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCourses.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                        <img src="/assets/images/not-found.webp" alt="Kelas Belum Tersedia" className="w-48" />
                        <div className="text-center text-gray-500">Belum ada kelas yang tersedia saat ini.</div>
                    </div>
                ) : (
                    visibleCourses.map((course) => {
                        const hasAccess = myCourseIds.includes(course.id);
                        return (
                            <Link
                                key={course.id}
                                href={hasAccess ? `profile/my-courses/${course.slug}` : `/course/${course.slug}`}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${
                                                course.level === 'beginner'
                                                    ? 'bg-green-100 text-green-700'
                                                    : course.level === 'intermediate'
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                        </span>
                                        <span className="bg-primary rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
                                            {course.category.name}
                                        </span>
                                    </div>
                                    {hasAccess && (
                                        <span className="bg-primary absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
                                            Sudah Diambil
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-5">
                                    <div>
                                        <h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{course.title}</h2>
                                        <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div>
                                            {hasAccess ? (
                                                <span className="text-primary text-sm font-semibold">Akses Dimiliki</span>
                                            ) : course.price === 0 ? (
                                                <span className="font-bold text-green-600 dark:text-green-400">Gratis</span>
                                            ) : (
                                                <div>
                                                    {course.strikethrough_price > 0 && (
                                                        <span className="mr-1 text-xs text-red-400 line-through">
                                                            Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                                        </span>
                                                    )}
                                                    <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                                                        Rp {course.price.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-yellow-400" fill="currentColor" />
                                            <span className="text-xs text-gray-500">5.0</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ring-primary pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 transition-opacity group-hover:opacity-100"></div>
                            </Link>
                        );
                    })
                )}
            </div>
            {visibleCount < filteredCourses.length && (
                <div className="mb-8 flex justify-center">
                    <Magnetic>
                        <Button type="button" className="mt-8 hover:cursor-pointer" onClick={() => setVisibleCount((prev) => prev + 6)}>
                            Lihat Lebih Banyak <GalleryVerticalEnd />
                        </Button>
                    </Magnetic>
                </div>
            )}
        </section>
    );
}
