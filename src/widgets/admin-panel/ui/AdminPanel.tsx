import { ExternalLink, LogOut, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Booking } from '@/entities/booking';
import type { SiteContent } from '@/entities/content';
import { cn } from '@/shared/lib/utils';
import { buttonClass } from '@/shared/ui/button-styles';
import { Logo } from '@/shared/ui/logo';
import { adminApi } from '../lib/api';
import { BookingsTab } from './BookingsTab';
import { ContactsTab } from './ContactsTab';
import { GalleryTab } from './GalleryTab';
import { MastersTab } from './MastersTab';
import { ReviewsTab } from './ReviewsTab';
import { ServicesTab } from './ServicesTab';

type Tab = 'bookings' | 'services' | 'gallery' | 'masters' | 'reviews' | 'contacts';

const TABS: { id: Tab; label: string }[] = [
	{ id: 'bookings', label: 'Заявки' },
	{ id: 'services', label: 'Услуги и цены' },
	{ id: 'gallery', label: 'Галерея' },
	{ id: 'masters', label: 'Мастера' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'contacts', label: 'Контакты' },
];

interface AdminPanelProps {
	initialContent: SiteContent;
	initialBookings: Booking[];
}

export default function AdminPanel({ initialContent, initialBookings }: AdminPanelProps) {
	const [tab, setTab] = useState<Tab>('bookings');
	const [saved, setSaved] = useState(initialContent);
	const [content, setContent] = useState(initialContent);
	const [bookings, setBookings] = useState(initialBookings);
	const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

	const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(content), [saved, content]);
	const newCount = bookings.filter((b) => b.status === 'new').length;

	// Предупреждаем о несохранённых изменениях при уходе со страницы
	useEffect(() => {
		if (!dirty) return;
		const handler = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [dirty]);

	// Новые заявки подтягиваются раз в минуту, пока вкладка открыта
	useEffect(() => {
		const timer = window.setInterval(() => {
			if (document.visibilityState === 'visible')
				adminApi
					.bookings()
					.then(setBookings)
					.catch(() => {});
		}, 60_000);
		return () => window.clearInterval(timer);
	}, []);

	function patch<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
		setContent((prev) => ({ ...prev, [key]: value }));
		setSaveState('idle');
	}

	async function save() {
		setSaveState('saving');
		try {
			const next = await adminApi.saveContent(content);
			setSaved(next);
			setContent(next);
			setSaveState('saved');
		} catch {
			setSaveState('error');
		}
	}

	return (
		<div className="min-h-screen pb-28">
			<header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
					<a href="/admin" aria-label="Админка">
						<Logo className="h-9" title="" />
					</a>
					<span className="hidden text-caption font-semibold uppercase tracking-[0.2em] text-stone sm:inline">
						Панель управления
					</span>
					<a
						href="/"
						target="_blank"
						rel="noopener"
						className="ml-auto flex items-center gap-1.5 text-body-md text-stone hover:text-ink"
					>
						Сайт <ExternalLink size={14} />
					</a>
					<form method="post" action="/api/admin/logout">
						<button
							type="submit"
							className="flex items-center gap-1.5 text-body-md text-stone hover:text-ink"
						>
							<LogOut size={15} /> Выйти
						</button>
					</form>
				</div>
				<nav
					className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4"
					aria-label="Разделы админки"
				>
					{TABS.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => setTab(t.id)}
							className={cn(
								'flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-caption font-semibold uppercase tracking-[0.12em] transition-colors',
								tab === t.id
									? 'border-ink text-ink'
									: 'border-transparent text-stone hover:text-ink'
							)}
						>
							{t.label}
							{t.id === 'bookings' && newCount > 0 && (
								<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[0.625rem] text-cream">
									{newCount}
								</span>
							)}
						</button>
					))}
				</nav>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-8">
				{tab === 'bookings' && <BookingsTab bookings={bookings} setBookings={setBookings} />}
				{tab === 'services' && (
					<ServicesTab categories={content.categories} onChange={(v) => patch('categories', v)} />
				)}
				{tab === 'gallery' && (
					<GalleryTab items={content.gallery} onChange={(v) => patch('gallery', v)} />
				)}
				{tab === 'masters' && (
					<MastersTab masters={content.masters} onChange={(v) => patch('masters', v)} />
				)}
				{tab === 'reviews' && (
					<ReviewsTab
						reviews={content.reviews}
						rating={content.rating}
						onChange={(v) => patch('reviews', v)}
						onRating={(v) => patch('rating', v)}
					/>
				)}
				{tab === 'contacts' && (
					<ContactsTab contacts={content.contacts} onChange={(v) => patch('contacts', v)} />
				)}
			</main>

			{(tab !== 'bookings' || dirty) && (
				<div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 backdrop-blur">
					<div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
						<span className="text-body-md text-stone">
							{saveState === 'saved' && !dirty && 'Сохранено — изменения уже на сайте'}
							{saveState === 'error' && <span className="text-danger">Ошибка сохранения</span>}
							{saveState !== 'error' && dirty && 'Есть несохранённые изменения'}
							{saveState === 'idle' && !dirty && 'Изменений нет'}
						</span>
						<div className="ml-auto flex gap-2">
							{dirty && (
								<button
									type="button"
									onClick={() => setContent(saved)}
									className={buttonClass('ghost', 'md')}
								>
									Отменить
								</button>
							)}
							<button
								type="button"
								onClick={save}
								disabled={!dirty || saveState === 'saving'}
								className={buttonClass('primary', 'md')}
							>
								<Save size={15} /> {saveState === 'saving' ? 'Сохраняем…' : 'Сохранить'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
