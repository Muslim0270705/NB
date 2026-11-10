import { Check } from 'lucide-react';
import { type SubmitEvent as FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { bishkekDate, bishkekMinutesNow, formatDateRu, timeSlots } from '@/entities/booking';
import type { ServiceCategory } from '@/entities/content';
import { formatPrice } from '@/shared/lib/format';
import { instagramDirectLink, whatsappLink } from '@/shared/lib/links';
import { isPhoneComplete, nextPhoneValue, PHONE_PREFIX } from '@/shared/lib/phone';
import { cn } from '@/shared/lib/utils';
import { buttonClass } from '@/shared/ui/button-styles';
import { InstagramIcon, WhatsappIcon } from '@/shared/ui/icons';

export const SELECT_SERVICE_EVENT = 'ns:select-service';

interface BookingFormProps {
	variant?: 'booking' | 'callback';
	categories?: ServiceCategory[];
	masters?: string[];
	openFrom?: string;
	openTo?: string;
	whatsapp?: string;
	instagram?: string;
	inverted?: boolean;
}

interface Values {
	name: string;
	phone: string;
	serviceId: string;
	master: string;
	date: string;
	time: string;
	comment: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const DAYS_AHEAD = 30;

function emptyValues(): Values {
	return {
		name: '',
		phone: PHONE_PREFIX,
		serviceId: '',
		master: '',
		date: bishkekDate(),
		time: '',
		comment: '',
	};
}

declare global {
	interface Window {
		nsSelectedService?: string;
	}
}

export default function BookingForm({
	variant = 'booking',
	categories = [],
	masters = [],
	openFrom = '10:00',
	openTo = '21:00',
	whatsapp,
	instagram,
	inverted = false,
}: BookingFormProps) {
	const isBooking = variant === 'booking';
	const [values, setValues] = useState<Values>(emptyValues);
	const [errors, setErrors] = useState<Errors>({});
	const [website, setWebsite] = useState('');
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
	const startedAt = useRef(Date.now());

	const services = useMemo(() => categories.flatMap((c) => c.services), [categories]);
	const selected = services.find((s) => s.id === values.serviceId);

	// Свободное время из CRM (учитывает занятых мастеров). null — CRM не подключена
	const [remoteSlots, setRemoteSlots] = useState<string[] | null>(null);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [busyError, setBusyError] = useState(false);

	useEffect(() => {
		if (!isBooking || !values.serviceId || !values.date) {
			setRemoteSlots(null);
			return;
		}
		const controller = new AbortController();
		const query = new URLSearchParams({ date: values.date, service: values.serviceId });
		if (values.master) query.set('master', values.master);
		setSlotsLoading(true);
		fetch(`/api/slots?${query}`, { signal: controller.signal })
			.then((r) => r.json())
			.then((data: { times: string[] | null }) => setRemoteSlots(data.times))
			.catch(() => {
				if (!controller.signal.aborted) setRemoteSlots(null);
			})
			.finally(() => {
				if (!controller.signal.aborted) setSlotsLoading(false);
			});
		return () => controller.abort();
	}, [isBooking, values.serviceId, values.date, values.master]);

	// Без CRM — время по часам работы; для сегодняшнего дня скрываем прошедшее
	const slots = useMemo(() => {
		if (remoteSlots) return remoteSlots;
		const all = timeSlots(openFrom, openTo);
		if (values.date !== bishkekDate()) return all;
		const now = bishkekMinutesNow() + 30;
		return all.filter((t) => {
			const [h, m] = t.split(':').map(Number);
			return h * 60 + m >= now;
		});
	}, [remoteSlots, openFrom, openTo, values.date]);

	// Кнопка «Записаться» у блока прайса передаёт выбранную услугу
	useEffect(() => {
		if (!isBooking) return;
		const apply = (serviceId?: string) => {
			if (serviceId) setValues((prev) => ({ ...prev, serviceId }));
		};
		apply(window.nsSelectedService);
		const handler = (event: Event) => apply((event as CustomEvent<string>).detail);
		window.addEventListener(SELECT_SERVICE_EVENT, handler);
		return () => window.removeEventListener(SELECT_SERVICE_EVENT, handler);
	}, [isBooking]);

	useEffect(() => {
		if (values.time && !slots.includes(values.time)) {
			setValues((prev) => ({ ...prev, time: '' }));
		}
	}, [slots, values.time]);

	function update<K extends keyof Values>(field: K, value: Values[K]) {
		setValues((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	function validate(): Errors {
		const found: Errors = {};
		if (values.name.trim().length < 2) found.name = 'Укажите ваше имя';
		if (!isPhoneComplete(values.phone)) found.phone = 'Укажите номер полностью';
		if (isBooking) {
			if (!values.serviceId) found.serviceId = 'Выберите услугу';
			if (!values.date) found.date = 'Выберите дату';
			if (!values.time) found.time = 'Выберите время';
		}
		return found;
	}

	async function submit(event: FormEvent) {
		event.preventDefault();
		if (status === 'sending') return;
		const found = validate();
		setErrors(found);
		if (Object.keys(found).length) return;

		setStatus('sending');
		try {
			const response = await fetch('/api/booking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: variant,
					name: values.name,
					phone: values.phone,
					serviceId: isBooking ? values.serviceId : undefined,
					master: isBooking ? values.master : undefined,
					date: isBooking ? values.date : undefined,
					time: isBooking ? values.time : undefined,
					comment: values.comment,
					website,
					elapsed: Date.now() - startedAt.current,
				}),
			});
			if (response.status === 409) {
				// Пока клиент заполнял форму, время заняли — обновляем список
				setBusyError(true);
				setValues((prev) => ({ ...prev, time: '' }));
				setRemoteSlots((prev) => prev?.filter((t) => t !== values.time) ?? prev);
				setStatus('idle');
				return;
			}
			if (!response.ok) throw new Error(String(response.status));
			setBusyError(false);
			setStatus('sent');
			window.dispatchEvent(new CustomEvent('ns:lead', { detail: variant }));
		} catch {
			setStatus('error');
		}
	}

	function messengerText(): string {
		const parts = ['Здравствуйте! Хочу записаться в NS Barber Studio.'];
		if (selected) parts.push(`Услуга: ${selected.name}`);
		if (values.master) parts.push(`Мастер: ${values.master}`);
		if (values.date && values.time)
			parts.push(`Когда: ${formatDateRu(values.date)}, ${values.time}`);
		if (values.name.trim()) parts.push(`Имя: ${values.name.trim()}`);
		return parts.join('\n');
	}

	const tone = inverted
		? {
				label: 'text-cream/60',
				field:
					'border-cream/25 bg-transparent text-cream placeholder:text-cream/35 focus:border-cream [&>option]:text-ink',
				error: 'text-[#e8b4a8]',
			}
		: {
				label: 'text-stone',
				field: 'border-ink/20 bg-paper text-ink placeholder:text-stone/60 focus:border-ink',
				error: 'text-danger',
			};

	const fieldClass = cn(
		'h-14 w-full rounded-none border px-4 text-body-lg outline-none transition-colors aria-invalid:border-danger',
		tone.field
	);

	if (status === 'sent') {
		return (
			<div
				className={cn(
					'flex flex-col items-start gap-5 border p-8 lg:p-10',
					inverted ? 'border-cream/20 text-cream' : 'border-ink/15 bg-paper text-ink'
				)}
				role="status"
			>
				<span
					className={cn(
						'flex size-12 items-center justify-center rounded-full',
						inverted ? 'bg-cream text-ink' : 'bg-ink text-cream'
					)}
				>
					<Check size={22} />
				</span>
				<h3 className="text-h3 font-bold">{isBooking ? 'Заявка принята' : 'Спасибо!'}</h3>
				<p className={cn('text-body-lg', inverted ? 'text-cream/70' : 'text-stone')}>
					{isBooking && selected && values.time
						? `${selected.name} · ${formatDateRu(values.date)}, ${values.time}. `
						: ''}
					Администратор свяжется с вами в ближайшее время, чтобы подтвердить
					{isBooking ? ' запись.' : ' детали.'}
				</p>
				<button
					type="button"
					onClick={() => {
						setValues(emptyValues());
						startedAt.current = Date.now();
						setStatus('idle');
					}}
					className={cn(
						'text-body-md font-semibold underline underline-offset-8',
						inverted ? 'text-cream' : 'text-ink'
					)}
				>
					Новая заявка
				</button>
			</div>
		);
	}

	const label = (text: string, required = false) => (
		<span className={cn('text-body-md font-semibold', tone.label)}>
			{text}
			{required && ' *'}
		</span>
	);

	const errorText = (field: keyof Values) =>
		errors[field] ? <span className={cn('text-body-md', tone.error)}>{errors[field]}</span> : null;

	return (
		<form noValidate onSubmit={submit} className="relative flex flex-col gap-5">
			<div className="grid gap-5 sm:grid-cols-2">
				<label className="flex flex-col gap-2">
					{label('Имя', true)}
					<input
						type="text"
						name="name"
						autoComplete="name"
						value={values.name}
						onChange={(e) => update('name', e.target.value)}
						placeholder="Как к вам обращаться"
						aria-invalid={Boolean(errors.name)}
						className={fieldClass}
					/>
					{errorText('name')}
				</label>
				<label className="flex flex-col gap-2">
					{label('Телефон', true)}
					<input
						type="tel"
						name="phone"
						inputMode="tel"
						autoComplete="tel"
						value={values.phone}
						onChange={(e) => update('phone', nextPhoneValue(values.phone, e.target.value))}
						aria-invalid={Boolean(errors.phone)}
						className={fieldClass}
					/>
					{errorText('phone')}
				</label>
			</div>

			{isBooking && (
				<>
					<div className="grid gap-5 sm:grid-cols-2">
						<label className="flex flex-col gap-2">
							{label('Услуга', true)}
							<select
								name="service"
								value={values.serviceId}
								onChange={(e) => update('serviceId', e.target.value)}
								aria-invalid={Boolean(errors.serviceId)}
								className={cn(fieldClass, 'appearance-none bg-no-repeat pr-10')}
								style={{
									backgroundImage:
										"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")",
									backgroundPosition: 'right 1rem center',
								}}
							>
								<option value="">Выберите услугу</option>
								{categories.map((cat) => (
									<optgroup key={cat.id} label={cat.title}>
										{cat.services.map((svc) => (
											<option key={svc.id} value={svc.id}>
												{svc.name} — {formatPrice(svc.price)} сом
											</option>
										))}
									</optgroup>
								))}
							</select>
							{errorText('serviceId')}
						</label>
						<label className="flex flex-col gap-2">
							{label('Мастер')}
							<select
								name="master"
								value={values.master}
								onChange={(e) => update('master', e.target.value)}
								className={cn(fieldClass, 'appearance-none')}
							>
								<option value="">Любой свободный мастер</option>
								{masters.map((name, i) => (
									<option key={`${name}-${i}`} value={name}>
										{name}
									</option>
								))}
							</select>
						</label>
					</div>
					<div className="grid gap-5 sm:grid-cols-2">
						<label className="flex flex-col gap-2">
							{label('Дата', true)}
							<input
								type="date"
								name="date"
								min={bishkekDate()}
								max={bishkekDate(DAYS_AHEAD)}
								value={values.date}
								onChange={(e) => update('date', e.target.value)}
								aria-invalid={Boolean(errors.date)}
								className={fieldClass}
							/>
							{errorText('date')}
						</label>
						<div className="flex flex-col gap-2">
							{label('Время', true)}
							{slots.length ? (
								<select
									name="time"
									value={values.time}
									onChange={(e) => update('time', e.target.value)}
									aria-invalid={Boolean(errors.time)}
									aria-label="Время"
									className={cn(fieldClass, 'appearance-none')}
								>
									<option value="">
										{slotsLoading ? 'Проверяем свободное время…' : 'Выберите время'}
									</option>
									{slots.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							) : (
								<p className={cn('flex h-14 items-center text-body-md', tone.label)}>
									{slotsLoading
										? 'Проверяем свободное время…'
										: 'На этот день свободного времени нет — выберите другой'}
								</p>
							)}
							{errorText('time')}
							{busyError && (
								<span className={cn('text-body-md', tone.error)}>
									Это время только что заняли — выберите другое
								</span>
							)}
						</div>
					</div>
				</>
			)}

			<label className="flex flex-col gap-2">
				{label(isBooking ? 'Комментарий' : 'Ваш вопрос')}
				<textarea
					name="comment"
					rows={3}
					value={values.comment}
					onChange={(e) => update('comment', e.target.value)}
					placeholder={isBooking ? 'Пожелания к стрижке, ребёнок и т.п.' : 'Чем можем помочь?'}
					className={cn(fieldClass, 'h-auto resize-y py-3')}
				/>
			</label>

			{/* Ловушка для ботов: скрыта от людей и скринридеров */}
			<input
				type="text"
				name="website"
				value={website}
				onChange={(e) => setWebsite(e.target.value)}
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
				className="absolute -left-[9999px] size-px opacity-0"
			/>

			{status === 'error' && (
				<p role="alert" className={cn('text-body-md', tone.error)}>
					Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в WhatsApp.
				</p>
			)}

			<div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
				<button
					type="submit"
					disabled={status === 'sending'}
					className={buttonClass(inverted ? 'light' : 'primary', 'lg', 'sm:min-w-56')}
				>
					{status === 'sending' ? 'Отправляем…' : isBooking ? 'Записаться' : 'Перезвоните мне'}
				</button>
				{isBooking && whatsapp && (
					<a
						href={whatsappLink(whatsapp, messengerText())}
						target="_blank"
						rel="noopener noreferrer"
						className={buttonClass(
							'outline',
							'lg',
							inverted ? 'border-cream/40 text-cream hover:bg-cream hover:text-ink' : ''
						)}
					>
						<WhatsappIcon size={18} />
						WhatsApp
					</a>
				)}
				{isBooking && instagram && (
					<a
						href={instagramDirectLink(instagram)}
						target="_blank"
						rel="noopener noreferrer"
						className={buttonClass(
							'outline',
							'lg',
							inverted ? 'border-cream/40 text-cream hover:bg-cream hover:text-ink' : ''
						)}
					>
						<InstagramIcon size={18} />
						Direct
					</a>
				)}
			</div>
			<p className={cn('text-caption', tone.label)}>
				Нажимая кнопку, вы соглашаетесь на обработку персональных данных для связи с вами.
			</p>
		</form>
	);
}
