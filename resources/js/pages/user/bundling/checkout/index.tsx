import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UserLayout from '@/layouts/user-layout';
import { rupiahFormatter } from '@/lib/utils';
import { SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Check, Hourglass, LoaderCircle, Package, RefreshCw, User, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';

interface Product {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
}

interface BundleItem {
    id: string;
    bundleable_type: string;
    bundleable: Product;
    price: number;
}

interface Bundle {
    id: string;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    thumbnail?: string | null;
    price: number;
    strikethrough_price: number;
    registration_deadline?: string | null;
    bundle_items: BundleItem[];
    bundle_items_count: number;
}

interface ReferralInfo {
    code?: string;
    hasActive: boolean;
}

interface CheckoutBundleProps {
    bundle: Bundle;
    hasAccess: boolean;
    pendingInvoiceUrl?: string | null;
    referralInfo: ReferralInfo;
}

type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    password: string;
    password_confirmation: string;
};

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

export default function CheckoutBundle({ bundle, hasAccess, pendingInvoiceUrl, referralInfo }: CheckoutBundleProps) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const transactionFee = 5000;
    const bundleDiscount = bundle.strikethrough_price - bundle.price;

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const totalPrice = bundle.price + transactionFee - (discountData?.discount_amount || 0);

    useEffect(() => {
        if (!promoCode.trim()) {
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
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: any = {
                code: promoCode,
                amount: bundle.price,
                product_type: 'bundle',
                product_id: bundle.id,
            };

            if (!isLoggedIn && emailExists && data.email) {
                requestData.email = data.email;
            }

            const response = await axios.post('/api/discount-codes/validate', requestData);

            if (response.data.valid) {
                setDiscountData(response.data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(response.data.message || 'Kode promo tidak valid');
            }
        } catch (error: any) {
            setDiscountData(null);
            setPromoError(error.response?.data?.message || 'Terjadi kesalahan saat memvalidasi kode promo');
        } finally {
            setPromoLoading(false);
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (!data.email || !data.email.includes('@')) {
            setEmailExists(false);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingEmail(true);
            try {
                const response = await axios.post('/api/check-email', {
                    email: data.email
                });

                if (response.data.exists) {
                    setEmailExists(true);
                    setData('name', response.data.name || '');
                    setData('phone_number', response.data.phone_number || '');
                    setData('instance', response.data.instance || '');
                } else {
                    setEmailExists(false);
                }
            } catch (error) {
                console.error('Error checking email:', error);
                setEmailExists(false);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.email]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

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

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            if (!data.email || !data.name || !data.phone_number || (!emailExists && !data.instance)) {
                toast.error('Lengkapi data terlebih dahulu');
                return;
            }

            setLoading(true);

            try {
                if (emailExists) {
                    const response = await axios.post('/auto-login', {
                        email: data.email,
                        phone_number: data.phone_number,
                    });

                    if (!response.data.success) {
                        throw new Error(response.data.message || 'Login gagal. Pastikan nomor telepon sesuai dengan yang terdaftar.');
                    }

                    toast.success('Login berhasil! Menyiapkan pembayaran...');

                    sessionStorage.setItem(
                        'pendingCheckout',
                        JSON.stringify({
                            bundleId: bundle.id,
                            productType: 'bundle',
                            termsAccepted,
                            timestamp: Date.now(),
                            discountData: discountData,
                            source: 'login'
                        }),
                    );

                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    window.location.reload();
                    return;
                } else {
                    const response = await axios.post('/register', {
                        name: data.name,
                        email: data.email,
                        phone_number: data.phone_number,
                        password: data.phone_number,
                        password_confirmation: data.phone_number,
                    });

                    if (!(response.data.success || response.status === 200 || response.status === 201)) {
                        throw new Error('Registrasi gagal');
                    }

                    toast.success('Registrasi berhasil! Menyiapkan pembayaran...');

                    sessionStorage.setItem(
                        'pendingCheckout',
                        JSON.stringify({
                            bundleId: bundle.id,
                            productType: 'bundle',
                            termsAccepted,
                            timestamp: Date.now(),
                            discountData: discountData,
                            source: 'register'
                        }),
                    );

                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    window.location.reload();
                    return;
                }
            } catch (error: any) {
                console.error('Login/Register error:', error);
                setLoading(false);

                if (error.response?.status === 419) {
                    toast.error('Sesi telah berakhir. Silakan muat ulang halaman.');
                } else {
                    toast.error(error.response?.data?.message || error.message || 'Gagal login/registrasi');
                }
                return;
            }
        }

        // Validasi profil setelah login
        if (!isProfileComplete) {
            toast.error('Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu.');
            window.location.href = route('profile.edit', { redirect: window.location.href });
            return;
        }

        // Validasi terms
        if (!termsAccepted) {
            toast.error('Anda harus menyetujui syarat dan ketentuan!');
            setLoading(false);
            return;
        }

        if (!loading) {
            setLoading(true);
        }

        const submitPayment = async (retryCount = 0): Promise<void> => {
            const invoiceData: any = {
                bundle_id: bundle.id,
                discount_amount: bundleDiscount,
                nett_amount: bundle.price - (discountData?.discount_amount || 0),
                transaction_fee: transactionFee,
                total_amount: totalPrice,
            };

            if (discountData?.valid) {
                invoiceData.discount_code_id = discountData.discount_code.id;
                invoiceData.discount_code_amount = discountData.discount_amount;
            }

            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                const res = await fetch(route('invoice.store.bundle'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(invoiceData),
                });

                if (res.status === 419 && retryCount < 2) {
                    await refreshCSRFToken();
                    return submitPayment(retryCount + 1);
                }

                if (res.status === 401 && retryCount < 2) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    return submitPayment(retryCount + 1);
                }

                const responseData = await res.json();

                if (res.ok && responseData.success) {
                    if (responseData.payment_url) {
                        sessionStorage.removeItem('pendingCheckout');
                        window.location.href = responseData.payment_url;
                    } else {
                        throw new Error('Payment URL not received');
                    }
                } else {
                    throw new Error(responseData.message || 'Gagal membuat invoice.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                throw error;
            }
        };

        try {
            await submitPayment();
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan saat proses pembayaran.');
            setLoading(false);
        }
    };

    useEffect(() => {

        const pendingCheckout = sessionStorage.getItem('pendingCheckout');

        if (pendingCheckout && isLoggedIn) {
            try {
                const checkoutData = JSON.parse(pendingCheckout);

                // Validasi timestamp (maksimal 5 menit)
                const timestamp = checkoutData.timestamp || 0;
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;

                if (now - timestamp > fiveMinutes) {
                    sessionStorage.removeItem('pendingCheckout');
                    toast.error('Sesi checkout telah kadaluarsa');
                    return;
                }

                // Validasi bundle ID + product type
                if (checkoutData.bundleId !== bundle.id || checkoutData.productType !== 'bundle') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                if (checkoutData.source !== 'register') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                // Restore state
                setTermsAccepted(checkoutData.termsAccepted || false);

                // Restore promo code jika ada
                if (checkoutData.discountData?.valid) {
                    setPromoCode(checkoutData.discountData.discount_code.code);
                    setDiscountData(checkoutData.discountData);
                }

                toast.success('Melanjutkan pembayaran...');

                setTimeout(async () => {
                    setLoading(true);

                    const submitPayment = async (retryCount = 0): Promise<void> => {
                        // Hitung ulang total dengan diskon dari sessionStorage
                        let calculatedNettAmount = bundle.price;
                        let calculatedTotalAmount = bundle.price + transactionFee;

                        if (checkoutData.discountData?.valid) {
                            calculatedNettAmount = bundle.price - checkoutData.discountData.discount_amount;
                            calculatedTotalAmount = calculatedNettAmount + transactionFee;
                        }

                        const invoiceData: any = {
                            bundle_id: bundle.id,
                            discount_amount: bundleDiscount,
                            nett_amount: calculatedNettAmount,
                            transaction_fee: transactionFee,
                            total_amount: calculatedTotalAmount,
                        };

                        if (checkoutData.discountData?.valid) {
                            invoiceData.discount_code_id = checkoutData.discountData.discount_code.id;
                            invoiceData.discount_code_amount = checkoutData.discountData.discount_amount;
                        }


                        try {
                            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                            const res = await fetch(route('invoice.store.bundle'), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrfToken || '',
                                    Accept: 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest',
                                },
                                credentials: 'same-origin',
                                body: JSON.stringify(invoiceData),
                            });


                            if (res.status === 419 && retryCount < 2) {
                                await refreshCSRFToken();
                                return submitPayment(retryCount + 1);
                            }

                            if (res.status === 401 && retryCount < 2) {
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                                return submitPayment(retryCount + 1);
                            }

                            const data = await res.json();

                            if (res.ok && data.success) {
                                if (data.payment_url) {
                                    sessionStorage.removeItem('pendingCheckout');
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
                        console.error('Failed to process payment:', error);
                        toast.error(error.message || 'Terjadi kesalahan saat proses pembayaran.');
                        sessionStorage.removeItem('pendingCheckout');
                        setLoading(false);
                    }
                }, 2000);
            } catch (error) {
                console.error('Error processing pending checkout:', error);
                sessionStorage.removeItem('pendingCheckout');
                toast.error('Gagal memproses checkout');
            }
        }

    }, [isLoggedIn, bundle.id]);


    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title="Checkout Paket Bundling" />
                <section className="to-primary w-full bg-gradient-to-tl from-black px-4">
                    <div className="mx-auto my-12 w-full max-w-7xl px-4">
                        <h2 className="mx-auto mb-4 max-w-3xl bg-gradient-to-r from-[#71D0F7] via-white to-[#E6834A] bg-clip-text text-center text-3xl font-bold text-transparent italic sm:text-4xl">
                            Checkout Paket Bundling "{bundle.title}"
                        </h2>
                        <p className="text-center text-gray-400">Silakan lengkapi profil Anda terlebih dahulu.</p>
                    </div>
                </section>
                <section className="mx-auto my-4 w-full max-w-7xl px-4">
                    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                        <User size={64} className="text-orange-500" />
                        <h2 className="text-xl font-bold">Profil Belum Lengkap</h2>
                        <p className="text-sm text-gray-500">
                            Profil Anda belum lengkap! Harap lengkapi nomor telepon terlebih dahulu untuk membeli paket bundling.
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
            <Head title={`Checkout - ${bundle.title}`} />

            <section className="mx-auto mb-4 my-8 w-full max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Bundle Details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
                            <div className="mb-6 flex items-start gap-4">
                                <img
                                    src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                    alt={bundle.title}
                                    className="h-32 w-48 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <Badge className="bg-primary mb-2 text-white">
                                        <Package size={12} className="mr-1" />
                                        Paket Bundling
                                    </Badge>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900 italic dark:text-white">{bundle.title}</h2>
                                    {bundle.short_description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{bundle.short_description}</p>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    Isi Paket ({bundle.bundle_items_count} Program)
                                </h3>
                                <div className="space-y-3">
                                    {bundle.bundle_items.map((item, index) => (
                                        <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-900 dark:text-white">{item.bundleable.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.bundleable_type.includes('Course')
                                                        ? 'Kelas Online'
                                                        : item.bundleable_type.includes('Bootcamp')
                                                            ? 'Bootcamp'
                                                            : 'Webinar'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {item.price === 0 ? 'Gratis' : rupiahFormatter.format(item.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-800 dark:text-green-400">
                                    <BadgeCheck size={18} />
                                    Keuntungan Paket Bundling
                                </h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                        <Check size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>
                                            Hemat {Math.round(((bundle.strikethrough_price - bundle.price) / bundle.strikethrough_price) * 100)}% dari
                                            harga normal
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                        <Check size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>Akses ke {bundle.bundle_items_count} program pembelajaran sekaligus</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                        <Check size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>Sertifikat untuk semua program yang diselesaikan</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                        <Check size={16} className="mt-0.5 flex-shrink-0" />
                                        <span>Akses selamanya ke semua materi pembelajaran</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {!isLoggedIn && (
                            <form className="flex flex-col gap-6 p-6 mt-6 rounded-2xl border bg-white/95 dark:bg-gray-800/95" onSubmit={submit}>
                                <h1 className="text-xl font-bold">Masukkan Data Diri Anda</h1>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={1}
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                disabled={processing}
                                                placeholder="email@example.com"
                                                className="pr-10"
                                            />
                                            {checkingEmail && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                </div>
                                            )}
                                            {!checkingEmail && emailExists && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={async () => {
                                                if (!data.email || !data.email.includes('@')) {
                                                    toast.error('Masukkan email yang valid');
                                                    return;
                                                }

                                                setCheckingEmail(true);
                                                try {
                                                    const response = await axios.post('/api/check-email', {
                                                        email: data.email
                                                    });

                                                    if (response.data.exists) {
                                                        setEmailExists(true);
                                                        setData('name', response.data.name || '');
                                                        setData('phone_number', response.data.phone_number || '');
                                                        toast.success('Email ditemukan!');
                                                    } else {
                                                        setEmailExists(false);
                                                        toast.info('Email tidak terdaftar');
                                                    }
                                                } catch (error) {
                                                    console.error('Error checking email:', error);
                                                    setEmailExists(false);
                                                    toast.error('Gagal mengecek email');
                                                } finally {
                                                    setCheckingEmail(false);
                                                }
                                            }}
                                            disabled={checkingEmail || !data.email}
                                            className="flex-shrink-0"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {emailExists && (
                                        <p className="text-xs text-green-600">Email ditemukan, data terisi otomatis</p>
                                    )}
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing || emailExists}
                                            placeholder="Nama lengkap Anda"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone_number">No. Telepon</Label>
                                        <Input
                                            id="phone_number"
                                            type="tel"
                                            required
                                            tabIndex={3}
                                            autoComplete="tel"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            disabled={processing || emailExists}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {!emailExists && (
                                            <p className="text-xs text-gray-500">
                                                Nomor telepon akan digunakan sebagai password anda
                                            </p>
                                        )}
                                        {emailExists && (
                                            <p className="text-xs text-blue-600">
                                                Pastikan nomor telepon sesuai dengan yang terdaftar
                                            </p>
                                        )}
                                        <InputError message={errors.phone_number} />
                                    </div>
                                    <div className="grid gap-2 pb-2">
                                        <Label htmlFor="instance">Instansi/Perusahaan</Label>
                                        <Input
                                            id="instance"
                                            type="text"
                                            tabIndex={4}
                                            autoComplete="organization"
                                            value={data.instance}
                                            onChange={(e) => setData('instance', e.target.value)}
                                            disabled={processing || emailExists}
                                            placeholder="Instansi atau perusahaan Anda"
                                            required
                                        />
                                        <InputError message={errors.instance} />
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Column - Payment */}
                    <div className="lg:col-span-1">
                        {hasAccess ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                                <BadgeCheck size={64} className="text-green-500" />
                                <h2 className="text-xl font-bold">Anda Sudah Memiliki Akses</h2>
                                <p className="text-sm text-gray-500">Anda sudah membeli paket bundling ini. Silakan lanjutkan belajar.</p>
                                <Button asChild className="w-full">
                                    <Link href={route('profile.index')}>Lihat Dashboard</Link>
                                </Button>
                            </div>
                        ) : pendingInvoiceUrl ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                                <Hourglass size={64} className="text-yellow-500" />
                                <h2 className="text-xl font-bold">Pembayaran Tertunda</h2>
                                <p className="text-sm text-gray-500">
                                    Anda memiliki pembayaran yang belum selesai untuk paket bundling ini. Silakan lanjutkan untuk membayar.
                                </p>
                                <Button asChild className="w-full">
                                    <a href={pendingInvoiceUrl}>Lanjutkan Pembayaran</a>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleCheckout}>
                                <h2 className="mb-4 text-xl font-bold italic">Detail Pembayaran</h2>
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="space-y-2 mb-4">
                                        <Label htmlFor="promo-code" className="text-sm font-medium">
                                            Punya Kode Promo?
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="promo-code"
                                                    type="text"
                                                    placeholder="Masukkan kode promo"
                                                    value={promoCode}
                                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                    className="pr-10"
                                                />
                                                {promoLoading && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                        <LoaderCircle className="h-4 w-4 animate-spin text-gray-400" />
                                                    </div>
                                                )}
                                                {!promoLoading && promoCode && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                        {discountData?.valid ? (
                                                            <Check className="h-5 w-5 text-green-600" />
                                                        ) : promoError ? (
                                                            <X className="h-5 w-5 text-red-600" />
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={async () => {
                                                    if (!promoCode.trim()) {
                                                        toast.error('Masukkan kode promo terlebih dahulu');
                                                        return;
                                                    }
                                                    await validatePromoCode();
                                                }}
                                                disabled={promoLoading || !promoCode.trim()}
                                                className="flex-shrink-0"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                                        {discountData?.valid && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        Promo "{discountData.discount_code.code}" diterapkan!
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                                                    {discountData.discount_code.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Harga Normal</span>
                                            <span className="text-sm font-semibold text-gray-500 line-through dark:text-gray-400">
                                                {rupiahFormatter.format(bundle.strikethrough_price)}
                                            </span>
                                        </div>

                                        {bundleDiscount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Diskon Bundle</span>
                                                <span className="text-sm font-semibold text-red-500">-{rupiahFormatter.format(bundleDiscount)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Harga Bundle</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {rupiahFormatter.format(bundle.price)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Biaya Transaksi</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {rupiahFormatter.format(transactionFee)}
                                            </span>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900 dark:text-white">Total Pembayaran</span>
                                            <span className="text-primary text-2xl font-bold">{rupiahFormatter.format(totalPrice)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Referral Info */}
                                    {referralInfo.hasActive && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                                🎁 Menggunakan kode referral: <span className="font-bold">{referralInfo.code}</span>
                                            </p>
                                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-500">
                                                Anda membantu teman Anda mendapatkan komisi!
                                            </p>
                                        </div>
                                    )}

                                    {/* Terms & Conditions */}
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="terms"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                        />
                                        <Label htmlFor="terms" className="text-sm leading-tight">
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

                                    {/* Submit Button */}
                                    <Button className="w-full" type="submit" disabled={!termsAccepted || loading}>
                                        {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </UserLayout>
    );
}
