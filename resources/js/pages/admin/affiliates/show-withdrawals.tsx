import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { Earning } from '../earnings/columns';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function AffiliateWithdrawals({ earnings }: { earnings: Earning[] }) {
    const paidEarnings = earnings.filter((e) => e.status === 'paid' && e.paid_at);

    const groupedByDate = paidEarnings.reduce(
        (acc, earning) => {
            const dateKey = format(new Date(earning.paid_at!), 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(earning);
            return acc;
        },
        {} as Record<string, Earning[]>,
    );

    const sortedDates = Object.keys(groupedByDate).sort().reverse();

    if (sortedDates.length === 0) {
        return (
            <div className="space-y-6 rounded-lg border p-4">
                <div>
                    <h2 className="text-lg font-medium">Data Penarikan Komisi</h2>
                    <p className="text-muted-foreground text-sm">Riwayat penarikan komisi affiliate</p>
                </div>
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">Belum ada data penarikan</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-lg border p-4">
            <div>
                <h2 className="text-lg font-medium">Data Penarikan Komisi</h2>
                <p className="text-muted-foreground text-sm">Riwayat penarikan komisi affiliate</p>
            </div>

            <div className="space-y-4">
                {sortedDates.map((dateKey) => {
                    const dayEarnings = groupedByDate[dateKey];
                    const totalAmount = dayEarnings.reduce((sum, e) => {
                        return sum + (e.partial_amount || e.amount);
                    }, 0);
                    const dateObj = new Date(dateKey);

                    return (
                        <Card key={dateKey} className="bg-green-50 dark:bg-green-950/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
                                                <p className="text-muted-foreground text-sm">{format(dateObj, 'dd MMMM yyyy', { locale: id })}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-600">Selesai</p>
                                        <p className="text-muted-foreground text-xs">{dayEarnings.length} transaksi</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Penarikan Keseluruhan</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(
                        paidEarnings.reduce((sum, e) => {
                            return sum + (e.partial_amount || e.amount);
                        }, 0),
                    )}
                </p>
            </div>
        </div>
    );
}
