// Постоянные данные бренда. Изменяемые контакты (адрес, телефон, часы) живут в админке —
// см. entities/content.
export const SITE = {
	name: 'NS Barber Studio',
	shortName: 'NS Barber',
	slogan: 'Качество · Стиль · Профессионализм',
	description:
		'NS Barber Studio — барбершоп в Бишкеке (мкр. Восток-5). Мужские и детские стрижки, оформление бороды, уход. Онлайн-запись за минуту.',
	city: 'Бишкек',
	locale: 'ru_RU',
} as const;

// Якорная навигация одностраничного сайта
export const NAV = [
	{ href: '/#services', label: 'Услуги и цены' },
	{ href: '/#about', label: 'О студии' },
	{ href: '/#gallery', label: 'Работы' },
	{ href: '/#reviews', label: 'Отзывы' },
	{ href: '/#contacts', label: 'Контакты' },
] as const;

export const BOOKING_ANCHOR = '/#booking';
