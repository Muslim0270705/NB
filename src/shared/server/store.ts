import { DATA_DIR } from 'astro:env/server';
import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Хранилище «ключ → значение» с двумя реализациями:
// • fs    — файлы в DATA_DIR (локальная разработка, Docker с volume);
// • blobs — Netlify Blobs (на Netlify диск функций не сохраняется между запросами).
// Реализация выбирается при сборке: на Netlify переменная NETLIFY=true.
// Ключи вида «bookings/b-123.json» — слэш работает как папка.

interface KV {
	getText(key: string): Promise<string | null>;
	getBytes(key: string): Promise<Uint8Array | null>;
	set(key: string, value: string | Uint8Array): Promise<void>;
	delete(key: string): Promise<void>;
	list(prefix: string): Promise<string[]>;
}

const dataDir = path.resolve(DATA_DIR || 'data');

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException)?.code === 'ENOENT';

const fsStore: KV = {
	async getText(key) {
		try {
			return await readFile(path.join(dataDir, key), 'utf8');
		} catch (error) {
			if (isMissing(error)) return null;
			throw error;
		}
	},
	async getBytes(key) {
		try {
			return new Uint8Array(await readFile(path.join(dataDir, key)));
		} catch (error) {
			if (isMissing(error)) return null;
			throw error;
		}
	},
	async set(key, value) {
		const target = path.join(dataDir, key);
		await mkdir(path.dirname(target), { recursive: true });
		// Запись через временный файл, чтобы при сбое не оставить битый файл
		const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
		await writeFile(tmp, value);
		await rename(tmp, target);
	},
	async delete(key) {
		await unlink(path.join(dataDir, key)).catch((error) => {
			if (!isMissing(error)) throw error;
		});
	},
	async list(prefix) {
		const dir = path.join(dataDir, prefix);
		try {
			const names = await readdir(dir);
			return names.filter((n) => !n.endsWith('.tmp')).map((n) => `${prefix}${n}`);
		} catch (error) {
			if (isMissing(error)) return [];
			throw error;
		}
	},
};

async function blobsStore(): Promise<KV> {
	const { getStore } = await import('@netlify/blobs');
	// strong — админ сразу видит то, что только что сохранил
	const store = getStore({ name: 'ns-barber', consistency: 'strong' });
	return {
		getText: (key) => store.get(key, { type: 'text' }),
		async getBytes(key) {
			const data = await store.get(key, { type: 'arrayBuffer' });
			return data ? new Uint8Array(data) : null;
		},
		async set(key, value) {
			await store.set(key, typeof value === 'string' ? value : new Blob([value as BlobPart]));
		},
		async delete(key) {
			await store.delete(key);
		},
		async list(prefix) {
			const { blobs } = await store.list({ prefix });
			return blobs.map((b) => b.key);
		},
	};
}

let kvPromise: Promise<KV> | null = null;
export function kv(): Promise<KV> {
	kvPromise ??= __NS_STORAGE__ === 'blobs' ? blobsStore() : Promise.resolve(fsStore);
	return kvPromise;
}

export async function readJson<T>(key: string, fallback: () => T): Promise<T> {
	try {
		const raw = await (await kv()).getText(key);
		return raw === null ? fallback() : (JSON.parse(raw) as T);
	} catch (error) {
		console.error(`Не удалось прочитать ${key}`, error);
		return fallback();
	}
}

export async function writeJson(key: string, value: unknown): Promise<void> {
	await (await kv()).set(key, JSON.stringify(value, null, '\t'));
}

// Последовательная очередь записей одного ключа внутри процесса
const queues = new Map<string, Promise<unknown>>();

export function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
	const prev = queues.get(key) ?? Promise.resolve();
	const next = prev.then(task, task);
	queues.set(
		key,
		next.catch(() => undefined)
	);
	return next;
}

export function newId(prefix = ''): string {
	return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
