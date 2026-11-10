import { cn } from '@/shared/lib/utils';

// Единые стили кнопок — используются и в .astro, и в React-островах.
// Форма как в Nomad College: прямые углы, обычный регистр, полужирный шрифт.
type Variant = 'primary' | 'outline' | 'light' | 'ghost' | 'glass';
type Size = 'md' | 'lg' | 'sm';

const base =
	'inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-semibold transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

const variants: Record<Variant, string> = {
	primary: 'bg-ink text-cream hover:bg-stone',
	outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream',
	light: 'bg-cream text-ink hover:bg-paper',
	ghost: 'text-ink hover:text-stone',
	glass: 'glass-card text-white hover:bg-white/[0.2]',
};

const sizes: Record<Size, string> = {
	sm: 'h-10 px-4 text-body-md',
	md: 'h-12 px-6 text-body-md',
	lg: 'h-14 px-7 text-body-lg',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
	return cn(base, variants[variant], sizes[size], className);
}

// Кнопка-призыв как в Nomad College: тёмная плашка + квадрат со стрелкой
export const ctaClass = {
	root: 'group inline-flex h-12 items-center gap-6 border border-ink/50 bg-ink py-1 pl-6 pr-1 text-cream transition-colors duration-300 hover:border-stone lg:h-14',
	label: 'whitespace-nowrap text-body-md font-semibold lg:text-body-lg',
	arrow:
		'flex size-10 shrink-0 items-center justify-center bg-sand text-ink transition-colors duration-300 group-hover:bg-cream lg:size-12',
};
