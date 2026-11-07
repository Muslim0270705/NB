import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from '@/entities/content';
import { cn } from '@/shared/lib/utils';
import { localId, move } from '../lib/api';
import { Card, inputClass, RowActions, TextInput } from './fields';
import { ImageUpload } from './ImageUpload';

export function GalleryTab({
	items,
	onChange,
}: {
	items: GalleryItem[];
	onChange: (items: GalleryItem[]) => void;
}) {
	const update = (i: number, patch: Partial<GalleryItem>) =>
		onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
	const placeholders = items.filter((i) => !i.src).length;

	return (
		<div className="flex flex-col gap-6">
			<Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-body-lg font-bold">Добавить фото в галерею</p>
					<p className="text-body-md text-stone">
						JPG/PNG/WebP до 15 МБ. Фото автоматически сжимаются. Первое фото «Интерьер» становится
						обложкой на главном экране.
					</p>
				</div>
				<ImageUpload
					multiple
					label="Выбрать фото"
					onUploaded={(images) =>
						onChange([
							...images.map((img) => ({
								id: localId('g-'),
								alt: 'Работа NS Barber Studio',
								category: 'hair' as GalleryCategory,
								...img,
							})),
							...items,
						])
					}
				/>
			</Card>
			{placeholders > 0 && (
				<p className="text-body-md text-stone">
					Заглушек без фото: {placeholders}. Их можно удалить после загрузки реальных снимков.
				</p>
			)}

			<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((item, i) => (
					<li key={item.id}>
						<Card className="flex h-full flex-col gap-3 p-3 sm:p-3">
							<div className={cn('aspect-[4/3] overflow-hidden', !item.src && 'photo-placeholder')}>
								{item.src && (
									<img src={item.thumb ?? item.src} alt="" className="size-full object-cover" />
								)}
							</div>
							<TextInput
								value={item.alt}
								aria-label="Подпись (alt)"
								placeholder="Подпись к фото"
								onChange={(e) => update(i, { alt: e.target.value })}
							/>
							<div className="flex gap-2">
								<select
									value={item.category}
									onChange={(e) => update(i, { category: e.target.value as GalleryCategory })}
									className={cn(inputClass, 'h-9 flex-1')}
									aria-label="Категория"
								>
									{Object.entries(GALLERY_CATEGORIES).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
								<RowActions
									onUp={() => onChange(move(items, i, -1))}
									onDown={() => onChange(move(items, i, 1))}
									onDelete={() => onChange(items.filter((_, j) => j !== i))}
								/>
							</div>
						</Card>
					</li>
				))}
			</ul>
		</div>
	);
}
