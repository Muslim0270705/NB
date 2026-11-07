import { defaultContent } from './defaults';
import type { GalleryCategory, SiteContent } from './types';

// Приводит данные из админки к ожидаемой форме: обрезает строки, отбрасывает мусор.
// Защищает публичную страницу от «сломанного» JSON.

const s = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const n = (v: unknown, fallback = 0): number => {
	const x = typeof v === 'number' ? v : Number(v);
	return Number.isFinite(x) ? x : fallback;
};
const arr = (v: unknown): Record<string, unknown>[] =>
	Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : [];
const id = (v: unknown, i: number, prefix: string): string =>
	s(v, 60).replace(/[^\w-]/g, '') || `${prefix}${i}-${Date.now().toString(36)}`;
const upload = (v: unknown): string | undefined => {
	const value = s(v, 200);
	return /^\/uploads\/[a-z0-9-]+\.webp$/.test(value) ? value : undefined;
};
const time = (v: unknown, fallback: string): string => {
	const value = s(v, 5);
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
};
const CATS: GalleryCategory[] = ['hair', 'beard', 'interior'];

export function sanitizeContent(input: unknown): SiteContent {
	const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
	const base = defaultContent();
	const c = (raw.contacts ?? {}) as Record<string, unknown>;
	const r = (raw.rating ?? {}) as Record<string, unknown>;

	return {
		contacts: {
			address: s(c.address) || base.contacts.address,
			addressNote: s(c.addressNote),
			phone: s(c.phone, 30).replace(/\D/g, ''),
			whatsapp: s(c.whatsapp, 30).replace(/\D/g, ''),
			instagram: s(c.instagram, 60)
				.replace(/^@/, '')
				.replace(/[^\w.]/g, ''),
			twoGisUrl: /^https:\/\/2gis\.(kg|ru|kz|com)\//.test(s(c.twoGisUrl, 300))
				? s(c.twoGisUrl, 300)
				: base.contacts.twoGisUrl,
			lat: n(c.lat, base.contacts.lat),
			lon: n(c.lon, base.contacts.lon),
			hoursDays: s(c.hoursDays, 60) || base.contacts.hoursDays,
			openFrom: time(c.openFrom, base.contacts.openFrom),
			openTo: time(c.openTo, base.contacts.openTo),
		},
		rating: {
			value: Math.min(5, Math.max(0, n(r.value, base.rating.value))),
			count: Math.max(0, Math.round(n(r.count, base.rating.count))),
		},
		categories: arr(raw.categories).map((cat, i) => ({
			id: id(cat.id, i, 'cat'),
			title: s(cat.title, 80) || 'Без названия',
			description: s(cat.description, 200) || undefined,
			services: arr(cat.services)
				.map((svc, j) => ({
					id: id(svc.id, j, 'svc'),
					name: s(svc.name, 120),
					price: Math.max(0, Math.round(n(svc.price))),
					note: s(svc.note, 40) || undefined,
				}))
				.filter((svc) => svc.name),
		})),
		masters: arr(raw.masters).map((m, i) => ({
			id: id(m.id, i, 'm'),
			name: s(m.name, 80) || 'Мастер',
			role: s(m.role, 120),
			photo: upload(m.photo),
		})),
		gallery: arr(raw.gallery).map((g, i) => ({
			id: id(g.id, i, 'g'),
			alt: s(g.alt, 160) || 'Работа NS Barber Studio',
			category: CATS.includes(g.category as GalleryCategory)
				? (g.category as GalleryCategory)
				: 'hair',
			src: upload(g.src),
			thumb: upload(g.thumb),
			width: n(g.width) || undefined,
			height: n(g.height) || undefined,
		})),
		reviews: arr(raw.reviews)
			.map((rv, i) => ({
				id: id(rv.id, i, 'r'),
				author: s(rv.author, 80),
				text: s(rv.text, 1200),
				rating: Math.min(5, Math.max(1, Math.round(n(rv.rating, 5)))),
			}))
			.filter((rv) => rv.author && rv.text),
		updatedAt: s(raw.updatedAt, 40) || undefined,
	};
}

export function referencedUploads(content: SiteContent): Set<string> {
	const set = new Set<string>();
	for (const g of content.gallery) {
		if (g.src) set.add(g.src);
		if (g.thumb) set.add(g.thumb);
	}
	for (const m of content.masters) if (m.photo) set.add(m.photo);
	return set;
}
