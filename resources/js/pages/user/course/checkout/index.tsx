import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BadgeCheck, Calendar, Check, Hourglass, RotateCcw, ShoppingCart, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    strikethrough_price: number;
    price: number;
    key_points?: string | null;
    level: 'beginner' | 'intermediate' | 'advanced';
    modules?: {
        title: string;
        description?: string | null;
        lessons?: {
            title: string;
            description?: string | null;
            type: 'text' | 'video' | 'file' | 'quiz';
            attachment?: string | null;
            video_url?: string | null;
            is_free?: boolean;
        }[];
    }[];
}

interface DiscountData {
    valid: boolean;
    discount_amount: number;
    final_amount: number;
    discount_code: {
        id: string;
        code: string;
        name: string;
        type: string;
        formatted_value: string;
    };
    message?: string;
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

interface PendingInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    payment_method: string;
    payment_channel: string;
    invoice_url?: string | null;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

interface InvoiceData {
    type: string;
    id: string;
    discount_amount: number;
    nett_amount: number;
    transaction_fee: number;
    total_amount: number;
    discount_code_id?: string;
    discount_code_amount?: number;
    referral_code?: string;
    points_redeemed?: number;
}

export default function CheckoutCourse({
    course,
    hasAccess,
    pendingInvoice,
    referralInfo,
}: {
    course: Course;
    hasAccess: boolean;
    pendingInvoice?: PendingInvoice | null;
    referralInfo: ReferralInfo;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number && auth.user?.instance && auth.user?.city;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancellingInvoice, setCancellingInvoice] = useState(false);

    // Guest Form State
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [guestFormData, setGuestFormData] = useState<{
        name: string;
        email: string;
        phone_number: string;
        instance: string;
        city: string;
    }>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        city: '',
    });

    const updateGuestForm = (field: keyof typeof guestFormData, value: string) => {
        setGuestFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Referral & Points State
    const [codeType, setCodeType] = useState<'voucher' | 'referral'>('voucher');
    const [userPoints, setUserPoints] = useState(0);
    const [pointsChecked, setPointsChecked] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointsError, setPointsError] = useState('');

    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [referralData, setReferralData] = useState<{ valid: boolean; referrer?: { name: string } } | null>(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');

    const isFree = course.price === 0;

    const benefitList = parseList(course.key_points);
    const requirementList = ["Peralatan dasar (laptop/PC)", "Koneksi internet stabil", "Semangat belajar"];
    const curriculumList = course.modules?.map((m) => m.title) || [];

    const transactionFee = 5000;
    const basePrice = course.price;
    const discountAmount = codeType === 'voucher' && discountData?.valid ? discountData.discount_amount : 0;
    const maxPointsAllowed = basePrice - discountAmount;
    const finalCoursePrice = basePrice - discountAmount - (pointsChecked ? pointsToUse : 0);
    const totalPrice = isFree ? 0 : (finalCoursePrice > 0 ? finalCoursePrice + transactionFee : 0);

    // Load points balance on mount
    useEffect(() => {
        if (isLoggedIn) {
            axios.get('/api/user/points')
                .then((response) => {
                    setUserPoints(response.data.point_balance || 0);
                })
                .catch((err) => {
                    console.error('Failed to load points balance:', err);
                });
        }
    }, [isLoggedIn]);

    // Check email for guest
    useEffect(() => {
        if (isLoggedIn) return;

        const email = guestFormData.email.trim();
        if (!email || !email.includes('@')) {
            setEmailExists(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingEmail(true);

            try {
                const response = await axios.post('/api/check-email', { email });
                const data = response.data;

                if (data.exists) {
                    setEmailExists(true);
                    setGuestFormData((prev) => ({
                        ...prev,
                        name: data.name || prev.name,
                        phone_number: data.phone_number || prev.phone_number,
                        instance: data.instance || prev.instance,
                        city: data.city || prev.city,
                    }));
                    setUserPoints(data.point_balance || 0);
                } else {
                    setEmailExists(false);
                    setUserPoints(0);
                    setPointsChecked(false);
                    setPointsToUse(0);
                }
            } catch {
                setEmailExists(false);
                setUserPoints(0);
                setPointsChecked(false);
                setPointsToUse(0);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [guestFormData.email, isLoggedIn]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo?.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

    const validatePromoCode = useCallback(async () => {
        if (!promoCode.trim() || isFree) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: Record<string, string | number> = {
                code: promoCode,
                amount: course.price,
                product_type: 'course',
                product_id: course.id,
            };

            if (!isLoggedIn && emailExists && guestFormData.email) {
                requestData.email = guestFormData.email;
            }

            const response = await axios.post('/api/discount-codes/validate', requestData);
            const data = response.data;

            if (data.valid) {
                setDiscountData(data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(data.message || 'Kode promo tidak valid');
            }
        } catch (error: unknown) {
            setDiscountData(null);
            if (axios.isAxiosError(error)) {
                setPromoError(error.response?.data?.message || 'Terjadi kesalahan saat memvalidasi kode promo');
            } else {
                setPromoError('Terjadi kesalahan saat memvalidasi kode promo');
            }
        } finally {
            setPromoLoading(false);
        }
    }, [promoCode, isFree, course.price, course.id, isLoggedIn, emailExists, guestFormData.email]);

    const validateReferralCode = useCallback(async () => {
        if (!promoCode.trim() || isFree) return;

        setReferralLoading(true);
        setReferralError('');

        try {
            const response = await axios.post('/api/referral/validate', {
                code: promoCode,
            });
            const data = response.data;

            if (data.valid) {
                setReferralData(data);
                setReferralError('');
            } else {
                setReferralData(null);
                setReferralError(data.message || 'Kode referral tidak valid');
            }
        } catch (error: unknown) {
            setReferralData(null);
            if (axios.isAxiosError(error)) {
                setReferralError(error.response?.data?.message || 'Terjadi kesalahan saat memvalidasi kode referral');
            } else {
                setReferralError('Terjadi kesalahan saat memvalidasi kode referral');
            }
        } finally {
            setReferralLoading(false);
        }
    }, [promoCode, isFree]);

    useEffect(() => {
        if (!promoCode.trim() || isFree) {
            setDiscountData(null);
            setReferralData(null);
            setPromoError('');
            setReferralError('');
            return;
        }

        const timer = setTimeout(() => {
            if (codeType === 'voucher') {
                void validatePromoCode();
            } else {
                void validateReferralCode();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [promoCode, isFree, codeType, validatePromoCode, validateReferralCode]);

    const handleFreeCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        router.post(
            route('enroll.free'),
            {
                type: 'course',
                id: course.id,
            },
            {
                onError: (errors) => {
                    console.log('Free enrollment errors:', errors);
                    alert(errors.message || 'Gagal mendaftar kelas gratis.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const submitPayment = async (): Promise<void> => {
        const originalDiscountAmount = course.strikethrough_price > 0 ? course.strikethrough_price - course.price : 0;
        const promoDiscountAmount = codeType === 'voucher' && discountData?.valid ? discountData.discount_amount : 0;

        const invoiceData: InvoiceData = {
            type: 'course',
            id: course.id,
            discount_amount: originalDiscountAmount + promoDiscountAmount,
            nett_amount: finalCoursePrice,
            transaction_fee: transactionFee,
            total_amount: totalPrice,
        };

        if (codeType === 'voucher' && discountData?.valid) {
            invoiceData.discount_code_id = discountData.discount_code.id;
            invoiceData.discount_code_amount = discountData.discount_amount;
        } else if (codeType === 'referral' && referralData?.valid) {
            invoiceData.referral_code = promoCode;
        }

        if (pointsChecked && pointsToUse > 0) {
            invoiceData.points_redeemed = pointsToUse;
        }

        try {
            const res = await axios.post(route('invoice.store'), invoiceData);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error('Payment URL tidak diterima dari server.');
                }
            } else {
                throw new Error(res.data?.message || 'Gagal membuat invoice.');
            }
        } catch (error: unknown) {
            console.error('Payment error:', error);
            throw error;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Jika belum login, proses autentikasi (auto-login atau register) terlebih dahulu
        if (!isLoggedIn) {
            if (!guestFormData.email || !guestFormData.phone_number || !guestFormData.instance || !guestFormData.city) {
                alert('Harap lengkapi seluruh data diri terlebih dahulu.');
                return;
            }

            if (!termsAccepted && !isFree) {
                alert('Anda harus menyetujui syarat dan ketentuan!');
                return;
            }

            setLoading(true);

            try {
                if (emailExists) {
                    const loginResponse = await axios.post(route('auto-login'), {
                        email: guestFormData.email,
                        phone_number: guestFormData.phone_number,
                        instance: guestFormData.instance,
                        city: guestFormData.city,
                    });

                    if (!loginResponse.data?.success) {
                        throw new Error(loginResponse.data?.message || 'Login otomatis gagal.');
                    }
                } else {
                    if (!guestFormData.name) {
                        alert('Nama wajib diisi.');
                        setLoading(false);
                        return;
                    }

                    await axios.post(route('register'), {
                        name: guestFormData.name,
                        email: guestFormData.email,
                        phone_number: guestFormData.phone_number,
                        instance: guestFormData.instance,
                        city: guestFormData.city,
                        password: guestFormData.phone_number,
                        password_confirmation: guestFormData.phone_number,
                        affiliate_code: (codeType === 'referral' && referralData?.valid) ? promoCode : (referralInfo?.code || sessionStorage.getItem('referral_code') || ''),
                    });
                }

                if (isFree) {
                    return handleFreeCheckout(e);
                }

                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment();
            } catch (error: unknown) {
                console.error('Login/Register error:', error);
                setLoading(false);
                if (axios.isAxiosError(error)) {
                    alert(error.response?.data?.message || 'Gagal memproses pendaftaran.');
                } else {
                    alert(error instanceof Error ? error.message : 'Gagal memproses pendaftaran.');
                }
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted && !isFree) {
            alert('Anda harus menyetujui syarat dan ketentuan!');
            return;
        }

        if (isFree) {
            return handleFreeCheckout(e);
        }

        setLoading(true);
        try {
            await submitPayment();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Gagal memproses pembayaran.');
            } else {
                alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat proses pembayaran.');
            }
            setLoading(false);
        }
    };

    const handleCancelInvoice = async () => {
        if (!pendingInvoice?.id) return;
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

        setCancellingInvoice(true);
        try {
            const response = await axios.post(route('invoice.cancel', { id: pendingInvoice.id }));
            if (response.data?.success || response.status === 200) {
                alert('Pesanan berhasil dibatalkan.');
                window.location.reload();
            } else {
                alert(response.data?.message || 'Gagal membatalkan pesanan.');
            }
        } catch (error: unknown) {
            console.error('Cancel invoice error:', error);
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Gagal membatalkan pesanan.');
            } else {
                alert('Gagal membatalkan pesanan.');
            }
        } finally {
            setCancellingInvoice(false);
        }
    };

    const formatExpiryTime = (expiresAt: string): { time: string; status: 'expired' | 'urgent' | 'normal' } => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
            return { time: 'Sudah kadaluarsa', status: 'expired' };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return { time: `${minutes} menit lagi`, status: 'urgent' };
        }

        return { time: `${hours} jam ${minutes} menit lagi`, status: hours < 3 ? 'urgent' : 'normal' };
    };

    const continuePendingPayment = () => {
        if (pendingInvoice?.invoice_url) {
            window.location.href = pendingInvoice.invoice_url;
            return;
        }

        window.location.reload();
    };

    return (
        <UserLayout>
            <Head title="Checkout Kelas" />
            <div className="min-h-screen w-full bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detail Pesanan Card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <img
                                        src={course.thumbnail ? `/storage/${course.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={course.title}
                                        className="w-full md:w-64 h-36 rounded-xl object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                                {course.title}
                                            </h4>
                                            {course.description ? (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    {course.description}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    Kelas online interaktif untuk belajar mandiri secara mendalam.
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-md inline-block uppercase tracking-wider">
                                                KELAS ONLINE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Card */}
                            <Tabs defaultValue="benefits" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 p-1 rounded-xl h-11 border border-gray-100">
                                    <TabsTrigger 
                                        value="benefits" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        Manfaat
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="requirements" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        Persyaratan
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="curriculum" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        Kurikulum
                                    </TabsTrigger>
                                </TabsList>
                                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <TabsContent value="benefits" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">Yang akan kamu dapatkan</h4>
                                        {benefitList.length > 0 ? (
                                            <ul className="space-y-3">
                                                {benefitList.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mt-0.5">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </span>
                                                        <span className="leading-tight">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Tidak ada detail manfaat.</p>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="requirements" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">Persyaratan Program</h4>
                                        {requirementList.length > 0 ? (
                                            <ul className="space-y-3">
                                                {requirementList.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 mt-0.5">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </span>
                                                        <span className="leading-tight">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Tidak ada persyaratan khusus.</p>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">Kurikulum / Materi Program</h4>
                                        {curriculumList.length > 0 ? (
                                            <ul className="space-y-3">
                                                {curriculumList.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mt-0.5">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </span>
                                                        <span className="leading-tight">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Kurikulum tidak tersedia.</p>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>

                            {/* Guest Form Card */}
                            {!isLoggedIn && !hasAccess && !pendingInvoice && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <h3 className="font-bold text-gray-900 text-lg mb-4">Masukkan Data Diri Anda</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest-email" className="font-semibold text-gray-700">Email</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="guest-email"
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    value={guestFormData.email}
                                                    onChange={(e) => updateGuestForm('email', e.target.value)}
                                                    className="flex-1 rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        updateGuestForm('email', '');
                                                        setEmailExists(false);
                                                    }}
                                                    className="h-10 w-10 shrink-0 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {checkingEmail && <p className="text-xs text-gray-500">Mengecek email...</p>}
                                            {emailExists && <p className="text-xs text-green-600">Email ditemukan. Login otomatis akan digunakan.</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-name" className="font-semibold text-gray-700">Nama Lengkap</Label>
                                            <Input
                                                id="guest-name"
                                                type="text"
                                                placeholder="Nama lengkap Anda"
                                                value={guestFormData.name}
                                                onChange={(e) => updateGuestForm('name', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-phone" className="font-semibold text-gray-700">No. WhatsApp / Telepon</Label>
                                            <Input
                                                id="guest-phone"
                                                type="tel"
                                                placeholder="08xxxxxxxxxx"
                                                value={guestFormData.phone_number}
                                                onChange={(e) => updateGuestForm('phone_number', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">Nomor telepon akan digunakan sebagai kata sandi akun Anda.</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">Data akun ditemukan dan dikunci agar sesuai akun terdaftar.</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-instance" className="font-semibold text-gray-700">Instansi / Perusahaan</Label>
                                            <Input
                                                id="guest-instance"
                                                type="text"
                                                placeholder="Instansi atau perusahaan Anda"
                                                value={guestFormData.instance}
                                                onChange={(e) => updateGuestForm('instance', e.target.value)}
                                                disabled={loading}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-city" className="font-semibold text-gray-700">Kota Domisili</Label>
                                            <Input
                                                id="guest-city"
                                                type="text"
                                                placeholder="Kota domisili Anda"
                                                value={guestFormData.city}
                                                onChange={(e) => updateGuestForm('city', e.target.value)}
                                                disabled={loading}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-1">
                            {hasAccess ? (
                                <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xs">
                                    <BadgeCheck size={64} className="text-green-500" />
                                    <h2 className="text-xl font-bold">Anda Sudah Memiliki Akses</h2>
                                    <p className="text-sm text-gray-500">Anda sudah terdaftar di kelas ini. Silakan mulai belajar.</p>
                                    <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                        <a href={`/profile/my-courses/${course.slug}`}>Masuk ke Kelas</a>
                                    </Button>
                                </div>
                            ) : pendingInvoice ? (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-6">
                                    <div
                                        className="rounded-xl p-4 flex items-center gap-2"
                                        style={{
                                            backgroundColor: (() => {
                                                const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                                const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';
                                                return isExpired ? '#fee2e2' : 'rgba(254, 249, 195, 0.5)';
                                            })(),
                                        }}
                                    >
                                        {(() => {
                                            const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                            const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';
                                            if (isExpired) {
                                                return (
                                                    <>
                                                        <X className="h-5 w-5 text-red-600" />
                                                        <h4 className="font-bold text-red-700">Pembayaran Gagal / Kedaluwarsa</h4>
                                                    </>
                                                );
                                            }
                                            return (
                                                <>
                                                    <Hourglass className="h-5 w-5 text-yellow-600 animate-pulse" />
                                                    <h4 className="font-bold text-yellow-950">Pembayaran Tertunda</h4>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 rounded-xl bg-gray-50/50 p-4 border border-gray-100 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">No. Invoice</span>
                                                <span className="font-semibold text-gray-800">{pendingInvoice.invoice_code}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Metode Pembayaran</span>
                                                <span className="font-semibold text-gray-800">DOKU</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Total Pembayaran</span>
                                                <span className="text-lg font-bold text-[#FA5F25]">
                                                    Rp {pendingInvoice.amount.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const expiryInfo = formatExpiryTime(pendingInvoice.expires_at);
                                            const isExpired = expiryInfo.status === 'expired' && pendingInvoice.status === 'pending';

                                            if (isExpired) {
                                                return (
                                                    <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700 leading-relaxed">
                                                        Waktu pembayaran telah habis. Silakan batalkan pesanan untuk membuat pesanan baru atau hubungi admin melalui{' '}
                                                        <a
                                                            href="https://wa.me/6289528514480"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-orange-600 underline"
                                                        >
                                                            WhatsApp Admin
                                                        </a>.
                                                    </div>
                                                );
                                            }

                                            return (
                                                <Button onClick={continuePendingPayment} className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs" type="button">
                                                    Lanjutkan Pembayaran
                                                </Button>
                                            );
                                        })()}

                                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 rounded-full border-gray-200 text-gray-700">
                                            Cek Status Pembayaran
                                        </Button>

                                        <Button
                                            onClick={handleCancelInvoice}
                                            disabled={cancellingInvoice}
                                            variant="ghost"
                                            className="w-full py-6 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            {cancellingInvoice ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCheckout} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Ringkasan Pembayaran</h3>
                                    
                                    {isFree ? (
                                        <div className="space-y-2 text-center py-2">
                                            <div className="flex items-center justify-between p-2">
                                                <span className="w-full text-xl font-bold text-green-600">KELAS ONLINE GRATIS</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Dapatkan akses langsung secara gratis ke materi pembelajaran kelas ini.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Pilihan Jenis Kode */}
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-gray-700">Jenis Kode</Label>
                                                <RadioGroup
                                                    value={codeType}
                                                    onValueChange={(val: 'voucher' | 'referral') => {
                                                        setCodeType(val);
                                                        setPromoCode('');
                                                        setDiscountData(null);
                                                        setReferralData(null);
                                                        setPromoError('');
                                                        setReferralError('');
                                                        if (val === 'voucher') {
                                                            setPointsChecked(false);
                                                            setPointsToUse(0);
                                                        }
                                                    }}
                                                    className="flex gap-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="voucher" id="code-voucher" />
                                                        <Label htmlFor="code-voucher" className="cursor-pointer font-medium">Voucher</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="referral" id="code-referral" />
                                                        <Label htmlFor="code-referral" className="cursor-pointer font-medium">Referral</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {/* Input Kode Promo / Referral */}
                                            <div className="space-y-2">
                                                <Label htmlFor="promo-code" className="font-semibold text-gray-700">
                                                    Punya Kode Promo?
                                                </Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            id="promo-code"
                                                            type="text"
                                                            placeholder={codeType === 'voucher' ? 'Masukkan kode voucher' : 'Masukkan kode referral'}
                                                            value={promoCode}
                                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                            className="rounded-xl pr-10"
                                                        />
                                                        {(promoLoading || referralLoading) && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-orange-600"></div>
                                                            </div>
                                                        )}
                                                        {!(promoLoading || referralLoading) && promoCode && (
                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                                {codeType === 'voucher' ? (
                                                                    discountData?.valid ? (
                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                    ) : promoError ? (
                                                                        <X className="h-4 w-4 text-red-600" />
                                                                    ) : null
                                                                ) : (
                                                                    referralData?.valid ? (
                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                    ) : referralError ? (
                                                                        <X className="h-4 w-4 text-red-600" />
                                                                    ) : null
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setPromoCode('');
                                                            setDiscountData(null);
                                                            setReferralData(null);
                                                            setPromoError('');
                                                            setReferralError('');
                                                        }}
                                                        className="h-10 w-10 shrink-0 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {codeType === 'voucher' && promoError && (
                                                    <p className="text-sm text-red-600">{promoError}</p>
                                                )}
                                                {codeType === 'voucher' && discountData?.valid && (
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            <p className="text-sm font-medium text-green-800">
                                                                Voucher "{discountData.discount_code.code}" berhasil diterapkan!
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            {discountData.discount_code.name} - Diskon {discountData.discount_code.formatted_value}
                                                        </p>
                                                    </div>
                                                )}
                                                {codeType === 'referral' && referralError && (
                                                    <p className="text-sm text-red-600">{referralError}</p>
                                                )}
                                                {codeType === 'referral' && referralData?.valid && (
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            <p className="text-sm font-medium text-green-800">
                                                                Kode referral valid!
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            Pembelian pertama Anda dirujuk oleh {referralData.referrer?.name}. Reward poin akan masuk setelah pembayaran sukses.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Point Reward/Redeem Section */}
                                            {isLoggedIn && userPoints > 0 && (
                                                <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold text-gray-700">Gunakan Reward Point</Label>
                                                            <p className="text-muted-foreground text-xs">
                                                                Anda memiliki {userPoints.toLocaleString('id-ID')} poin (Rp {userPoints.toLocaleString('id-ID')})
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={pointsChecked}
                                                            disabled={codeType === 'voucher' && !!discountData?.valid}
                                                            onCheckedChange={(checked) => {
                                                                setPointsChecked(checked);
                                                                if (checked) {
                                                                    const autoPoints = Math.min(userPoints, maxPointsAllowed);
                                                                    setPointsToUse(autoPoints);
                                                                    setPointsError('');
                                                                } else {
                                                                    setPointsToUse(0);
                                                                    setPointsError('');
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    {pointsChecked && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="points-input" className="text-sm font-medium text-gray-700">Jumlah poin yang digunakan</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    id="points-input"
                                                                    type="number"
                                                                    max={Math.min(userPoints, maxPointsAllowed)}
                                                                    min={1}
                                                                    value={pointsToUse || ''}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value) || 0;
                                                                        if (val > userPoints) {
                                                                            setPointsError('Poin melebihi saldo Anda.');
                                                                        } else if (val > maxPointsAllowed) {
                                                                            setPointsError(`Maksimal poin yang dapat digunakan adalah ${maxPointsAllowed}.`);
                                                                        } else {
                                                                            setPointsError('');
                                                                        }
                                                                        setPointsToUse(val);
                                                                    }}
                                                                    className="rounded-xl"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setPointsToUse(Math.min(userPoints, maxPointsAllowed));
                                                                        setPointsError('');
                                                                    }}
                                                                    className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
                                                                >
                                                                    Maksimal
                                                                </Button>
                                                            </div>
                                                            {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                            {codeType === 'voucher' && !!discountData?.valid && (
                                                                <p className="text-xs text-amber-600">Poin tidak dapat digunakan bersamaan dengan kode voucher.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2 pt-2 text-sm">
                                                {course.strikethrough_price > 0 && (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Harga Asli</span>
                                                            <span className="font-semibold text-gray-500 line-through">
                                                                Rp {course.strikethrough_price.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Diskon</span>
                                                            <span className="font-semibold text-red-500">
                                                                -Rp {(course.strikethrough_price - course.price).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <Separator className="my-2" />
                                                    </>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Harga Kelas</span>
                                                    <span className="font-semibold text-gray-800">Rp {course.price.toLocaleString('id-ID')}</span>
                                                </div>

                                                {/* Promo Discount */}
                                                {codeType === 'voucher' && discountData?.valid && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Diskon Promo ({discountData.discount_code.code})</span>
                                                        <span className="font-semibold text-green-600">
                                                            -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Points Discount */}
                                                {pointsChecked && pointsToUse > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Potongan Poin ({pointsToUse.toLocaleString('id-ID')} Poin)</span>
                                                        <span className="font-semibold text-green-600">
                                                            -Rp {pointsToUse.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Biaya Transaksi</span>
                                                    <span className="font-semibold text-gray-800">Rp {transactionFee.toLocaleString('id-ID')}</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between text-base">
                                                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                    <span className="text-[#FA5F25] text-xl font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!isFree && (
                                        <div className="flex items-start gap-3 pt-2">
                                            <Checkbox
                                                id="terms"
                                                checked={termsAccepted}
                                                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                className="mt-0.5"
                                            />
                                            <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                                Saya menyetujui{' '}
                                                <a
                                                    href="/terms-and-conditions"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-orange-600 hover:underline font-semibold"
                                                >
                                                    syarat dan ketentuan
                                                </a>{' '}
                                                yang berlaku
                                            </Label>
                                        </div>
                                    )}
                                    <Button
                                        className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                        type="submit"
                                        disabled={(isFree ? false : !termsAccepted) || loading}
                                    >
                                        {loading ? 'Memproses...' : isFree ? 'Dapatkan Akses Gratis Sekarang' : 'Lanjutkan Pembayaran'}
                                    </Button>
                                    <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                                        Pembayaran aman dan terenkripsi 🔒
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}

