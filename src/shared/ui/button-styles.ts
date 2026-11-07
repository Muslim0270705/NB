import { cn } from '@/shared/lib/utils';

// Единые стили кнопок — используются и в .astro, и в React-островах
type Variant = 'primary' | 'outline' | 'light' | 'ghost';
type Size = 'md' | 'lg' | 'sm';

const base =
	'inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-semibold uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

const variants: Record<Variant, string> = {
	primary: 'bg-ink text-cream hover:bg-stone',
	outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
	light: 'bg-cream text-ink hover:bg-paper',
	ghost: 'text-ink hover:text-stone',
};

const sizes: Record<Size, string> = {
	sm: 'h-10 px-4 text-[0.6875rem] tracking-[0.18em]',
	md: 'h-12 px-6 text-caption tracking-[0.2em]',
	lg: 'h-14 px-8 text-caption tracking-[0.24em]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
	return cn(base, variants[variant], sizes[size], className);
}
