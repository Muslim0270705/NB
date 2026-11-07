import { readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ensureDirs, newId, uploadsDir } from './store';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const UPLOAD_NAME = /^[a-z0-9-]+\.webp$/;

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
	await ensureDirs();

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

	await writeFile(path.join(uploadsDir, `${id}.webp`), large.data);
	await writeFile(path.join(uploadsDir, `${id}-sm.webp`), small);

	return {
		src: `/uploads/${id}.webp`,
		thumb: `/uploads/${id}-sm.webp`,
		width: large.info.width,
		height: large.info.height,
	};
}

// Удаляем с диска файлы, на которые больше не ссылается контент
export async function removeUnreferenced(referenced: Set<string>): Promise<void> {
	let files: string[] = [];
	try {
		files = await readdir(uploadsDir);
	} catch {
		return;
	}
	await Promise.all(
		files
			.filter((name) => UPLOAD_NAME.test(name) && !referenced.has(`/uploads/${name}`))
			.map((name) => unlink(path.join(uploadsDir, name)).catch(() => undefined))
	);
}
