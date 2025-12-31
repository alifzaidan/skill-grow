import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { rupiahFormatter } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertTriangle, Calendar, Check, Package } from 'lucide-react';

interface Bundle {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnail?: string | null;
    registration_deadline?: string | null;
    registration_url: string;
    bundle_items_count: number;
}

interface OwnedItem {
    id: string;
    title: string;
    type: string;
}

interface RegisterSectionProps {
    bundle: Bundle;
    totalOriginalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    hasOwnedItems: boolean;
    ownedItems: OwnedItem[];
}

export default function RegisterSection({
    bundle,
    totalOriginalPrice,
    discountAmount,
    discountPercentage,
    hasOwnedItems,
    ownedItems,
}: RegisterSectionProps) {
    const { auth } = usePage<SharedData>().props;

    const deadline = bundle.registration_deadline ? new Date(bundle.registration_deadline) : null;

    const isLoggedIn = !!auth.user;
    const isProfileComplete = isLoggedIn && auth.user?.phone_number;

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;
    let isDisabled = false;

    if (hasOwnedItems) {
        registrationUrl = '#';
        buttonText = 'Tidak Dapat Mendaftar';
        warningMessage = 'Anda sudah memiliki beberapa produk dalam bundle ini!';
        isDisabled = true;
    } else if (!isLoggedIn) {
        registrationUrl = bundle.registration_url;
        buttonText = 'Login untuk Mendaftar';
        warningMessage = 'Anda harus login terlebih dahulu!';
    } else if (!isProfileComplete) {
        registrationUrl = route('profile.edit', { redirect: window.location.href });
        buttonText = 'Lengkapi Profil untuk Mendaftar';
        warningMessage = 'Profil Anda belum lengkap!';
    } else {
        registrationUrl = bundle.registration_url;
        buttonText = 'Daftar Sekarang';
        warningMessage = null;
    }

    return (
        <section className="mx-auto my-8 w-full max-w-7xl px-4 md:my-10 lg:my-12" id="register">
            <h2 className="dark:text-primary-foreground mb-3 text-center text-2xl font-bold text-gray-900 italic sm:text-3xl md:mb-4 md:text-4xl">
                Informasi Pendaftaran
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600 md:mb-8 md:text-base dark:text-gray-400">
                Daftar sekarang dan dapatkan akses ke semua program pembelajaran dalam paket bundling ini.
            </p>

            {/* ✅ Warning if user already owns items */}
            {hasOwnedItems && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <p className="mb-2 font-semibold">Anda sudah memiliki produk berikut dalam bundle ini:</p>
                        <ul className="ml-4 list-disc space-y-1">
                            {ownedItems.map((item) => (
                                <li key={item.id}>
                                    <span className="font-medium">{item.type}:</span> {item.title}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-sm">Untuk menghindari duplikasi, Anda tidak dapat membeli bundle ini.</p>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md md:flex-row md:gap-6 md:p-6 dark:border-zinc-700 dark:bg-zinc-800">
                {/* Left - Image */}
                <img
                    src={bundle.thumbnail ? `/storage/${bundle.thumbnail}` : '/assets/images/placeholder.png'}
                    alt={bundle.title}
                    className="mb-3 h-48 w-full rounded-lg border border-gray-200 object-cover shadow-md sm:h-56 md:mb-0 md:h-72 md:w-64"
                />

                {/* Right - Content */}
                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <h5 className="mb-3 text-sm font-semibold text-black md:mb-4 md:text-base dark:text-white">
                            Daftar Paket Bundling Skill Grow dan dapatkan akses ke semua program pembelajaran
                        </h5>

                        {/* Price Section */}
                        <div className="mb-2 flex flex-col items-end">
                            {totalOriginalPrice > bundle.price && (
                                <span className="mb-1 text-xs text-red-500 line-through sm:text-sm">
                                    {rupiahFormatter.format(totalOriginalPrice)}
                                </span>
                            )}
                            {bundle.price > 0 ? (
                                <span className="text-2xl font-bold text-gray-900 italic sm:text-3xl dark:text-gray-100">
                                    {rupiahFormatter.format(bundle.price)}
                                </span>
                            ) : (
                                <span className="text-2xl font-bold text-gray-900 italic sm:text-3xl dark:text-gray-100">GRATIS</span>
                            )}
                        </div>

                        <Separator className="my-3 md:my-4" />

                        {/* Bundle Info */}
                        <ul className="mb-3 space-y-1.5 md:mb-4 md:space-y-2">
                            <li className="flex items-center gap-2 text-xs md:text-sm">
                                <Package size="14" className="flex-shrink-0 text-primary md:h-4 md:w-4 dark:text-secondary" />
                                <p>Total {bundle.bundle_items_count} Program Pembelajaran</p>
                            </li>
                            <li className="flex items-start gap-2 text-xs md:text-sm">
                                <Check size="14" className="mt-0.5 flex-shrink-0 text-green-600 md:h-4 md:w-4" />
                                <p>Hemat {rupiahFormatter.format(discountAmount)} dari harga normal</p>
                            </li>
                            <li className="flex items-start gap-2 text-xs md:text-sm">
                                <Check size="14" className="mt-0.5 flex-shrink-0 text-green-600 md:h-4 md:w-4" />
                                <p>Sertifikat untuk semua program yang diselesaikan</p>
                            </li>
                            {deadline && (
                                <li className="flex items-start gap-2 text-xs md:text-sm">
                                    <Calendar size="14" className="text-primary dark:text-secondary mt-0.5 flex-shrink-0 md:h-4 md:w-4" />
                                    <div>
                                        <p className="font-medium">Batas Pendaftaran:</p>
                                        <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">
                                            {format(deadline, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: id })} WIB
                                        </p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Registration Button */}
                    <div className="mt-auto">
                        {warningMessage && (
                            <p className={`mb-2 text-center text-xs md:text-sm ${hasOwnedItems ? 'font-semibold text-red-600' : 'text-red-500'}`}>
                                {warningMessage}
                            </p>
                        )}
                        <Button className="w-full text-sm md:text-base" asChild={!isDisabled} disabled={isDisabled}>
                            {isDisabled ? <span>{buttonText}</span> : <Link href={registrationUrl}>{buttonText}</Link>}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
