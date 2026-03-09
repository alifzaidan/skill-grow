import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Check, Hourglass, LoaderCircle, RefreshCw, User, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import InputError from '@/components/input-error';

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
    batch?: string;
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
}

type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    password: string;
    password_confirmation: string;
};

function sanitizeListText(value: string): string {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseList(items?: string | null): string[] {
    if (!items) return [];

    const normalized = items.replace(/<br\s*\/?>/gi, '\n').trim();
    const liMatches = normalized.match(/<li[^>]*>[\s\S]*?<\/li>/gi);

    if (liMatches?.length) {
        return liMatches.map((li) => sanitizeListText(li.replace(/<\/?li[^>]*>/gi, ''))).filter(Boolean);
    }

    return normalized
        .split(/\r?\n/)
        .map((line) => line.replace(/^(?:[\s•*-]+|✔(?:️)?|✅|☑(?:️)?)+/gu, '').trim())
        .map((line) => sanitizeListText(line))
        .filter(Boolean)
        .filter((line) => !line.endsWith(':'));
}

export default function RegisterBootcamp({
    bootcamp,
    hasAccess,
    pendingInvoiceUrl,
    referralInfo,
    pendingInvoice,
    invoiceData,
}: {
    bootcamp: Bootcamp;
    hasAccess: boolean;
    pendingInvoiceUrl?: string | null;
    referralInfo: ReferralInfo;
    pendingInvoice: PendingInvoice;
    invoiceData?: InvoiceData | null;
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

    const adminFee = isFree ? 0 : 5000;
    const transactionFee = 5000;
    const basePrice = bootcamp.price;
    const discountAmount = discountData?.discount_amount || 0;
    const finalBootcampPrice = basePrice - discountAmount;
    const totalPrice = isFree ? 0 : finalBootcampPrice + transactionFee;

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

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
            const requestData: any = {
                code: promoCode,
                amount: bootcamp.price,
                product_type: 'bootcamp',
                product_id: bootcamp.id,
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
                alert(errors.message || 'Gagal mendaftar bootcamp gratis.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        // Jika belum login, lakukan registrasi/login terlebih dahulu
        if (!isLoggedIn) {
            if (!data.email || !data.name || !data.phone_number) {
                toast.error('Lengkapi data terlebih dahulu');
                return;
            }

            setLoading(true);

            try {
                if (emailExists) {
                    // Gunakan axios yang sudah auto-handle CSRF token
                    const response = await axios.post('/auto-login', {
                        email: data.email,
                        phone_number: data.phone_number,
                    });

                    if (!response.data.success) {
                        throw new Error(response.data.message || 'Login gagal. Pastikan nomor telepon sesuai dengan yang terdaftar.');
                    }

                    toast.success('Login berhasil! Menyiapkan pembayaran...');

                    sessionStorage.setItem('pendingCheckout', JSON.stringify({
                        bootcampId: bootcamp.id,
                        productType: 'bootcamp',
                        termsAccepted: termsAccepted,
                        promoCode: promoCode,
                        discountData: discountData,
                        timestamp: Date.now(),
                        source: 'login',

                    }));

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    window.location.reload();
                    return;

                } else {
                    // Registrasi juga menggunakan axios
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

                    sessionStorage.setItem('pendingCheckout', JSON.stringify({
                        bootcampId: bootcamp.id,
                        productType: 'bootcamp',
                        termsAccepted: termsAccepted,
                        promoCode: promoCode,
                        discountData: discountData,
                        timestamp: Date.now(),
                        source: 'register'
                    }));

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    window.location.reload();
                    return;
                }

            } catch (error: any) {
                console.error('Login/Register error:', error);
                setLoading(false);

                // Better error messages
                if (error.response?.status === 419) {
                    toast.error('Sesi telah berakhir. Silakan muat ulang halaman.');
                } else {
                    toast.error(error.response?.data?.message || error.message || 'Gagal login/registrasi');
                }
                return;
            }
        }

        // Validasi terms untuk pembayaran berbayar
        if (!termsAccepted && !isFree) {
            toast.error('Anda harus menyetujui syarat dan ketentuan!');
            setLoading(false);
            return;
        }

        if (!loading) {
            setLoading(true);
        }

        if (isFree) {
            setShowFreeForm(true);
            setLoading(false);
            return;
        }

        // Lanjutkan ke submit payment
        const submitPayment = async (retryCount = 0): Promise<void> => {
            const originalDiscountAmount = bootcamp.strikethrough_price > 0
                ? bootcamp.strikethrough_price - bootcamp.price
                : 0;
            const promoDiscountAmount = discountData?.discount_amount || 0;
            const finalPrice = bootcamp.price - promoDiscountAmount;
            const totalAmount = finalPrice + 5000; // Admin fee

            const invoiceData: InvoiceData = {
                type: 'bootcamp',
                id: bootcamp.id,
                discount_amount: originalDiscountAmount + promoDiscountAmount,
                nett_amount: finalPrice,
                total_amount: totalAmount,
                transaction_fee: adminFee,
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
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return submitPayment(retryCount + 1);
                }

                const data = await res.json();

                if (res.ok && data.success) {
                    if (data.payment_url) {
                        // Hapus pending checkout setelah berhasil
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
            toast.error(error.message || 'Terjadi kesalahan saat proses pembayaran.');
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

    useEffect(() => {

        const pendingCheckout = sessionStorage.getItem('pendingCheckout');

        if (pendingCheckout && isLoggedIn) {
            try {
                const checkoutData = JSON.parse(pendingCheckout);

                // Validasi timestamp (maksimal 5 menit)
                const timestamp = checkoutData.timestamp || 0;
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;

                if ((now - timestamp) > fiveMinutes) {
                    sessionStorage.removeItem('pendingCheckout');
                    toast.error('Sesi checkout telah kadaluarsa');
                    return;
                }

                // Validasi bootcamp ID
                if (checkoutData.bootcampId !== bootcamp.id) {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                if (checkoutData.source !== 'register') {
                    sessionStorage.removeItem('pendingCheckout');
                    return;
                }

                // Restore state
                if (checkoutData.promoCode) {
                    setPromoCode(checkoutData.promoCode);
                }
                if (checkoutData.discountData) {
                    setDiscountData(checkoutData.discountData);
                }
                setTermsAccepted(checkoutData.termsAccepted || false);

                // Toast notification
                toast.success('Melanjutkan pembayaran...');

                // Auto-submit setelah delay
                setTimeout(async () => {
                    setLoading(true);

                    const submitPayment = async (retryCount = 0): Promise<void> => {
                        const originalDiscountAmount = bootcamp.strikethrough_price > 0
                            ? bootcamp.strikethrough_price - bootcamp.price
                            : 0;
                        const promoDiscountAmount = checkoutData.discountData?.discount_amount || 0;
                        const finalPrice = bootcamp.price - promoDiscountAmount;
                        const totalAmount = finalPrice + 5000; // Admin fee

                        const invoiceData: InvoiceData = {
                            type: 'bootcamp',
                            id: bootcamp.id,
                            discount_amount: originalDiscountAmount + promoDiscountAmount,
                            nett_amount: finalPrice,
                            total_amount: totalAmount,
                            transaction_fee: adminFee,
                        };

                        if (checkoutData.discountData?.valid) {
                            invoiceData.discount_code_id = checkoutData.discountData.discount_code.id;
                            invoiceData.discount_code_amount = checkoutData.discountData.discount_amount;
                        }


                        try {
                            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

                            const res = await fetch(route('invoice.store'), {
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
                                await new Promise(resolve => setTimeout(resolve, 2000));
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
                }, 2000); // Tingkatkan delay jadi 2 detik

            } catch (error) {
                console.error('Error processing pending checkout:', error);
                sessionStorage.removeItem('pendingCheckout');
                toast.error('Gagal memproses checkout');
            }
        }
    }, [isLoggedIn, bootcamp.id]);

    const continuePendingPayment = () => {
        if (pendingInvoice?.invoice_url) {
            window.location.href = pendingInvoice.invoice_url;
            return;
        }

        window.location.reload();
    };

    if (isLoggedIn && !isProfileComplete) {
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
                        {!isLoggedIn && (
                            <div className=" overflow-hidden rounded-2xl border bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-800/95">
                                <form className="flex flex-col gap-6 p-6" onSubmit={submit}>
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
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">
                                                    Kosongkan jika tidak memiliki instansi
                                                </p>
                                            )}
                                            <InputError message={errors.instance} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
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
