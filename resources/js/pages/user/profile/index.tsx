import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookTextIcon, ExternalLink, GraduationCap, MessageCircle, MonitorPlay, Play, Presentation, TrendingUp } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    slug: string;
    type: 'course' | 'bootcamp' | 'webinar';
    progress?: number;
    completed_at?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    group_url?: string;
    enrolled_at: string;
}

interface ProfileProps {
    stats: {
        courses: number;
        bootcamps: number;
        webinars: number;
        total: number;
    };
    recentProducts: Product[];
}

export default function Profile({ stats, recentProducts }: ProfileProps) {
    const getProductTypeLabel = (type: string): string => {
        switch (type) {
            case 'course':
                return 'Kelas Online';
            case 'bootcamp':
                return 'Bootcamp';
            case 'webinar':
                return 'Webinar';
            default:
                return 'Produk';
        }
    };

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'course':
                return <BookTextIcon className="h-4 w-4" />;
            case 'bootcamp':
                return <Presentation className="h-4 w-4" />;
            case 'webinar':
                return <MonitorPlay className="h-4 w-4" />;
            default:
                return <GraduationCap className="h-4 w-4" />;
        }
    };

    const getProgressBadge = (progress: number) => {
        if (progress === 100) {
            return <Badge className="border-green-300 bg-green-100 text-green-700">Selesai</Badge>;
        } else if (progress > 0) {
            return <Badge className="border-blue-300 bg-blue-100 text-blue-700">Berlangsung</Badge>;
        } else {
            return <Badge className="border-gray-300 bg-gray-100 text-gray-700">Belum Dimulai</Badge>;
        }
    };

    const formatSchedule = (product: Product): string => {
        if (product.type === 'bootcamp') {
            const startDate = format(new Date(product.start_date!), 'dd MMM yyyy', { locale: id });
            const endDate = product.end_date ? format(new Date(product.end_date), 'dd MMM yyyy', { locale: id }) : '';
            return endDate ? `${startDate} - ${endDate}` : startDate;
        }

        if (product.type === 'webinar') {
            const startTime = format(new Date(product.start_time!), 'dd MMM yyyy, HH:mm', { locale: id });
            const endTime = product.end_time ? format(new Date(product.end_time), 'HH:mm', { locale: id }) : '';
            return endTime ? `${startTime} - ${endTime}` : startTime;
        }

        return '-';
    };

    return (
        <UserLayout>
            <Head title="Profil" />
            <ProfileLayout>
                {/* Hero Section with Gradient */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fccd22] via-[#e6b81f] to-white p-8 text-white shadow-xl">
                    <div className="relative z-10">
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-6 w-6" />
                            <span className="text-sm font-medium tracking-wide uppercase">Dashboard</span>
                        </div>
                        <h1 className="mb-2 text-4xl font-bold italic">Selamat Datang Kembali!</h1>
                        <p className="text-lg opacity-90">Pantau aktivitas dan progres belajar Anda di sini.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="group relative overflow-hidden border-2 transition hover:border-[#fccd22] hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-yellow-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] p-2">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Total item yang Anda ikuti</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-[#200cf5] hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kelas Online</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-[#200cf5] to-blue-600 p-2">
                                <BookTextIcon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.courses}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Kelas yang telah Anda beli</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-green-500 hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-green-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bootcamp</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-2">
                                <Presentation className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.bootcamps}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Bootcamp yang Anda ikuti</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-purple-500 hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-purple-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Webinar</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-2">
                                <MonitorPlay className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.webinars}</div>
                            <p className="text-muted-foreground mt-1 text-xs">Webinar yang Anda ikuti</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Table */}
                <div>
                    <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold italic">Produk Saya</h2>
                        <p className="text-muted-foreground">Daftar produk yang telah Anda beli dan ikuti.</p>
                    </div>

                    {recentProducts.length > 0 ? (
                        <div className="grid gap-4">
                            {recentProducts.map((product) => (
                                <Card key={`${product.type}-${product.id}`} className="group overflow-hidden transition hover:shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            {/* Product Info */}
                                            <div className="flex flex-1 items-start gap-4">
                                                <div className="rounded-lg bg-gradient-to-br from-[#fccd22] to-[#200cf5] p-3">
                                                    {getProductTypeIcon(product.type)}
                                                    <span className="sr-only">{getProductTypeLabel(product.type)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Link
                                                            href={route(`profile.${product.type}.detail`, {
                                                                [product.type]: product.slug,
                                                            })}
                                                            className="text-lg font-semibold hover:text-[#200cf5]"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                    </div>
                                                    <Badge variant="outline" className="mb-2">
                                                        {getProductTypeLabel(product.type)}
                                                    </Badge>
                                                    <p className="text-muted-foreground text-sm">
                                                        {product.type === 'course' ? <span>Belajar Mandiri</span> : formatSchedule(product)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status/Progress */}
                                            <div className="flex items-center gap-4">
                                                {product.type === 'course' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            {getProgressBadge(product.progress || 0)}
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Progress value={product.progress || 0} className="w-24" />
                                                                <span className="text-sm font-semibold">{product.progress || 0}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                        Terdaftar
                                                    </Badge>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {product.type === 'course' ? (
                                                        <Button asChild size="sm">
                                                            <Link href={route('profile.course.detail', { course: product.slug })}>
                                                                <Play className="mr-1 h-4 w-4" />
                                                                Belajar
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link
                                                                    href={route(`profile.${product.type}.detail`, {
                                                                        [product.type]: product.slug,
                                                                    })}
                                                                >
                                                                    <ExternalLink className="mr-1 h-4 w-4" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                            {product.group_url && (
                                                                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                                                                    <a href={product.group_url} target="_blank" rel="noopener noreferrer">
                                                                        <MessageCircle className="mr-1 h-4 w-4" />
                                                                        Grup
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-6 rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] p-6">
                                    <GraduationCap className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">Belum Ada Produk</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Anda belum memiliki produk apapun. Mulai jelajahi dan pilih kelas, bootcamp, atau webinar yang sesuai dengan
                                    kebutuhan Anda.
                                </p>
                                <div className="flex gap-3">
                                    <Button asChild className="bg-gradient-to-r from-[#fccd22] to-[#200cf5]">
                                        <Link href={route('course.index')}>Jelajahi Kelas</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={route('bootcamp.index')}>Lihat Bootcamp</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
