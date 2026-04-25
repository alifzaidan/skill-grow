import { L as c, r as s, j as t } from './app-YpIYLBeO.js';
import './avatar-B2-w03p6.js';
import './badge-0iDt5May.js';
import './breadcrumbs-CsE5J3Ts.js';
import u from './business-section-BzhdxjKr.js';
import './button-D6jV5iZd.js';
import './card-7o3Ui4ft.js';
import f from './career-section-BL80aQfi.js';
import './carousel-CujNfDTz.js';
import g from './categories-section-7XQp6mI8.js';
import './check-Cqm3K05O.js';
import './chevron-right-CcB3--ug.js';
import './circle-check-big-o48eT2iK.js';
import './clock-BZeKVlB4.js';
import './Combination-DForpSOC.js';
import './command-DBflw03Y.js';
import './createLucideIcon-CznZjamP.js';
import './dialog-BJVi_unN.js';
import w from './digmar-section-BaRyEwxt.js';
import './dropdown-menu-B_XxOxPD.js';
import './floating-ui.react-dom-DhdReOBU.js';
import b from './hero-DWNGDQ8V.js';
import './house-DNfH2s_k.js';
import './icon-CKTb-5Jw.js';
import './index-BDKJ_NqI.js';
import './index-C4-Of0NU.js';
import './index-CB3fLD34.js';
import './index-CHpEGpGi.js';
import './index-CYFDEeU-.js';
import './index-DGgRCLg3.js';
import './index-DH0kq-eE.js';
import './index-Dlk3ksW0.js';
import './index-DltBXwOt.js';
import './index-DUhKNaAh.js';
import { t as h } from './index-pYcqEd81.js';
import './index-xoFH74Sc.js';
import './monitor-play-BWIPtBC_.js';
import './presentation-fXhTX9rF.js';
import './proxy-CCcOuTFC.js';
import './search-Di01vbHr.js';
import './sonner-B23tF3jR.js';
import j from './technology-section-FWRjgmr-.js';
import y from './testimony-section-BHLU1RsH.js';
import './tooltip-CEAXCeAV.js';
import S from './trainer-section-mN5tobyb.js'; /* empty css            */
import './use-initials-fKcVvJlK.js';
import './use-motion-value-D72B8dtI.js';
import './user-BuBJ2oUL.js';
import { U as x } from './user-layout--wPUaYS_.js';
import './utils-B6UgOHOA.js';
import './x-DAVjUvp5.js';
const l = [
    'Ahmad Rizki',
    'Siti Nurhaliza',
    'Budi Santoso',
    'Maya Sari',
    'Andi Pratama',
    'Dewi Lestari',
    'Reza Fauzi',
    'Indira Putri',
    'Fajar Nugroho',
    'Rina Maharani',
    'Dimas Aditya',
    'Lina Kartika',
    'Arief Rahman',
    'Tia Permata',
    'Yoga Saputra',
    'Nita Sari',
    'Bayu Wijaya',
    'Safira Anggraini',
    'Hendra Gunawan',
    'Mira Oktavia',
    'Alif Firmansyah',
    'Putri Wulandari',
    'Irfan Hakim',
    'Sari Melati',
    'Doni Setiawan',
];
function v({ products: i }) {
    const [m, a] = s.useState(!0);
    return (
        s.useEffect(() => {
            if (!i || i.length === 0) return;
            const e = () => {
                    const r = i[Math.floor(Math.random() * i.length)],
                        p = l[Math.floor(Math.random() * l.length)],
                        d = r.type === 'course' ? 'Kelas Online' : r.type === 'bootcamp' ? 'Bootcamp' : 'Webinar';
                    h.success(
                        t.jsx('div', {
                            className: 'flex w-full min-w-0 items-start space-x-3',
                            children: t.jsxs('div', {
                                className: 'min-w-0 flex-1 overflow-hidden',
                                children: [
                                    t.jsx('p', {
                                        className: 'mb-1 text-sm font-medium text-gray-900',
                                        children: t.jsx('span', { className: 'font-semibold', children: p }),
                                    }),
                                    t.jsxs('span', {
                                        className: 'text-xs leading-relaxed break-words text-gray-500',
                                        children: ['Baru saja membeli ', d, ': '],
                                    }),
                                    t.jsx('span', { className: 'text-xs leading-relaxed font-medium break-words text-gray-700', children: r.title }),
                                ],
                            }),
                        }),
                        {
                            duration: 5e3,
                            position: 'bottom-left',
                            style: {
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                maxWidth: '350px',
                                width: '350px',
                                padding: '12px',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                            },
                        },
                    );
                },
                o = setTimeout(e, 1e4),
                n = setInterval(
                    () => {
                        m && e();
                    },
                    Math.random() * 3e4 + 3e4,
                );
            return () => {
                clearTimeout(o), clearInterval(n);
            };
        }, [i, m]),
        s.useEffect(() => {
            const e = () => {
                    const n = window.scrollY + window.innerHeight,
                        r = document.documentElement.scrollHeight;
                    n >= r * 0.8 ? a(!1) : a(!0);
                },
                o = () => {
                    a(!document.hidden);
                };
            return (
                window.addEventListener('scroll', e),
                document.addEventListener('visibilitychange', o),
                () => {
                    window.removeEventListener('scroll', e), document.removeEventListener('visibilitychange', o);
                }
            );
        }, []),
        null
    );
}
function St({ allProducts: i }) {
    return t.jsxs(x, {
        children: [
            t.jsx(c, { title: 'Beranda' }),
            t.jsx(b, {}),
            t.jsx(g, {}),
            t.jsx(w, {}),
            t.jsx(u, {}),
            t.jsx(j, {}),
            t.jsx(f, {}),
            t.jsx(S, {}),
            t.jsx(y, {}),
            typeof window < 'u' && window.innerWidth >= 1024 && t.jsx(v, { products: i }),
            t.jsx('a', {
                href: 'https://wa.me/+6285167541152?text=Halo%20Admin%Skillgrow,%20saya%20ingin%20bertanya%20tentang%20kelas%20online.',
                target: '_blank',
                rel: 'noopener noreferrer',
                className:
                    'fixed right-4 bottom-18 z-50 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-green-100 shadow-lg transition duration-1000 hover:bg-green-200 md:right-10 md:h-16 md:w-16 lg:bottom-6',
                'aria-label': 'Chat WhatsApp',
                children: t.jsx('img', { src: '/assets/images/icon-wa.svg', alt: 'WhatsApp', className: 'h-8 w-8 md:h-12 md:w-12' }),
            }),
        ],
    });
}
export { St as default };
