import { Plus } from 'lucide-react';
import type { Master } from '@/entities/content';
import { localId, move } from '../lib/api';
import { AddButton, Card, Field, RowActions, TextInput } from './fields';
import { ImageUpload } from './ImageUpload';

export function MastersTab({
	masters,
	onChange,
}: {
	masters: Master[];
	onChange: (m: Master[]) => void;
}) {
	const update = (i: number, patch: Partial<Master>) =>
		onChange(masters.map((m, j) => (j === i ? { ...m, ...patch } : m)));

	return (
		<div className="flex flex-col gap-4">
			<p className="text-body-md text-stone">
				Мастера показываются в разделе «О студии» и в списке выбора мастера в форме записи.
			</p>
			{masters.map((m, i) => (
				<Card key={m.id} className="flex flex-col gap-4 sm:flex-row">
					<div className="photo-placeholder aspect-[3/4] w-28 shrink-0 overflow-hidden">
						{m.photo && <img src={m.photo} alt="" className="size-full object-cover" />}
					</div>
					<div className="flex flex-1 flex-col gap-3">
						<div className="grid gap-3 sm:grid-cols-2">
							<Field label="Имя">
								<TextInput value={m.name} onChange={(e) => update(i, { name: e.target.value })} />
							</Field>
							<Field label="Роль / опыт">
								<TextInput
									value={m.role}
									placeholder="Барбер · 5 лет опыта"
									onChange={(e) => update(i, { role: e.target.value })}
								/>
							</Field>
						</div>
						<div className="flex flex-wrap items-start gap-2">
							<ImageUpload
								label={m.photo ? 'Заменить фото' : 'Фото'}
								onUploaded={([img]) => update(i, { photo: img.thumb })}
							/>
							{m.photo && (
								<button
									type="button"
									onClick={() => update(i, { photo: undefined })}
									className="h-11 px-3 text-caption font-semibold uppercase tracking-[0.12em] text-stone hover:text-danger"
								>
									Убрать фото
								</button>
							)}
							<div className="ml-auto">
								<RowActions
									onUp={() => onChange(move(masters, i, -1))}
									onDown={() => onChange(move(masters, i, 1))}
									onDelete={() => onChange(masters.filter((_, j) => j !== i))}
								/>
							</div>
						</div>
					</div>
				</Card>
			))}
			<AddButton
				onClick={() => onChange([...masters, { id: localId('m-'), name: '', role: 'Барбер' }])}
			>
				<Plus size={15} /> Мастер
			</AddButton>
		</div>
	);
}
