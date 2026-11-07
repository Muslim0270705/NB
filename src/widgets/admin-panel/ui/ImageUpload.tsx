import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { adminApi } from '../lib/api';

type Image = Awaited<ReturnType<typeof adminApi.upload>>;

// Кнопка загрузки одного или нескольких фото; файлы сжимаются на сервере
export function ImageUpload({
	onUploaded,
	multiple = false,
	label = 'Загрузить фото',
	className,
}: {
	onUploaded: (images: Image[]) => void;
	multiple?: boolean;
	label?: string;
	className?: string;
}) {
	const input = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');

	async function handle(files: FileList | null) {
		if (!files?.length) return;
		setBusy(true);
		setError('');
		const done: Image[] = [];
		for (const file of Array.from(files)) {
			try {
				done.push(await adminApi.upload(file));
			} catch (e) {
				setError(
					(e as Error).message === 'too_large'
						? `«${file.name}» больше 15 МБ`
						: `Не удалось загрузить «${file.name}»`
				);
			}
		}
		if (done.length) onUploaded(done);
		setBusy(false);
		if (input.current) input.current.value = '';
	}

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<button
				type="button"
				disabled={busy}
				onClick={() => input.current?.click()}
				className="flex h-11 items-center justify-center gap-2 border border-ink bg-paper px-4 text-caption font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-cream disabled:opacity-50"
			>
				<Upload size={15} /> {busy ? 'Загрузка…' : label}
			</button>
			<input
				ref={input}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
				multiple={multiple}
				hidden
				onChange={(e) => handle(e.target.files)}
			/>
			{error && <span className="text-caption text-danger">{error}</span>}
		</div>
	);
}
