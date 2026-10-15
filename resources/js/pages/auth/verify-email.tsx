// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation('auth');
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title={t('verifyEmail.title', 'Verifikasi email')}
            description={t('verifyEmail.description', 'Silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan ke Anda.')}
        >
            <Head title={t('verifyEmail.headTitle', 'Verifikasi email')} />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('verifyEmail.resend', 'Kirim ulang email verifikasi')}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    {t('verifyEmail.logout', 'Log out')}
                </TextLink>
            </form>
        </AuthLayout>
    );
}
