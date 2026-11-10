import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from '@/entities/content';
import { cn } from '@/shared/lib/utils';

interface GalleryGridProps {
	items: GalleryItem[];
}

type Filter = 'all' | GalleryCategory;

// Ритм сетки: некоторые карточки выше — получается «журнальная» раскладка
const tall = (i: number) => i % 5 === 0 || i % 5 === 3;

export default function GalleryGrid({ items }: GalleryGridProps) {
	const [filter, setFilter] = useState<Filter>('all');
	const [active, setActive] = useState<number | null>(null);

	const filters = useMemo(() => {
		const present = new Set(items.map((i) => i.category));
		return (Object.keys(GALLERY_CATEGORIES) as GalleryCategory[]).filter((c) => present.has(c));
	}, [items]);

	const visible = useMemo(
		() => (filter === 'all' ? items : items.filter((i) => i.category === filter)),
		[items, filter]
	);
	// В лайтбоксе листаем только реальные фото
	const photos = useMemo(() => visible.filter((i) => i.src), [visible]);

	const open = (item: GalleryItem) => {
		const index = photos.findIndex((p) => p.id === item.id);
		if (index >= 0) setActive(index);
	};
	const close = useCallback(() => setActive(null), []);
	const step = useCallback(
		(dir: 1 | -1) => setActive((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
		[photos.length]
	);

	useEffect(() => {
		if (active === null) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
			if (e.key === 'ArrowRight') step(1);
			if (e.key === 'ArrowLeft') step(-1);
		};
		document.documentElement.style.overflow = 'hidden';
		window.addEventListener('keydown', onKey);
		return () => {
			document.documentElement.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [active, close, step]);

	const current = active === null ? null : photos[active];

	return (
		<div>
			{filters.length > 1 && (
				<div role="tablist" aria-label="Фильтр работ" className="flex flex-wrap gap-2">
					{(['all', ...filters] as Filter[]).map((f) => (
						<button
							key={f}
							type="button"
							role="tab"
							aria-selected={filter === f}
							onClick={() => setFilter(f)}
							className={cn(
								'h-10 border px-5 text-body-md font-semibold transition-colors',
								filter === f
									? 'border-ink bg-ink text-cream'
									: 'border-ink/20 text-ink hover:border-ink'
							)}
						>
							{f === 'all' ? 'Все' : GALLERY_CATEGORIES[f]}
						</button>
					))}
				</div>
			)}

			<motion.ul
				layout
				className="mt-10 grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-2 sm:auto-rows-[200px] md:grid-cols-3 md:gap-3 lg:auto-rows-[220px] lg:grid-cols-4"
			>
				<AnimatePresence mode="popLayout">
					{visible.map((item, i) => (
						<motion.li
							key={item.id}
							layout
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
							className={cn('relative', tall(i) && 'row-span-2')}
						>
							{item.src ? (
								<button
									type="button"
									onClick={() => open(item)}
									className="group absolute inset-0 overflow-hidden"
									aria-label={`Открыть фото: ${item.alt}`}
								>
									<img
										src={item.thumb ?? item.src}
										alt={item.alt}
										loading="lazy"
										decoding="async"
										className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
									/>
									<span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
								</button>
							) : (
								<div className="photo-placeholder absolute inset-0 flex items-end p-4">
									<span className="text-body-md font-semibold text-ink/50">{item.alt}</span>
								</div>
							)}
						</motion.li>
					))}
				</AnimatePresence>
			</motion.ul>

			<AnimatePresence>
				{current && (
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label={current.alt}
						className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={close}
					>
						<motion.img
							key={current.id}
							src={current.src}
							alt={current.alt}
							initial={{ opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.35 }}
							className="max-h-[86vh] max-w-full object-contain"
							onClick={(e) => e.stopPropagation()}
						/>
						<p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-body-md text-cream/60">
							{current.alt} · {(active ?? 0) + 1} / {photos.length}
						</p>
						<button
							type="button"
							onClick={close}
							aria-label="Закрыть"
							className="absolute right-4 top-4 flex size-12 items-center justify-center text-cream"
						>
							<X size={28} />
						</button>
						{photos.length > 1 && (
							<>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										step(-1);
									}}
									aria-label="Предыдущее фото"
									className="absolute left-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-cream md:left-6"
								>
									<ChevronLeft size={32} />
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										step(1);
									}}
									aria-label="Следующее фото"
									className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center text-cream md:right-6"
								>
									<ChevronRight size={32} />
								</button>
							</>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
