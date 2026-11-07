// Слоты записи по часам работы: каждые 30 минут, последний — за час до закрытия
export function timeSlots(openFrom: string, openTo: string, step = 30): string[] {
	const toMin = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};
	const start = toMin(openFrom);
	let end = toMin(openTo);
	if (end <= start) end += 24 * 60;
	const slots: string[] = [];
	for (let t = start; t <= end - 60; t += step) {
		const h = Math.floor(t / 60) % 24;
		const m = t % 60;
		slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
	}
	return slots;
}

// Дата в часовом поясе Бишкека (UTC+6) в формате YYYY-MM-DD
export function bishkekDate(offsetDays = 0, now = new Date()): string {
	const d = new Date(now.getTime() + 6 * 3600_000 + offsetDays * 86_400_000);
	return d.toISOString().slice(0, 10);
}

export function bishkekMinutesNow(now = new Date()): number {
	const d = new Date(now.getTime() + 6 * 3600_000);
	return d.getUTCHours() * 60 + d.getUTCMinutes();
}

export function formatDateRu(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	if (!y || !m || !d) return iso;
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		weekday: 'short',
		timeZone: 'UTC',
	});
}
