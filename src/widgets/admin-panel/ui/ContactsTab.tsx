import type { Contacts } from '@/entities/content';
import { Card, Field, TextInput } from './fields';

export function ContactsTab({
	contacts,
	onChange,
}: {
	contacts: Contacts;
	onChange: (c: Contacts) => void;
}) {
	const set = <K extends keyof Contacts>(key: K, value: Contacts[K]) =>
		onChange({ ...contacts, [key]: value });

	return (
		<div className="flex flex-col gap-4">
			<Card className="grid gap-4 sm:grid-cols-2">
				<Field label="Адрес">
					<TextInput value={contacts.address} onChange={(e) => set('address', e.target.value)} />
				</Field>
				<Field label="Уточнение к адресу">
					<TextInput
						value={contacts.addressNote}
						placeholder="1 этаж, вход со двора"
						onChange={(e) => set('addressNote', e.target.value)}
					/>
				</Field>
				<Field label="Телефон" hint="Только цифры с кодом страны: 996XXXXXXXXX">
					<TextInput
						inputMode="tel"
						value={contacts.phone}
						onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))}
					/>
				</Field>
				<Field label="WhatsApp" hint="Номер для wa.me; пусто — кнопки WhatsApp скрыты">
					<TextInput
						inputMode="tel"
						value={contacts.whatsapp}
						onChange={(e) => set('whatsapp', e.target.value.replace(/\D/g, ''))}
					/>
				</Field>
				<Field label="Instagram" hint="Без @">
					<TextInput
						value={contacts.instagram}
						onChange={(e) => set('instagram', e.target.value)}
					/>
				</Field>
				<Field label="Ссылка на 2ГИС">
					<TextInput
						value={contacts.twoGisUrl}
						onChange={(e) => set('twoGisUrl', e.target.value)}
					/>
				</Field>
			</Card>
			<Card className="grid gap-4 sm:grid-cols-3">
				<Field label="Дни работы">
					<TextInput
						value={contacts.hoursDays}
						onChange={(e) => set('hoursDays', e.target.value)}
					/>
				</Field>
				<Field label="Открытие">
					<TextInput
						type="time"
						value={contacts.openFrom}
						onChange={(e) => set('openFrom', e.target.value)}
					/>
				</Field>
				<Field label="Закрытие" hint="По часам строятся слоты записи">
					<TextInput
						type="time"
						value={contacts.openTo}
						onChange={(e) => set('openTo', e.target.value)}
					/>
				</Field>
			</Card>
			<Card className="grid gap-4 sm:grid-cols-2">
				<Field label="Широта (карта)">
					<TextInput
						type="number"
						step="0.000001"
						value={contacts.lat}
						onChange={(e) => set('lat', Number(e.target.value))}
					/>
				</Field>
				<Field label="Долгота (карта)">
					<TextInput
						type="number"
						step="0.000001"
						value={contacts.lon}
						onChange={(e) => set('lon', Number(e.target.value))}
					/>
				</Field>
			</Card>
		</div>
	);
}
