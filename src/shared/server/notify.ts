import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from 'astro:env/server';

// Отправка уведомления о заявке в Telegram. Если бот не настроен — заявка всё равно
// сохраняется и видна в админке.
export async function notifyTelegram(text: string): Promise<boolean> {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
	try {
		const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: TELEGRAM_CHAT_ID,
				text,
				parse_mode: 'HTML',
				disable_web_page_preview: true,
			}),
			signal: AbortSignal.timeout(8000),
		});
		if (!response.ok) console.error('Telegram error', response.status, await response.text());
		return response.ok;
	} catch (error) {
		console.error('Telegram request failed', error);
		return false;
	}
}

export function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
