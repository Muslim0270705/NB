import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Сообщаем tailwind-merge о кастомной шкале шрифтов из global.css,
// иначе он принимает text-caption за цвет и удаляет text-cream / text-ink рядом с ним
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [
				{ text: ['display', 'h1', 'h2', 'h3', 'body-xl', 'body-lg', 'body-md', 'caption'] },
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
