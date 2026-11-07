import { newId, readJson, withLock, writeJson } from '@/shared/server/store';
import type { Booking, BookingStatus } from '../model/types';

const FILE = 'bookings.json';
const MAX_STORED = 5000;

export async function listBookings(): Promise<Booking[]> {
	const list = await readJson<Booking[]>(FILE, () => []);
	return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addBooking(data: Omit<Booking, 'id' | 'createdAt' | 'status'>) {
	return withLock(FILE, async () => {
		const list = await readJson<Booking[]>(FILE, () => []);
		const booking: Booking = {
			...data,
			id: newId('b-'),
			createdAt: new Date().toISOString(),
			status: 'new',
		};
		list.push(booking);
		await writeJson(FILE, list.slice(-MAX_STORED));
		return booking;
	});
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
	return withLock(FILE, async () => {
		const list = await readJson<Booking[]>(FILE, () => []);
		const item = list.find((b) => b.id === id);
		if (!item) return null;
		item.status = status;
		await writeJson(FILE, list);
		return item;
	});
}

export async function deleteBooking(id: string) {
	return withLock(FILE, async () => {
		const list = await readJson<Booking[]>(FILE, () => []);
		const next = list.filter((b) => b.id !== id);
		await writeJson(FILE, next);
		return next.length !== list.length;
	});
}
