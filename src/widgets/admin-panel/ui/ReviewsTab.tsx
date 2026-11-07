import { Plus } from 'lucide-react';
import type { Rating, Review } from '@/entities/content';
import { cn } from '@/shared/lib/utils';
import { localId, move } from '../lib/api';
import { AddButton, Card, Field, inputClass, RowActions, TextInput } from './fields';

export function ReviewsTab({
	reviews,
	rating,
	onChange,
	onRating,
}: {
	reviews: Review[];
	rating: Rating;
	onChange: (r: Review[]) => void;
	onRating: (r: Rating) => void;
}) {
	const update = (i: number, patch: Partial<Review>) =>
		onChange(reviews.map((r, j) => (j === i ? { ...r, ...patch } : r)));

	return (
		<div className="flex flex-col gap-4">
			<Card className="grid gap-3 sm:grid-cols-2">
				<Field label="Рейтинг в 2ГИС" hint="Показывается на первом экране и в отзывах">
					<TextInput
						type="number"
						min={0}
						max={5}
						step={0.1}
						value={rating.value}
						onChange={(e) => onRating({ ...rating, value: Number(e.target.value) })}
					/>
				</Field>
				<Field label="Количество оценок" hint="0 — скрыть рейтинг">
					<TextInput
						type="number"
						min={0}
						value={rating.count}
						onChange={(e) => onRating({ ...rating, count: Number(e.target.value) })}
					/>
				</Field>
			</Card>
			<p className="text-body-md text-stone">
				Добавляйте реальные отзывы гостей (например, из 2ГИС с указанием имени). На сайте
				показываются первые 6.
			</p>
			{reviews.map((r, i) => (
				<Card key={r.id} className="flex flex-col gap-3">
					<div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
						<Field label="Имя">
							<TextInput value={r.author} onChange={(e) => update(i, { author: e.target.value })} />
						</Field>
						<Field label="Оценка">
							<select
								value={r.rating}
								onChange={(e) => update(i, { rating: Number(e.target.value) })}
								className={inputClass}
							>
								{[5, 4, 3, 2, 1].map((n) => (
									<option key={n} value={n}>
										{'★'.repeat(n)}
									</option>
								))}
							</select>
						</Field>
						<RowActions
							onUp={() => onChange(move(reviews, i, -1))}
							onDown={() => onChange(move(reviews, i, 1))}
							onDelete={() => onChange(reviews.filter((_, j) => j !== i))}
						/>
					</div>
					<Field label="Текст отзыва">
						<textarea
							rows={3}
							value={r.text}
							onChange={(e) => update(i, { text: e.target.value })}
							className={cn(inputClass, 'h-auto resize-y py-2')}
						/>
					</Field>
				</Card>
			))}
			<AddButton
				onClick={() =>
					onChange([...reviews, { id: localId('r-'), author: '', text: '', rating: 5 }])
				}
			>
				<Plus size={15} /> Отзыв
			</AddButton>
		</div>
	);
}
