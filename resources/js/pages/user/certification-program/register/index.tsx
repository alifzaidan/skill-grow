import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import UserLayout from '@/layouts/user-layout';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, BadgeCheck, Calendar, CheckCircle2, Clock, GraduationCap, Loader2, Lock, Tag, User, RotateCcw, ShoppingCart, Check, Hourglass } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstallmentOptions, { ActiveInstallmentData, InstallmentTermOption } from '@/components/installment-options';

function parseList(items?: string | null): string[] {
    if (!items) return [];
    const matches = items.match(/<li>(.*?)<\/li>/g);
    if (!matches) return [];
    return matches.map((li) => li.replace(/<\/?li>/g, '').trim());
}


interface Mentor {
    id: string;
    name: string;
}
interface Schedule {
    id: string;
    schedule_date?: string;
    start_date?: string;
}

interface Program {
    id: string;
    title: string;
    slug: string;
    type: 'regular' | 'scholarship';
    price: number;
    scholarship_price?: number;
    strikethrough_price?: number;
    thumbnail?: string | null;
    registration_deadline?: string;
    mentors: Mentor[];
    schedules?: Schedule[];
    benefits?: string | null;
    terms?: string | null;
    notes?: string | null;
    requirement_1?: string | null;
    requirement_2?: string | null;
    requirement_3?: string | null;
    require_document_upload?: boolean;
    document_required?: boolean;
    document_description?: string | null;
    group_url?: string | null;
}

interface Application {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    type: 'regular' | 'scholarship';
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

interface PendingCheckoutData {
    programSlug: string;
    timestamp: number;
    promoCode: string;
    termsAccepted: boolean;
    discountData: DiscountData | null;
    needsDocumentUpload?: boolean;
    codeType?: 'voucher' | 'referral';
    referralValid?: boolean;
    pointsChecked?: boolean;
    pointsToUse?: number;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

interface RegisterProps {
    program: Program;
    hasAccess: boolean;
    activeInstallment?: ActiveInstallmentData | null;
    pendingInvoice?: PendingInvoice | null;
    pendingInvoiceUrl?: string | null;
    regularApplication?: Application | null;
    scholarshipApplication?: Application | null;
    isScholarship: boolean;
    referralInfo: {
        code: string | null;
        hasActive: boolean;
    };
    installmentTerms?: InstallmentTermOption[];
}

export default function Register({
    program,
    hasAccess,
    activeInstallment: initialActiveInstallment = null,
    pendingInvoice,
    pendingInvoiceUrl,
    regularApplication,
    scholarshipApplication,
    isScholarship,
    referralInfo,
    installmentTerms = [],
}: RegisterProps) {
    const [activeInstallment, setActiveInstallment] = useState<ActiveInstallmentData | null>(initialActiveInstallment);
    const [paymentTab, setPaymentTab] = useState<'full' | 'installment'>(initialActiveInstallment ? 'installment' : 'full');
    const hasInstallments = Boolean(!isScholarship && ((installmentTerms && installmentTerms.length > 0) || activeInstallment));
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as
        | {
              name?: string;
              email?: string;
              phone_number?: string;
              instance?: string;
              city?: string | null;
          }
        | null
        | undefined;
    const isLoggedIn = !!user;
    const isProfileComplete = !!(isLoggedIn && user?.phone_number && user?.instance && user?.city);

    const [isLoading, setIsLoading] = useState(false);
    const [cancellingInvoice, setCancellingInvoice] = useState(false);
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
    const [documentAttachment, setDocumentAttachment] = useState<File | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

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

    const [guestScholarshipStatus, setGuestScholarshipStatus] = useState<string | null>(null);
    const [guestFormData, setGuestFormData] = useState<GuestFormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone_number: user?.phone_number ?? '',
        instance: user?.instance ?? '',
        city: (user?.city as string) ?? '',
    });

    const formatRupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const isApprovedScholarship = scholarshipApplication?.status === 'approved' || guestScholarshipStatus === 'approved';
    const isScholarshipNotApproved = program.type === 'scholarship' && !isApprovedScholarship;
    const displayPrice = isScholarshipNotApproved ? 0 : (isScholarship && program.scholarship_price ? program.scholarship_price : program.price);
    const deadline = program.registration_deadline ? new Date(program.registration_deadline) : null;
    const getDate = (s: Schedule) => s.schedule_date || s.start_date || '';
    const requiresDocumentUpload = program.type === 'regular' && !!(program.require_document_upload || program.document_required) && !isScholarship;
    const documentStatus = regularApplication?.status ?? null;
    const hasApprovedDocument = !requiresDocumentUpload || documentStatus === 'approved';
    const isDocumentPending = documentStatus === 'pending';
    const isDocumentRejected = documentStatus === 'rejected';

