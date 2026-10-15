import { parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BadgeCheck, Check, Hourglass, User, X, ShoppingCart, Calendar, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import InstallmentOptions, { ActiveInstallmentData, InstallmentTermOption } from '@/components/installment-options';


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
    requirement_1?: string | null;
    requirement_2?: string | null;
    requirement_3?: string | null;
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

interface GuestFormData {
    name: string;
    email: string;
    phone_number: string;
    instance: string;
    city: string;
}

interface PendingCheckoutData {
    bootcampId: string;
    timestamp: number;
    promoCode: string;
    discountData: DiscountData | null;
    termsAccepted: boolean;
    isFree: boolean;
    codeType?: 'voucher' | 'referral';
    referralValid?: boolean;
    pointsChecked?: boolean;
    pointsToUse?: number;
}

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    const optionsDay: Intl.DateTimeFormatOptions = { day: 'numeric' };
    const optionsMonth: Intl.DateTimeFormatOptions = { month: 'short' };
    const optionsYear: Intl.DateTimeFormatOptions = { year: 'numeric' };

    const startDay = startDate.toLocaleDateString('id-ID', optionsDay);
    const startMonth = startDate.toLocaleDateString('id-ID', optionsMonth);
    const startYear = startDate.toLocaleDateString('id-ID', optionsYear);

    if (!endDate) {
        return `${startDay} ${startMonth} ${startYear}`;
    }

    const endDay = endDate.toLocaleDateString('id-ID', optionsDay);
    const endMonth = endDate.toLocaleDateString('id-ID', optionsMonth);
    const endYear = endDate.toLocaleDateString('id-ID', optionsYear);

    if (startYear === endYear) {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
    } else {
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
};


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

export default function RegisterBootcamp({
    bootcamp,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    pendingInvoiceUrl,
    referralInfo,
    installmentTerms = [],
}: {
    bootcamp: Bootcamp;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    pendingInvoiceUrl?: string | null;
    referralInfo: ReferralInfo;
    installmentTerms?: InstallmentTermOption[];
}) {
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

    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);

    const [guestFormData, setGuestFormData] = useState<GuestFormData>({
        name: '',
        email: '',
        phone_number: '',
        instance: '',
        city: '',
    });

    const [showFreeForm, setShowFreeForm] = useState(false);
    const [freeFormData, setFreeFormData] = useState<Record<string, File | null>>({
        requirement_1_proof: null,
        requirement_2_proof: null,
        requirement_3_proof: null,
    });
    const [fileErrors, setFileErrors] = useState<Record<string, boolean>>({
        requirement_1_proof: false,
        requirement_2_proof: false,
        requirement_3_proof: false,
    });

    const requirementList = parseList(bootcamp.requirements);
    const benefitList = parseList(bootcamp.benefits);
    const curriculumList = parseList(bootcamp.curriculum);
    const isFree = bootcamp.price === 0;

    const transactionFee = 5000;
    const basePrice = bootcamp.price;
    const discountAmount = discountData?.valid ? discountData.discount_amount : 0;
    const maxPointsAllowed = basePrice - discountAmount;

    const finalBootcampPrice = basePrice - discountAmount - (pointsChecked ? pointsToUse : 0);
    const totalPrice = isFree ? 0 : finalBootcampPrice + transactionFee;

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
                amount: bootcamp.price,
                product_type: 'bootcamp',
                product_id: bootcamp.id,
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
                setPromoError(data.message || t('bootcamp.register.errors.invalidPromo'));
            }
        } catch (error: unknown) {
            setDiscountData(null);
            if (axios.isAxiosError(error)) {
                setPromoError(error.response?.data?.message || t('bootcamp.register.errors.promoValidateError'));
            } else {
                setPromoError(t('bootcamp.register.errors.promoValidateError'));
            }
        } finally {
            setPromoLoading(false);
        }
    }, [bootcamp.id, bootcamp.price, emailExists, guestFormData.email, isFree, isLoggedIn, promoCode, t]);

    const validateReferralCode = useCallback(async () => {
        if (!promoCode.trim() || isFree) return;

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
                setReferralError(data.message || t('bootcamp.register.errors.invalidReferral'));
            }
        } catch (error: unknown) {
            setReferralData(null);
            if (axios.isAxiosError(error)) {
                setReferralError(error.response?.data?.message || t('bootcamp.register.errors.referralValidateError'));
            } else {
                setReferralError(t('bootcamp.register.errors.referralValidateError'));
            }
        } finally {
            setReferralLoading(false);
        }
    }, [promoCode, isFree, isLoggedIn, guestFormData.email, t]);

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
                validatePromoCode();
            } else {
                validateReferralCode();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [isFree, promoCode, codeType, validatePromoCode, validateReferralCode]);

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
                    type: 'bootcamp',
                    id: bootcamp.id,
                    bootcamp_id: bootcamp.id,
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
    }, [guestFormData.email, isLoggedIn, bootcamp.id]);

    const handleCancelInvoice = async () => {
        const invoiceId = pendingInvoice?.id;
        if (!invoiceId) return;
        if (!confirm(t('bootcamp.register.errors.confirmCancelOrder'))) return;

        setCancellingInvoice(true);
        try {
            const response = await axios.post(route('invoice.cancel', { id: invoiceId }));
            if (response.data?.success || response.status === 200) {
                toast.success(t('bootcamp.register.cancelSuccess'));
                window.location.reload();
            } else {
                toast.error(response.data?.message || t('bootcamp.register.cancelFailed'));
            }
        } catch (error: unknown) {
            console.error('Cancel invoice error:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('bootcamp.register.cancelFailed'));
            } else {
                toast.error(t('bootcamp.register.cancelFailed'));
            }
        } finally {
            setCancellingInvoice(false);
        }
    };

    const submitPayment = async (): Promise<void> => {
        const originalDiscountAmount = bootcamp.strikethrough_price > 0 ? bootcamp.strikethrough_price - bootcamp.price : 0;
        const promoDiscountAmount = discountData?.valid ? discountData.discount_amount : 0;
        const activeFinalPrice = basePrice - promoDiscountAmount;
        
        const pointsDeduction = pointsChecked ? pointsToUse : 0;
        const finalNettAmount = activeFinalPrice - pointsDeduction;
        const activeTotalPrice = isFree ? 0 : finalNettAmount + transactionFee;

        const invoiceData: Record<string, string | number> = {
            type: 'bootcamp',
            id: bootcamp.id,
            discount_amount: originalDiscountAmount + promoDiscountAmount,
            nett_amount: finalNettAmount,
            transaction_fee: transactionFee,
            total_amount: activeTotalPrice,
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
            const res = await axios.post(route('invoice.store'), invoiceData);

            if (res.data && res.data.success) {
                if (res.data.payment_url) {
                    sessionStorage.removeItem('pendingCheckout');
                    window.location.href = res.data.payment_url;
                } else {
                    throw new Error(t('bootcamp.register.errors.noPaymentUrl'));
                }
            } else {
                throw new Error(res.data?.message || t('bootcamp.register.errors.createInvoiceFailed'));
            }
        } catch (error: unknown) {
            console.error('Payment error:', error);
            throw error;
        }
    };

    const handleFreeCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (!freeFormData.requirement_1_proof || !freeFormData.requirement_2_proof || !freeFormData.requirement_3_proof) {
            alert(t('bootcamp.register.errors.uploadAllProof'));
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('type', 'bootcamp');
        formData.append('id', bootcamp.id);
        formData.append('requirement_1_proof', freeFormData.requirement_1_proof);
        formData.append('requirement_2_proof', freeFormData.requirement_2_proof);
        formData.append('requirement_3_proof', freeFormData.requirement_3_proof);

        router.post(route('enroll.free'), formData, {
            onError: (errors) => {
                console.log('Free enrollment errors:', errors);
                alert(errors.message || t('bootcamp.register.errors.enrollFreeFailed'));
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!guestFormData.email || !guestFormData.phone_number || !guestFormData.instance || !guestFormData.city) {
            toast.error(t('bootcamp.register.errors.completePersonalDataError'));
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
                    throw new Error(loginResponse.data?.message || t('bootcamp.register.errors.autoLoginFailed'));
                }
            } else {
                if (!guestFormData.name) {
                    toast.error(t('bootcamp.register.errors.nameRequired'));
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
                    throw new Error(t('bootcamp.register.errors.registerFailed'));
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || t('bootcamp.register.errors.processRegistrationFailed'));
            return false;
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error(t('bootcamp.register.activeInstallmentAlert'));
            setPaymentTab('installment');
            return;
        }

        // 1. Jika belum login, proses autentikasi (auto-login atau register) terlebih dahulu
        if (!isLoggedIn) {
            if (!termsAccepted && !isFree) {
                toast.error(t('bootcamp.register.errors.termsRequired'));
                return;
            }

            setLoading(true);

            const authOk = await ensureAuth();
            if (!authOk) {
                setLoading(false);
                return;
            }

            if (isFree) {
                setShowFreeForm(true);
                setLoading(false);
                return;
            }

            try {
                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment();
            } catch (error: unknown) {
                setLoading(false);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || t('bootcamp.register.errors.processRegistrationFailed'));
                } else {
                    toast.error(getErrorMessage(error, t('bootcamp.register.errors.processRegistrationFailed')));
                }
            }
            return;
        }

        // 2. Jika sudah login
        if (!termsAccepted && !isFree) {
            toast.error(t('bootcamp.register.errors.termsRequired'));
            return;
        }

        if (isFree) {
            setShowFreeForm(true);
            return;
        }

        setLoading(true);
        try {
            await submitPayment();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || t('bootcamp.register.errors.paymentFailed'));
            } else {
                toast.error(getErrorMessage(error, t('bootcamp.register.errors.paymentFailed')));
            }
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

            toast.error(t('bootcamp.register.errors.fileTooLarge'));
            return;
        }

        // Validasi tipe file (hanya image)
        if (!file.type.startsWith('image/')) {
            setFileErrors((prev) => ({ ...prev, [fieldName]: true }));

            const input = document.querySelector(`input[data-field="${fieldName}"]`) as HTMLInputElement;
            if (input) {
                input.value = '';
            }

            toast.error(t('bootcamp.register.errors.fileMustBeImage'));
            return;
        }

        // File valid
        setFreeFormData((prev) => ({ ...prev, [fieldName]: file }));
        setFileErrors((prev) => ({ ...prev, [fieldName]: false }));

        toast.success(t('bootcamp.register.errors.fileUploaded'));
    };

    if (isLoggedIn && !isProfileComplete) {
        return (
            <UserLayout>
                <Head title={t('bootcamp.register.headTitle')} />
                <section className="to-primary w-full bg-gradient-to-tl from-black px-4">
                    <div className="mx-auto my-12 w-full max-w-7xl px-4">
                        <h2 className="mx-auto mb-4 max-w-3xl bg-gradient-to-r from-[#71D0F7] via-white to-[#E6834A] bg-clip-text text-center text-3xl font-bold text-transparent italic sm:text-4xl">
                            {t('bootcamp.register.pageTitle', { title: bootcamp.title })}
                        </h2>
                        <p className="text-center text-gray-400">{t('bootcamp.register.errors.profileIncomplete')}</p>
                    </div>
                </section>
                <section className="mx-auto my-4 w-full max-w-7xl px-4">
                    <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-lg border p-6 text-center">
                        <User size={64} className="text-orange-500" />
                        <h2 className="text-xl font-bold">{t('bootcamp.register.incompleteProfileTitle')}</h2>
                        <p className="text-sm text-gray-500">
                            {t('bootcamp.register.incompleteProfileDesc')}
                        </p>
                        <Button asChild className="w-full max-w-md">
                            <Link href={route('profile.edit', { redirect: window.location.href })}>{t('bootcamp.register.btnCompleteProfile')}</Link>
                        </Button>
                    </div>
                </section>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title={t('bootcamp.register.headTitle')} />
            <div className="min-h-screen w-full bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detail Pesanan Card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <img
                                        src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={bootcamp.title}
                                        className="w-full md:w-64 h-36 rounded-xl object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                                {bootcamp.title}
                                            </h4>
                                            {bootcamp.description ? (
                                                <div 
                                                    className="text-sm text-gray-500 mt-2 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: bootcamp.description }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    {t('bootcamp.register.programDefaultDesc')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-md inline-block uppercase tracking-wider">
                                                { (bootcamp as any).batch ? `BATCH ${(bootcamp as any).batch}` : 'BOOTCAMP' }
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
                                        {t('bootcamp.register.tabBenefits')}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="requirements" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        {t('bootcamp.register.tabRequirements')}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="curriculum" 
                                        className="rounded-lg text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs text-gray-500 cursor-pointer"
                                    >
                                        {t('bootcamp.register.tabCurriculum')}
                                    </TabsTrigger>
                                </TabsList>
                                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <TabsContent value="benefits" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bootcamp.register.whatYouWillGet')}</h4>
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
                                            <p className="text-sm text-gray-500 italic">{t('bootcamp.register.noBenefits')}</p>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="requirements" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bootcamp.register.programRequirements')}</h4>
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
                                            <p className="text-sm text-gray-500 italic">{t('bootcamp.register.noRequirements')}</p>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none">
                                        <h4 className="font-bold text-gray-900 text-base mb-4">{t('bootcamp.register.programCurriculum')}</h4>
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
                                            <p className="text-sm text-gray-500 italic">{t('bootcamp.register.noCurriculum')}</p>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>

                            {/* Guest Form Card (Masukkan Data Diri Anda) */}
                            {!isLoggedIn && !hasAccess && !pendingInvoiceUrl && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                    <h3 className="font-bold text-gray-900 text-lg mb-4">{t('bootcamp.register.enterPersonalData')}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest-email" className="font-semibold text-gray-700">{t('bootcamp.register.emailLabel')}</Label>
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
                                            {checkingEmail && <p className="text-xs text-gray-500">{t('bootcamp.register.checkingEmail')}</p>}
                                            {emailExists && <p className="text-xs text-green-600">{t('bootcamp.register.emailFound')}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-name" className="font-semibold text-gray-700">{t('bootcamp.register.nameLabel')}</Label>
                                            <Input
                                                id="guest-name"
                                                type="text"
                                                placeholder={t('bootcamp.register.namePlaceholder')}
                                                value={guestFormData.name}
                                                onChange={(e) => updateGuestForm('name', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-phone" className="font-semibold text-gray-700">{t('bootcamp.register.phoneLabel')}</Label>
                                            <Input
                                                id="guest-phone"
                                                type="tel"
                                                placeholder={t('bootcamp.register.phonePlaceholder')}
                                                value={guestFormData.phone_number}
                                                onChange={(e) => updateGuestForm('phone_number', e.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">{t('bootcamp.register.phoneNotice')}</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">{t('bootcamp.register.accountLockedNotice')}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-instance" className="font-semibold text-gray-700">{t('bootcamp.register.instanceLabel')}</Label>
                                            <Input
                                                id="guest-instance"
                                                type="text"
                                                placeholder={t('bootcamp.register.instancePlaceholder')}
                                                value={guestFormData.instance}
                                                onChange={(e) => updateGuestForm('instance', e.target.value)}
                                                disabled={loading}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-city" className="font-semibold text-gray-700">{t('bootcamp.register.cityLabel')}</Label>
                                            <Input
                                                id="guest-city"
                                                type="text"
                                                placeholder={t('bootcamp.register.cityPlaceholder')}
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
                                    <h2 className="text-xl font-bold">{t('bootcamp.register.alreadyHaveAccessTitle')}</h2>
                                    <p className="text-sm text-gray-500">{t('bootcamp.register.alreadyHaveAccessDesc')}</p>
                                    <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                        <a href={bootcamp.group_url ?? ''} target="_blank" rel="noopener noreferrer">
                                            {t('bootcamp.register.btnEnterGroup')}
                                        </a>
                                    </Button>
                                </div>
                            ) : (pendingInvoice || pendingInvoiceUrl) && !activeInstallment ? (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-6">
                                    <div
                                        className="rounded-xl p-4 flex items-center gap-2 bg-yellow-50/50"
                                    >
                                        <Hourglass className="h-5 w-5 text-yellow-600 animate-pulse" />
                                        <h4 className="font-bold text-yellow-950">{t('bootcamp.register.pendingPaymentTitle')}</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 rounded-xl bg-gray-50/50 p-4 border border-gray-100 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bootcamp.register.invoiceNumber')}</span>
                                                <span className="font-semibold text-gray-800">{pendingInvoice?.invoice_code || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bootcamp.register.paymentMethod')}</span>
                                                <span className="font-semibold text-gray-800">DOKU</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">{t('bootcamp.register.totalPayment')}</span>
                                                <span className="text-lg font-bold text-[#FA5F25]">
                                                    Rp {(pendingInvoice?.amount || bootcamp.price + transactionFee).toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {(pendingInvoice?.invoice_url || pendingInvoiceUrl) && (
                                            <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                                <a href={pendingInvoice?.invoice_url || pendingInvoiceUrl || '#'}>{t('bootcamp.register.btnContinuePayment')}</a>
                                            </Button>
                                        )}

                                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 rounded-full border-gray-200 text-gray-700">
                                            {t('bootcamp.register.checkPaymentStatus')}
                                        </Button>

                                        {pendingInvoice?.id && (
                                            <Button
                                                onClick={handleCancelInvoice}
                                                disabled={cancellingInvoice}
                                                variant="ghost"
                                                className="w-full py-6 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {cancellingInvoice ? t('bootcamp.register.cancelling') : t('bootcamp.register.btnCancelOrder')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : !showFreeForm ? (
                                <form onSubmit={handleCheckout} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">{t('bootcamp.register.paymentSummaryTitle')}</h3>
                                    
                                    {isFree ? (
                                        <div className="space-y-2 text-center py-2">
                                            <div className="flex items-center justify-between p-2">
                                                <span className="w-full text-xl font-bold text-green-600">{t('bootcamp.register.freeBadge')}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{t('bootcamp.register.freeInstruction')}</p>
                                            <ul className="space-y-1 text-left text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                                                {bootcamp.requirement_1 && <li>• {bootcamp.requirement_1}</li>}
                                                {bootcamp.requirement_2 && <li>• {bootcamp.requirement_2}</li>}
                                                {bootcamp.requirement_3 && <li>• {bootcamp.requirement_3}</li>}
                                            </ul>
                                            <p className="text-xs text-gray-500">{t('bootcamp.register.uploadProofNotice')}</p>
                                            <Button
                                                className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? t('bootcamp.register.processing') : t('bootcamp.register.btnUploadProof')}
                                            </Button>
                                        </div>
                                    ) : hasInstallments ? (
                                        <Tabs
                                            value={paymentTab}
                                            onValueChange={(val) => {
                                                if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                    toast.error(t('bootcamp.register.hasActiveInstallment'));
                                                    return;
                                                }
                                                if (val === 'installment' && isAnyTermOverdue && !activeInstallment) {
                                                    toast.error(t('bootcamp.register.installmentOverdue'));
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
                                                    {t('bootcamp.register.tabFullPayment')}
                                                </TabsTrigger>
                                                <TabsTrigger value="installment" disabled={isAnyTermOverdue && !activeInstallment} className="flex items-center justify-center gap-1.5">
                                                    <span>{t('bootcamp.register.tabInstallment')}</span>
                                                    {((installmentTerms && installmentTerms.length > 0) || (activeInstallment && !activeInstallment.is_fully_paid)) && (
                                                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                            {activeInstallment && !activeInstallment.is_fully_paid
                                                                ? `${activeInstallment.total_terms || activeInstallment.terms?.length}x`
                                                                : `${installmentTerms?.length || 0}x`}
                                                        </span>
                                                    )}
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="full" className="space-y-4 m-0">
                                                {/* Pilihan Jenis Kode */}
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-gray-700">{t('bootcamp.register.codeType')}</Label>
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
                                                            <Label htmlFor="code-voucher" className="cursor-pointer font-medium">{t('bootcamp.register.voucher')}</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="referral" id="code-referral" />
                                                            <Label htmlFor="code-referral" className="cursor-pointer font-medium">{t('bootcamp.register.referral')}</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                {/* Input Kode Promo */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="promo-code" className="font-semibold text-gray-700">
                                                        {t('bootcamp.register.havePromoCode')}
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                id="promo-code"
                                                                type="text"
                                                                placeholder={codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode') : t('bootcamp.register.enterReferralCode')}
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
                                                                    {t('bootcamp.register.voucherSuccess', { code: discountData.discount_code.code })}
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
                                                                    {t('bootcamp.register.referralSuccess')}
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-xs text-green-600">
                                                                {t('bootcamp.register.referralReferredBy', { name: referralData.referrer?.name })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Point Reward/Redeem Section */}
                                                {(isLoggedIn || emailExists) && userPoints > 0 && (
                                                    <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-base font-semibold text-gray-700">{t('bootcamp.register.useRewardPoints')}</Label>
                                                                <p className="text-muted-foreground text-xs">
                                                                    {t('bootcamp.register.pointsBalance', {
                                                                        points: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID'),
                                                                        rupiah: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')
                                                                    })}
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
                                                                <Label htmlFor="points-input" className="text-sm font-medium text-gray-700">{t('bootcamp.register.pointsToUse')}</Label>
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
                                                                                setPointsError(t('bootcamp.register.pointsExceedBalance'));
                                                                            } else if (val > maxPointsAllowed) {
                                                                                setPointsError(t('bootcamp.register.pointsExceedMax', { max: maxPointsAllowed }));
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
                                                                        className="rounded-xl border-orange-200 text-orange-500 hover:bg-orange-50"
                                                                    >
                                                                        {t('bootcamp.register.maxPoints')}
                                                                    </Button>
                                                                </div>
                                                                {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                                {codeType === 'voucher' && !!discountData?.valid && (
                                                                    <p className="text-xs text-amber-600">{t('bootcamp.register.pointsConflictVoucher')}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-2 pt-2 text-sm">
                                                    {bootcamp.strikethrough_price > 0 && (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">{t('bootcamp.register.originalPrice')}</span>
                                                                <span className="font-semibold text-gray-500 line-through">
                                                                    Rp {bootcamp.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">{t('bootcamp.register.discount')}</span>
                                                                <span className="font-semibold text-red-500">
                                                                    -Rp {(bootcamp.strikethrough_price - bootcamp.price).toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                                </span>
                                                            </div>
                                                            <Separator className="my-2" />
                                                        </>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bootcamp.register.bootcampPrice')}</span>
                                                        <span className="font-semibold text-gray-800">Rp {bootcamp.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                    </div>

                                                    {/* Promo Discount */}
                                                    {codeType === 'voucher' && discountData?.valid && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bootcamp.register.promoDiscount', { code: discountData.discount_code.code })}</span>
                                                            <span className="font-semibold text-green-600">
                                                                -Rp {discountData.discount_amount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Points Discount */}
                                                    {pointsChecked && pointsToUse > 0 && !pointsError && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bootcamp.register.pointsDiscount')}</span>
                                                            <span className="font-semibold text-green-600">
                                                                -Rp {pointsToUse.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bootcamp.register.transactionFee')}</span>
                                                        <span className="font-semibold text-gray-800">Rp {transactionFee.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex items-center justify-between text-base">
                                                        <span className="font-bold text-gray-900">{t('bootcamp.register.totalPayment')}</span>
                                                        <span className="text-[#FA5F25] text-xl font-bold">Rp {totalPrice.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 pt-2">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                                        {t('bootcamp.register.agreeTerms')}{' '}
                                                        <a
                                                            href="/terms-and-conditions"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:underline font-semibold"
                                                        >
                                                            {t('bootcamp.register.termsAndConditions')}
                                                        </a>{' '}
                                                        {t('bootcamp.register.termsNoticeSuffix')}
                                                    </Label>
                                                </div>

                                                <Button
                                                    className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                    type="submit"
                                                    disabled={!termsAccepted || loading}
                                                >
                                                    {loading ? t('bootcamp.register.processing') : t('bootcamp.register.btnPayNow')}
                                                </Button>
                                            </TabsContent>

                                            {/* Tab Cicilan */}
                                            <TabsContent value="installment" className="space-y-4 m-0">
                                                <InstallmentOptions
                                                    productType="bootcamp"
                                                    productId={bootcamp.id}
                                                    productPrice={bootcamp.price}
                                                    terms={installmentTerms}
                                                    activeInstallment={activeInstallment}
                                                    termsAccepted={termsAccepted}
                                                    onTermsAcceptedChange={setTermsAccepted}
                                                    onBeforePay={async () => {
                                                        if (!activeInstallment && !termsAccepted) {
                                                            toast.error(t('bootcamp.register.errors.termsRequired'));
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
                                                <Label className="font-semibold text-gray-700">{t('bootcamp.register.codeType')}</Label>
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
                                                        <Label htmlFor="code-voucher" className="cursor-pointer font-medium">{t('bootcamp.register.voucher')}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="referral" id="code-referral" />
                                                        <Label htmlFor="code-referral" className="cursor-pointer font-medium">{t('bootcamp.register.referral')}</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {/* Input Kode Promo */}
                                            <div className="space-y-2">
                                                <Label htmlFor="promo-code" className="font-semibold text-gray-700">
                                                    {t('bootcamp.register.havePromoCode')}
                                                </Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            id="promo-code"
                                                            type="text"
                                                            placeholder={codeType === 'voucher' ? t('bootcamp.register.enterVoucherCode') : t('bootcamp.register.enterReferralCode')}
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
                                                                {t('bootcamp.register.voucherSuccess', { code: discountData.discount_code.code })}
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
                                                                {t('bootcamp.register.referralSuccess')}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-green-600">
                                                            {t('bootcamp.register.referralReferredBy', { name: referralData.referrer?.name })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Point Reward/Redeem Section */}
                                            {(isLoggedIn || emailExists) && userPoints > 0 && (
                                                <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold text-gray-700">{t('bootcamp.register.useRewardPoints')}</Label>
                                                            <p className="text-muted-foreground text-xs">
                                                                {t('bootcamp.register.pointsBalance', {
                                                                    points: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID'),
                                                                    rupiah: userPoints.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')
                                                                })}
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
                                                            <Label htmlFor="points-input" className="text-sm font-medium text-gray-700">{t('bootcamp.register.pointsToUse')}</Label>
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
                                                                            setPointsError(t('bootcamp.register.pointsExceedBalance'));
                                                                        } else if (val > maxPointsAllowed) {
                                                                            setPointsError(t('bootcamp.register.pointsExceedMax', { max: maxPointsAllowed }));
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
                                                                    className="rounded-xl border-orange-200 text-orange-500 hover:bg-orange-50"
                                                                >
                                                                    {t('bootcamp.register.maxPoints')}
                                                                </Button>
                                                            </div>
                                                            {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                            {codeType === 'voucher' && !!discountData?.valid && (
                                                                <p className="text-xs text-amber-600">{t('bootcamp.register.pointsConflictVoucher')}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2 pt-2 text-sm">
                                                {bootcamp.strikethrough_price > 0 && (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bootcamp.register.originalPrice')}</span>
                                                            <span className="font-semibold text-gray-500 line-through">
                                                                Rp {bootcamp.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">{t('bootcamp.register.discount')}</span>
                                                            <span className="font-semibold text-red-500">
                                                                -Rp {(bootcamp.strikethrough_price - bootcamp.price).toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                            </span>
                                                        </div>
                                                        <Separator className="my-2" />
                                                    </>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">{t('bootcamp.register.bootcampPrice')}</span>
                                                    <span className="font-semibold text-gray-800">Rp {bootcamp.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                </div>

                                                {/* Promo Discount */}
                                                {codeType === 'voucher' && discountData?.valid && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bootcamp.register.promoDiscount', { code: discountData.discount_code.code })}</span>
                                                        <span className="font-semibold text-green-600">
                                                            -Rp {discountData.discount_amount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Points Discount */}
                                                {pointsChecked && pointsToUse > 0 && !pointsError && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">{t('bootcamp.register.pointsDiscount')}</span>
                                                        <span className="font-semibold text-green-600">
                                                            -Rp {pointsToUse.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">{t('bootcamp.register.transactionFee')}</span>
                                                    <span className="font-semibold text-gray-800">Rp {transactionFee.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex items-center justify-between text-base">
                                                    <span className="font-bold text-gray-900">{t('bootcamp.register.totalPayment')}</span>
                                                    <span className="text-[#FA5F25] text-xl font-bold">Rp {totalPrice.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</span>
                                                </div>
                                                <div className="flex items-start gap-3 pt-2">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <Label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                                                        {t('bootcamp.register.agreeTerms')}{' '}
                                                        <a
                                                            href="/terms-and-conditions"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-600 hover:underline font-semibold"
                                                        >
                                                            {t('bootcamp.register.termsAndConditions')}
                                                        </a>{' '}
                                                        {t('bootcamp.register.termsNoticeSuffix')}
                                                    </Label>
                                                </div>
                                                <Button
                                                    className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                    type="submit"
                                                    disabled={!termsAccepted || loading}
                                                >
                                                    {loading ? t('bootcamp.register.processing') : t('bootcamp.register.btnPayNow')}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                                        {t('bootcamp.register.securePaymentNotice')}
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleFreeCheckout} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">{t('bootcamp.register.uploadProofTitle')}</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((index) => {
                                            const requirementKey = `requirement_${index}`;
                                            const proofKey = `${requirementKey}_proof` as const;
                                            const requirementText = bootcamp[requirementKey as keyof Bootcamp] as string | null | undefined;

                                            return (
                                                <div key={index} className="space-y-1.5">
                                                    <Label htmlFor={proofKey} className="font-semibold text-gray-700 text-xs">
                                                        {t('bootcamp.register.proofRequirement', {
                                                            index,
                                                            requirement: requirementText || t('bootcamp.register.proofRequirementDefault', { index })
                                                        })}
                                                    </Label>
                                                    <Input
                                                        id={proofKey}
                                                        data-field={proofKey}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(proofKey, e.target.files?.[0] || null)}
                                                        className={`rounded-xl ${fileErrors[proofKey] ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                    <p className="text-[10px] text-gray-500">
                                                        {t('bootcamp.register.proofRequirementMax', { requirement: requirementText })}
                                                    </p>
                                                </div>
                                            );
                                        })}

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowFreeForm(false);
                                                    setFileErrors({
                                                        requirement_1_proof: false,
                                                        requirement_2_proof: false,
                                                        requirement_3_proof: false,
                                                    });
                                                    setFreeFormData({
                                                        requirement_1_proof: null,
                                                        requirement_2_proof: null,
                                                        requirement_3_proof: null,
                                                    });
                                                }}
                                                className="flex-1 rounded-full border-gray-200 text-gray-700"
                                            >
                                                {t('bootcamp.register.btnBack')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    loading ||
                                                    !freeFormData.requirement_1_proof ||
                                                    !freeFormData.requirement_2_proof ||
                                                    !freeFormData.requirement_3_proof ||
                                                    Object.values(fileErrors).some((e) => e)
                                                }
                                                className="flex-1 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs"
                                            >
                                                {loading ? t('bootcamp.register.processing') : t('bootcamp.register.btnGetAccess')}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
