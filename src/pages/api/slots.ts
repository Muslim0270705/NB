import type { APIRoute } from 'astro';
import { getContent } from '@/entities/content/api/content.repo';
import { findService } from '@/entities/content/model/selectors';
import { crmSlots, isCrmEnabled } from '@/shared/server/crm';
import { json, rateLimited, str } from '@/shared/server/http';

export const prerender = false;

// Свободное время из CRM (с учётом уже занятых мастеров).
// times: null — CRM не подключена, форма строит время по часам работы сама.
export const GET: APIRoute = async ({ url, clientAddress }) => {
	if (!isCrmEnabled()) return json({ times: null });
	if (rateLimited(`slots:${clientAddress}`, 120, 10 * 60_000)) return json({ times: null }, 429);

	const date = str(url.searchParams.get('date'), 10);
	const service = findService(await getContent(), str(url.searchParams.get('service'), 60));
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !service) return json({ times: null }, 422);

	try {
		const times = await crmSlots({
			date,
			serviceName: service.name,
			masterName: str(url.searchParams.get('master'), 80) || undefined,
		});
		return json({ times });
	} catch (error) {
		console.error('CRM slots failed', error);
		// CRM недоступна — форма покажет время по часам работы, заявка всё равно дойдёт
		return json({ times: null });
	}
};