    const benefitList = parseList((program as any).benefits);
    const requirementList = parseList((program as any).terms_conditions || (program as any).requirements);
    const curriculumList = program.schedules && program.schedules.length > 0
        ? program.schedules.map((s) => {
              const d = s.schedule_date || s.start_date;
              return d ? `Pertemuan: ${format(new Date(d), 'dd MMMM yyyy', { locale: id })}` : 'Sesi Pelatihan';
          })
        : ["Sesi Pelatihan Utama", "Ujian Sertifikasi Kompetensi"];

    const transactionFee = 5000;
    const basePrice = displayPrice;
    const discountAmount = discountData?.valid ? discountData.discount_amount : 0;
    const maxPointsAllowed = basePrice - discountAmount;

    const finalCertificationPrice = basePrice - discountAmount - (pointsChecked ? pointsToUse : 0);
    const totalPrice = isScholarshipNotApproved ? 0 : (finalCertificationPrice > 0 ? finalCertificationPrice + transactionFee : 0);

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

    const isGuestFormComplete = useCallback(() => {
        if (isLoggedIn) return true;

        const hasEmail = !!guestFormData.email;
        const hasPhone = !!guestFormData.phone_number;
        const hasNameOrEmailExists = !!guestFormData.name || emailExists;
        const hasInstanceOrEmailExists = !!guestFormData.instance || guestScholarshipStatus === 'approved';
        const hasCityOrEmailExists = !!guestFormData.city || guestScholarshipStatus === 'approved';

        return hasEmail && hasPhone && hasNameOrEmailExists && hasInstanceOrEmailExists && hasCityOrEmailExists;
    }, [isLoggedIn, guestFormData, emailExists, guestScholarshipStatus]);

    const validatePromoCode = useCallback(async () => {
        if (!promoCode.trim() || displayPrice === 0) return;

        setPromoLoading(true);
        setPromoError('');

        try {
            const requestData: Record<string, string | number> = {
                code: promoCode,
                amount: displayPrice,
                product_type: 'certification_program',
                product_id: program.id,
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
    }, [displayPrice, emailExists, guestFormData.email, isLoggedIn, program.id, promoCode]);

    const validateReferralCode = useCallback(async () => {
        if (!promoCode.trim() || displayPrice === 0) return;

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
    }, [promoCode, displayPrice, isLoggedIn, guestFormData.email]);

    useEffect(() => {
        if (!promoCode.trim() || displayPrice === 0) {
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
    }, [displayPrice, promoCode, codeType, validatePromoCode, validateReferralCode]);

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
                    type: 'certification_program',
                    id: program.id,
                    program_id: program.id,
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

                // Always check and store scholarship application status, regardless of user existence
                if (data.scholarship_application_status) {
                    setGuestScholarshipStatus(data.scholarship_application_status);
                } else {
                    setGuestScholarshipStatus(null);
                }
            } catch {
                setEmailExists(false);
                setGuestScholarshipStatus(null);
                setUserPoints(0);
                setPointsChecked(false);
                setPointsToUse(0);
                setActiveInstallment(null);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [guestFormData.email, isLoggedIn, program.id]);

    const savePendingCheckout = useCallback(
        (needsDocumentUpload = false) => {
            const pendingCheckoutData: PendingCheckoutData = {
                programSlug: program.slug,
                timestamp: Date.now(),
                promoCode,
                termsAccepted,
                discountData,
                needsDocumentUpload,
                codeType,
                referralValid: codeType === 'referral' && !!referralData?.valid,
                pointsChecked,
                pointsToUse,
            };

            sessionStorage.setItem('pendingCertificationCheckout', JSON.stringify(pendingCheckoutData));
        },
        [discountData, program.slug, promoCode, termsAccepted, codeType, referralData?.valid, pointsChecked, pointsToUse],
    );

    // Show scholarship prompt only when the user hasn't applied yet or their application was rejected.
    // For guests, consider `guestScholarshipStatus` returned by `/api/check-email`.
    const showScholarshipWarning = !!(
        isScholarship &&
        ((!scholarshipApplication && !guestScholarshipStatus) ||
            (scholarshipApplication && scholarshipApplication.status === 'rejected') ||
            guestScholarshipStatus === 'rejected')
    );

    // Determine if scholarship is not approved (either for logged user or guest)
    const scholarshipNotApproved = !!(
        isScholarship &&
        ((scholarshipApplication && scholarshipApplication.status !== 'approved') ||
            (guestScholarshipStatus && guestScholarshipStatus !== 'approved'))
    );

    const handleDocumentSubmit = () => {
        if (!documentAttachment) {
            toast.error('Pilih dokumen pendukung terlebih dahulu');
            return;
        }

        const formData = new FormData();
        formData.append('document_attachment', documentAttachment);

        router.post(route('certification-programs.apply-regular', program.slug), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsDocumentDialogOpen(false);
                setDocumentAttachment(null);
                toast.success('Dokumen berhasil dikirim. Menunggu verifikasi admin.');
            },
            onError: () => {
                toast.error('Gagal mengirim dokumen pendukung');
            },
        });
    };

