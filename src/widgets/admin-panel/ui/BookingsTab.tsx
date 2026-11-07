import { Phone, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
	BOOKING_STATUSES,
	type Booking,
	type BookingStatus,
	formatDateRu,
} from '@/entities/booking';
import { telLink, whatsappLink } from '@/shared/lib/links';
import { cn } from '@/shared/lib/utils';
import { WhatsappIcon } from '@/shared/ui/icons';
import { adminApi } from '../lib/api';
import { Card, inputClass, RowActions } from './fields';

const STATUS_STYLE: Record<BookingStatus, string> = {
	new: 'bg-ink text-cream',
	confirmed: 'bg-sand text-ink',
	done: 'bg-cream text-stone',
	cancelled: 'bg-cream text-stone line-through',
};

type Filter = 'all' | BookingStatus;

export function BookingsTab({
	bookings,
	setBookings,
}: {
	bookings: Booking[];
	setBookings: (b: Booking[]) => void;
}) {
	const [filter, setFilter] = useState<Filter>('new');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const counts = useMemo(() => {
		const c: Record<string, number> = { all: bookings.length };
		for (const b of bookings) c[b.status] = (c[b.status] ?? 0) + 1;
		return c;
	}, [bookings]);
	const list = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

	async function refresh() {
		setLoading(true);
		setError('');
		try {
			setBookings(await adminApi.bookings());
		} catch {
			setError('Не удалось обновить список');
		} finally {
			setLoading(false);
		}
	}

	async function changeStatus(id: string, status: BookingStatus) {
		const prev = bookings;
		setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
		try {
			await adminApi.setStatus(id, status);
		} catch {
			setBookings(prev);
			setError('Статус не сохранён');
		}
	}

	async function remove(id: string) {
		if (!window.confirm('Удалить заявку без возможности восстановления?')) return;
		try {
			await adminApi.deleteBooking(id);
			setBookings(bookings.filter((b) => b.id !== id));
		} catch {
			setError('Не удалось удалить заявку');
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center gap-2">
				{(['new', 'confirmed', 'done', 'cancelled', 'all'] as Filter[]).map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => setFilter(f)}
						className={cn(
							'h-10 border px-4 text-caption font-semibold uppercase tracking-[0.12em]',
							filter === f ? 'border-ink bg-ink text-cream' : 'border-ink/15 bg-paper'
						)}
					>
						{f === 'all' ? 'Все' : BOOKING_STATUSES[f]} · {counts[f] ?? 0}
					</button>
				))}
				<button
					type="button"
					onClick={refresh}
					className="ml-auto flex h-10 items-center gap-2 px-3 text-caption font-semibold uppercase tracking-[0.12em] text-stone hover:text-ink"
				>
					<RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Обновить
				</button>
			</div>
			{error && <p className="text-body-md text-danger">{error}</p>}

			{list.length === 0 ? (
				<Card className="py-16 text-center text-stone">Заявок нет</Card>
			) : (
				<ul className="flex flex-col gap-3">
					{list.map((b) => (
						<li key={b.id}>
							<Card className="flex flex-col gap-4 lg:flex-row lg:items-center">
								<div className="flex min-w-0 flex-1 flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2">
										<span
											className={cn(
												'px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]',
												STATUS_STYLE[b.status]
											)}
										>
											{BOOKING_STATUSES[b.status]}
										</span>
										<span className="text-caption text-stone">
											{b.type === 'callback' ? 'Обратный звонок' : 'Запись'} · создана{' '}
											{new Date(b.createdAt).toLocaleString('ru-RU', {
												day: 'numeric',
												month: 'short',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									</div>
									<p className="text-body-xl font-bold">
										{b.name} · <span className="font-medium">{b.phone}</span>
									</p>
									{b.type === 'booking' && (
										<p className="text-body-md">
											<b>{b.serviceName}</b>
											{b.price ? ` · ${b.price} сом` : ''} · {b.date ? formatDateRu(b.date) : ''}{' '}
											{b.time} · мастер: {b.master || 'любой'}
										</p>
									)}
									{b.comment && <p className="text-body-md text-stone">«{b.comment}»</p>}
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<a
										href={telLink(b.phone)}
										className="flex size-9 items-center justify-center border border-ink/10 hover:border-ink"
										aria-label="Позвонить"
									>
										<Phone size={15} />
									</a>
									<a
										href={whatsappLink(b.phone)}
										target="_blank"
										rel="noopener noreferrer"
										className="flex size-9 items-center justify-center border border-ink/10 hover:border-ink"
										aria-label="WhatsApp"
									>
										<WhatsappIcon size={15} />
									</a>
									<select
										value={b.status}
										onChange={(e) => changeStatus(b.id, e.target.value as BookingStatus)}
										className={cn(inputClass, 'h-9 w-auto')}
										aria-label="Статус"
									>
										{Object.entries(BOOKING_STATUSES).map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>
									<RowActions onDelete={() => remove(b.id)} deleteLabel="Удалить заявку" />
								</div>
							</Card>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
