import type { APIRoute } from 'astro';
import {
	deleteBooking,
	listBookings,
	updateBookingStatus,
} from '@/entities/booking/api/booking.repo';
import { BOOKING_STATUSES, type BookingStatus } from '@/entities/booking/model/types';
import { isAuthed, unauthorized } from '@/shared/server/auth';
import { json, str } from '@/shared/server/http';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
	if (!isAuthed(cookies)) return unauthorized();
	return json({ ok: true, bookings: await listBookings() });
};

export const PATCH: APIRoute = async ({ cookies, request }) => {
	if (!isAuthed(cookies)) return unauthorized();
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	const status = str(body.status, 20) as BookingStatus;
	if (!(status in BOOKING_STATUSES)) return json({ ok: false }, 422);
	const item = await updateBookingStatus(str(body.id, 60), status);
	return item ? json({ ok: true, booking: item }) : json({ ok: false }, 404);
};

export const DELETE: APIRoute = async ({ cookies, url }) => {
	if (!isAuthed(cookies)) return unauthorized();
	const removed = await deleteBooking(url.searchParams.get('id') ?? '');
	return json({ ok: removed }, removed ? 200 : 404);
};
