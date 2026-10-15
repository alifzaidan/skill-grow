import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { formatExternalUrl } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import {
    BookTextIcon,
    BriefcaseBusiness,
    ExternalLink,
    GraduationCap,
    MessageCircle,
    MonitorPlay,
    Play,
    Presentation,
    TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    title: string;
    slug: string;
    type: 'course' | 'bootcamp' | 'webinar' | 'certification-program';
    routeParam?: string;
    is_scholarship?: boolean;
    progress?: number;
    completed_at?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    group_url?: string;
    enrolled_at: string;
    is_installment?: boolean;
    is_fully_paid?: boolean;
    is_suspended?: boolean;
}

interface ProfileProps {
    stats: {
        courses: number;
        bootcamps: number;
        webinars: number;
        certificationPrograms: number;
        total: number;
    };
    recentProducts: Product[];
}

export default function Profile({ stats, recentProducts }: ProfileProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'en' ? enUS : id;

    const getProductTypeLabel = (type: string): string => {
        switch (type) {
            case 'course':
                return t('profile.dashboard.typeCourse');
            case 'bootcamp':
                return t('profile.dashboard.typeBootcamp');
            case 'webinar':
                return t('profile.dashboard.typeWebinar');
            case 'certification-program':
                return t('profile.dashboard.typeCertification');
            default:
                return t('profile.dashboard.typeProduct');
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
            case 'certification-program':
                return <BriefcaseBusiness className="h-4 w-4" />;
            default:
                return <GraduationCap className="h-4 w-4" />;
        }
    };

    const getProgressBadge = (progress: number) => {
        if (progress === 100) {
            return <Badge className="border-green-300 bg-green-100 text-green-700">{t('profile.dashboard.badgeFinished')}</Badge>;
        } else if (progress > 0) {
            return <Badge className="border-blue-300 bg-blue-100 text-blue-700">{t('profile.dashboard.badgeOngoing')}</Badge>;
        } else {
            return <Badge className="border-gray-300 bg-gray-100 text-gray-700">{t('profile.dashboard.badgeNotStarted')}</Badge>;
        }
    };

    const getProductDetailUrl = (product: Product): string => {
        if (!product.slug) return '#';
        if (product.type === 'certification-program') {
            return route('profile.certification-program.detail', { program: product.slug });
        }
        const paramKey = product.routeParam || product.type;
        return route(`profile.${product.type}.detail`, { [paramKey]: product.slug });
    };

    const formatSchedule = (product: Product): string => {
        if (product.type === 'bootcamp') {
            if (!product.start_date) return '-';
            const startDate = format(new Date(product.start_date), 'dd MMM yyyy', { locale: dateLocale });
            const endDate = product.end_date ? format(new Date(product.end_date), 'dd MMM yyyy', { locale: dateLocale }) : '';
            return endDate ? `${startDate} - ${endDate}` : startDate;
        }

        if (product.type === 'webinar') {
            if (!product.start_time) return '-';
            const startTime = format(new Date(product.start_time), 'dd MMM yyyy, HH:mm', { locale: dateLocale });
            const endTime = product.end_time ? format(new Date(product.end_time), 'HH:mm', { locale: dateLocale }) : '';
            return endTime ? `${startTime} - ${endTime}` : startTime;
        }

        return '-';
    };

    return (
        <UserLayout>
            <Head title={t('profile.dashboard.headTitle')} />
            <ProfileLayout>
                {/* Hero Section with Gradient */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fccd22] via-[#e6b81f] to-white p-8 text-white shadow-xl">
                    <div className="relative z-10">
                        <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-6 w-6" />
                            <span className="text-sm font-medium tracking-wide uppercase">{t('profile.dashboard.badge')}</span>
                        </div>
                        <h1 className="mb-2 text-4xl font-bold italic">{t('profile.dashboard.welcomeBack')}</h1>
                        <p className="text-lg opacity-90">{t('profile.dashboard.welcomeSubtitle')}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card className="group relative overflow-hidden border-2 transition hover:border-[#fccd22] hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-yellow-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('profile.dashboard.totalProducts')}</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-[#fccd22] to-[#200cf5] p-2">
                                <GraduationCap className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{t('profile.dashboard.totalProductsDesc')}</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-[#200cf5] hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('profile.dashboard.courses')}</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-[#200cf5] to-blue-600 p-2">
                                <BookTextIcon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.courses}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{t('profile.dashboard.coursesDesc')}</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-green-500 hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-green-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('profile.dashboard.bootcamps')}</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-2">
                                <Presentation className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.bootcamps}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{t('profile.dashboard.bootcampsDesc')}</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-purple-500 hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-purple-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('profile.dashboard.webinars')}</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-2">
                                <MonitorPlay className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.webinars}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{t('profile.dashboard.webinarsDesc')}</p>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden border-2 transition hover:border-amber-500 hover:shadow-xl">
                        <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-amber-200 to-transparent opacity-0 transition group-hover:opacity-50" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('profile.dashboard.certifications')}</CardTitle>
                            <div className="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-2">
                                <BriefcaseBusiness className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold">{stats.certificationPrograms}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{t('profile.dashboard.certificationsDesc')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Section */}
                <div>
                    <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold italic">{t('profile.dashboard.myProducts')}</h2>
                        <p className="text-muted-foreground">{t('profile.dashboard.myProductsDesc')}</p>
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
                                                            href={getProductDetailUrl(product)}
                                                            className="text-lg font-semibold hover:text-[#200cf5]"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                    </div>
                                                    <Badge variant="outline" className="mb-2">
                                                        {getProductTypeLabel(product.type)}
                                                    </Badge>
                                                    <p className="text-muted-foreground text-sm">
                                                        {product.type === 'course' ? (
                                                            <span>{t('profile.dashboard.selfPaced')}</span>
                                                        ) : product.type === 'certification-program' ? (
                                                            <span>{t('profile.dashboard.certRegistration')}</span>
                                                        ) : (
                                                            formatSchedule(product)
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status/Progress & Actions */}
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                {/* Status/Progress */}
                                                <div className="flex flex-col items-start gap-2 md:items-end">
                                                    {product.type === 'course' ? (
                                                        <div className="flex flex-col items-start gap-1.5 md:items-end">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {product.is_installment && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            product.is_fully_paid
                                                                                ? 'border-green-300 bg-green-50 text-green-700'
                                                                                : product.is_suspended
                                                                                ? 'border-red-300 bg-red-50 text-red-700'
                                                                                : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                        }
                                                                    >
                                                                        {product.is_fully_paid
                                                                            ? t('profile.dashboard.installmentPaid')
                                                                            : product.is_suspended
                                                                            ? t('profile.dashboard.installmentSuspended')
                                                                            : t('profile.dashboard.installmentActive')}
                                                                    </Badge>
                                                                )}
                                                                {getProgressBadge(product.progress || 0)}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={product.progress || 0} className="w-24" />
                                                                <span className="text-sm font-semibold">{product.progress || 0}%</span>
                                                            </div>
                                                        </div>
                                                    ) : product.type === 'certification-program' ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {product.is_installment && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        product.is_fully_paid
                                                                            ? 'border-green-300 bg-green-50 text-green-700'
                                                                            : product.is_suspended
                                                                            ? 'border-red-300 bg-red-50 text-red-700'
                                                                            : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                    }
                                                                >
                                                                    {product.is_fully_paid
                                                                        ? t('profile.dashboard.installmentPaid')
                                                                        : product.is_suspended
                                                                        ? t('profile.dashboard.installmentSuspended')
                                                                        : t('profile.dashboard.installmentActive')}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                                {product.is_scholarship
                                                                    ? t('profile.dashboard.badgeScholarship')
                                                                    : t('profile.dashboard.badgeRegular')}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {product.is_installment && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        product.is_fully_paid
                                                                            ? 'border-green-300 bg-green-50 text-green-700'
                                                                            : product.is_suspended
                                                                            ? 'border-red-300 bg-red-50 text-red-700'
                                                                            : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                                                    }
                                                                >
                                                                    {product.is_fully_paid
                                                                        ? t('profile.dashboard.installmentPaid')
                                                                        : product.is_suspended
                                                                        ? t('profile.dashboard.installmentSuspended')
                                                                        : t('profile.dashboard.installmentActive')}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                                {t('profile.dashboard.badgeRegistered')}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {product.is_installment && !product.is_fully_paid && (
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                        >
                                                            <Link href={route('profile.installments')}>
                                                                {t('profile.dashboard.btnInstallment')}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {product.type === 'course' ? (
                                                        <Button asChild size="sm">
                                                            <Link href={route('profile.course.detail', { course: product.slug })}>
                                                                <Play className="mr-1 h-4 w-4" />
                                                                {t('profile.dashboard.btnLearn')}
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button asChild size="sm" variant="outline">
                                                                <Link href={getProductDetailUrl(product)}>
                                                                    <ExternalLink className="mr-1 h-4 w-4" />
                                                                    {t('profile.dashboard.btnDetail')}
                                                                </Link>
                                                            </Button>
                                                            {product.group_url && (
                                                                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                                                                    <a href={formatExternalUrl(product.group_url)} target="_blank" rel="noopener noreferrer">
                                                                        <MessageCircle className="mr-1 h-4 w-4" />
                                                                        {t('profile.dashboard.btnWaGroup')}
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
                                <h3 className="mb-2 text-xl font-bold">{t('profile.dashboard.emptyTitle')}</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    {t('profile.dashboard.emptyDesc')}
                                </p>
                                <div className="flex gap-3">
                                    <Button asChild className="bg-gradient-to-r from-[#fccd22] to-[#200cf5]">
                                        <Link href={route('course.index')}>{t('profile.dashboard.btnExploreCourses')}</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={route('bootcamp.index')}>{t('profile.dashboard.btnViewBootcamps')}</Link>
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
