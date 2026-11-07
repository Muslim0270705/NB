import { Plus } from 'lucide-react';
import type { Service, ServiceCategory } from '@/entities/content';
import { localId, move } from '../lib/api';
import { AddButton, Card, Field, RowActions, TextInput } from './fields';

export function ServicesTab({
	categories,
	onChange,
}: {
	categories: ServiceCategory[];
	onChange: (c: ServiceCategory[]) => void;
}) {
	const updateCat = (i: number, patch: Partial<ServiceCategory>) =>
		onChange(categories.map((c, j) => (j === i ? { ...c, ...patch } : c)));
	const updateSvc = (ci: number, si: number, patch: Partial<Service>) =>
		updateCat(ci, {
			services: categories[ci].services.map((s, j) => (j === si ? { ...s, ...patch } : s)),
		});

	return (
		<div className="flex flex-col gap-6">
			{categories.map((cat, ci) => (
				<Card key={cat.id} className="flex flex-col gap-5">
					<div className="flex items-end gap-3">
						<Field label="Категория" className="flex-1">
							<TextInput
								value={cat.title}
								onChange={(e) => updateCat(ci, { title: e.target.value })}
							/>
						</Field>
						<RowActions
							onUp={() => onChange(move(categories, ci, -1))}
							onDown={() => onChange(move(categories, ci, 1))}
							onDelete={() => {
								if (window.confirm(`Удалить категорию «${cat.title}» со всеми услугами?`)) {
									onChange(categories.filter((_, j) => j !== ci));
								}
							}}
							deleteLabel="Удалить категорию"
						/>
					</div>
					<Field label="Подзаголовок">
						<TextInput
							value={cat.description ?? ''}
							onChange={(e) => updateCat(ci, { description: e.target.value })}
						/>
					</Field>

					<div className="flex flex-col gap-2">
						<div className="hidden grid-cols-[1fr_120px_auto] gap-2 text-caption font-semibold uppercase tracking-[0.12em] text-stone sm:grid">
							<span>Услуга</span>
							<span>Цена, сом</span>
						</div>
						{cat.services.map((svc, si) => (
							<div
								key={svc.id}
								className="grid grid-cols-[1fr_96px] gap-2 sm:grid-cols-[1fr_120px_auto]"
							>
								<TextInput
									value={svc.name}
									placeholder="Название"
									aria-label="Название услуги"
									onChange={(e) => updateSvc(ci, si, { name: e.target.value })}
								/>
								<TextInput
									type="number"
									min={0}
									step={50}
									value={svc.price}
									aria-label="Цена"
									onChange={(e) => updateSvc(ci, si, { price: Number(e.target.value) })}
								/>
								<div className="col-span-2 sm:col-span-1">
									<RowActions
										onUp={() => updateCat(ci, { services: move(cat.services, si, -1) })}
										onDown={() => updateCat(ci, { services: move(cat.services, si, 1) })}
										onDelete={() =>
											updateCat(ci, { services: cat.services.filter((_, j) => j !== si) })
										}
									/>
								</div>
							</div>
						))}
						<AddButton
							onClick={() =>
								updateCat(ci, {
									services: [...cat.services, { id: localId('svc-'), name: '', price: 0 }],
								})
							}
						>
							<Plus size={15} /> Услуга
						</AddButton>
					</div>
				</Card>
			))}
			<AddButton
				onClick={() =>
					onChange([...categories, { id: localId('cat-'), title: 'Новая категория', services: [] }])
				}
			>
				<Plus size={15} /> Категория
			</AddButton>
		</div>
	);
}
