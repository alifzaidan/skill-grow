import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Earning } from '../earnings/columns';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'paid':
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'approved':
            return <Clock className="h-5 w-5 text-yellow-600" />;
        case 'rejected':
            return <XCircle className="h-5 w-5 text-red-600" />;
        default:
            return <Clock className="h-5 w-5 text-gray-600" />;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'paid':
            return 'Sudah Ditarik';
        case 'approved':
            return 'Menunggu Penarikan';
        case 'rejected':
            return 'Ditolak';
        default:
            return status;
    }
};

export default function AffiliateWithdrawals({ earnings }: { earnings: Earning[] }) {
    const withdrawals = earnings.filter((e) => e.status === 'paid');
    const pendingWithdrawals = earnings.filter((e) => e.status === 'approved');

    return (
        <div className="space-y-6 rounded-lg border p-4">
            <div>
                <h2 className="text-lg font-medium">Data Penarikan</h2>
                <p className="text-muted-foreground text-sm">Total penarikan yang telah dilakukan</p>
            </div>

            {withdrawals.length === 0 && pendingWithdrawals.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">Belum ada data penarikan</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Riwayat Penarikan Sukses */}
                    {withdrawals.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold">Penarikan Selesai ({withdrawals.length})</h3>
                            <div className="space-y-2">
                                {withdrawals.map((withdrawal) => (
                                    <Card key={withdrawal.id} className="bg-green-50 dark:bg-green-950/20">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(withdrawal.status)}
                                                    <div>
                                                        <p className="font-semibold">{formatCurrency(withdrawal.amount)}</p>
                                                        <p className="text-muted-foreground text-xs">{withdrawal.invoice?.user?.name || 'Invoice'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-green-600">{getStatusLabel(withdrawal.status)}</p>
                                                {withdrawal.paid_at && (
                                                    <p className="text-muted-foreground text-xs">
                                                        {format(new Date(withdrawal.paid_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Penarikan Menunggu */}
                    {pendingWithdrawals.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold">Menunggu Penarikan ({pendingWithdrawals.length})</h3>
                            <div className="space-y-2">
                                {pendingWithdrawals.map((withdrawal) => (
                                    <Card key={withdrawal.id} className="bg-yellow-50 dark:bg-yellow-950/20">
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(withdrawal.status)}
                                                    <div>
                                                        <p className="font-semibold">{formatCurrency(withdrawal.amount)}</p>
                                                        <p className="text-muted-foreground text-xs">{withdrawal.invoice?.user?.name || 'Invoice'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-yellow-600">{getStatusLabel(withdrawal.status)}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {format(new Date(withdrawal.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
