import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserLayout from '@/layouts/user-layout';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, Award, Calendar, Check, Copy, Download, ExternalLink, Mail, Phone, Search, User } from 'lucide-react';
import { useState } from 'react';

interface CertificateParticipant {
    id: string;
    certificate_code: string;
    certificate_number: number;
    created_at: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    } | null;
    certificate: {
        id: string;
        title: string;
        issued_date: string;
        course?: { title: string } | null;
        bootcamp?: { title: string } | null;
        webinar?: { title: string } | null;
        design?: {
            id: string;
            name: string;
            image_1: string | null;
            image_2: string | null;
        } | null;
    };
}

interface CheckCertificateProps {
    participants: CertificateParticipant[];
    searched: boolean;
    error: string | null;
    filters: {
        email: string | null;
        phone_number: string | null;
    };
}

export default function CheckCertificate({ participants, searched, error, filters }: CheckCertificateProps) {
    const { auth } = usePage<SharedData>().props;

    const [email, setEmail] = useState(filters.email || (auth.user?.email as string) || '');
    const [phone, setPhone] = useState(filters.phone_number || (auth.user?.phone_number as string) || '');
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !phone.trim()) return;

        setLoading(true);
        router.get(
            route('certificates.check'),
            { email, phone_number: phone },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getProgramDetails = (participant: CertificateParticipant) => {
        const cert = participant.certificate;
        if (cert.course) {
            return { title: cert.course.title, type: 'Kelas Online', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
        }
        if (cert.bootcamp) {
            return { title: cert.bootcamp.title, type: 'Bootcamp', color: 'bg-blue-50 text-blue-600 border-blue-200' };
        }
        if (cert.webinar) {
            return { title: cert.webinar.title, type: 'Webinar', color: 'bg-amber-50 text-amber-600 border-amber-200' };
        }
        return { title: cert.title, type: 'Sertifikat', color: 'bg-purple-50 text-purple-600 border-purple-200' };
    };

    return (
        <UserLayout>
            <Head title="Cek Sertifikat" />

            {/* Hero Section */}
            <section className="pt-16 pb-12 w-full mx-auto max-w-7xl px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="w-fit mx-auto relative mb-4">
                        <span className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold block text-foreground tracking-tight">
                            Cek Sertifikat Anda
                        </span>
                        <span className="absolute left-1 right-1 -bottom-1 h-3 md:h-4 bg-primary z-0 rounded"></span>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                        Masukkan email dan nomor WhatsApp terdaftar Anda untuk mencari, memvalidasi, dan mengunduh sertifikat kelulusan program di Skill Grow.
                    </p>
                </div>
            </section>

            {/* Main Form Section */}
            <section className="mx-auto max-w-7xl px-4 pb-24 space-y-12">
                {/* Centered Form */}
                <div className="mx-auto max-w-2xl">
                    <Card className="shadow-xl border border-gray-100 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardHeader className="pb-4 pt-6 text-center border-b border-gray-50/50">
                            <CardTitle className="text-xl font-bold text-foreground">Form Pencarian</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-1">Masukkan data Anda untuk melihat sertifikat kelulusan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                            <Mail className="h-4 w-4 text-secondary" /> Email Terdaftar
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-11 pl-3 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                            <Phone className="h-4 w-4 text-secondary" /> Nomor WhatsApp
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="text"
                                            placeholder="0812xxxxxxxx"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="h-11 pl-3 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full gap-2 h-11 mt-4 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300">
                                    <Search className="h-4 w-4" />
                                    {loading ? 'Mencari...' : 'Cari Sertifikat'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section Below Form */}
                <div className="w-full">
                    {searched ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3 max-w-7xl mx-auto">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                                    Hasil Pencarian
                                </h3>
                                <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-1">
                                    {participants.length} Sertifikat Ditemukan
                                </Badge>
                            </div>

                            {error && (
                                <div className="flex items-start gap-4 rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive max-w-2xl mx-auto shadow-sm">
                                    <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-base leading-none">Pencarian Gagal</p>
                                        <p className="text-muted-foreground text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            {!error && participants.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-white/50 backdrop-blur-xs max-w-2xl mx-auto shadow-sm">
                                    <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
                                        <AlertCircle className="h-10 w-10 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">Sertifikat Belum Tersedia</h3>
                                    <p className="text-muted-foreground mt-3 text-sm max-w-md leading-relaxed">
                                        Data pencarian Anda terdaftar di sistem kami, namun saat ini belum ada sertifikat kelulusan yang diterbitkan atas nama Anda.
                                    </p>
                                </div>
                            )}

                            {!error && participants.length > 0 && (
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {participants.map((p) => {
                                        const details = getProgramDetails(p);
                                        return (
                                            <Card key={p.id} className="bg-white border border-gray-100 hover:border-primary/50 shadow-xs hover:shadow-xl rounded-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group border-t-4 border-t-primary">
                                                <CardHeader className="p-5 pb-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${details.color}`}>
                                                            {details.type}
                                                        </Badge>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleCopyCode(p.certificate_code)}
                                                            className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-secondary hover:border-secondary/30 transition-colors duration-150 cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200"
                                                            title="Salin Kode Sertifikat"
                                                        >
                                                            {p.certificate_code}
                                                            {copiedId === p.certificate_code ? (
                                                                <Check className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-3 w-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <CardTitle className="font-bold text-foreground text-base tracking-tight leading-snug group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                                                        {details.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
                                                    <div className="space-y-2.5 text-xs text-muted-foreground">
                                                        {p.user?.name && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                                <span>Penerima: </span>
                                                                <span className="font-semibold text-foreground truncate max-w-[180px]">
                                                                    {p.user.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                            <span>Diterbitkan: </span>
                                                            <span className="font-medium text-foreground">
                                                                {p.certificate.issued_date 
                                                                    ? format(new Date(p.certificate.issued_date), 'dd MMMM yyyy', { locale: id }) 
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Award className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                            <span>No. Sertifikat: </span>
                                                            <span className="font-mono text-foreground font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                                {p.certificate_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3.5 flex items-center justify-end gap-2 mt-auto">
                                                    <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs border-gray-200 text-foreground hover:bg-gray-100 hover:text-black">
                                                        <a href={route('certificate.participant.detail', p.certificate_code)} target="_blank" rel="noopener noreferrer">
                                                            <span>Detail</span>
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                    <Button asChild size="sm" variant="default" className="h-8 gap-1 text-xs font-semibold">
                                                        <a href={route('certificate.participant.download.public', p.certificate_code)}>
                                                            <span>Unduh</span>
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-white/50 backdrop-blur-xs min-h-[320px] max-w-2xl mx-auto shadow-sm">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 animate-pulse">
                                <Award className="h-10 w-10 text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Temukan Sertifikat Anda</h3>
                            <p className="text-muted-foreground mt-3 text-sm max-w-md leading-relaxed">
                                Silakan masukkan alamat email dan nomor WhatsApp terdaftar Anda pada formulir pencarian di atas untuk menampilkan seluruh sertifikat kelulusan Anda.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </UserLayout>
    );
}

