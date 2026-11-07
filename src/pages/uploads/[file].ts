import type { APIRoute } from 'astro';
import { readImage } from '@/shared/server/uploads';

export const prerender = false;

// Отдаёт загруженные через админку фото. Имена уникальны, поэтому кэшируем надолго.
export const GET: APIRoute = async ({ params }) => {
	const data = await readImage(params.file ?? '').catch(() => null);
	if (!data) return new Response('Not found', { status: 404 });
	return new Response(data as BodyInit, {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
