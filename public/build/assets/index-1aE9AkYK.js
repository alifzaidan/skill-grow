<<<<<<< HEAD:public/build/assets/index-WXqYD0bQ.js
import './Combination-DForpSOC.js';
import { L as A, S as G, r as b, j as e } from './app-YpIYLBeO.js';
import './avatar-B2-w03p6.js';
import './badge-0iDt5May.js';
import './breadcrumbs-CsE5J3Ts.js';
import { B as F } from './button-D6jV5iZd.js';
import './check-Cqm3K05O.js';
import './chevron-down-DGNd5io0.js';
import './chevron-right-CcB3--ug.js';
import './chevron-up-DyoNMEVy.js';
import { C as N } from './circle-check-DFNogc_p.js'; /* empty css            */
import './circle-check-big-o48eT2iK.js';
import './clock-BZeKVlB4.js';
import './command-DBflw03Y.js';
import './createLucideIcon-CznZjamP.js';
import './dialog-BJVi_unN.js';
import './dropdown-menu-B_XxOxPD.js';
import './floating-ui.react-dom-DhdReOBU.js';
import { F as K, u as L, e as c, c as d, f, a as l, d as m, b as o } from './form-BZkS8sqS.js';
import './house-DNfH2s_k.js';
import './icon-CKTb-5Jw.js';
import './index-BDKJ_NqI.js';
import './index-C4-Of0NU.js';
import './index-CB3fLD34.js';
import './index-CHpEGpGi.js';
import './index-CYFDEeU-.js';
import './index-DGgRCLg3.js';
import './index-DH0kq-eE.js';
import './index-DUhKNaAh.js';
import './index-Dlk3ksW0.js';
import './index-DltBXwOt.js';
import { t as z } from './index-pYcqEd81.js';
import './index-xoFH74Sc.js';
import { I as p } from './input-C8-nRU4G.js';
import './label-0kF1CPRc.js';
import './monitor-play-BWIPtBC_.js';
import './presentation-fXhTX9rF.js';
import './search-Di01vbHr.js';
import { S as D, a as E, c as J, b as U, d as g } from './select-Gozci-5w.js';
import './sonner-B23tF3jR.js';
import './tooltip-CEAXCeAV.js';
import { s as W, o as X, b as j, i as k } from './types-DzJSFORU.js';
import './use-initials-fKcVvJlK.js';
import './user-BuBJ2oUL.js';
import { U as V } from './user-layout--wPUaYS_.js';
import './utils-B6UgOHOA.js';
import './x-DAVjUvp5.js';
const R = X({
    name: j().nonempty('Nama lengkap harus diisi'),
    email: j().email('Email tidak valid'),
    phone: j().nonempty('Nomor telepon harus diisi'),
    nim: j().nonempty('NIM harus diisi'),
    university: j().nonempty('Nama universitas harus diisi'),
    major: j().nonempty('Program studi harus diisi'),
    semester: j().nonempty('Semester harus dipilih'),
    ktm_photo: k(File, { message: 'Foto KTM harus diunggah' }).optional(),
    transcript_photo: k(File, { message: 'Foto transkrip nilai harus diunggah' }).optional(),
    instagram_proof_photo: k(File, { message: 'Foto bukti follow Instagram harus diunggah' }).optional(),
    instagram_tag_proof_photo: k(File, { message: 'Foto bukti tag Instagram harus diunggah' }).optional(),
});
function Ue({ partnershipProduct: h }) {
    const [y, v] = b.useState(!1),
        [w, M] = b.useState(null),
        [P, T] = b.useState(null),
        [_, I] = b.useState(null),
        [S, C] = b.useState(null),
        i = L({ resolver: W(R), defaultValues: { name: '', email: '', phone: '', nim: '', university: '', major: '', semester: '' } });
    function B(r) {
        v(!0);
        const s = new FormData();
        s.append('name', r.name),
            s.append('email', r.email),
            s.append('phone', r.phone),
            s.append('nim', r.nim),
            s.append('university', r.university),
            s.append('major', r.major),
            s.append('semester', r.semester),
            r.ktm_photo && s.append('ktm_photo', r.ktm_photo),
            r.transcript_photo && s.append('transcript_photo', r.transcript_photo),
            r.instagram_proof_photo && s.append('instagram_proof_photo', r.instagram_proof_photo),
            r.instagram_tag_proof_photo && s.append('instagram_tag_proof_photo', r.instagram_tag_proof_photo),
            G.post(route('partnership-products.scholarship-store', h.slug), s, {
                onSuccess: () => {
                    z.success('Pendaftaran beasiswa berhasil dikirim!'), v(!1);
                },
                onError: () => {
                    z.error('Terjadi kesalahan saat mengirim pendaftaran'), v(!1);
                },
            });
    }
    const u = (r, s) => {
        var t;
        const x = (t = r.target.files) == null ? void 0 : t[0];
        if (x) {
            const a = new FileReader();
            (a.onloadend = () => {
                s(a.result);
            }),
                a.readAsDataURL(x);
        }
    };
    return e.jsxs(V, {
        children: [
            e.jsx(A, { title: `Daftar Beasiswa - ${h.title}` }),
            e.jsxs('div', {
                className: 'min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800',
                children: [
                    e.jsxs('div', {
                        className: 'to-primary relative overflow-hidden bg-gradient-to-tl from-black px-4 py-8 md:py-12',
                        children: [
                            e.jsxs('div', {
                                className: 'absolute inset-0 opacity-10',
                                children: [
                                    e.jsx('div', { className: 'absolute top-0 left-0 size-96 rounded-full bg-white blur-3xl' }),
                                    e.jsx('div', { className: 'absolute right-0 bottom-0 size-96 rounded-full bg-white blur-3xl' }),
                                ],
                            }),
                            e.jsx('div', {
                                className: 'relative mx-auto w-full max-w-5xl',
                                children: e.jsxs('div', {
                                    className: 'flex flex-col items-center gap-8 text-center',
                                    children: [
                                        h.thumbnail &&
                                            e.jsx('div', {
                                                className: 'overflow-hidden rounded-lg shadow-xl',
                                                children: e.jsx('img', {
                                                    src: h.thumbnail ? `/storage/${h.thumbnail}` : '/assets/images/placeholder.png',
                                                    alt: h.title,
                                                    className: 'h-36 object-cover md:h-56',
                                                }),
                                            }),
                                        e.jsxs('div', {
                                            className: 'space-y-2',
                                            children: [
                                                e.jsx('h1', { className: 'text-3xl font-bold text-white md:text-4xl', children: h.title }),
                                                e.jsx('p', { className: 'text-blue-100 md:text-xl', children: h.description }),
                                            ],
                                        }),
                                    ],
                                }),
                            }),
                        ],
                    }),
                    e.jsxs('div', {
                        className: 'mx-auto w-full max-w-5xl px-4 py-8',
                        children: [
                            e.jsxs('div', {
                                className:
                                    'mb-8 space-y-6 rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 shadow-md md:p-8 dark:from-blue-950/30 dark:to-indigo-950/30',
                                children: [
                                    e.jsx('div', {
                                        className: 'rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm md:p-6 dark:bg-zinc-800/40',
                                        children: e.jsx('p', {
                                            className: 'font-semibold text-gray-900 md:text-lg dark:text-gray-100',
                                            children:
                                                'Skill Grow membuka Program Beasiswa Kompetensi bagi mahasiswa yang ingin meningkatkan kemampuan di bidang perpajakan dan memperoleh sertifikasi profesional yang dibutuhkan di dunia kerja.',
                                        }),
                                    }),
                                    e.jsxs('div', {
                                        children: [
                                            e.jsxs('h3', {
                                                className:
                                                    'mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100',
                                                children: [e.jsx('span', { className: 'md:text-2xl', children: '🎓' }), ' Persyaratan Peserta'],
                                            }),
                                            e.jsxs('div', {
                                                className: 'grid gap-3',
                                                children: [
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx(N, { className: 'mt-0.5 size-5 flex-shrink-0 text-green-500' }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Mahasiswa aktif jenjang D1–S1',
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx(N, { className: 'mt-0.5 size-5 flex-shrink-0 text-green-500' }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Memiliki IPK minimal 3,00',
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx(N, { className: 'mt-0.5 size-5 flex-shrink-0 text-green-500' }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Maksimal berada pada semester 8',
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx(N, { className: 'mt-0.5 size-5 flex-shrink-0 text-green-500' }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Bersedia mengikuti seluruh tahapan seleksi',
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    e.jsxs('div', {
                                        children: [
                                            e.jsxs('h3', {
                                                className:
                                                    'mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100',
                                                children: [e.jsx('span', { className: 'md:text-2xl', children: '📅' }), ' Tahapan Pelaksanaan'],
                                            }),
                                            e.jsxs('div', {
                                                className: 'space-y-2',
                                                children: [
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx('div', {
                                                                className:
                                                                    'flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white',
                                                                children: '1',
                                                            }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Pendaftaran administrasi',
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx('div', {
                                                                className:
                                                                    'flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white',
                                                                children: '2',
                                                            }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Sosialisasi program',
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40',
                                                        children: [
                                                            e.jsx('div', {
                                                                className:
                                                                    'flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white',
                                                                children: '3',
                                                            }),
                                                            e.jsx('span', {
                                                                className: 'text-sm text-gray-700 md:text-base dark:text-gray-300',
                                                                children: 'Seleksi peserta',
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                    e.jsxs('div', {
                                        className: 'to-primary rounded-lg bg-gradient-to-tl from-black p-4 text-white shadow-lg',
                                        children: [
                                            e.jsx('p', {
                                                className: 'mb-3 text-xs font-semibold md:text-sm',
                                                children: '📞 Untuk informasi lebih lanjut, silakan hubungi:',
                                            }),
                                            e.jsxs('div', {
                                                className: 'space-y-1',
                                                children: [
                                                    e.jsxs('p', {
                                                        className: 'text-sm',
                                                        children: [
                                                            '📧 ',
                                                            e.jsx('span', { className: 'font-medium', children: 'skillgrow.id@gmail.com' }),
                                                        ],
                                                    }),
                                                    e.jsxs('p', {
                                                        className: 'text-sm',
                                                        children: ['💬 ', e.jsx('span', { className: 'font-medium', children: '+6285167541152' })],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            e.jsxs('div', {
                                className: 'rounded-xl border-0 bg-white shadow-lg dark:bg-zinc-800',
                                children: [
                                    e.jsxs('div', {
                                        className:
                                            'to-primary rounded-t-xl border-b border-gray-200 bg-gradient-to-tl from-black px-6 py-6 dark:border-zinc-700',
                                        children: [
                                            e.jsx('h2', { className: 'font-bold text-white md:text-2xl', children: '📝 Formulir Pendaftaran' }),
                                            e.jsx('p', {
                                                className: 'mt-1 text-sm text-blue-100 md:text-base',
                                                children: 'Lengkapi data diri dan dokumen pendukung Anda',
                                            }),
                                        ],
                                    }),
                                    e.jsx('div', {
                                        className: 'p-3 md:p-6',
                                        children: e.jsx(K, {
                                            ...i,
                                            children: e.jsxs('form', {
                                                onSubmit: i.handleSubmit(B),
                                                className: 'space-y-8',
                                                children: [
                                                    e.jsxs('div', {
                                                        className:
                                                            'space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-5 dark:from-blue-950/20 dark:to-indigo-950/20',
                                                        children: [
                                                            e.jsxs('div', {
                                                                className: 'flex items-center gap-2',
                                                                children: [
                                                                    e.jsx('span', { className: 'md:text-2xl', children: '👤' }),
                                                                    e.jsx('h3', {
                                                                        className: 'font-semibold text-gray-900 dark:text-gray-100',
                                                                        children: 'Informasi Pribadi',
                                                                    }),
                                                                ],
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'name',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Nama Lengkap *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    placeholder: 'Masukkan nama lengkap Anda',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'email',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Email *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    type: 'email',
                                                                                    placeholder: 'Masukkan email Anda',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'phone',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Nomor Telepon *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    placeholder: 'Masukkan nomor telepon Anda (08XXXX)',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-green-950/20 dark:to-emerald-950/20',
                                                        children: [
                                                            e.jsxs('div', {
                                                                className: 'flex items-center gap-2',
                                                                children: [
                                                                    e.jsx('span', { className: 'md:text-2xl', children: '🎓' }),
                                                                    e.jsx('h3', {
                                                                        className: 'font-semibold text-gray-900 dark:text-gray-100',
                                                                        children: 'Informasi Universitas',
                                                                    }),
                                                                ],
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'university',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Nama Universitas *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    placeholder: 'Masukkan nama universitas Anda',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'major',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Program Studi *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    placeholder: 'Contoh: Teknik Informatika, Ekonomi, etc',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'semester',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'Semester *' }),
                                                                            e.jsxs(D, {
                                                                                onValueChange: r.onChange,
                                                                                defaultValue: r.value,
                                                                                children: [
                                                                                    e.jsx(m, {
                                                                                        children: e.jsx(E, {
                                                                                            children: e.jsx(U, {
                                                                                                placeholder: 'Pilih semester Anda',
                                                                                            }),
                                                                                        }),
                                                                                    }),
                                                                                    e.jsxs(J, {
                                                                                        children: [
                                                                                            e.jsx(g, { value: '1', children: 'Semester 1' }),
                                                                                            e.jsx(g, { value: '2', children: 'Semester 2' }),
                                                                                            e.jsx(g, { value: '3', children: 'Semester 3' }),
                                                                                            e.jsx(g, { value: '4', children: 'Semester 4' }),
                                                                                            e.jsx(g, { value: '5', children: 'Semester 5' }),
                                                                                            e.jsx(g, { value: '6', children: 'Semester 6' }),
                                                                                            e.jsx(g, { value: '7', children: 'Semester 7' }),
                                                                                            e.jsx(g, { value: '8', children: 'Semester 8' }),
                                                                                        ],
                                                                                    }),
                                                                                ],
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'nim',
                                                                render: ({ field: r }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsx(d, { children: 'NIM *' }),
                                                                            e.jsx(m, {
                                                                                children: e.jsx(p, {
                                                                                    ...r,
                                                                                    placeholder: 'Masukkan NIM Anda',
                                                                                    autoComplete: 'off',
                                                                                }),
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className:
                                                            'space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-orange-950/20 dark:to-amber-950/20',
                                                        children: [
                                                            e.jsxs('div', {
                                                                className: 'flex items-center gap-2',
                                                                children: [
                                                                    e.jsx('span', { className: 'md:text-2xl', children: '📄' }),
                                                                    e.jsx('h3', {
                                                                        className: 'font-semibold text-gray-900 dark:text-gray-100',
                                                                        children: 'Dokumen Pendukung',
                                                                    }),
                                                                ],
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'ktm_photo',
                                                                render: ({ field: { onChange: r, value: s, ...x } }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsxs(d, {
                                                                                className: 'flex items-center gap-2',
                                                                                children: [e.jsx('span', { children: '📋' }), 'Foto KTM *'],
                                                                            }),
                                                                            e.jsx(m, {
                                                                                children: e.jsxs('div', {
                                                                                    className: 'space-y-3',
                                                                                    children: [
                                                                                        w &&
                                                                                            e.jsxs('div', {
                                                                                                className:
                                                                                                    'relative overflow-hidden rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:from-green-950/30 dark:to-emerald-950/30',
                                                                                                children: [
                                                                                                    e.jsx('img', {
                                                                                                        src: w,
                                                                                                        alt: 'KTM Preview',
                                                                                                        className:
                                                                                                            'h-40 w-full rounded object-contain',
                                                                                                    }),
                                                                                                    e.jsx('div', {
                                                                                                        className:
                                                                                                            'absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white',
                                                                                                        children: '✓ Terpilih',
                                                                                                    }),
                                                                                                ],
                                                                                            }),
                                                                                        e.jsx(p, {
                                                                                            type: 'file',
                                                                                            accept: 'image/*',
                                                                                            onChange: (t) => {
                                                                                                var n;
                                                                                                const a =
                                                                                                    (n = t.target.files) == null ? void 0 : n[0];
                                                                                                a && (r(a), u(t, M));
                                                                                            },
                                                                                            className:
                                                                                                'cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-green-400 dark:border-zinc-600',
                                                                                            ...x,
                                                                                        }),
                                                                                    ],
                                                                                }),
                                                                            }),
                                                                            e.jsx(f, {
                                                                                className: 'text-xs',
                                                                                children: '📸 Format: JPG, PNG, WebP (Maks 5MB)',
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'transcript_photo',
                                                                render: ({ field: { onChange: r, value: s, ...x } }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsxs(d, {
                                                                                className: 'flex items-center gap-2',
                                                                                children: [
                                                                                    e.jsx('span', { children: '📊' }),
                                                                                    'Foto Transkrip Nilai *',
                                                                                ],
                                                                            }),
                                                                            e.jsx(m, {
                                                                                children: e.jsxs('div', {
                                                                                    className: 'space-y-3',
                                                                                    children: [
                                                                                        P &&
                                                                                            e.jsxs('div', {
                                                                                                className:
                                                                                                    'relative overflow-hidden rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 dark:from-blue-950/30 dark:to-indigo-950/30',
                                                                                                children: [
                                                                                                    e.jsx('img', {
                                                                                                        src: P,
                                                                                                        alt: 'Transcript Preview',
                                                                                                        className:
                                                                                                            'h-40 w-full rounded object-contain',
                                                                                                    }),
                                                                                                    e.jsx('div', {
                                                                                                        className:
                                                                                                            'absolute top-2 right-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white',
                                                                                                        children: '✓ Terpilih',
                                                                                                    }),
                                                                                                ],
                                                                                            }),
                                                                                        e.jsx(p, {
                                                                                            type: 'file',
                                                                                            accept: 'image/*',
                                                                                            onChange: (t) => {
                                                                                                var n;
                                                                                                const a =
                                                                                                    (n = t.target.files) == null ? void 0 : n[0];
                                                                                                a && (r(a), u(t, T));
                                                                                            },
                                                                                            className:
                                                                                                'cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-blue-400 dark:border-zinc-600',
                                                                                            ...x,
                                                                                        }),
                                                                                    ],
                                                                                }),
                                                                            }),
                                                                            e.jsx(f, {
                                                                                className: 'text-xs',
                                                                                children: '📸 Format: JPG, PNG, WebP (Maks 5MB)',
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'instagram_proof_photo',
                                                                render: ({ field: { onChange: r, value: s, ...x } }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsxs(d, {
                                                                                className: 'flex items-center gap-2',
                                                                                children: [
                                                                                    e.jsx('span', { children: '📱' }),
                                                                                    'Foto Bukti Follow Instagram @skillgrow.id *',
                                                                                ],
                                                                            }),
                                                                            e.jsx(m, {
                                                                                children: e.jsxs('div', {
                                                                                    className: 'space-y-3',
                                                                                    children: [
                                                                                        _ &&
                                                                                            e.jsxs('div', {
                                                                                                className:
                                                                                                    'relative overflow-hidden rounded-lg border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-2 dark:from-pink-950/30 dark:to-rose-950/30',
                                                                                                children: [
                                                                                                    e.jsx('img', {
                                                                                                        src: _,
                                                                                                        alt: 'Instagram Proof Preview',
                                                                                                        className:
                                                                                                            'h-40 w-full rounded object-contain',
                                                                                                    }),
                                                                                                    e.jsx('div', {
                                                                                                        className:
                                                                                                            'absolute top-2 right-2 rounded-full bg-pink-500 px-2 py-1 text-xs font-semibold text-white',
                                                                                                        children: '✓ Terpilih',
                                                                                                    }),
                                                                                                ],
                                                                                            }),
                                                                                        e.jsx(p, {
                                                                                            type: 'file',
                                                                                            accept: 'image/*',
                                                                                            onChange: (t) => {
                                                                                                var n;
                                                                                                const a =
                                                                                                    (n = t.target.files) == null ? void 0 : n[0];
                                                                                                a && (r(a), u(t, I));
                                                                                            },
                                                                                            className:
                                                                                                'cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-pink-400 dark:border-zinc-600',
                                                                                            ...x,
                                                                                        }),
                                                                                    ],
                                                                                }),
                                                                            }),
                                                                            e.jsx(f, {
                                                                                className: 'text-xs',
                                                                                children: '📸 Format: JPG, PNG, WebP (Maks 5MB)',
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                            e.jsx(l, {
                                                                control: i.control,
                                                                name: 'instagram_tag_proof_photo',
                                                                render: ({ field: { onChange: r, value: s, ...x } }) =>
                                                                    e.jsxs(o, {
                                                                        children: [
                                                                            e.jsxs(d, {
                                                                                className: 'flex items-center gap-2',
                                                                                children: [
                                                                                    e.jsx('span', { children: '👥' }),
                                                                                    'Foto Bukti Tag 3 Teman di Instagram @skillgrow.id *',
                                                                                ],
                                                                            }),
                                                                            e.jsx(m, {
                                                                                children: e.jsxs('div', {
                                                                                    className: 'space-y-3',
                                                                                    children: [
                                                                                        S &&
                                                                                            e.jsxs('div', {
                                                                                                className:
                                                                                                    'relative overflow-hidden rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 p-2 dark:from-purple-950/30 dark:to-violet-950/30',
                                                                                                children: [
                                                                                                    e.jsx('img', {
                                                                                                        src: S,
                                                                                                        alt: 'Instagram Tag Proof Preview',
                                                                                                        className:
                                                                                                            'h-40 w-full rounded object-contain',
                                                                                                    }),
                                                                                                    e.jsx('div', {
                                                                                                        className:
                                                                                                            'absolute top-2 right-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-semibold text-white',
                                                                                                        children: '✓ Terpilih',
                                                                                                    }),
                                                                                                ],
                                                                                            }),
                                                                                        e.jsx(p, {
                                                                                            type: 'file',
                                                                                            accept: 'image/*',
                                                                                            onChange: (t) => {
                                                                                                var n;
                                                                                                const a =
                                                                                                    (n = t.target.files) == null ? void 0 : n[0];
                                                                                                a && (r(a), u(t, C));
                                                                                            },
                                                                                            className:
                                                                                                'cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-purple-400 dark:border-zinc-600',
                                                                                            ...x,
                                                                                        }),
                                                                                    ],
                                                                                }),
                                                                            }),
                                                                            e.jsx(f, {
                                                                                className: 'text-xs',
                                                                                children: '📸 Format: JPG, PNG, WebP (Maks 5MB)',
                                                                            }),
                                                                            e.jsx(c, {}),
                                                                        ],
                                                                    }),
                                                            }),
                                                        ],
                                                    }),
                                                    e.jsxs('div', {
                                                        className: 'flex gap-3 border-t border-gray-200 pt-6 dark:border-zinc-700',
                                                        children: [
                                                            e.jsx(F, {
                                                                variant: 'outline',
                                                                type: 'button',
                                                                onClick: () => window.history.back(),
                                                                className: 'border-2',
                                                                children: '← Kembali',
                                                            }),
                                                            e.jsx(F, {
                                                                type: 'submit',
                                                                disabled: y,
                                                                className: 'flex-1',
                                                                children: y ? '⏳ Mengirim...' : '✓ Kirim Pendaftaran',
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            }),
                                        }),
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}
export { Ue as default };
=======
import{r as b,j as e,L as A,S as G}from"./app-B9EQy2l3.js";import{B as F}from"./button-tsBQ5x30.js";import{u as L,F as K,a as l,b as o,c as d,d as m,e as c,f}from"./form-BHARrWaB.js";import{I as p}from"./input-BUEhVf_E.js";import{S as D,a as E,b as U,c as J,d as g}from"./select-KLbaODKI.js";import{U as V}from"./user-layout-PuPom1nu.js";import{s as W,o as X,i as k,b as j}from"./types-BahNB_Ha.js";import{t as z}from"./index-BhAXMsAF.js";import{C as N}from"./circle-check-Dr1mYGBx.js";/* empty css            */import"./index-FOcnKCsB.js";import"./index-D6Sjj0Qe.js";import"./utils-CODBLNBU.js";import"./label-BtdlM6Cy.js";import"./index-DG2ovGfT.js";import"./index-sgIWSHPb.js";import"./index-DY0P39R0.js";import"./index-Dv-72GWL.js";import"./floating-ui.react-dom-2WPMdk5t.js";import"./index-DMsT3_UI.js";import"./index-DoBGrkfF.js";import"./index-CLiKzACH.js";import"./Combination-DlGiFaFu.js";import"./chevron-down-JK7pcBYS.js";import"./createLucideIcon-DVMaWdHK.js";import"./check-U300oPtx.js";import"./chevron-up-CMlZztEr.js";import"./sonner-DmA5P2fM.js";import"./breadcrumbs-CtUAHNwc.js";import"./index-Blw0-eBK.js";import"./x-Hiq79rrp.js";import"./tooltip-BP-Gf3_q.js";import"./index-B7lA4_Vx.js";import"./dropdown-menu-Fs3fLTIU.js";import"./avatar-P2zOQZet.js";import"./use-initials-Co0XxBVs.js";import"./user-CP9A_cOF.js";import"./chevron-right-Cc8CwA1v.js";import"./icon-uecDs5nl.js";import"./badge-CdEY1T3X.js";import"./command-CiizRU2Q.js";import"./dialog-C_d_ap4X.js";import"./search-DC2sdtJA.js";import"./circle-check-big-BBH4-93L.js";import"./clock-C4ecFZST.js";import"./house-DV-7WYFC.js";import"./monitor-play-DUXcp-h_.js";import"./presentation-TuCgFXPS.js";const R=X({name:j().nonempty("Nama lengkap harus diisi"),email:j().email("Email tidak valid"),phone:j().nonempty("Nomor telepon harus diisi"),nim:j().nonempty("NIM harus diisi"),university:j().nonempty("Nama universitas harus diisi"),major:j().nonempty("Program studi harus diisi"),semester:j().nonempty("Semester harus dipilih"),ktm_photo:k(File,{message:"Foto KTM harus diunggah"}).optional(),transcript_photo:k(File,{message:"Foto transkrip nilai harus diunggah"}).optional(),instagram_proof_photo:k(File,{message:"Foto bukti follow Instagram harus diunggah"}).optional(),instagram_tag_proof_photo:k(File,{message:"Foto bukti tag Instagram harus diunggah"}).optional()});function Ue({partnershipProduct:h}){const[y,v]=b.useState(!1),[w,M]=b.useState(null),[P,T]=b.useState(null),[_,I]=b.useState(null),[S,C]=b.useState(null),i=L({resolver:W(R),defaultValues:{name:"",email:"",phone:"",nim:"",university:"",major:"",semester:""}});function B(r){v(!0);const s=new FormData;s.append("name",r.name),s.append("email",r.email),s.append("phone",r.phone),s.append("nim",r.nim),s.append("university",r.university),s.append("major",r.major),s.append("semester",r.semester),r.ktm_photo&&s.append("ktm_photo",r.ktm_photo),r.transcript_photo&&s.append("transcript_photo",r.transcript_photo),r.instagram_proof_photo&&s.append("instagram_proof_photo",r.instagram_proof_photo),r.instagram_tag_proof_photo&&s.append("instagram_tag_proof_photo",r.instagram_tag_proof_photo),G.post(route("partnership-products.scholarship-store",h.slug),s,{onSuccess:()=>{z.success("Pendaftaran beasiswa berhasil dikirim!"),v(!1)},onError:()=>{z.error("Terjadi kesalahan saat mengirim pendaftaran"),v(!1)}})}const u=(r,s)=>{var t;const x=(t=r.target.files)==null?void 0:t[0];if(x){const a=new FileReader;a.onloadend=()=>{s(a.result)},a.readAsDataURL(x)}};return e.jsxs(V,{children:[e.jsx(A,{title:`Daftar Beasiswa - ${h.title}`}),e.jsxs("div",{className:"min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800",children:[e.jsxs("div",{className:"to-primary relative overflow-hidden bg-gradient-to-tl from-black px-4 py-8 md:py-12",children:[e.jsxs("div",{className:"absolute inset-0 opacity-10",children:[e.jsx("div",{className:"absolute top-0 left-0 size-96 rounded-full bg-white blur-3xl"}),e.jsx("div",{className:"absolute right-0 bottom-0 size-96 rounded-full bg-white blur-3xl"})]}),e.jsx("div",{className:"relative mx-auto w-full max-w-5xl",children:e.jsxs("div",{className:"flex flex-col items-center gap-8 text-center",children:[h.thumbnail&&e.jsx("div",{className:"overflow-hidden rounded-lg shadow-xl",children:e.jsx("img",{src:h.thumbnail?`/storage/${h.thumbnail}`:"/assets/images/placeholder.png",alt:h.title,className:"h-36 object-cover md:h-56"})}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h1",{className:"text-3xl font-bold text-white md:text-4xl",children:h.title}),e.jsx("p",{className:"text-blue-100 md:text-xl",children:h.description})]})]})})]}),e.jsxs("div",{className:"mx-auto w-full max-w-5xl px-4 py-8",children:[e.jsxs("div",{className:"mb-8 space-y-6 rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 shadow-md md:p-8 dark:from-blue-950/30 dark:to-indigo-950/30",children:[e.jsx("div",{className:"rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm md:p-6 dark:bg-zinc-800/40",children:e.jsx("p",{className:"font-semibold text-gray-900 md:text-lg dark:text-gray-100",children:"Skill Grow membuka Program Beasiswa Kompetensi bagi mahasiswa yang ingin meningkatkan kemampuan di bidang perpajakan dan memperoleh sertifikasi profesional yang dibutuhkan di dunia kerja."})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100",children:[e.jsx("span",{className:"md:text-2xl",children:"🎓"})," Persyaratan Peserta"]}),e.jsxs("div",{className:"grid gap-3",children:[e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx(N,{className:"mt-0.5 size-5 flex-shrink-0 text-green-500"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Mahasiswa aktif jenjang D1–S1"})]}),e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx(N,{className:"mt-0.5 size-5 flex-shrink-0 text-green-500"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Memiliki IPK minimal 3,00"})]}),e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx(N,{className:"mt-0.5 size-5 flex-shrink-0 text-green-500"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Maksimal berada pada semester 8"})]}),e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx(N,{className:"mt-0.5 size-5 flex-shrink-0 text-green-500"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Bersedia mengikuti seluruh tahapan seleksi"})]})]})]}),e.jsxs("div",{children:[e.jsxs("h3",{className:"mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100",children:[e.jsx("span",{className:"md:text-2xl",children:"📅"})," Tahapan Pelaksanaan"]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx("div",{className:"flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white",children:"1"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Pendaftaran administrasi"})]}),e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx("div",{className:"flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white",children:"2"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Sosialisasi program"})]}),e.jsxs("div",{className:"flex items-start gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/40",children:[e.jsx("div",{className:"flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white",children:"3"}),e.jsx("span",{className:"text-sm text-gray-700 md:text-base dark:text-gray-300",children:"Seleksi peserta"})]})]})]}),e.jsxs("div",{className:"to-primary rounded-lg bg-gradient-to-tl from-black p-4 text-white shadow-lg",children:[e.jsx("p",{className:"mb-3 text-xs font-semibold md:text-sm",children:"📞 Untuk informasi lebih lanjut, silakan hubungi:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("p",{className:"text-sm",children:["📧 ",e.jsx("span",{className:"font-medium",children:"skillgrow.id@gmail.com"})]}),e.jsxs("p",{className:"text-sm",children:["💬 ",e.jsx("span",{className:"font-medium",children:"+6285111022504"})]})]})]})]}),e.jsxs("div",{className:"rounded-xl border-0 bg-white shadow-lg dark:bg-zinc-800",children:[e.jsxs("div",{className:"to-primary rounded-t-xl border-b border-gray-200 bg-gradient-to-tl from-black px-6 py-6 dark:border-zinc-700",children:[e.jsx("h2",{className:"font-bold text-white md:text-2xl",children:"📝 Formulir Pendaftaran"}),e.jsx("p",{className:"mt-1 text-sm text-blue-100 md:text-base",children:"Lengkapi data diri dan dokumen pendukung Anda"})]}),e.jsx("div",{className:"p-3 md:p-6",children:e.jsx(K,{...i,children:e.jsxs("form",{onSubmit:i.handleSubmit(B),className:"space-y-8",children:[e.jsxs("div",{className:"space-y-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-5 dark:from-blue-950/20 dark:to-indigo-950/20",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"md:text-2xl",children:"👤"}),e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-gray-100",children:"Informasi Pribadi"})]}),e.jsx(l,{control:i.control,name:"name",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Nama Lengkap *"}),e.jsx(m,{children:e.jsx(p,{...r,placeholder:"Masukkan nama lengkap Anda"})}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"email",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Email *"}),e.jsx(m,{children:e.jsx(p,{...r,type:"email",placeholder:"Masukkan email Anda"})}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"phone",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Nomor Telepon *"}),e.jsx(m,{children:e.jsx(p,{...r,placeholder:"Masukkan nomor telepon Anda (08XXXX)"})}),e.jsx(c,{})]})})]}),e.jsxs("div",{className:"space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-green-950/20 dark:to-emerald-950/20",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"md:text-2xl",children:"🎓"}),e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-gray-100",children:"Informasi Universitas"})]}),e.jsx(l,{control:i.control,name:"university",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Nama Universitas *"}),e.jsx(m,{children:e.jsx(p,{...r,placeholder:"Masukkan nama universitas Anda"})}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"major",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Program Studi *"}),e.jsx(m,{children:e.jsx(p,{...r,placeholder:"Contoh: Teknik Informatika, Ekonomi, etc"})}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"semester",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"Semester *"}),e.jsxs(D,{onValueChange:r.onChange,defaultValue:r.value,children:[e.jsx(m,{children:e.jsx(E,{children:e.jsx(U,{placeholder:"Pilih semester Anda"})})}),e.jsxs(J,{children:[e.jsx(g,{value:"1",children:"Semester 1"}),e.jsx(g,{value:"2",children:"Semester 2"}),e.jsx(g,{value:"3",children:"Semester 3"}),e.jsx(g,{value:"4",children:"Semester 4"}),e.jsx(g,{value:"5",children:"Semester 5"}),e.jsx(g,{value:"6",children:"Semester 6"}),e.jsx(g,{value:"7",children:"Semester 7"}),e.jsx(g,{value:"8",children:"Semester 8"})]})]}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"nim",render:({field:r})=>e.jsxs(o,{children:[e.jsx(d,{children:"NIM *"}),e.jsx(m,{children:e.jsx(p,{...r,placeholder:"Masukkan NIM Anda",autoComplete:"off"})}),e.jsx(c,{})]})})]}),e.jsxs("div",{className:"space-y-4 rounded-lg border-t border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 pt-5 md:p-5 dark:border-zinc-700 dark:from-orange-950/20 dark:to-amber-950/20",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"md:text-2xl",children:"📄"}),e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-gray-100",children:"Dokumen Pendukung"})]}),e.jsx(l,{control:i.control,name:"ktm_photo",render:({field:{onChange:r,value:s,...x}})=>e.jsxs(o,{children:[e.jsxs(d,{className:"flex items-center gap-2",children:[e.jsx("span",{children:"📋"}),"Foto KTM *"]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-3",children:[w&&e.jsxs("div",{className:"relative overflow-hidden rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:from-green-950/30 dark:to-emerald-950/30",children:[e.jsx("img",{src:w,alt:"KTM Preview",className:"h-40 w-full rounded object-contain"}),e.jsx("div",{className:"absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white",children:"✓ Terpilih"})]}),e.jsx(p,{type:"file",accept:"image/*",onChange:t=>{var n;const a=(n=t.target.files)==null?void 0:n[0];a&&(r(a),u(t,M))},className:"cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-green-400 dark:border-zinc-600",...x})]})}),e.jsx(f,{className:"text-xs",children:"📸 Format: JPG, PNG, WebP (Maks 5MB)"}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"transcript_photo",render:({field:{onChange:r,value:s,...x}})=>e.jsxs(o,{children:[e.jsxs(d,{className:"flex items-center gap-2",children:[e.jsx("span",{children:"📊"}),"Foto Transkrip Nilai *"]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-3",children:[P&&e.jsxs("div",{className:"relative overflow-hidden rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 dark:from-blue-950/30 dark:to-indigo-950/30",children:[e.jsx("img",{src:P,alt:"Transcript Preview",className:"h-40 w-full rounded object-contain"}),e.jsx("div",{className:"absolute top-2 right-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white",children:"✓ Terpilih"})]}),e.jsx(p,{type:"file",accept:"image/*",onChange:t=>{var n;const a=(n=t.target.files)==null?void 0:n[0];a&&(r(a),u(t,T))},className:"cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-blue-400 dark:border-zinc-600",...x})]})}),e.jsx(f,{className:"text-xs",children:"📸 Format: JPG, PNG, WebP (Maks 5MB)"}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"instagram_proof_photo",render:({field:{onChange:r,value:s,...x}})=>e.jsxs(o,{children:[e.jsxs(d,{className:"flex items-center gap-2",children:[e.jsx("span",{children:"📱"}),"Foto Bukti Follow Instagram @skillgrow.id *"]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-3",children:[_&&e.jsxs("div",{className:"relative overflow-hidden rounded-lg border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-2 dark:from-pink-950/30 dark:to-rose-950/30",children:[e.jsx("img",{src:_,alt:"Instagram Proof Preview",className:"h-40 w-full rounded object-contain"}),e.jsx("div",{className:"absolute top-2 right-2 rounded-full bg-pink-500 px-2 py-1 text-xs font-semibold text-white",children:"✓ Terpilih"})]}),e.jsx(p,{type:"file",accept:"image/*",onChange:t=>{var n;const a=(n=t.target.files)==null?void 0:n[0];a&&(r(a),u(t,I))},className:"cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-pink-400 dark:border-zinc-600",...x})]})}),e.jsx(f,{className:"text-xs",children:"📸 Format: JPG, PNG, WebP (Maks 5MB)"}),e.jsx(c,{})]})}),e.jsx(l,{control:i.control,name:"instagram_tag_proof_photo",render:({field:{onChange:r,value:s,...x}})=>e.jsxs(o,{children:[e.jsxs(d,{className:"flex items-center gap-2",children:[e.jsx("span",{children:"👥"}),"Foto Bukti Tag 3 Teman di Instagram @skillgrow.id *"]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-3",children:[S&&e.jsxs("div",{className:"relative overflow-hidden rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 p-2 dark:from-purple-950/30 dark:to-violet-950/30",children:[e.jsx("img",{src:S,alt:"Instagram Tag Proof Preview",className:"h-40 w-full rounded object-contain"}),e.jsx("div",{className:"absolute top-2 right-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-semibold text-white",children:"✓ Terpilih"})]}),e.jsx(p,{type:"file",accept:"image/*",onChange:t=>{var n;const a=(n=t.target.files)==null?void 0:n[0];a&&(r(a),u(t,C))},className:"cursor-pointer border-2 border-dashed border-gray-300 py-6 hover:border-purple-400 dark:border-zinc-600",...x})]})}),e.jsx(f,{className:"text-xs",children:"📸 Format: JPG, PNG, WebP (Maks 5MB)"}),e.jsx(c,{})]})})]}),e.jsxs("div",{className:"flex gap-3 border-t border-gray-200 pt-6 dark:border-zinc-700",children:[e.jsx(F,{variant:"outline",type:"button",onClick:()=>window.history.back(),className:"border-2",children:"← Kembali"}),e.jsx(F,{type:"submit",disabled:y,className:"flex-1",children:y?"⏳ Mengirim...":"✓ Kirim Pendaftaran"})]})]})})})]})]})]})]})}export{Ue as default};
>>>>>>> 132845b553d0d9240cb0ef755c0137390a6c9096:public/build/assets/index-1aE9AkYK.js
