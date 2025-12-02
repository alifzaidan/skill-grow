import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Check, Hourglass, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Bootcamp {
    id: string;
    title: string;
    schedules?: { day: string; start_time: string; end_time: string }[];
    start_date: string;
    end_date: string;
    strikethrough_price: number;
    price: number;
    thumbnail?: string | null;
    description?: string | null;
    benefits?: string | null;
    requirements?: string | null;
    curriculum?: string | null;
    group_url?: string | null;
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

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

export default function RegisterBootcamp({
    bootcamp,
    hasAccess,
    pendingInvoiceUrl,
    referralInfo,
}: {
    bootcamp: Bootcamp;
    hasAccess: boolean;
    pendingInvoiceUrl?: string | null;
    referralInfo: ReferralInfo;
}) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [showFreeForm, setShowFreeForm] = useState(false);
    const [freeFormData, setFreeFormData] = useState({
        ig_follow_proof: null as File | null,
        tiktok_follow_proof: null as File | null,
        tag_friend_proof: null as File | null,
    });
    const [fileErrors, setFileErrors] = useState({
        ig_follow_proof: false,
        tiktok_follow_proof: false,
        tag_friend_proof: false,
    });

    const requirementList = parseList(bootcamp.requirements);
    const benefitList = parseList(bootcamp.benefits);
    const curriculumList = parseList(bootcamp.curriculum);
    const isFree = bootcamp.price === 0;

    const transactionFee = 5000;
    const basePrice = bootcamp.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalBootcampPrice = basePrice - discountAmount;
    const totalPrice = isFree ? 0 : finalBootcampPrice + transactionFee;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

    useEffect(() => {
        if (!promoCode.trim() || isFree) {
            setDiscountData(null);
            setPromoError('');
            return;
        }

        const timer = setTimeout(() => {
            validatePromoCode();
        }, 500);

        return () => clearTimeout(timer);
    }, [promoCode]);

    const validatePromoCode = async () => {
        if (!promoCode.trim() || isFree) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const response = await fetch('/api/discount-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    code: promoCode,
                    amount: bootcamp.price,
                    product_type: 'bootcamp',
                    product_id: bootcamp.id,
                }),
            });

            const data = await response.json();

            if (data.valid) {
                setDiscountData(data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(data.message || 'Kode promo tidak valid');
            }
        } catch {
            setDiscountData(null);
            setPromoError('Terjadi kesalahan saat memvalidasi kode promo');
        } finally {
            setPromoLoading(false);
        }
    };

    const refreshCSRFToken = async (): Promise<string> => {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
            });
            const data = await response.json();

            const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
            if (metaTag) {
                metaTag.content = data.token;
            }

            return data.token;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
            throw error;
        }
    };

    const handleFreeCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            alert('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit');
            return;
        }

        if (!freeFormData.ig_follow_proof || !freeFormData.tiktok_follow_proof || !freeFormData.tag_friend_proof) {
            alert('Harap upload semua bukti yang diperlukan!');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('type', 'bootcamp');
        formData.append('id', bootcamp.id);
        formData.append('ig_follow_proof', freeFormData.ig_follow_proof);
        formData.append('tiktok_follow_proof', freeFormData.tiktok_follow_proof);
        formData.append('tag_friend_proof', freeFormData.tag_friend_proof);

        router.post(route('enroll.free'), formData, {
            onError: (errors) => {
                console.log('Free enrollment errors:', errors);
                alert(errors.message || 'Gagal mendaftar bootcamp gratis.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isProfileComplete) {
            alert('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit');
            return;
        }

        if (!termsAccepted && !isFree) {
            alert('Anda harus menyetujui syarat dan ketentuan!');
            return;
        }

        setLoading(true);

        if (isFree) {
            setShowFreeForm(true);
            setLoading(false);
            return;
        }

        const submitPayment = async (retryCount = 0): Promise<void> => {
            const originalDiscountAmount = bootcamp.strikethrough_price > 0 ? bootcamp.strikethrough_price - bootcamp.price : 0;
            const promoDiscountAmount = discountData?.discount_amount || 0;

            const invoiceData: any = {
                type: 'bootcamp',
                id: bootcamp.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: finalBootcampPrice,
                transaction_fee: transactionFee,
                total_amount: totalPrice,
            };

            if (discountData?.valid) {
                invoiceData.discount_code_id = discountData.discount_code.id;
                invoiceData.discount_code_amount = discountData.discount_amount;
            }

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                const res = await fetch(route('invoice.store'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(invoiceData),
                });

                // Handle 419 error with retry
                if (res.status === 419 && retryCount < 2) {
                    console.log(`CSRF token expired, refreshing... (attempt ${retryCount + 1})`);
                    await refreshCSRFToken();
                    return submitPayment(retryCount + 1);
                }

                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.payment_url) {
                        window.location.href = data.payment_url;
                    } else {
                        throw new Error('Payment URL not received');
                    }
                } else {
                    throw new Error(data.message || 'Gagal membuat invoice.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        };

        try {
            await submitPayment();
        } catch (error: any) {
            alert(error.message || 'Terjadi kesalahan saat proses pembayaran.');
            setLoading(false);
        }
    };

    // Function untuk validasi ukuran file
    const validateFileSize = (file: File, maxSizeMB: number = 2): boolean => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    };

    // Function untuk handle file input dengan validasi
    const handleFileChange = (fieldName: keyof typeof freeFormData, file: File | null) => {
        if (!file) {
            setFreeFormData((prev) => ({ ...prev, [fieldName]: null }));
            setFileErrors((prev) => ({ ...prev, [fieldName]: false }));
            return;
        }

        // Validasi ukuran file
        if (!validateFileSize(file, 2)) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));

            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) {
                input.value = '';
            }

            toast.error('Ukuran file terlalu besar. Maksimal 2MB.');
            return;
        }

        // Validasi tipe file (hanya image)
        if (!file.type.startsWith('image/')) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));

            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) {
                input.value = '';
            }

            toast.error('Hanya file gambar (JPG, PNG, GIF, dll) yang diperbolehkan.');
            return;
        }

        // File valid
        setFreeFormData((prev) => ({ ...prev, [fieldName]: file }));
        setFileErrors((prev) => ({ ...prev, [fieldName]: false }));

        toast.success('File berhasil diunggah.');
    };

    if (!isLoggedIn) {
        const currentUrl = window.location.href;
        const loginUrl = route('login', { redirect: currentUrl });

        return (
            <UserLayout>
                <Head title="Login Required" />

                <section className="to-primary w-full bg-gradient-to-tl from-black px-4">
                    <div className="mx-auto my-12 w-full max-w-7xl px-4">
                        <h2 className="mx-auto mb-4 max-w-3xl bg-gradient-to-r from-[#71D0F7] via-white to-[#E6834A] bg-clip-text text-center text-3xl font-bold text-transparent italic sm:text-4xl">
                            Daftar Bootcamp "{bootcamp.title}"
                        </h2>
                        <p className="text-center text-gray-400">Silakan login terlebih dahulu untuk mendaftar bootcamp.</p>
                    </div>
                </section>
                <section className="mx-auto my-4 w-full max-w-7xl px-4">
                    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                        <User size={64} className="text-blue-500" />
                        <h2 className="text-xl font-bold">Login Diperlukan</h2>
                        <p className="text-sm text-gray-500">
                            Anda perlu login terlebih dahulu untuk mendaftar bootcamp ini.
                            {referralInfo.hasActive && ' Kode referral Anda akan tetap tersimpan.'}
                        </p>
                        <div className="flex w-full max-w-md gap-2">
                            <Button asChild className="flex-1">
                                <a href={loginUrl}>Login</a>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href={route('register', referralInfo.code ? { ref: referralInfo.code } : {})}>Daftar</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </UserLayout>
        );
    }

    if (!isProfileComplete) {
        return (
            <UserLayout>
                <Head title="Daftar Bootcamp" />
                <section className="to-primary w-full bg-gradient-to-tl from-black px-4">
                    <div className="mx-auto my-12 w-full max-w-7xl px-4">
                        <h2 className="mx-auto mb-4 max-w-3xl bg-gradient-to-r from-[#71D0F7] via-white to-[#E6834A] bg-clip-text text-center text-3xl font-bold text-transparent italic sm:text-4xl">
                            Daftar Bootcamp "{bootcamp.title}"
                        </h2>
                        <p className="text-center text-gray-400">Silakan lengkapi profil Anda terlebih dahulu.</p>
                    </div>
                </section>
                <section className="mx-auto my-4 w-full max-w-7xl px-4">
                    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                        <User size={64} className="text-orange-500" />
                        <h2 className="text-xl font-bold">Profil Belum Lengkap</h2>
                        <p className="text-sm text-gray-500">
                            Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu untuk mendaftar bootcamp.
                        </p>
                        <Button asChild className="w-full max-w-md">
                            <Link href={route('profile.edit', { redirect: window.location.href })}>Lengkapi Profil</Link>
                        </Button>
                    </div>
                </section>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="Daftar Bootcamp" />
            <section className="min-h-screen w-full bg-gradient-to-br from-yellow-50 via-white to-blue-50 px-2 py-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row">
                    {/* Kiri: Info & Detail */}
                    <div className="flex flex-1 flex-col gap-6">
                        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-white/80 p-6 shadow-lg md:flex-row">
                            <img
                                src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                alt={bootcamp.title}
                                className="aspect-video w-full rounded-xl object-cover shadow-md md:w-64"
                            />
                            <div className="flex-1">
                                <h2 className="mb-2 text-3xl font-bold text-black italic">{bootcamp.title}</h2>
                                <p className="mb-4 line-clamp-3 text-gray-600">{bootcamp.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 uppercase">
                                        Batch {bootcamp.batch}
                                    </span>
                                    {isFree && (
                                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 uppercase">Gratis</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="benefits" className="rounded-2xl border bg-white/80 shadow-lg">
                            <TabsList className="w-full">
                                <TabsTrigger value="benefits" className="flex-1">
                                    Manfaat
                                </TabsTrigger>
                                <TabsTrigger value="requirements" className="flex-1">
                                    Persyaratan
                                </TabsTrigger>
                                <TabsTrigger value="curriculum" className="flex-1">
                                    Kurikulum
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="benefits" className="p-6">
                                <h3 className="mb-4 text-xl font-bold text-black italic">Yang akan kamu dapatkan</h3>
                                <ul className="space-y-3">
                                    {benefitList.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <BadgeCheck size={20} className="mt-1 min-w-5 flex-shrink-0 text-green-600" />
                                            <p className="text-sm md:text-base">{benefit}</p>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                            <TabsContent value="requirements" className="p-6">
                                <h3 className="mb-4 text-xl font-bold text-black italic">Persyaratan Peserta</h3>
                                <ul className="space-y-3">
                                    {requirementList.map((requirement, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <BadgeCheck size={20} className="mt-1 min-w-5 flex-shrink-0 text-green-600" />
                                            <p className="text-sm md:text-base">{requirement}</p>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                            <TabsContent value="curriculum" className="p-6">
                                <h3 className="mb-4 text-xl font-bold text-black italic">Kurikulum Bootcamp</h3>
                                <ul className="space-y-3">
                                    {curriculumList.map((curriculum, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="mt-1 min-w-6 flex-shrink-0 font-semibold text-blue-600">{idx + 1}.</span>
                                            <p className="text-sm md:text-base">{curriculum}</p>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Kanan: Ringkasan & Checkout */}
                    <div className="w-full flex-shrink-0 lg:w-[400px]">
                        <div className="sticky top-8 flex flex-col gap-4 rounded-2xl border-2 border-blue-100 bg-white/90 p-6 shadow-2xl">
                            {hasAccess ? (
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <BadgeCheck size={64} className="text-green-500" />
                                    <h2 className="text-xl font-bold">Anda Sudah Memiliki Akses</h2>
                                    <p className="text-sm text-gray-500">Anda sudah terdaftar di bootcamp ini. Silakan masuk ke dalam grup.</p>
                                    <Button asChild className="w-full">
                                        <a href={bootcamp.group_url ?? ''} target="_blank" rel="noopener noreferrer">
                                            Masuk Group Bootcamp
                                        </a>
                                    </Button>
                                </div>
                            ) : pendingInvoiceUrl ? (
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <Hourglass size={64} className="text-yellow-500" />
                                    <h2 className="text-xl font-bold">Pembayaran Tertunda</h2>
                                    <p className="text-sm text-gray-500">
                                        Anda memiliki pembayaran yang belum selesai untuk bootcamp ini. Silakan lanjutkan untuk membayar.
                                    </p>
                                    <Button asChild className="w-full">
                                        <a href={pendingInvoiceUrl}>Lanjutkan Pembayaran</a>
                                    </Button>
                                </div>
                            ) : !showFreeForm ? (
                                <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                                    <h2 className="text-xl font-bold text-black italic">Ringkasan Pembayaran</h2>
                                    {isFree ? (
                                        <div className="flex items-center justify-center p-4 text-center">
                                            <span className="w-full text-2xl font-bold text-green-600">BOOTCAMP GRATIS</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Promo Code Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="promo-code">Kode Promo (Opsional)</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="promo-code"
                                                        type="text"
                                                        placeholder="Masukkan kode promo"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                        className="w-full pr-10"
                                                    />
                                                    {promoLoading && (
                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                                        </div>
                                                    )}
                                                    {!promoLoading && promoCode && (
                                                        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                                            {discountData?.valid ? (
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            ) : promoError ? (
                                                                <X className="h-4 w-4 text-red-600" />
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                                {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                                {discountData?.valid && (
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            <p className="text-sm font-medium text-green-800">
                                                                Kode promo "{discountData.discount_code.code}" berhasil diterapkan!
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            {discountData.discount_code.name} - Diskon {discountData.discount_code.formatted_value}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 rounded-lg border bg-blue-50/50 p-4">
                                                {bootcamp.strikethrough_price > 0 && (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Harga Asli</span>
                                                            <span className="font-semibold text-gray-500 line-through">
                                                                Rp {bootcamp.strikethrough_price.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Diskon</span>
                                                            <span className="font-semibold text-red-500">
                                                                -Rp {(bootcamp.strikethrough_price - bootcamp.price).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <Separator className="my-2" />
                                                    </>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Harga Bootcamp</span>
                                                    <span className="font-semibold text-gray-900">Rp {bootcamp.price.toLocaleString('id-ID')}</span>
                                                </div>

                                                {/* Promo Discount */}
                                                {discountData?.valid && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Diskon Promo ({discountData.discount_code.code})</span>
                                                        <span className="font-semibold text-green-600">
                                                            -Rp {discountData.discount_amount.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Biaya Transaksi</span>
                                                    <span className="font-semibold text-gray-900">Rp {transactionFee.toLocaleString('id-ID')}</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-black">Total Pembayaran</span>
                                                    <span className="text-xl font-bold text-black">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {!isFree && (
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="terms"
                                                checked={termsAccepted}
                                                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                            />
                                            <Label htmlFor="terms" className="text-sm">
                                                Saya menyetujui{' '}
                                                <a
                                                    href="/terms-and-conditions"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-700 hover:underline"
                                                >
                                                    syarat dan ketentuan
                                                </a>
                                            </Label>
                                        </div>
                                    )}
                                    <Button className="mt-2 w-full" type="submit" disabled={(isFree ? false : !termsAccepted) || loading}>
                                        {loading ? 'Memproses...' : isFree ? 'Upload Bukti Follow' : 'Lanjutkan Pembayaran'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleFreeCheckout} className="flex flex-col gap-4">
                                    <h2 className="text-xl font-bold text-black italic">Upload Bukti Follow & Tag</h2>
                                    {/* ...existing free form code... */}
                                    <div>
                                        <Label htmlFor="ig_follow_proof">Bukti Follow Instagram</Label>
                                        <Input
                                            id="ig_follow_proof"
                                            data-field="ig_follow_proof"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('ig_follow_proof', e.target.files?.[0] || null)}
                                            className={fileErrors.ig_follow_proof ? 'border-red-500 focus:ring-red-500' : ''}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Screenshot halaman profil Instagram kami yang menunjukkan Anda sudah follow (Maks. 2MB)
                                        </p>
                                        {fileErrors.ig_follow_proof && (
                                            <p className="mt-1 text-xs text-red-600">
                                                File tidak valid. Pastikan ukuran tidak melebihi 2MB dan format gambar.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tiktok_follow_proof">Bukti Follow TikTok</Label>
                                        <Input
                                            id="tiktok_follow_proof"
                                            data-field="tiktok_follow_proof"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('tiktok_follow_proof', e.target.files?.[0] || null)}
                                            className={fileErrors.tiktok_follow_proof ? 'border-red-500 focus:ring-red-500' : ''}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Screenshot halaman profil TikTok kami yang menunjukkan Anda sudah follow (Maks. 2MB)
                                        </p>
                                        {fileErrors.tiktok_follow_proof && (
                                            <p className="mt-1 text-xs text-red-600">
                                                File tidak valid. Pastikan ukuran tidak melebihi 2MB dan format gambar.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tag_friend_proof">Bukti Tag 3 Teman di Instagram</Label>
                                        <Input
                                            id="tag_friend_proof"
                                            data-field="tag_friend_proof"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('tag_friend_proof', e.target.files?.[0] || null)}
                                            className={fileErrors.tag_friend_proof ? 'border-red-500 focus:ring-red-500' : ''}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Screenshot postingan Instagram kami yang menunjukkan Anda sudah tag 3 teman di komentar (Maks. 2MB)
                                        </p>
                                        {fileErrors.tag_friend_proof && (
                                            <p className="mt-1 text-xs text-red-600">
                                                File tidak valid. Pastikan ukuran tidak melebihi 2MB dan format gambar.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowFreeForm(false);
                                                setFileErrors({
                                                    ig_follow_proof: false,
                                                    tiktok_follow_proof: false,
                                                    tag_friend_proof: false,
                                                });
                                                setFreeFormData({
                                                    ig_follow_proof: null,
                                                    tiktok_follow_proof: null,
                                                    tag_friend_proof: null,
                                                });
                                            }}
                                            className="flex-1"
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                loading ||
                                                !freeFormData.ig_follow_proof ||
                                                !freeFormData.tiktok_follow_proof ||
                                                !freeFormData.tag_friend_proof ||
                                                fileErrors.ig_follow_proof ||
                                                fileErrors.tiktok_follow_proof ||
                                                fileErrors.tag_friend_proof
                                            }
                                            className="flex-1"
                                        >
                                            {loading ? 'Memproses...' : 'Dapatkan Akses Gratis'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
