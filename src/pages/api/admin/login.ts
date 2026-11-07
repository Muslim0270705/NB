import type { APIRoute } from 'astro';
import { checkPassword, startSession } from '@/shared/server/auth';
import { rateLimited } from '@/shared/server/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress, url }) => {
	if (rateLimited(`login:${clientAddress}`, 8, 15 * 60_000)) {
		return redirect('/admin/login?error=limit', 303);
	}
	const form = await request.formData().catch(() => null);
	const password = String(form?.get('password') ?? '');
	if (!checkPassword(password)) {
		return redirect('/admin/login?error=1', 303);
	}
	startSession(cookies, url.protocol === 'https:');
	return redirect('/admin', 303);
};
