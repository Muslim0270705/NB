// Ссылки на мессенджеры и соцсети собираются из номеров/хэндлов в одном месте

export function digitsOnly(value: string): string {
	return value.replace(/\D/g, '');
}

export function telLink(phone: string): string {
	return `tel:+${digitsOnly(phone)}`;
}

export function whatsappLink(phone: string, text?: string): string {
	const base = `https://wa.me/${digitsOnly(phone)}`;
	return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function instagramLink(handle: string): string {
	return `https://instagram.com/${handle.replace(/^@/, '')}`;
}

// Instagram Direct: открывает диалог с аккаунтом
export function instagramDirectLink(handle: string): string {
	return `https://ig.me/m/${handle.replace(/^@/, '')}`;
}

// Виджет карты 2ГИС с карточкой организации
export function twoGisWidgetUrl(firmUrl: string, lat: number, lon: number): string {
	const org = firmUrl.match(/firm\/(\d+)/)?.[1];
	const options = {
		pos: { lat, lon, zoom: 16 },
		opt: { city: 'bishkek' },
		...(org ? { org } : {}),
	};
	return `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(JSON.stringify(options))}`;
}

export function twoGisReviewsLink(firmUrl: string): string {
	return `${firmUrl.replace(/\/$/, '')}/tab/reviews`;
}
