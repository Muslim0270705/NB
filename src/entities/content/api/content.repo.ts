import { readJson, withLock, writeJson } from '@/shared/server/store';
import { removeUnreferenced } from '@/shared/server/uploads';
import { defaultContent } from '../model/defaults';
import { referencedUploads, sanitizeContent } from '../model/sanitize';
import type { SiteContent } from '../model/types';

const FILE = 'content.json';

export async function getContent(): Promise<SiteContent> {
	const raw = await readJson<unknown>(FILE, defaultContent);
	return sanitizeContent(raw);
}

export async function saveContent(input: unknown): Promise<SiteContent> {
	return withLock(FILE, async () => {
		const content = sanitizeContent(input);
		content.updatedAt = new Date().toISOString();
		await writeJson(FILE, content);
		await removeUnreferenced(referencedUploads(content));
		return content;
	});
}
