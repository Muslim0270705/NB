// Маска +996 (XXX) XXX-XXX для полей телефона
export const PHONE_PREFIX = '+996 ';
export const PHONE_DIGITS = 9;

// Цифры номера без кода страны: «0700…» и «996700…» приводим к «700…»
export function phoneDigits(value: string): string {
	let digits = value.replace(/\D/g, '');
	if (digits.startsWith('996')) digits = digits.slice(3);
	if (digits.startsWith('0')) digits = digits.slice(1);
	return digits.slice(0, PHONE_DIGITS);
}

export function formatPhone(digits: string): string {
	if (!digits) return PHONE_PREFIX;
	let result = `${PHONE_PREFIX}(${digits.slice(0, 3)}`;
	if (digits.length >= 3) result += ')';
	if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
	if (digits.length > 6) result += `-${digits.slice(6)}`;
	return result;
}

// Обработчик ввода: стирание скобки/пробела/дефиса убирает последнюю цифру
export function nextPhoneValue(prev: string, next: string): string {
	let digits = phoneDigits(next);
	if (next.length < prev.length && digits === phoneDigits(prev)) digits = digits.slice(0, -1);
	return formatPhone(digits);
}

export function isPhoneComplete(value: string): boolean {
	return phoneDigits(value).length === PHONE_DIGITS;
}

// Красивый вывод сохранённого номера: 996704126555 → +996 704 12-65-55
export function displayPhone(value: string): string {
	const d = value.replace(/\D/g, '');
	if (d.length !== 12) return value;
	return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)}-${d.slice(8, 10)}-${d.slice(10)}`;
}
