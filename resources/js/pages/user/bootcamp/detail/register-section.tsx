import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, ChartArea, Clock, Hourglass, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Bootcamp {
    title: string;
    batch?: string | null;
    strikethrough_price: number;
    price: number;
    quota: number;
    start_date: string;
    end_date: string;
    schedules?: { schedule_date: string; day: string; start_time: string; end_time: string }[];
    registration_deadline: string;
    registration_url: string;
    thumbnail?: string | null;
}

export default function RegisterSection({ bootcamp }: { bootcamp: Bootcamp }) {
    const { t, i18n } = useTranslation('user');
    const { auth } = usePage<SharedData>().props;
    const start = new Date(bootcamp.start_date);
    const end = new Date(bootcamp.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(diffDays / 7);

    let registrationUrl: string;
    let buttonText: string;
    let warningMessage: string | null = null;

    registrationUrl = bootcamp.registration_url;
    buttonText = t('bootcamp.detail.btnRegisterNow');
    warningMessage = null;

    const deadline = new Date(bootcamp.registration_deadline);
    const isRegistrationOpen = new Date() < deadline;

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl px-4" id="register">
            <h2 className="dark:text-primary-foreground mb-4 text-center text-3xl font-bold text-gray-900 italic md:text-4xl">
                {t('bootcamp.detail.locationScheduleCost')}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
                {t('bootcamp.detail.locationScheduleSubtitle')}
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-6 md:flex-row">
                <div className="flex h-full w-full flex-col items-center gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md md:flex-row dark:border-zinc-700 dark:bg-zinc-800">
                    <img
                        src={bootcamp.thumbnail ? `/storage/${bootcamp.thumbnail}` : '/assets/images/placeholder.png'}
                        alt={bootcamp.title}
                        className="mb-4 h-72 w-full rounded-lg border border-gray-200 object-cover shadow-md md:mb-0 md:w-64"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <h5 className="mb-4 text-base font-semibold text-black dark:text-white">
                                {t('bootcamp.detail.pitchBuildProject')}
                            </h5>
                            <div className="mb-2 flex flex-col items-end">
                                {bootcamp.strikethrough_price > 0 && (
                                    <span className="mb-1 text-sm text-red-500 line-through">
                                        Rp {bootcamp.strikethrough_price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                    </span>
                                )}
                                {bootcamp.price > 0 ? (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">
                                        Rp {bootcamp.price.toLocaleString(i18n.language === 'en' ? 'en-US' : 'id-ID')}
                                    </span>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900 italic dark:text-gray-100">{t('bootcamp.detail.free')}</span>
                                )}
                            </div>
                            <Separator className="my-4" />
                            <ul className="mb-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <MapPin size="16" className="text-primary dark:text-secondary" />
                                    <p>{t('bootcamp.detail.online')}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Hourglass size="16" className="text-primary dark:text-secondary" />
                                    <p>{t('bootcamp.detail.batch', { batch: bootcamp.batch })}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Users size="16" className="text-primary dark:text-secondary" />
                                    <p>{bootcamp.quota ? t('bootcamp.detail.quotaParticipants', { quota: bootcamp.quota }) : t('bootcamp.detail.unlimitedQuota')}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <ChartArea size="16" className="text-primary dark:text-secondary" />
                                    <p>{diffDays < 7 ? t('bootcamp.detail.daysCount', { count: diffDays }) : t('bootcamp.detail.weeksCount', { count: totalWeeks })}</p>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <CalendarDays size="16" className="text-primary dark:text-secondary" />
                                    <p>
                                        {new Date(bootcamp.start_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}{' '}
                                        -{' '}
                                        {new Date(bootcamp.end_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </li>
                                {bootcamp.schedules && bootcamp.schedules.length > 0 ? (
                                    bootcamp.schedules.map((schedule, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                            <Clock size="16" className="text-primary dark:text-secondary" />
                                            <p className="capitalize">
                                                {schedule.day},{' '}
                                                {new Date(schedule.schedule_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}{' '}
                                                | {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)} WIB
                                            </p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-center gap-2 text-sm">
                                        <Clock size="16" className="text-primary dark:text-secondary" />
                                        <p>{t('bootcamp.detail.scheduleNotAvailable')}</p>
                                    </li>
                                )}
                            </ul>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                {t('bootcamp.detail.lastRegistration', {
                                    date: new Date(bootcamp.registration_deadline).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    }),
                                })}
                            </p>
                        </div>
                        <div className="mt-auto">
                            {warningMessage && <p className="mb-2 text-center text-sm text-red-500">{warningMessage}</p>}
                            {isRegistrationOpen ? (
                                <Button className="w-full" asChild>
                                    <Link href={registrationUrl}>{buttonText}</Link>
                                </Button>
                            ) : (
                                <Button className="w-full" disabled>
                                    {t('bootcamp.detail.registrationClosed')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