    const handleCancelInvoice = async () => {
        const invoiceId = pendingInvoice?.id;
        if (!invoiceId) return;
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

        setCancellingInvoice(true);
        try {
            const response = await axios.post(route('invoice.cancel', { id: invoiceId }));
            if (response.data?.success || response.status === 200) {
                toast.success('Pesanan berhasil dibatalkan.');
                window.location.reload();
            } else {
                toast.error(response.data?.message || 'Gagal membatalkan pesanan.');
            }
        } catch (error: unknown) {
            console.error('Cancel invoice error:', error);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan.');
            } else {
                toast.error('Gagal membatalkan pesanan.');
            }
        } finally {
            setCancellingInvoice(false);
        }
    };

    const submitPayment = async (): Promise<void> => {
        const transactionFee = 5000;
        const originalDiscountAmount =
            program.strikethrough_price && program.strikethrough_price > 0 ? program.strikethrough_price - program.price : 0;
        const promoDiscountAmount = discountData?.valid ? discountData.discount_amount : 0;
        const activeFinalPrice = displayPrice - promoDiscountAmount;
        
        const pointsDeduction = pointsChecked ? pointsToUse : 0;
        const finalNettAmount = activeFinalPrice - pointsDeduction;
        const activeTotalPrice = finalNettAmount > 0 ? finalNettAmount + transactionFee : 0;

        const invoiceData: Record<string, string | number> = {
            type: 'certification_program',
            id: program.id,
            discount_amount: originalDiscountAmount + promoDiscountAmount,
            nett_amount: finalNettAmount,
            transaction_fee: transactionFee,
            total_amount: activeTotalPrice,
            isScholarship: isScholarship ? 1 : 0,
            is_scholarship: isScholarship ? 1 : 0,
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
                    sessionStorage.removeItem('pendingCertificationCheckout');
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

    const ensureAuth = async (): Promise<boolean> => {
        if (isLoggedIn) return true;

        if (!isGuestFormComplete()) {
            toast.error('Lengkapi semua data diri terlebih dahulu.');
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
                    throw new Error(loginResponse.data?.message || 'Gagal login otomatis. Pastikan nomor telepon sesuai dengan yang terdaftar.');
                }
            } else {
                if (!guestFormData.name) {
                    toast.error('Nama lengkap wajib diisi.');
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
                    throw new Error('Registrasi gagal.');
                }
            }
            return true;
        } catch (error: any) {
            console.error('Login/Register error:', error);
            toast.error(error.response?.data?.message || error.message || 'Gagal memproses pendaftaran.');
            return false;
        }
    };

    const handleCheckout = async () => {
        if (activeInstallment && !activeInstallment.is_fully_paid) {
            toast.error('Anda sedang memiliki program cicilan berjalan. Silakan selesaikan pembayaran melalui tab Cicilan.');
            setPaymentTab('installment');
            return;
        }

        if (!termsAccepted && displayPrice > 0) {
            toast.error('Anda harus menyetujui syarat dan ketentuan.');
            return;
        }

        // 1. Jika belum login, proses autentikasi (auto-login atau register) terlebih dahulu
        if (!isLoggedIn) {
            setIsLoading(true);

            const authOk = await ensureAuth();
            if (!authOk) {
                setIsLoading(false);
                return;
            }

            if (requiresDocumentUpload && !hasApprovedDocument) {
                if (isDocumentPending || isDocumentRejected) {
                    setIsLoading(false);
                    return;
                }

                setIsDocumentDialogOpen(true);
                setIsLoading(false);
                return;
            }

            try {
                // Langsung jalankan submitPayment tanpa reload!
                await submitPayment();
            } catch (error: unknown) {
                console.error('Payment error:', error);
                setIsLoading(false);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.message || 'Gagal memproses pendaftaran.');
                } else {
                    toast.error(getErrorMessage(error, 'Gagal memproses pendaftaran.'));
                }
            }
            return;
        }

        // 2. Jika sudah login
        if (requiresDocumentUpload && !hasApprovedDocument) {
            if (isDocumentPending || isDocumentRejected) {
                return;
            }

            setIsDocumentDialogOpen(true);
            return;
        }

        setIsLoading(true);

        try {
            await submitPayment();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal memproses pembayaran.');
            } else {
                toast.error(getErrorMessage(error, 'Terjadi kesalahan saat proses pembayaran.'));
            }
            setIsLoading(false);
        }
    };

    const handlePrimaryAction = () => {
        void handleCheckout();
    };

    return (
        <UserLayout>
            <Head title={`Daftar - ${program.title}`} />
            <div className="min-h-screen w-full bg-[url('/assets/images/bg-product.png')] bg-cover bg-center bg-no-repeat py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detail Pesanan Card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <img
                                        src={program.thumbnail ? `/storage/${program.thumbnail}` : '/assets/images/placeholder.png'}
                                        alt={program.title}
                                        className="w-full md:w-64 h-36 rounded-xl object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                                {program.title}
                                            </h4>
                                            {(program as any).description ? (
                                                <div 
                                                    className="text-sm text-gray-500 mt-2 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: (program as any).description }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                    Program sertifikasi profesional terakreditasi untuk meningkatkan kompetensi Anda.
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-md inline-block uppercase tracking-wider">
                                                { program.type === 'scholarship' ? 'BEASISWA' : 'SERTIFIKASI' }
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

                            {/* Alerts */}
                            {pendingInvoiceUrl && !isLoading && (
                                <Alert className="rounded-2xl">
                                    <Clock className="h-4 w-4" />
                                    <AlertTitle>Pembayaran Menunggu</AlertTitle>
                                    <AlertDescription>
                                        Anda memiliki invoice yang belum dibayar.
                                        <Button asChild size="sm" className="mt-2 w-full">
                                            <a href={pendingInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                Lanjutkan Pembayaran
                                            </a>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {requiresDocumentUpload && (
                                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-2xl">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-900 dark:text-amber-200 font-semibold">Dokumen Pendukung Diperlukan</AlertTitle>
                                    <AlertDescription className="space-y-3 text-amber-800 dark:text-amber-300">
                                        <p>
                                            {program.document_description ?? 'Program ini memerlukan dokumen pendukung sebelum pendaftaran diproses.'}
                                        </p>
                                        {!documentStatus && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-full rounded-full border-amber-200"
                                                variant="secondary"
                                                onClick={() => handlePrimaryAction()}
                                            >
                                                Upload Dokumen Pendukung
                                            </Button>
                                        )}
                                        {isDocumentPending && <p>Dokumen sudah dikirim dan sedang menunggu verifikasi admin.</p>}
                                        {isDocumentRejected && (
                                            <p className="text-red-600 dark:text-red-300 font-semibold">
                                                Dokumen Anda ditolak. Silakan hubungi admin untuk tindak lanjut.
                                            </p>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {showScholarshipWarning && (
                                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-2xl">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-900 dark:text-amber-200 font-semibold">Aplikasi Beasiswa Diperlukan</AlertTitle>
                                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                                        Silakan ajukan aplikasi beasiswa dan tunggu persetujuan admin.
                                        <Button asChild size="sm" className="mt-2 w-full rounded-full" variant="secondary">
                                            <Link href={route('certification-programs.scholarship-apply', program.slug)}>Ajukan Beasiswa</Link>
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {regularApplication && regularApplication.status !== 'approved' && (
                                <Alert className="rounded-2xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Status Dokumen: {regularApplication.status}</AlertTitle>
                                    <AlertDescription>
                                        {regularApplication.status === 'pending' ? (
                                            'Dokumen Anda sedang diverifikasi oleh admin.'
                                        ) : (
                                            <span className="text-red-600 dark:text-red-300 font-semibold">Dokumen Anda ditolak. Silakan ajukan ulang.</span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {scholarshipApplication && scholarshipApplication.status !== 'approved' && (
                                <Alert className="rounded-2xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Status Beasiswa: {scholarshipApplication.status}</AlertTitle>
                                    <AlertDescription>
                                        {scholarshipApplication.status === 'pending' ? (
                                            'Aplikasi beasiswa Anda sedang diverifikasi oleh admin.'
                                        ) : (
                                            <span className="text-red-600 dark:text-red-300 font-semibold">
                                                Aplikasi beasiswa Anda ditolak. Silakan ajukan ulang.
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {guestScholarshipStatus && guestScholarshipStatus !== 'approved' && (
                                <Alert className="rounded-2xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Status Beasiswa: {guestScholarshipStatus}</AlertTitle>
                                    <AlertDescription>
                                        {guestScholarshipStatus === 'pending' ? (
                                            'Aplikasi beasiswa Anda sedang diverifikasi oleh admin.'
                                        ) : (
                                            <span className="text-red-600 dark:text-red-300 font-semibold">
                                                Aplikasi beasiswa Anda ditolak. Silakan ajukan ulang.
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {guestScholarshipStatus === 'approved' && (
                                <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl">
                                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                    <AlertTitle>Status Beasiswa: Disetujui</AlertTitle>
                                    <AlertDescription>Pengajuan beasiswa Anda telah disetujui. Silakan lanjutkan pendaftaran.</AlertDescription>
                                </Alert>
                            )}

                            {/* Guest Form Card (Masukkan Data Diri Anda) */}
                            {!isLoggedIn && !hasAccess && !pendingInvoiceUrl && (
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
                                                    onChange={(event) => updateGuestForm('email', event.target.value)}
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
                                            <Label htmlFor="guest-name" className="font-semibold text-gray-700">Nama</Label>
                                            <Input
                                                id="guest-name"
                                                type="text"
                                                placeholder="Nama lengkap Anda"
                                                value={guestFormData.name}
                                                onChange={(event) => updateGuestForm('name', event.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-phone" className="font-semibold text-gray-700">No. Telepon</Label>
                                            <Input
                                                id="guest-phone"
                                                type="tel"
                                                placeholder="08xxxxxxxxxx"
                                                value={guestFormData.phone_number}
                                                onChange={(event) => updateGuestForm('phone_number', event.target.value)}
                                                disabled={emailExists}
                                                className="rounded-xl bg-gray-50/50 border-gray-200 focus:border-orange-500"
                                                required
                                            />
                                            {!emailExists && (
                                                <p className="text-xs text-gray-500">Nomor telepon akan digunakan sebagai password anda</p>
                                            )}
                                            {emailExists && (
                                                <p className="text-xs text-blue-600">Data akun ditemukan dan dikunci agar sesuai akun terdaftar.</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-instance" className="font-semibold text-gray-700">Instansi/Perusahaan</Label>
                                            <Input
                                                id="guest-instance"
                                                type="text"
                                                placeholder="Instansi atau perusahaan Anda"
                                                value={guestFormData.instance}
                                                onChange={(event) => updateGuestForm('instance', event.target.value)}
                                                disabled={isLoading}
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
                                                onChange={(event) => updateGuestForm('city', event.target.value)}
                                                disabled={isLoading}
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
                                    <h2 className="text-xl font-bold">Anda Sudah Memiliki Akses</h2>
                                    <p className="text-sm text-gray-500">Anda sudah terdaftar di program sertifikasi ini.</p>
                                    {program.group_url && (
                                        <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                            <a href={program.group_url} target="_blank" rel="noopener noreferrer">
                                                Masuk Group
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ) : (pendingInvoice || pendingInvoiceUrl) && !activeInstallment ? (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-6">
                                    <div
                                        className="rounded-xl p-4 flex items-center gap-2 bg-yellow-50/50"
                                    >
                                        <Hourglass className="h-5 w-5 text-yellow-600 animate-pulse" />
                                        <h4 className="font-bold text-yellow-950">Pembayaran Tertunda</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2 rounded-xl bg-gray-50/50 p-4 border border-gray-100 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">No. Invoice</span>
                                                <span className="font-semibold text-gray-800">{pendingInvoice?.invoice_code || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Metode Pembayaran</span>
                                                <span className="font-semibold text-gray-800">DOKU</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Total Pembayaran</span>
                                                <span className="text-lg font-bold text-[#FA5F25]">
                                                    Rp {(pendingInvoice?.amount || totalPrice).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        {(pendingInvoice?.invoice_url || pendingInvoiceUrl) && (
                                            <Button asChild className="w-full py-6 rounded-full bg-[#F9A885] hover:bg-[#F9A885]/90 text-white font-semibold shadow-xs">
                                                <a href={pendingInvoice?.invoice_url || pendingInvoiceUrl || '#'}>Lanjutkan Pembayaran</a>
                                            </Button>
                                        )}

                                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 rounded-full border-gray-200 text-gray-700">
                                            Cek Status Pembayaran
                                        </Button>

                                        {pendingInvoice?.id && (
                                            <Button
                                                onClick={handleCancelInvoice}
                                                disabled={cancellingInvoice}
                                                variant="ghost"
                                                className="w-full py-6 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {cancellingInvoice ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
                                    <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Ringkasan Pendaftaran</h3>
                                    {hasInstallments ? (
                                        <Tabs
                                            value={paymentTab}
                                            onValueChange={(val) => {
                                                if (val === 'full' && activeInstallment && !activeInstallment.is_fully_paid) {
                                                    toast.error('Anda memiliki program cicilan berjalan. Silakan selesaikan pembayaran cicilan Anda.');
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
                                                    Pembayaran Penuh
                                                </TabsTrigger>
                                                <TabsTrigger value="installment" className="flex items-center justify-center gap-1.5">
                                                    <span>Cicilan</span>
                                                    {installmentTerms && installmentTerms.length > 0 && (
                                                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                            {installmentTerms.length}x
                                                        </span>
                                                    )}
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="full" className="space-y-4 m-0">
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

                                                {/* Input Kode Promo */}
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
                                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                        ) : promoError ? (
                                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                                        ) : null
                                                                    ) : (
                                                                        referralData?.valid ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                        ) : referralError ? (
                                                                            <AlertCircle className="h-4 w-4 text-red-600" />
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
                                                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/50 dark:bg-green-950/30">
                                                            <Tag className="h-4 w-4 shrink-0 text-green-600" />
                                                            <div className="flex-1 text-sm">
                                                                <span className="font-semibold text-green-800 dark:text-green-200">
                                                                    Hemat {discountData.discount_code.formatted_value}
                                                                </span>
                                                                <span className="text-green-700 dark:text-green-300"> ({discountData.discount_code.name})</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {codeType === 'referral' && referralError && (
                                                        <p className="text-sm text-red-600">{referralError}</p>
                                                    )}
                                                    {codeType === 'referral' && referralData?.valid && (
                                                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/50 dark:bg-green-950/30">
                                                            <Tag className="h-4 w-4 shrink-0 text-green-600" />
                                                            <div className="flex-1 text-sm">
                                                                <span className="font-semibold text-green-800 dark:text-green-200">
                                                                    Referral Aktif
                                                                </span>
                                                                {referralData.referrer?.name && (
                                                                    <span className="text-green-700 dark:text-green-300"> (dari {referralData.referrer.name})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tukar Poin (hanya jika referral aktif / login) */}
                                                {codeType === 'referral' && isLoggedIn && userPoints > 0 && (
                                                    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Tag className="h-4 w-4 text-orange-600" />
                                                                <Label htmlFor="use-points" className="font-semibold text-gray-800 text-sm cursor-pointer">
                                                                    Gunakan Skill Points
                                                                </Label>
                                                            </div>
                                                            <Switch
                                                                id="use-points"
                                                                checked={pointsChecked}
                                                                onCheckedChange={(checked) => {
                                                                    setPointsChecked(checked);
                                                                    if (checked) {
                                                                        const maxAllowedPoints = displayPrice;
                                                                        setPointsToUse(Math.min(userPoints, maxAllowedPoints));
                                                                        setPointsError('');
                                                                    } else {
                                                                        setPointsToUse(0);
                                                                        setPointsError('');
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Poin tersedia: <span className="font-semibold text-orange-600">{userPoints.toLocaleString('id-ID')} Poin</span> (1 Poin = Rp 1)
                                                        </p>
                                                        {pointsChecked && (
                                                            <div className="space-y-1 pt-1">
                                                                <Input
                                                                    type="number"
                                                                    value={pointsToUse || ''}
                                                                    onChange={(e) => {
                                                                        const val = Number(e.target.value);
                                                                        const maxAllowedPoints = displayPrice;
                                                                        if (val > userPoints) {
                                                                            setPointsError(`Poin Anda tidak mencukupi (Maks. ${userPoints.toLocaleString('id-ID')} Poin)`);
                                                                            setPointsToUse(val);
                                                                        } else if (val > maxAllowedPoints) {
                                                                            setPointsError(`Maksimal poin yang dapat digunakan adalah ${maxAllowedPoints.toLocaleString('id-ID')} Poin`);
                                                                            setPointsToUse(val);
                                                                        } else if (val < 0) {
                                                                            setPointsError('Jumlah poin tidak valid');
                                                                            setPointsToUse(0);
                                                                        } else {
                                                                            setPointsError('');
                                                                            setPointsToUse(val);
                                                                        }
                                                                    }}
                                                                    placeholder="Jumlah poin yang ingin digunakan"
                                                                    className="rounded-lg bg-white"
                                                                />
                                                                {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-2 text-sm pt-2">
                                                    {codeType === 'voucher' && discountData?.valid ? (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Harga Program</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Diskon Voucher</span>
                                                                <span className="font-semibold text-green-600">-{formatRupiah(discountData.discount_amount)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Biaya Admin</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                            </div>
                                                            <Separator className="my-2" />
                                                            <div className="flex items-center justify-between text-base">
                                                                <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                                <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                    {formatRupiah(totalPrice)}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-green-600 text-right">Sudah termasuk diskon {discountData.discount_code.formatted_value}</p>
                                                        </>
                                                    ) : pointsChecked && pointsToUse > 0 && !pointsError ? (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Harga Program</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Potongan Poin</span>
                                                                <span className="font-semibold text-green-600">-{formatRupiah(pointsToUse)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Biaya Admin</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                            </div>
                                                            <Separator className="my-2" />
                                                            <div className="flex items-center justify-between text-base">
                                                                <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                                <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                    {formatRupiah(totalPrice)}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-green-600 text-right">Sudah termasuk potongan poin {formatRupiah(pointsToUse)}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {!isScholarshipNotApproved && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-600">Harga Program</span>
                                                                    <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                                </div>
                                                            )}
                                                            {displayPrice > 0 && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-600">Biaya Admin</span>
                                                                    <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                                </div>
                                                            )}
                                                            <Separator className="my-2" />
                                                            <div className="flex items-center justify-between text-base">
                                                                <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                                <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                    {displayPrice > 0 ? formatRupiah(totalPrice) : 'GRATIS'}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {deadline && (
                                                    <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <Calendar size="16" className="text-orange-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-semibold">Batas Pendaftaran:</p>
                                                            <p className="text-gray-500">
                                                                {format(deadline, "dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                                            </p>
                                                        </div>
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
                                                        Saya menyetujui syarat dan ketentuan pendaftaran yang berlaku.
                                                    </Label>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    <Button
                                                        onClick={handlePrimaryAction}
                                                        disabled={
                                                            isLoading ||
                                                            showScholarshipWarning ||
                                                            (!isLoggedIn && !isGuestFormComplete()) ||
                                                            (requiresDocumentUpload && (isDocumentPending || isDocumentRejected)) ||
                                                            (!!regularApplication &&
                                                                regularApplication.status !== 'approved' &&
                                                                !isScholarship &&
                                                                requiresDocumentUpload) ||
                                                            scholarshipNotApproved ||
                                                            (displayPrice > 0 && !termsAccepted)
                                                        }
                                                        className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                    >
                                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        {isLoading
                                                            ? 'Memproses...'
                                                            : requiresDocumentUpload && !hasApprovedDocument && !isDocumentPending && !isDocumentRejected
                                                              ? 'Upload Dokumen Pendukung'
                                                              : 'Lanjutkan Pembayaran'}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            {/* Tab Cicilan */}
                                            <TabsContent value="installment" className="space-y-4 m-0">
                                                <InstallmentOptions
                                                    productType="certification_program"
                                                    productId={program.id}
                                                    productPrice={displayPrice}
                                                    terms={installmentTerms}
                                                    activeInstallment={activeInstallment}
                                                    termsAccepted={termsAccepted}
                                                    onTermsAcceptedChange={setTermsAccepted}
                                                    onBeforePay={async () => {
                                                        if (!activeInstallment && !termsAccepted) {
                                                            toast.error('Anda harus menyetujui syarat dan ketentuan!');
                                                            return false;
                                                        }
                                                        return await ensureAuth();
                                                    }}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <div className="space-y-4">
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

                                            {/* Input Kode Promo */}
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
                                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                    ) : promoError ? (
                                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                                    ) : null
                                                                ) : (
                                                                    referralData?.valid ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                    ) : referralError ? (
                                                                        <AlertCircle className="h-4 w-4 text-red-600" />
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
                                                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/50 dark:bg-green-950/30">
                                                        <Tag className="h-4 w-4 shrink-0 text-green-600" />
                                                        <div className="flex-1 text-sm">
                                                            <span className="font-semibold text-green-800 dark:text-green-200">
                                                                Hemat {discountData.discount_code.formatted_value}
                                                            </span>
                                                            <span className="text-green-700 dark:text-green-300"> ({discountData.discount_code.name})</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {codeType === 'referral' && referralError && (
                                                    <p className="text-sm text-red-600">{referralError}</p>
                                                )}
                                                {codeType === 'referral' && referralData?.valid && (
                                                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/50 dark:bg-green-950/30">
                                                        <Tag className="h-4 w-4 shrink-0 text-green-600" />
                                                        <div className="flex-1 text-sm">
                                                            <span className="font-semibold text-green-800 dark:text-green-200">
                                                                Referral Aktif
                                                            </span>
                                                            {referralData.referrer?.name && (
                                                                <span className="text-green-700 dark:text-green-300"> (dari {referralData.referrer.name})</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tukar Poin (hanya jika referral aktif / login) */}
                                            {codeType === 'referral' && isLoggedIn && userPoints > 0 && (
                                                <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-orange-600" />
                                                            <Label htmlFor="use-points" className="font-semibold text-gray-800 text-sm cursor-pointer">
                                                                Gunakan Skill Points
                                                            </Label>
                                                        </div>
                                                        <Switch
                                                            id="use-points"
                                                            checked={pointsChecked}
                                                            onCheckedChange={(checked) => {
                                                                setPointsChecked(checked);
                                                                if (checked) {
                                                                    const maxAllowedPoints = displayPrice;
                                                                    setPointsToUse(Math.min(userPoints, maxAllowedPoints));
                                                                    setPointsError('');
                                                                } else {
                                                                    setPointsToUse(0);
                                                                    setPointsError('');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Poin tersedia: <span className="font-semibold text-orange-600">{userPoints.toLocaleString('id-ID')} Poin</span> (1 Poin = Rp 1)
                                                    </p>
                                                    {pointsChecked && (
                                                        <div className="space-y-1 pt-1">
                                                            <Input
                                                                type="number"
                                                                value={pointsToUse || ''}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    const maxAllowedPoints = displayPrice;
                                                                    if (val > userPoints) {
                                                                        setPointsError(`Poin Anda tidak mencukupi (Maks. ${userPoints.toLocaleString('id-ID')} Poin)`);
                                                                        setPointsToUse(val);
                                                                    } else if (val > maxAllowedPoints) {
                                                                        setPointsError(`Maksimal poin yang dapat digunakan adalah ${maxAllowedPoints.toLocaleString('id-ID')} Poin`);
                                                                        setPointsToUse(val);
                                                                    } else if (val < 0) {
                                                                        setPointsError('Jumlah poin tidak valid');
                                                                        setPointsToUse(0);
                                                                    } else {
                                                                        setPointsError('');
                                                                        setPointsToUse(val);
                                                                    }
                                                                }}
                                                                placeholder="Jumlah poin yang ingin digunakan"
                                                                className="rounded-lg bg-white"
                                                            />
                                                            {pointsError && <p className="text-xs text-red-600">{pointsError}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2 text-sm pt-2">
                                                {codeType === 'voucher' && discountData?.valid ? (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Harga Program</span>
                                                            <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Diskon Voucher</span>
                                                            <span className="font-semibold text-green-600">-{formatRupiah(discountData.discount_amount)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Biaya Admin</span>
                                                            <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                        </div>
                                                        <Separator className="my-2" />
                                                        <div className="flex items-center justify-between text-base">
                                                            <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                            <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                {formatRupiah(totalPrice)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-green-600 text-right">Sudah termasuk diskon {discountData.discount_code.formatted_value}</p>
                                                    </>
                                                ) : pointsChecked && pointsToUse > 0 && !pointsError ? (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Harga Program</span>
                                                            <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Potongan Poin</span>
                                                            <span className="font-semibold text-green-600">-{formatRupiah(pointsToUse)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Biaya Admin</span>
                                                            <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                        </div>
                                                        <Separator className="my-2" />
                                                        <div className="flex items-center justify-between text-base">
                                                            <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                            <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                {formatRupiah(totalPrice)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-green-600 text-right">Sudah termasuk potongan poin {formatRupiah(pointsToUse)}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        {!isScholarshipNotApproved && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Harga Program</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(displayPrice)}</span>
                                                            </div>
                                                        )}
                                                        {displayPrice > 0 && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Biaya Admin</span>
                                                                <span className="font-semibold text-gray-800">{formatRupiah(transactionFee)}</span>
                                                            </div>
                                                        )}
                                                        <Separator className="my-2" />
                                                        <div className="flex items-center justify-between text-base">
                                                            <span className="font-bold text-gray-900">Total Pembayaran</span>
                                                            <span className="text-[#FA5F25] text-xl font-bold italic">
                                                                {displayPrice > 0 ? formatRupiah(totalPrice) : 'GRATIS'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {deadline && (
                                                <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <Calendar size="16" className="text-orange-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-semibold">Batas Pendaftaran:</p>
                                                        <p className="text-gray-500">
                                                            {format(deadline, "dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                                        </p>
                                                    </div>
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
                                                    Saya menyetujui syarat dan ketentuan pendaftaran yang berlaku.
                                                </Label>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <Button
                                                    onClick={handlePrimaryAction}
                                                    disabled={
                                                        isLoading ||
                                                        showScholarshipWarning ||
                                                        (!isLoggedIn && !isGuestFormComplete()) ||
                                                        (requiresDocumentUpload && (isDocumentPending || isDocumentRejected)) ||
                                                        (!!regularApplication &&
                                                            regularApplication.status !== 'approved' &&
                                                            !isScholarship &&
                                                            requiresDocumentUpload) ||
                                                        scholarshipNotApproved ||
                                                        (displayPrice > 0 && !termsAccepted)
                                                    }
                                                    className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs transition-colors cursor-pointer"
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {isLoading
                                                        ? 'Memproses...'
                                                        : requiresDocumentUpload && !hasApprovedDocument && !isDocumentPending && !isDocumentRejected
                                                          ? 'Upload Dokumen Pendukung'
                                                          : 'Lanjutkan Pembayaran'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Button asChild variant="outline" className="w-full py-6 rounded-full border-gray-200 text-gray-700">
                                        <Link href={route('certification-programs.detail', program.slug)}>Kembali</Link>
                                    </Button>
                                    <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                                        Pembayaran aman dan terenkripsi 🔒
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


                <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Upload Dokumen Pendukung</DialogTitle>
                            <DialogDescription>
                                {program.document_description ?? 'Unggah dokumen yang diminta agar admin dapat memverifikasi pendaftaran Anda.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                                <p className="font-semibold">Format dokumen yang diterima</p>
                                <p className="mt-1">PDF, JPG, JPEG, PNG, atau WebP. Maksimal 5 MB.</p>
                            </div>
                            <Input type="file" accept=".pdf,image/*" onChange={(event) => setDocumentAttachment(event.target.files?.[0] ?? null)} />
                            {documentAttachment && <p className="text-muted-foreground text-sm">File terpilih: {documentAttachment.name}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="button" onClick={handleDocumentSubmit} disabled={isLoading || !documentAttachment}>
                                Upload Dokumen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </UserLayout>
    );
}
