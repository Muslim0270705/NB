import { kv, newId } from './store';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const UPLOAD_NAME = /^[a-z0-9-]+\.webp$/;
const PREFIX = 'uploads/';

export interface UploadedImage {
	src: string;
	thumb: string;
	width: number;
	height: number;
}

// Каждое фото сжимается в WebP: крупная версия для лайтбокса и превью для сетки —
// так галерея остаётся лёгкой для мобильного PageSpeed.
export async function saveImage(file: File): Promise<UploadedImage> {
	if (file.size > MAX_UPLOAD_BYTES) throw new Error('too_large');
	if (!file.type.startsWith('image/')) throw new Error('not_image');

	// sharp грузится только здесь: сбой нативного модуля не должен ронять весь сайт
	const { default: sharp } = await import('sharp');
	const input = Buffer.from(await file.arrayBuffer());
	const id = newId('img-');
	const image = sharp(input, { failOn: 'error' }).rotate();

	const large = await image
		.clone()
		.resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 80 })
		.toBuffer({ resolveWithObject: true });
	const small = await image
		.clone()
		.resize({ width: 720, height: 900, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 74 })
		.toBuffer();

	const store = await kv();
	await store.set(`${PREFIX}${id}.webp`, new Uint8Array(large.data));
	await store.set(`${PREFIX}${id}-sm.webp`, new Uint8Array(small));

	return {
		src: `/uploads/${id}.webp`,
		thumb: `/uploads/${id}-sm.webp`,
		width: large.info.width,
		height: large.info.height,
	};
}

export async function readImage(name: string): Promise<Uint8Array | null> {
	if (!UPLOAD_NAME.test(name)) return null;
	return (await kv()).getBytes(`${PREFIX}${name}`);
}

// Удаляем файлы, на которые больше не ссылается контент
export async function removeUnreferenced(referenced: Set<string>): Promise<void> {
	const store = await kv();
	const keys = await store.list(PREFIX);
	await Promise.all(
		keys
			.filter((key) => {
				const name = key.slice(PREFIX.length);
				return UPLOAD_NAME.test(name) && !referenced.has(`/uploads/${name}`);
			})
			.map((key) => store.delete(key).catch(() => undefined))
	);
}
