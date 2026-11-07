import { ADMIN_PASSWORD, SESSION_SECRET } from 'astro:env/server';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const SESSION_COOKIE = 'ns_admin';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 дней

export function isAdminEnabled(): boolean {
	return Boolean(ADMIN_PASSWORD);
}

function sessionToken(): string | null {
	if (!ADMIN_PASSWORD) return null;
	// Смена пароля автоматически разлогинивает все старые сессии
	return createHmac('sha256', SESSION_SECRET || ADMIN_PASSWORD)
		.update(`ns-admin:${ADMIN_PASSWORD}`)
		.digest('hex');
}

function safeEqual(a: string, b: string): boolean {
	const ha = createHash('sha256').update(a).digest();
	const hb = createHash('sha256').update(b).digest();
	return timingSafeEqual(ha, hb);
}

export function checkPassword(password: string): boolean {
	return Boolean(ADMIN_PASSWORD) && safeEqual(password, ADMIN_PASSWORD as string);
}

export function isAuthed(cookies: AstroCookies): boolean {
	const token = sessionToken();
	const value = cookies.get(SESSION_COOKIE)?.value;
	return Boolean(token && value && safeEqual(value, token));
}

export function startSession(cookies: AstroCookies, secure: boolean): void {
	const token = sessionToken();
	if (!token) return;
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure,
		maxAge: MAX_AGE,
	});
}

export function endSession(cookies: AstroCookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function unauthorized(): Response {
	return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' },
	});
}
