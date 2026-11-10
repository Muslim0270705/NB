// @ts-check

import netlify from '@astrojs/netlify';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
// На Netlify (NETLIFY=true при сборке) — серверлесс-функции и Netlify Blobs,
// везде остальном — Node-сервер и файлы на диске (Docker, локальная разработка)
const onNetlify = process.env.NETLIFY === 'true';

export default defineConfig({
	// Адрес сайта для canonical/OG: SITE_URL, иначе основной адрес Netlify, иначе будущий домен
	site: process.env.SITE_URL || (onNetlify && process.env.URL) || 'https://nsbarber.kg',
	// Главная и админка рендерятся на сервере (контент редактируется из админки),
	// служебные страницы (404) собираются статически
	adapter: onNetlify ? netlify() : node({ mode: 'standalone' }),
	server: { port: 3000 },
	env: {
		schema: {
			// Пароль входа в /admin. Пока не задан — админка закрыта
			ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Секрет подписи сессии (любая длинная случайная строка)
			SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Уведомления о новых заявках в Telegram
			TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
			TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Где хранятся контент, заявки и загруженные фото (в Docker — volume)
			DATA_DIR: envField.string({ context: 'server', access: 'public', optional: true }),
			// CRM NS Barber (crm_nb): заявки уходят туда, свободное время берётся оттуда
			CRM_API_URL: envField.string({ context: 'server', access: 'public', optional: true }),
			CRM_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
			// Аналитика: подключается, только если ID заданы
			PUBLIC_GA_ID: envField.string({ context: 'client', access: 'public', optional: true }),
			PUBLIC_YM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
		},
	},
	vite: {
		plugins: [tailwindcss()],
		define: {
			__NS_STORAGE__: JSON.stringify(onNetlify ? 'blobs' : 'fs'),
		},
	},
	integrations: [react()],
});
