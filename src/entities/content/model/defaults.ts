import type { SiteContent } from './types';

// Стартовое наполнение сайта. После первого сохранения в админке данные живут в data/content.json,
// а этот файл используется только как исходник.
// Контакты сверены с карточкой 2ГИС (ноябрь 2026).
export function defaultContent(): SiteContent {
	return {
		contacts: {
			address: 'мкр. Восток-5, 2/2',
			addressNote: '1 этаж · Свердловский район, Бишкек',
			phone: '996704126555',
			whatsapp: '996704126555',
			instagram: 'nsbarber_studio',
			twoGisUrl: 'https://2gis.kg/bishkek/firm/70000001104062519',
			lat: 42.870793,
			lon: 74.636047,
			hoursDays: 'Ежедневно',
			openFrom: '10:00',
			openTo: '21:00',
		},
		rating: { value: 5, count: 110 },
		categories: [
			{
				id: 'hair',
				title: 'Стрижки и волосы',
				description: 'Классика, фейды и укладка под ваш образ',
				services: [
					{ id: 'men-cut', name: 'Мужская стрижка', price: 900 },
					{ id: 'kids-cut', name: 'Детская стрижка', price: 700 },
					{ id: 'edging', name: 'Окантовка', price: 300 },
					{ id: 'styling', name: 'Укладка', price: 400 },
					{ id: 'head-tint', name: 'Тонировка головы', price: 800 },
					{ id: 'bio-perm', name: 'БИО завивка', price: 3000 },
				],
			},
			{
				id: 'beard',
				title: 'Борода',
				description: 'Форма, контур и цвет — аккуратно и симметрично',
				services: [
					{ id: 'beard-design', name: 'Оформление бороды', price: 700 },
					{ id: 'beard-fix', name: 'Коррекция бороды', price: 300 },
					{ id: 'beard-tint', name: 'Тонировка бороды', price: 700 },
				],
			},
			{
				id: 'care',
				title: 'Уход',
				description: 'Чистая кожа и завершённый образ',
				services: [
					{ id: 'face-clean', name: 'Чистка лица', price: 900 },
					{ id: 'wax', name: 'Воск', price: 200 },
				],
			},
			{
				id: 'combo',
				title: 'Комплексы',
				description: 'Выгоднее, чем по отдельности',
				services: [
					{ id: 'cut-beard', name: 'Стрижка + борода', price: 1500 },
					{ id: 'cut-face', name: 'Стрижка + чистка лица', price: 1600 },
				],
			},
		],
		// Мастера: имена и фото заполняются в админке
		masters: [
			{ id: 'm1', name: 'Имя мастера', role: 'Барбер' },
			{ id: 'm2', name: 'Имя мастера', role: 'Барбер' },
			{ id: 'm3', name: 'Имя мастера', role: 'Барбер' },
		],
		// Фото добавляются через админку; пока их нет, на сайте стоят нейтральные заглушки
		gallery: [
			{ id: 'g1', alt: 'Мужская стрижка', category: 'hair' },
			{ id: 'g2', alt: 'Оформление бороды', category: 'beard' },
			{ id: 'g3', alt: 'Интерьер студии', category: 'interior' },
			{ id: 'g4', alt: 'Фейд', category: 'hair' },
			{ id: 'g5', alt: 'Рабочее место барбера', category: 'interior' },
			{ id: 'g6', alt: 'Контур бороды', category: 'beard' },
			{ id: 'g7', alt: 'Детская стрижка', category: 'hair' },
			{ id: 'g8', alt: 'Зона ожидания', category: 'interior' },
		],
		// Отзывы добавляются в админке (можно переносить реальные отзывы из 2ГИС)
		reviews: [],
	};
}
