import type { APIRoute } from 'astro';
import { addBooking } from '@/entities/booking/api/booking.repo';
import { formatDateRu } from '@/entities/booking/model/slots';
import { getContent } from '@/entities/content/api/content.repo';
import { findService } from '@/entities/content/model/selectors';
import { CrmError, crmCreateBooking, isCrmEnabled } from '@/shared/server/crm';
import { json, num, rateLimited, str } from '@/shared/server/http';
import { escapeHtml, notifyTelegram } from '@/shared/server/notify';

export const prerender = false;

const MIN_FILL_MS = 2500; // быстрее человек форму не заполнит

export const POST: APIRoute = async ({ request, clientAddress }) => {
	let input: Record<string, unknown>;
	try {
		input = await request.json();
	} catch {
		return json({ ok: false }, 400);
	}

	// Антибот: скрытое поле, время заполнения и лимит по IP.
	// Ботам отвечаем «успехом», чтобы они не подбирали обход.
	if (str(input.website, 200) || num(input.elapsed) < MIN_FILL_MS) {
		return json({ ok: true });
	}
	if (rateLimited(`booking:${clientAddress}`, 6, 10 * 60_000)) {
		return json({ ok: false, error: 'rate_limited' }, 429);
	}

	const type = input.type === 'callback' ? 'callback' : 'booking';
	const name = str(input.name, 80);
	const phone = str(input.phone, 40);
	if (name.length < 2 || phone.replace(/\D/g, '').length < 12) {
		return json({ ok: false, error: 'validation' }, 422);
	}

	const content = await getContent();
	const service = type === 'booking' ? findService(content, str(input.serviceId, 60)) : undefined;
	const date = str(input.date, 10);
	const time = str(input.time, 5);
	if (type === 'booking') {
		if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
			return json({ ok: false, error: 'validation' }, 422);
		}
	}

	// CRM подключена — запись создаётся там: CRM проверит занятость мастера,
	// подтвердит клиенту и уведомит владельца в WhatsApp
	if (type === 'booking' && service && isCrmEnabled()) {
		try {
			await crmCreateBooking({
				name,
				phone,
				serviceName: service.name,
				masterName: str(input.master, 80) || undefined,
				date,
				time,
				comment: str(input.comment, 1000) || undefined,
			});
			return json({ ok: true });
		} catch (error) {
			if (error instanceof CrmError && error.status === 409) {
				return json({ ok: false, error: 'busy' }, 409);
			}
			// CRM недоступна — сохраняем заявку на сайте, чтобы не потерять клиента
			console.error('CRM booking failed, saving locally', error);
		}
	}

	const booking = await addBooking({
		type,
		name,
		phone,
		serviceId: service?.id,
		serviceName: service?.name,
		price: service?.price,
		master: str(input.master, 80) || undefined,
		date: type === 'booking' ? date : undefined,
		time: type === 'booking' ? time : undefined,
		comment: str(input.comment, 1000) || undefined,
	});

	const lines =
		type === 'booking'
			? [
					'<b>✂️ Новая запись — NS Barber Studio</b>',
					`Услуга: ${escapeHtml(service?.name ?? '')} (${service?.price} сом)`,
					`Когда: ${escapeHtml(formatDateRu(date))}, ${escapeHtml(time)}`,
					`Мастер: ${escapeHtml(booking.master ?? 'любой')}`,
				]
			: ['<b>📞 Обратный звонок — NS Barber Studio</b>'];
	lines.push(`Имя: ${escapeHtml(name)}`, `Телефон: ${escapeHtml(phone)}`);
	if (booking.comment) lines.push(`Комментарий: ${escapeHtml(booking.comment)}`);
	await notifyTelegram(lines.join('\n'));

	return json({ ok: true });
};
