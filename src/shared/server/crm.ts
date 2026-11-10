import { CRM_API_KEY, CRM_API_URL } from 'astro:env/server';

// Клиент CRM NS Barber (crm_nb). Сайт обращается к CRM со своего сервера:
// ключ CRM_API_KEY не попадает в браузер. Пока CRM не настроена — сайт работает как раньше.

export function isCrmEnabled(): boolean {
	return Boolean(CRM_API_URL && CRM_API_KEY);
}

export class CrmError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

async function crmFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(`${String(CRM_API_URL).replace(/\/$/, '')}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'X-Api-Key': String(CRM_API_KEY),
			...init.headers,
		},
		signal: AbortSignal.timeout(10_000),
	});
	const body = (await response.json().catch(() => null)) as {
		data?: T;
		message?: string;
		error?: boolean;
	} | null;
	if (!response.ok || !body || body.error) {
		throw new CrmError(response.status, body?.message ?? `CRM HTTP ${response.status}`);
	}
	return body.data as T;
}

export function crmSlots(params: { date: string; serviceName: string; masterName?: string }) {
	const query = new URLSearchParams({ date: params.date, serviceName: params.serviceName });
	if (params.masterName) query.set('masterName', params.masterName);
	return crmFetch<string[]>(`/public/slots?${query}`);
}

export function crmCreateBooking(data: {
	name: string;
	phone: string;
	serviceName: string;
	masterName?: string;
	date: string;
	time: string;
	comment?: string;
}) {
	return crmFetch<{ id: number; status: string; masterName: string | null }>('/public/bookings', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}
