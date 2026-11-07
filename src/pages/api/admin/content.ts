import type { APIRoute } from 'astro';
import { getContent, saveContent } from '@/entities/content/api/content.repo';
import { isAuthed, unauthorized } from '@/shared/server/auth';
import { json } from '@/shared/server/http';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
	if (!isAuthed(cookies)) return unauthorized();
	return json({ ok: true, content: await getContent() });
};

export const PUT: APIRoute = async ({ cookies, request }) => {
	if (!isAuthed(cookies)) return unauthorized();
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') return json({ ok: false }, 400);
	const content = await saveContent((body as { content?: unknown }).content);
	return json({ ok: true, content });
};
