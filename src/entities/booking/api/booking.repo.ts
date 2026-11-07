import { kv, newId, readJson, writeJson } from '@/shared/server/store';
import type { Booking, BookingStatus } from '../model/types';

// Каждая заявка — отдельная запись: параллельные заявки (в том числе с разных
// серверлесс-инстансов Netlify) не перезаписывают друг друга.
const PREFIX = 'bookings/';
const key = (id: string) => `${PREFIX}${id.replace(/[^\w-]/g, '')}.json`;

export async function listBookings(): Promise<Booking[]> {
	const keys = await (await kv()).list(PREFIX);
	const items = await Promise.all(
		keys.filter((k) => k.endsWith('.json')).map((k) => readJson<Booking | null>(k, () => null))
	);
	return items
		.filter((b): b is Booking => Boolean(b?.id))
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status'>) {
	const booking: Booking = {
		...data,
		id: newId('b-'),
		createdAt: new Date().toISOString(),
		status: 'new',
	};
	await writeJson(key(booking.id), booking);
	return booking;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
	const item = await readJson<Booking | null>(key(id), () => null);
	if (!item) return null;
	item.status = status;
	await writeJson(key(id), item);
	return item;
}

export async function deleteBooking(id: string) {
	const store = await kv();
	const exists = (await store.getText(key(id))) !== null;
	if (exists) await store.delete(key(id));
	return exists;
}
