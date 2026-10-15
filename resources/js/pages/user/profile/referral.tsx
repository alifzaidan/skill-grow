import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProfileLayout from '@/layouts/profile/layout';
import UserLayout from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, Award, Copy, Gift, Share2, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PointTransaction {
    id: string;
    amount: number;
    type: 'reward' | 'redeem' | 'adjustment';
    source: 'referral' | 'checkout' | 'admin';
    description: string;
    created_at: string;
}

interface ReferralProps {
    referralCode: string;
    pointBalance: number;
    totalReferrals: number;
    totalEarned: number;
    transactions: PointTransaction[];
}

export default function Referral({
    referralCode,
    pointBalance,
    totalReferrals,
    totalEarned,
    transactions,
}: ReferralProps) {
    const { t, i18n } = useTranslation();
    const [copied, setCopied] = useState(false);
    const dateLocale = i18n.language === 'en' ? enUS : id;
    const numLocale = i18n.language === 'en' ? 'en-US' : 'id-ID';

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success(t('profile.referral.toastCopied'));
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const text = t('profile.referral.waShareText', { code: referralCode, url: shareUrl });
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getTransactionBadge = (type: string, source: string) => {
        if (source === 'referral') {
            return <Badge className="border-green-200 bg-green-100 text-green-800">{t('profile.referral.badgeReferralReward')}</Badge>;
        }
        if (source === 'checkout') {
            if (type === 'redeem') {
                return <Badge className="border-amber-200 bg-amber-100 text-amber-800">{t('profile.referral.badgeDiscount')}</Badge>;
            }
            if (type === 'adjustment') {
                return <Badge className="border-blue-200 bg-blue-100 text-blue-800">{t('profile.referral.badgeRefund')}</Badge>;
            }
        }
        if (source === 'admin') {
            return <Badge className="border-purple-200 bg-purple-100 text-purple-800">{t('profile.referral.badgeAdminCorrection')}</Badge>;
        }
        return <Badge variant="outline">{type} / {source}</Badge>;
    };

    return (
        <UserLayout>
            <Head title={t('profile.referral.headTitle')} />
            <ProfileLayout>
                <div className="space-y-6">
                    <Heading
                        title={t('profile.referral.title')}
                        description={t('profile.referral.description')}
                    />

                    {/* Top Section: Referral Link & Code sharing */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 overflow-hidden md:col-span-2 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-950/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-400">
                                    <Gift className="h-5 w-5" />
                                    {t('profile.referral.shareCardTitle')}
                                </CardTitle>
                                <CardDescription>
                                    {t('profile.referral.shareCardDesc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 flex items-center justify-between border rounded-lg bg-white px-3 py-2 text-sm font-mono select-all overflow-x-auto dark:bg-zinc-900">
                                        <span className="mr-2 truncate text-gray-600 dark:text-gray-400">{shareUrl}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleCopy} className="flex-1 sm:flex-initial gap-2">
                                            <Copy className="h-4 w-4" />
                                            {copied ? t('profile.referral.copied') : t('profile.referral.copyLink')}
                                        </Button>
                                        <Button onClick={handleShareWhatsApp} variant="outline" className="flex-1 sm:flex-initial gap-2 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-950/20">
                                            <Share2 className="h-4 w-4" />
                                            {t('profile.referral.shareWa')}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-t border-dashed pt-2">
                                    <span className="text-muted-foreground text-xs font-semibold uppercase">{t('profile.referral.yourCode')}</span>
                                    <Badge variant="secondary" className="border px-2 py-0.5 font-mono text-sm tracking-wider">
                                        {referralCode}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Balance display widget */}
                        <Card className="flex flex-col justify-between border-indigo-100 bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-white/80">
                                    <Award className="h-4 w-4 text-amber-300" />
                                    {t('profile.referral.balanceTitle')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="text-4xl font-extrabold tracking-tight">
                                    {pointBalance.toLocaleString(numLocale)} <span className="text-lg font-normal text-white/70">{t('profile.referral.pointUnit')}</span>
                                </div>
                                <p className="mt-1 text-xs text-white/60">{t('profile.referral.pointConversionDesc')}</p>
                            </CardContent>
                            <div className="border-t border-white/10 bg-white/10 px-4 py-2 text-center text-xs dark:bg-white/5">
                                {t('profile.referral.pointFooter')}
                            </div>
                        </Card>
                    </div>

                    {/* Middle Section: Stats details */}
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2">
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('profile.referral.referredFriends')}</CardTitle>
                                <Users className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {totalReferrals} <span className="text-muted-foreground text-sm font-normal">{t('profile.referral.purchasesUnit')}</span>
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">{t('profile.referral.referredDesc')}</p>
                            </CardContent>
                        </Card>

                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('profile.referral.totalEarned')}</CardTitle>
                                <Award className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    +{totalEarned.toLocaleString(numLocale)} <span className="text-muted-foreground text-sm font-normal">{t('profile.referral.pointUnit')}</span>
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">{t('profile.referral.totalEarnedDesc')}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Section: Point Transaction History List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('profile.referral.historyTitle')}</CardTitle>
                            <CardDescription>
                                {t('profile.referral.historyDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <div className="text-muted-foreground py-12 text-center">
                                    <Award className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                    <p className="text-sm">{t('profile.referral.emptyHistory')}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('profile.referral.thDate')}</TableHead>
                                                <TableHead>{t('profile.referral.thType')}</TableHead>
                                                <TableHead>{t('profile.referral.thDescription')}</TableHead>
                                                <TableHead className="text-right">{t('profile.referral.thAmount')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                                                        {format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: dateLocale })}
                                                    </TableCell>
                                                    <TableCell>{getTransactionBadge(tx.type, tx.source)}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-sm">{tx.description}</TableCell>
                                                    <TableCell className={`text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        <span className="inline-flex items-center gap-1">
                                                            {tx.amount > 0 ? (
                                                                <>
                                                                    <ArrowUpRight className="h-3 w-3" />
                                                                    +{tx.amount.toLocaleString(numLocale)}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ArrowDownLeft className="h-3 w-3" />
                                                                    {tx.amount.toLocaleString(numLocale)}
                                                                </>
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </ProfileLayout>
        </UserLayout>
    );
}
