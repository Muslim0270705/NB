import type { Booking, BookingStatus } from '@/entities/booking';
import type { SiteContent } from '@/entities/content';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	if (response.status === 401) {
		window.location.href = '/admin/login';
		throw new Error('unauthorized');
	}
	const data = await response.json().catch(() => ({}));
	if (!response.ok || !data.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
	return data as T;
}

export const adminApi = {
	saveContent: (content: SiteContent) =>
		request<{ content: SiteContent }>('/api/admin/content', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content }),
		}).then((d) => d.content),

	bookings: () => request<{ bookings: Booking[] }>('/api/admin/bookings').then((d) => d.bookings),

	setStatus: (id: string, status: BookingStatus) =>
		request('/api/admin/bookings', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, status }),
		}),

	deleteBooking: (id: string) =>
		request(`/api/admin/bookings?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

	upload: (file: File) => {
		const form = new FormData();
		form.append('file', file);
		return request<{
			image: { src: string; thumb: string; width: number; height: number };
		}>('/api/admin/upload', { method: 'POST', body: form }).then((d) => d.image);
	},
};

export function localId(prefix: string): string {
	return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
	const target = index + dir;
	if (target < 0 || target >= list.length) return list;
	const next = [...list];
	[next[index], next[target]] = [next[target], next[index]];
	return next;
}
