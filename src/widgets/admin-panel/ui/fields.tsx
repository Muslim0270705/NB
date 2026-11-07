import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export const inputClass =
	'h-11 w-full border border-ink/15 bg-paper px-3 text-body-md text-ink outline-none transition-colors focus:border-ink';

export function Field({
	label,
	hint,
	children,
	className,
}: {
	label: string;
	hint?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: поле передаётся через children
		<label className={cn('flex flex-col gap-1.5', className)}>
			<span className="text-caption font-semibold uppercase tracking-[0.14em] text-stone">
				{label}
			</span>
			{children}
			{hint && <span className="text-caption text-stone/80">{hint}</span>}
		</label>
	);
}

export function TextInput({ className, ...props }: ComponentProps<'input'>) {
	return <input {...props} className={cn(inputClass, className)} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={cn('border border-ink/10 bg-paper p-4 sm:p-6', className)}>{children}</div>
	);
}

export function RowActions({
	onUp,
	onDown,
	onDelete,
	deleteLabel = 'Удалить',
}: {
	onUp?: () => void;
	onDown?: () => void;
	onDelete: () => void;
	deleteLabel?: string;
}) {
	const btn =
		'flex size-9 items-center justify-center border border-ink/10 text-stone transition-colors hover:border-ink hover:text-ink disabled:opacity-30';
	return (
		<div className="flex shrink-0 gap-1">
			{onUp && (
				<button type="button" className={btn} onClick={onUp} aria-label="Выше">
					<ArrowUp size={15} />
				</button>
			)}
			{onDown && (
				<button type="button" className={btn} onClick={onDown} aria-label="Ниже">
					<ArrowDown size={15} />
				</button>
			)}
			<button
				type="button"
				className={cn(btn, 'hover:border-danger hover:text-danger')}
				onClick={onDelete}
				aria-label={deleteLabel}
				title={deleteLabel}
			>
				<Trash2 size={15} />
			</button>
		</div>
	);
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-11 items-center justify-center gap-2 border border-dashed border-ink/30 px-4 text-caption font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-paper"
		>
			{children}
		</button>
	);
}
