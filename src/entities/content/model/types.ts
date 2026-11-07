export interface Service {
	id: string;
	name: string;
	price: number;
	/** Необязательная приписка, например «от» или длительность */
	note?: string;
}

export interface ServiceCategory {
	id: string;
	title: string;
	description?: string;
	services: Service[];
}

export interface Master {
	id: string;
	name: string;
	role: string;
	photo?: string;
}

export type GalleryCategory = 'hair' | 'beard' | 'interior';

export interface GalleryItem {
	id: string;
	alt: string;
	category: GalleryCategory;
	src?: string;
	thumb?: string;
	width?: number;
	height?: number;
}

export interface Review {
	id: string;
	author: string;
	text: string;
	rating: number;
}

export interface Contacts {
	address: string;
	addressNote: string;
	phone: string;
	whatsapp: string;
	instagram: string;
	twoGisUrl: string;
	lat: number;
	lon: number;
	hoursDays: string;
	openFrom: string;
	openTo: string;
}

export interface Rating {
	value: number;
	count: number;
}

export interface SiteContent {
	contacts: Contacts;
	rating: Rating;
	categories: ServiceCategory[];
	masters: Master[];
	gallery: GalleryItem[];
	reviews: Review[];
	updatedAt?: string;
}

export const GALLERY_CATEGORIES: Record<GalleryCategory, string> = {
	hair: 'Стрижки',
	beard: 'Борода',
	interior: 'Интерьер',
};
