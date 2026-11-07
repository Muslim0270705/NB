import { DATA_DIR } from 'astro:env/server';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Простое файловое хранилище: JSON-файлы в DATA_DIR. Для барбершопа с десятками заявок в день
// этого достаточно; в Docker папка монтируется как volume, чтобы данные переживали деплой.
export const dataDir = path.resolve(DATA_DIR || 'data');
export const uploadsDir = path.join(dataDir, 'uploads');

export async function ensureDirs(): Promise<void> {
	await mkdir(uploadsDir, { recursive: true });
}

export async function readJson<T>(name: string, fallback: () => T): Promise<T> {
	try {
		const raw = await readFile(path.join(dataDir, name), 'utf8');
		return JSON.parse(raw) as T;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.error(`Не удалось прочитать ${name}`, error);
		}
		return fallback();
	}
}

// Запись через временный файл, чтобы при сбое не оставить битый JSON
export async function writeJson(name: string, value: unknown): Promise<void> {
	await ensureDirs();
	const target = path.join(dataDir, name);
	const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
	await writeFile(tmp, JSON.stringify(value, null, '\t'), 'utf8');
	await rename(tmp, target);
}

// Последовательная очередь записей одного файла — чтобы параллельные запросы не затирали друг друга
const queues = new Map<string, Promise<unknown>>();

export function withLock<T>(name: string, task: () => Promise<T>): Promise<T> {
	const prev = queues.get(name) ?? Promise.resolve();
	const next = prev.then(task, task);
	queues.set(
		name,
		next.catch(() => undefined)
	);
	return next;
}

export function newId(prefix = ''): string {
	return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
