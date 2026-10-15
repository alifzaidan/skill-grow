import { parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BadgeCheck, Check, Hourglass, LoaderCircle, Package, RefreshCw, User, X, ShoppingCart, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstallmentOptions, { ActiveInstallmentData, InstallmentTermOption } from '@/components/installment-options';
import { useTranslation } from 'react-i18next';

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

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
    batch?: string | null;
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

interface PendingInvoice {
    id: string;
    invoice_code: string;
    status: string;
    amount: number;
    payment_method?: string;
    invoice_url?: string | null;
    va_number?: string;
    qr_code_url?: string;
    bank_name?: string;
    created_at: string;
    expires_at: string;
}

interface CheckoutBundleProps {
    bundle: Bundle;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    pendingInvoiceUrl?: string | null;
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
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

interface GuestFormData {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
}

interface PendingCheckoutData {
    bundleId: string;
    timestamp: number;
    promoCode: string;
    discountData: DiscountData | null;
    termsAccepted: boolean;
    codeType?: 'voucher' | 'referral';
    referralValid?: boolean;
    pointsChecked?: boolean;
    pointsToUse?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export default function CheckoutBundle({
    bundle,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    pendingInvoiceUrl,
    referralInfo,
    installmentTerms = [],
}: CheckoutBundleProps) {
    const { t, i18n } = useTranslation('user');
    const [activeInstallment, setActiveInstallment] = useState<ActiveInstallmentData | null>(initialActiveInstallment);
    const isAnyTermOverdue = !initialActiveInstallment && installmentTerms.some((t: any) => {
        if (!t.due_date) return false;
        try {
            const d = typeof t.due_date === 'string' ? parseISO(t.due_date) : new Date(t.due_date);
            if (isNaN(d.getTime())) return false;
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            return new Date() > endOfDay;
        } catch {
            return false;
        }
    });

    const [paymentTab, setPaymentTab] = useState<'full' | 'installment'>(initialActiveInstallment ? 'installment' : 'full');
    const hasInstallments = Boolean((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid));
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number && auth.user?.instance && auth.user?.city;

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancellingInvoice, setCancellingInvoice] = useState(false);

    const formatRupiah = (val: number) => `Rp ${val.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}`;

    const transactionFee = 5000;
    const bundleDiscount = bundle.strikethrough_price - bundle.price;
    const [discountData, setDiscountData] = useState<DiscountData | null>(null);
    const discountAmount = discountData?.valid ? discountData.discount_amount : 0;

    // Referral & Points State
    const [codeType, setCodeType] = useState<'voucher' | 'referral'>('voucher');
    const [userPoints, setUserPoints] = useState(0);
    const [pointsChecked, setPointsChecked] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointsError, setPointsError] = useState('');

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [referralData, setReferralData] = useState<{ valid: boolean; referrer?: { name: string } } | null>(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');

    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);

    const [guestFormData, setGuestFormData] = useState<GuestFormData>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        city: '',
    });

    const maxPointsAllowed = bundle.price - discountAmount;
    const finalBundle = bundle.price - discountAmount - (pointsChecked ? pointsToUse : 0);
    const totalPrice = finalBundle + transactionFee;

    const benefitList = parseList((bundle as any).benefits || bundle.description);
    const requirementList = [
        t('bundling.checkout.reqInternet'),
        t('bundling.checkout.reqBrowser'),
        t('bundling.checkout.reqWillingness'),
    ];
    const curriculumList = bundle.bundle_items?.map((item) => item.bundleable.title) || [];

    const updateGuestForm = (field: keyof GuestFormData, value: string) => {
        setGuestFormData((prev) => ({ ...prev, [field]: value }));
    };

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

    const validatePromoCode = useCallback(async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: Record<string, string | number> = {
                code: promoCode,
                amount: bundle.price,
                product_type: 'bundle',
                product_id: bundle.id,
            };

            if (!isLoggedIn && emailExists && guestFormData.email) {
                requestData.email = guestFormData.email;
            }

            const response = await axios.post('/api/discount-codes/validate', requestData);

            if (response.data.valid) {
                setDiscountData(response.data);
                setPromoError('');
            } else {
                setDiscountData(null);
                setPromoError(response.data.message || t('bundling.checkout.errors.invalidPromo'));
            }
        } catch (error: unknown) {
            setDiscountData(null);
            if (axios.isAxiosError(error)) {
                setPromoError(error.response?.data?.message || t('bundling.checkout.errors.promoValidateError'));
            } else {
                setPromoError(t('bundling.checkout.errors.promoValidateError'));
            }
        } finally {
            setPromoLoading(false);
        }
    }, [bundle.id, bundle.price, emailExists, guestFormData.email, isLoggedIn, promoCode, t]);

    const validateReferralCode = useCallback(async () => {
        if (!promoCode.trim()) return;

        setReferralLoading(true);
        setReferralError('');

        try {
            const response = await axios.post('/api/referral/validate', {
                code: promoCode,
                email: !isLoggedIn ? guestFormData.email : undefined,
            });
            const data = response.data;

            if (data.valid) {
                setReferralData(data);
                setReferralError('');
            } else {
                setReferralData(null);
                setReferralError(data.message || t('bundling.checkout.errors.invalidReferral'));
            }
        } catch (error: unknown) {
            setReferralData(null);
            if (axios.isAxiosError(error)) {
                setReferralError(error.response?.data?.message || t('bundling.checkout.errors.referralValidateError'));
            } else {
                setReferralError(t('bundling.checkout.errors.referralValidateError'));
            }
        } finally {
            setReferralLoading(false);
        }
    }, [promoCode, isLoggedIn, guestFormData.email, t]);

    useEffect(() => {
        if (!promoCode.trim()) {
            setDiscountData(null);
            setReferralData(null);
            setPromoError('');
            setReferralError('');
            return;
        }

        const timer = setTimeout(() => {
            if (codeType === 'voucher') {
                validatePromoCode();
            } else {
                validateReferralCode();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [promoCode, codeType, validatePromoCode, validateReferralCode]);

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
                const response = await axios.post('/api/check-email', {
                    email,
                    type: 'bundle',
                    id: bundle.id,
                    bundle_id: bundle.id,
                });
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

                    if (data.active_installment) {
                        setActiveInstallment(data.active_installment);
                        setPaymentTab('installment');
                    } else {
                        setActiveInstallment(null);
                    }
                } else {
                    setEmailExists(false);
                    setUserPoints(0);
                    setPointsChecked(false);
                    setPointsToUse(0);
                    setActiveInstallment(null);
                }
            } catch {
                setEmailExists(false);
                setUserPoints(0);
                setPointsChecked(false);
                setPointsToUse(0);
                setActiveInstallment(null);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [guestFormData.email, isLoggedIn, bundle.id]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refFromUrl = urlParams.get('ref');

        if (refFromUrl) {
            sessionStorage.setItem('referral_code', refFromUrl);
        } else if (referralInfo?.code) {
            sessionStorage.setItem('referral_code', referralInfo.code);
        }
    }, [referralInfo]);

    const refreshCSRFToken = useCallback(async (): Promise<string> => {
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
    }, []);

    const handleCancelInvoice = async () => {
        const invoiceId = pendingInvoice?.id;
        if (!invoiceId) return;
        if (!confirm(t('bundling.checkout.confirmCancel'))) return;

        setCancellingInvoice(true);
        try {
            const response = await axios.post(route('invoice.cancel', { id: invoiceId }));
            if (response.data?.success || response.status === 200) {
                toast.success(t('bundling.checkout.cancelSuccess'));
                window.location.reload();
            } else {
                toast.error(response.data?.message || t('bundling.checkout.cancelFailed'));
            }
        } catch (error: unknown) {
            console.error('Cancel invoice error:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('bundling.checkout.cancelFailed'));
            } else {
                toast.error(t('bundling.checkout.cancelFailed'));
            }
        } finally {
            setCancellingInvoice(false);
        }
    };

    const submitPayment = async (): Promise<void> => {
        const activeDiscountAmount = discountData?.valid ? discountData.discount_amount : 0;
        const activeFinalPrice = bundle.price - activeDiscountAmount;
        
        const pointsDeduction = pointsChecked ? pointsToUse : 0;
        const finalNettAmount = activeFinalPrice - pointsDeduction;
        const activeTotal = finalNettAmount + transactionFee;

        const invoiceData: Record<string, string | number> = {
            bundle_id: bundle.id,
            discount_amount: bundleDiscount + activeDiscountAmount,
            nett_amount: finalNettAmount,
            transaction_fee: transactionFee,
            total_amount: activeTotal,
            points_redeemed: pointsDeduction,
        };
        if (discountData?.valid && codeType === 'voucher') {
            invoiceData.discount_code_id = discountData.discount_code.id;
            invoiceData.discount_code_amount = discountData.discount_amount;
        }

        if (codeType === 'referral' && referralData?.valid) {
            invoiceData.referral_code = promoCode;
        }

        try {
            const res = await axios.post(route('invoice.store.bundle'), invoiceData);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    sessionStorage.removeItem('pendingCheckoutBundle');
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error(t('bundling.checkout.errors.noPaymentUrl'));
                }
            } else {
                throw new Error(res.data?.message || t('bundling.checkout.errors.createInvoiceFailed'));
            }
        } catch (error: unknown) {
            console.error('Payment error:', error);
            throw error;
        }
    };

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!guestFormData.email || !guestFormData.phone_number || !guestFormData.instance || !guestFormData.city) {
            toast.error(t('bundling.checkout.errors.completePersonalData'));
            return false;
        }

        try {
            if (emailExists) {
                const loginResponse = await axios.post(route('auto-login'), {
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                    instance: guestFormData.instance,
                    city: guestFormData.city,
                });

                if (!loginResponse.data?.success) {
                    throw new Error(loginResponse.data?.message || t('bundling.checkout.errors.autoLoginFailed'));
                }
            } else {
                if (!guestFormData.name) {
                    toast.error(t('bundling.checkout.errors.nameRequired'));
                    return false;
                }

                const regResponse = await axios.post(route('register'), {
                    name: guestFormData.name,
                    email: guestFormData.email,
                    phone_number: guestFormData.phone_number,
                    instance: guestFormData.instance,
                    city: guestFormData.city,
                    password: guestFormData.phone_number,
                    password_confirmation: guestFormData.phone_number,
                    affiliate_code: (codeType === 'referral' && referralData?.valid) ? promoCode : (sessionStorage.getItem('referral_code') || referralInfo?.code || ''),
                });

                if (!(regResponse.data?.success || regResponse.status === 200 || regResponse.status === 201)) {
                    throw new Error(t('bundling.checkout.errors.registerFailed'));
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || t('bundling.checkout.errors.processRegistrationFailed'));
            return false;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('bundling.checkout.errors.activeInstallmentTab'));
            setPaymentTab('installment');
            return;
        }

        // 1. Jika belum login, proses autentikasi (auto-login atau register) terlebih dahulu
        if (!isLoggedIn) {
            if (!termsAccepted) {
                toast.error(t('bundling.checkout.errors.termsRequired'));
                return;
            }

            setLoading(true);

            const authOk = await ensureAuth();
            if (!authOk) {
                setLoading(false);
                return;
            }

            try {
                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment();
            } catch (error: unknown) {
                setLoading(false);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || t('bundling.checkout.errors.processRegistrationFailed'));
                } else {
                    toast.error(getErrorMessage(error, t('bundling.checkout.errors.processRegistrationFailed')));
                }
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted) {
            toast.error(t('bundling.checkout.errors.termsRequired'));
            return;
        }

        setLoading(true);
        try {
            await submitPayment();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('bundling.checkout.errors.paymentFailed'));
            } else {
                toast.error(getErrorMessage(error, t('bundling.checkout.errors.paymentFailed')));
            }
            setLoading(false);
        }
    };

    return (
        <UserLayout>
            <Head title={t('bundling.checkout.pageTitle', { title: bundle.title })} />
            <div className="min-h-screen w-full bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detail Pesanan Card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <img
                                        src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={bundle.title}
                                        className="w-full md:w-64 h-36 rounded-xl object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                                {bundle.title}
                                            </h4>
                                            {bundle.short_description ? (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    {bundle.short_description}
                                                </p>
                                            ) : bundle.description ? (
                                                <div 
                                                    className="text-sm text-gray-500 mt-2 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: bundle.description }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    {t('bundling.checkout.defaultBundleDesc')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-md inline-block uppercase tracking-wider">
                                                {t('bundling.checkout.bundleBadge')}
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
                                        {t('bundling.checkout.tabBenefits')}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="requirements" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        {t('bundling.checkout.tabRequirements')}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="curriculum" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        {t('bundling.checkout.tabCurriculum')}
                                    </TabsTrigger>
                                </TabsList>
                                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <TabsContent value="benefits" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bundling.checkout.whatYouWillGet')}</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mt-0.5">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </span>
                                                <span className="leading-tight">
                                                    {t('bundling.checkout.benefitSavePercent', { percent: Math.round(((bundle.strikethrough_price - bundle.price) / bundle.strikethrough_price) * 100) })}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mt-0.5">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </span>
                                                <span className="leading-tight">
                                                    {t('bundling.checkout.benefitDirectAccess', { count: bundle.bundle_items_count })}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mt-0.5">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </span>
                                                <span className="leading-tight">
                                                    {t('bundling.checkout.benefitOfficialCert')}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mt-0.5">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                </span>
                                                <span className="leading-tight">
                                                    {t('bundling.checkout.benefitLifetimeAccess')}
                                                </span>
                                            </li>
                                        </ul>
                                    </TabsContent>
                                    <TabsContent value="requirements" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bundling.checkout.programRequirements')}</h4>
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
                                    </TabsContent>
                                    <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bundling.checkout.curriculumTitle', { count: bundle.bundle_items_count })}</h4>
                                        <div className="space-y-3">
                                            {bundle.bundle_items.map((item, idx) => (
                                                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                                                    <div className="bg-[#F9A885]/10 text-[#F9A885] flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1 text-left">
                                                        <p className="truncate font-semibold text-gray-900 text-sm">{item.bundleable.title}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">
                                                            {item.bundleable_type.includes('Course')
                                                                ? t('bundling.checkout.courseBadge')
                                                                : item.bundleable_type.includes('Bootcamp')
                                                                  ? t('bundling.checkout.bootcampBadge')
                                                                  : t('bundling.checkout.webinarBadge')}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 shrink-0">
                                                        {item.price === 0 ? t('bundling.checkout.free') : formatRupiah(item.price)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>

                            {/* Guest Form Card (Masukkan Data Diri Anda) */}
                            {!isLoggedIn && !hasAccess && !pendingInvoiceUrl && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <h3 className="font-bold text-gray-900 text-lg mb-4">{t('bundling.checkout.personalDataTitle')}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest-email" className="font-semibold text-gray-700">{t('bundling.checkout.emailLabel')}</Label>
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
                                            {checkingEmail && <p className="text-xs text-gray-500">{t('bundling.checkout.checkingEmail')}</p>}
                                            {emailExists && <p className="text-xs text-green-600">{t('bundling.checkout.emailFound')}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-name" className="font-semibold text-gray-700">{t('bundling.checkout.nameLabel')}</Label>
                                            <Input
                                                id="guest-name"
                                                type="text"
                                                placeholder={t('bundling.checkout.namePlaceholder')}
                                                value={guestFormData.name}
                                                onChange={(e) => updateGuestForm('name', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-phone" className="font-semibold text-gray-700">{t('bundling.checkout.phoneLabel')}</Label>
                                            <Input
                                                id="guest-phone"
                                                type="tel"
                                                placeholder={t('bundling.checkout.phonePlaceholder')}
                                                value={guestFormData.phone_number}
                                                onChange={(e) => updateGuestForm('phone_number', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">{t('bundling.checkout.phoneNotice')}</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">{t('bundling.checkout.accountLockedNotice')}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-instance" className="font-semibold text-gray-700">{t('bundling.checkout.instanceLabel')}</Label>
                                            <Input
                                                id="guest-instance"
                                                type="text"
                                                placeholder={t('bundling.checkout.instancePlaceholder')}
                                                value={guestFormData.instance}
                                                onChange={(e) => updateGuestForm('instance', e.target.value)}
                                                disabled={loading}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-city" className="font-semibold text-gray-700">{t('bundling.checkout.cityLabel')}</Label>
                                            <Input
                                                id="guest-city"
                                                type="text"
                                                placeholder={t('bundling.checkout.cityPlaceholder')}
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
                            {hasAccess && (!activeInstallment || activeInstallment.is_fully_paid) ? (
                                <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xs">
                                    <BadgeCheck size={64} className="text-green-500" />
                                    <h2 className="text-xl font-bold">{t('bundling.checkout.alreadyHaveAccessTitle')}</h2>
                                    <p className="text-sm text-gray-500">{t('bundling.checkout.alreadyHaveAccessDesc')}</p>
                                    <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                        <a href={route('profile.index')}>{t('bundling.checkout.btnViewDashboard')}</a>
                                    </Button>
                                </div>
                            ) : (pendingInvoice || pendingInvoiceUrl) && !activeInstallment ? (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-6">
                                    <div
                                        className="rounded-xl p-4 flex items-center gap-2 bg-yellow-50/50"
                                    >
                                        <Hourglass className="h-5 w-5 text-yellow-600 animate-pulse" />
                                        <h4 className="font-bold text-yellow-950">{t('bundling.checkout.pendingPayment')}</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 rounded-xl bg-gray-50/50 p-4 border border-gray-100 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bundling.checkout.invoiceNumber')}</span>
                                                <span className="font-semibold text-gray-800">{pendingInvoice?.invoice_code || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bundling.checkout.paymentMethod')}</span>
                                                <span className="font-semibold text-gray-800">DOKU</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bundling.checkout.totalPayment')}</span>
                                                <span className="text-lg font-bold text-[#FA5F25]">
                                                    {formatRupiah(pendingInvoice?.amount || bundle.price + transactionFee)}
                                                </span>
                                            </div>
                                        </div>

                                        {(pendingInvoice?.invoice_url || pendingInvoiceUrl) && (
                                            <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                                <a href={pendingInvoice?.invoice_url || pendingInvoiceUrl || '#'}>{t('bundling.checkout.btnContinuePayment')}</a>
                                            </Button>
                                        )}

                                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 rounded-full border-gray-200 text-gray-700">
                                            {t('bundling.checkout.checkPaymentStatus')}
                                        </Button>

                                        {pendingInvoice?.id && (
                                            <Button
                                                onClick={handleCancelInvoice}
                                                disabled={cancellingInvoice}
                                                variant="ghost"
                                                className="w-full py-6 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {cancellingInvoice ? t('bundling.checkout.cancelling') : t('bundling.checkout.btnCancelOrder')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCheckout} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">{t('bundling.checkout.paymentSummaryTitle')}</h3>

                                    {hasInstallments ? (
                                        <Tabs
                                            value={paymentTab}
                                            onValueChange={(val) => {
                                                if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                    toast.error(t('bundling.checkout.errors.activeInstallmentNotice'));
                                                    return;
                                                }
                                                if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                    toast.error(t('bundling.checkout.errors.installmentOverdue'));
                                                    return;
                                                }
                                                setPaymentTab(val as 'full' | 'installment');
                                            }}
                                            className="w-full space-y-4"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger
                                                    value="full"
                                                    disabled={!!activeInstallment && !activeInstallment.is_fully_paid}
                                                >
                                                    {t('bundling.checkout.tabFullPayment')}
                                                </TabsTrigger>
                                                <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="flex items-center justify-center gap-1.5">
                                                    <span>{t('bundling.checkout.tabInstallment')}</span>
                                                    {((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) && (
                                                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                            {activeInstallment && !activeInstallment.is_fully_paid
                                                                ? t('bundling.checkout.installmentBadge', { count: activeInstallment.total_terms || activeInstallment.terms?.length })
                                                                : t('bundling.checkout.installmentBadge', { count: installmentTerms?.length || 0 })}
                                                        </span>
                                                    )}
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="full" className="space-y-4 m-0">
                                                {/* Pilihan Jenis Kode */}
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-gray-700">{t('bundling.checkout.codeType')}</Label>
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
                                                            <Label htmlFor="code-voucher" className="cursor-pointer font-medium">{t('bundling.checkout.voucher')}</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="referral" id="code-referral" />
                                                            <Label htmlFor="code-referral" className="cursor-pointer font-medium">{t('bundling.checkout.referral')}</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                {/* Input Kode Promo */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="promo-code" className="font-semibold text-gray-700">
                                                        {t('bundling.checkout.havePromoCode')}
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                id="promo-code"
                                                                type="text"
                                                                placeholder={codeType === 'voucher' ? t('bundling.checkout.enterVoucherCode') : t('bundling.checkout.enterReferralCode')}
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
                                                                    {t('bundling.checkout.voucherSuccess', { code: discountData.discount_code.code })}
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-xs text-green-600">
                                                                {t('bundling.checkout.voucherDiscount', { name: discountData.discount_code.name, value: discountData.discount_code.formatted_value })}
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
                                                                    {t('bundling.checkout.referralSuccess')}
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-xs text-green-600">
                                                                {t('bundling.checkout.referralReferredBy', { name: referralData.referrer?.name })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Point Reward/Redeem Section */}
                                                {(isLoggedIn || emailExists) && userPoints > 0 && (
                                                    <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-base font-semibold text-gray-700">{t('bundling.checkout.useRewardPoints')}</Label>
                                                                <p className="text-muted-foreground text-xs">
                                                                    {t('bundling.checkout.pointsBalance', { points: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID'), rupiah: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID') })}
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
                                                                <Label htmlFor="points-input" className="text-sm font-medium text-gray-700">{t('bundling.checkout.pointsToUse')}</Label>
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
                                                                                setPointsError(t('bundling.checkout.pointsExceedBalance'));
                                                                            } else if (val > maxPointsAllowed) {
                                                                                setPointsError(t('bundling.checkout.pointsExceedMax', { max: maxPointsAllowed }));
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
                                                                        {t('bundling.checkout.maxPoints')}
                                                                    </Button>
                                                                </div>
                                                                {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                                {codeType === 'voucher' && !!discountData?.valid && (
                                                                    <p className="text-xs text-amber-600">{t('bundling.checkout.pointsConflictVoucher')}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-2 pt-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.normalPrice')}</span>
                                                        <span className="font-semibold text-gray-500 line-through">
                                                            {formatRupiah(bundle.strikethrough_price)}
                                                        </span>
                                                    </div>

                                                    {bundleDiscount > 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bundling.checkout.bundleDiscount')}</span>
                                                            <span className="font-semibold text-red-500">-{formatRupiah(bundleDiscount)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.bundlePrice')}</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {formatRupiah(bundle.price)}
                                                        </span>
                                                    </div>

                                                    {/* Promo Discount */}
                                                    {codeType === 'voucher' && discountData?.valid && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bundling.checkout.promoDiscount', { code: discountData.discount_code.code })}</span>
                                                            <span className="font-semibold text-green-600">
                                                                -{formatRupiah(discountData.discount_amount)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Points Discount */}
                                                    {pointsChecked && pointsToUse > 0 && !pointsError && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bundling.checkout.pointsDiscount')}</span>
                                                            <span className="font-semibold text-green-600">
                                                                -{formatRupiah(pointsToUse)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.transactionFee')}</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {formatRupiah(transactionFee)}
                                                        </span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex items-center justify-between text-base">
                                                        <span className="font-bold text-gray-900">{t('bundling.checkout.totalPayment')}</span>
                                                        <span className="text-[#FA5F25] text-xl font-bold">
                                                            {formatRupiah(totalPrice)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Referral Info */}
                                                {referralInfo.hasActive && (
                                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                                                        <p className="text-sm font-medium text-blue-800">
                                                            {t('bundling.checkout.referralActiveNotice', { code: referralInfo.code })}
                                                        </p>
                                                        <p className="mt-1 text-xs text-blue-600">
                                                            {t('bundling.checkout.referralHelpFriend')}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-3 pt-2">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                                        {t('bundling.checkout.agreeTerms')}{' '}
                                                        <a
                                                            href="/terms-and-conditions"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:underline font-semibold"
                                                        >
                                                            {t('bundling.checkout.termsAndConditions')}
                                                        </a>{' '}
                                                        {t('bundling.checkout.termsNoticeSuffix')}
                                                    </Label>
                                                </div>
                                                <Button
                                                    className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                    type="submit"
                                                    disabled={!termsAccepted || loading}
                                                >
                                                    {loading ? t('bundling.checkout.processing') : t('bundling.checkout.btnPayNow')}
                                                </Button>
                                            </TabsContent>

                                            {/* Tab Cicilan */}
                                            <TabsContent value="installment" className="space-y-4 m-0">
                                                <InstallmentOptions
                                                    productType="bundle"
                                                    productId={bundle.id}
                                                    productPrice={bundle.price}
                                                    terms={installmentTerms}
                                                    activeInstallment={activeInstallment}
                                                    termsAccepted={termsAccepted}
                                                    onTermsAcceptedChange={setTermsAccepted}
                                                    onBeforePay={async () => {
                                                        if (!activeInstallment && !termsAccepted) {
                                                            toast.error(t('bundling.checkout.errors.termsRequired'));
                                                            return false;
                                                        }
                                                        return await ensureAuth();
                                                    }}
                                                />
                                            </TabsContent>
                                        </Tabs>

                                    ) : (
                                        <>
                                            {/* Pilihan Jenis Kode */}
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-gray-700">{t('bundling.checkout.codeType')}</Label>
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
                                                        <Label htmlFor="code-voucher" className="cursor-pointer font-medium">{t('bundling.checkout.voucher')}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="referral" id="code-referral" />
                                                        <Label htmlFor="code-referral" className="cursor-pointer font-medium">{t('bundling.checkout.referral')}</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {/* Input Kode Promo */}
                                            <div className="space-y-2">
                                                <Label htmlFor="promo-code" className="font-semibold text-gray-700">
                                                    {t('bundling.checkout.havePromoCode')}
                                                </Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            id="promo-code"
                                                            type="text"
                                                            placeholder={codeType === 'voucher' ? t('bundling.checkout.enterVoucherCode') : t('bundling.checkout.enterReferralCode')}
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
                                                                {t('bundling.checkout.voucherSuccess', { code: discountData.discount_code.code })}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            {t('bundling.checkout.voucherDiscount', { name: discountData.discount_code.name, value: discountData.discount_code.formatted_value })}
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
                                                                {t('bundling.checkout.referralSuccess')}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            {t('bundling.checkout.referralReferredBy', { name: referralData.referrer?.name })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Point Reward/Redeem Section */}
                                            {(isLoggedIn || emailExists) && userPoints > 0 && (
                                                <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold text-gray-700">{t('bundling.checkout.useRewardPoints')}</Label>
                                                            <p className="text-muted-foreground text-xs">
                                                                {t('bundling.checkout.pointsBalance', { points: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID'), rupiah: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID') })}
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
                                                            <Label htmlFor="points-input" className="text-sm font-medium text-gray-700">{t('bundling.checkout.pointsToUse')}</Label>
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
                                                                            setPointsError(t('bundling.checkout.pointsExceedBalance'));
                                                                        } else if (val > maxPointsAllowed) {
                                                                            setPointsError(t('bundling.checkout.pointsExceedMax', { max: maxPointsAllowed }));
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
                                                                    {t('bundling.checkout.maxPoints')}
                                                                </Button>
                                                            </div>
                                                            {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                            {codeType === 'voucher' && !!discountData?.valid && (
                                                                <p className="text-xs text-amber-600">{t('bundling.checkout.pointsConflictVoucher')}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2 pt-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">{t('bundling.checkout.normalPrice')}</span>
                                                    <span className="font-semibold text-gray-500 line-through">
                                                        {formatRupiah(bundle.strikethrough_price)}
                                                    </span>
                                                </div>

                                                {bundleDiscount > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.bundleDiscount')}</span>
                                                        <span className="font-semibold text-red-500">-{formatRupiah(bundleDiscount)}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">{t('bundling.checkout.bundlePrice')}</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {formatRupiah(bundle.price)}
                                                    </span>
                                                </div>

                                                {/* Promo Discount */}
                                                {codeType === 'voucher' && discountData?.valid && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.promoDiscount', { code: discountData.discount_code.code })}</span>
                                                        <span className="font-semibold text-green-600">
                                                            -{formatRupiah(discountData.discount_amount)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Points Discount */}
                                                {pointsChecked && pointsToUse > 0 && !pointsError && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bundling.checkout.pointsDiscount')}</span>
                                                        <span className="font-semibold text-green-600">
                                                            -{formatRupiah(pointsToUse)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">{t('bundling.checkout.transactionFee')}</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {formatRupiah(transactionFee)}
                                                    </span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between text-base">
                                                    <span className="font-bold text-gray-900">{t('bundling.checkout.totalPayment')}</span>
                                                    <span className="text-[#FA5F25] text-xl font-bold">
                                                        {formatRupiah(totalPrice)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Referral Info */}
                                            {referralInfo.hasActive && (
                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-sm font-medium text-blue-800">
                                                        {t('bundling.checkout.referralActiveNotice', { code: referralInfo.code })}
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-600">
                                                        {t('bundling.checkout.referralHelpFriend')}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3 pt-2">
                                                <Checkbox
                                                    id="terms"
                                                    checked={termsAccepted}
                                                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                    className="mt-0.5"
                                                />
                                                <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                                    {t('bundling.checkout.agreeTerms')}{' '}
                                                    <a
                                                        href="/terms-and-conditions"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-orange-600 hover:underline font-semibold"
                                                    >
                                                        {t('bundling.checkout.termsAndConditions')}
                                                    </a>{' '}
                                                    {t('bundling.checkout.termsNoticeSuffix')}
                                                </Label>
                                            </div>
                                            <Button
                                                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                type="submit"
                                                disabled={!termsAccepted || loading}
                                            >
                                                {loading ? t('bundling.checkout.processing') : t('bundling.checkout.btnPayNow')}
                                            </Button>
                                        </>
                                    )}

                                    <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                                        {t('bundling.checkout.securePaymentNotice')}
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
