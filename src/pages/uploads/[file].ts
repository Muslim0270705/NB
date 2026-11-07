import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { uploadsDir } from '@/shared/server/store';
import { UPLOAD_NAME } from '@/shared/server/uploads';

export const prerender = false;

// Отдаёт загруженные через админку фото. Имена уникальны, поэтому кэшируем надолго.
export const GET: APIRoute = async ({ params }) => {
	const name = params.file ?? '';
	if (!UPLOAD_NAME.test(name)) return new Response('Not found', { status: 404 });
	try {
		const data = await readFile(path.join(uploadsDir, name));
		return new Response(data, {
			headers: {
				'Content-Type': 'image/webp',
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} catch {
		return new Response('Not found', { status: 404 });
	}
};
