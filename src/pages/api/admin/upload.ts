import type { APIRoute } from 'astro';
import { isAuthed, unauthorized } from '@/shared/server/auth';
import { json } from '@/shared/server/http';
import { saveImage } from '@/shared/server/uploads';

export const prerender = false;

// Загрузка фото для галереи и мастеров. Файл сразу сжимается в WebP;
// в контент он попадает после нажатия «Сохранить» в админке.
export const POST: APIRoute = async ({ cookies, request }) => {
	if (!isAuthed(cookies)) return unauthorized();
	const form = await request.formData().catch(() => null);
	const file = form?.get('file');
	if (!(file instanceof File)) return json({ ok: false, error: 'no_file' }, 400);
	try {
		const image = await saveImage(file);
		return json({ ok: true, image });
	} catch (error) {
		const code = error instanceof Error ? error.message : 'failed';
		console.error('Upload failed', error);
		return json({ ok: false, error: code }, code === 'too_large' ? 413 : 422);
	}
};
