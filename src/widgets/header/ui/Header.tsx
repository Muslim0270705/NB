import { Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BOOKING_ANCHOR, NAV } from '@/shared/config/site';
import { instagramLink, telLink, whatsappLink } from '@/shared/lib/links';
import { cn } from '@/shared/lib/utils';
import { buttonClass } from '@/shared/ui/button-styles';
import { InstagramIcon, TwoGisIcon, WhatsappIcon } from '@/shared/ui/icons';
import { Logo } from '@/shared/ui/logo';

interface HeaderProps {
	phone: string;
	phoneLabel: string;
	instagram: string;
	twoGisUrl: string;
	whatsapp: string;
}

export default function Header({ phone, phoneLabel, instagram, twoGisUrl, whatsapp }: HeaderProps) {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.documentElement.style.overflow = open ? 'hidden' : '';
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open]);

	const socials = [
		{ href: instagramLink(instagram), label: 'Instagram', icon: InstagramIcon },
		{ href: twoGisUrl, label: '2ГИС', icon: TwoGisIcon },
		...(whatsapp ? [{ href: whatsappLink(whatsapp), label: 'WhatsApp', icon: WhatsappIcon }] : []),
	];

	return (
		<header
			className={cn(
				'fixed inset-x-0 top-0 z-50 transition-all duration-500',
				scrolled || open
					? 'bg-cream/95 shadow-[0_1px_0_rgb(26_26_26/0.08)] backdrop-blur'
					: 'bg-transparent'
			)}
		>
			<div className="section-container flex h-16 items-center justify-between gap-6 lg:h-20">
				<a href="/" aria-label="NS Barber Studio — на главную" className="shrink-0">
					<Logo className="h-10 lg:h-12" title="" />
				</a>

				<nav aria-label="Основная навигация" className="hidden xl:block">
					<ul className="flex items-center gap-7">
						{NAV.map((item) => (
							<li key={item.href}>
								<a
									href={item.href}
									className="whitespace-nowrap text-caption font-semibold uppercase tracking-[0.16em] text-ink/80 transition-colors hover:text-ink"
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="flex items-center gap-2 lg:gap-4">
					<div className="hidden items-center gap-1 2xl:flex">
						{socials.map(({ href, label, icon: Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								className="flex size-10 items-center justify-center text-ink transition-colors hover:text-stone"
							>
								<Icon size={19} />
							</a>
						))}
					</div>
					{phone && (
						<a
							href={telLink(phone)}
							className="hidden items-center gap-2 whitespace-nowrap text-body-md font-semibold text-ink md:flex"
						>
							<Phone size={16} />
							{phoneLabel}
						</a>
					)}
					<a
						href={BOOKING_ANCHOR}
						className={buttonClass('primary', 'sm', 'hidden sm:inline-flex')}
					>
						Записаться
					</a>
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						aria-controls="mobile-menu"
						aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
						className="flex size-11 items-center justify-center text-ink xl:hidden"
					>
						{open ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			<div
				id="mobile-menu"
				hidden={!open}
				className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink/10 bg-cream xl:hidden"
			>
				<nav aria-label="Мобильная навигация" className="section-container flex flex-col py-6">
					{NAV.map((item) => (
						<a
							key={item.href}
							href={item.href}
							onClick={() => setOpen(false)}
							className="border-b border-ink/10 py-5 text-h3 font-extrabold uppercase text-ink"
						>
							{item.label}
						</a>
					))}
					<a
						href={BOOKING_ANCHOR}
						onClick={() => setOpen(false)}
						className={buttonClass('primary', 'lg', 'mt-8 w-full')}
					>
						Записаться онлайн
					</a>
					{phone && (
						<a href={telLink(phone)} className="mt-6 text-h3 font-bold text-ink">
							{phoneLabel}
						</a>
					)}
					<div className="mt-6 flex gap-3">
						{socials.map(({ href, label, icon: Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-12 items-center gap-2 border border-ink/20 px-4 text-caption font-semibold uppercase tracking-[0.16em]"
							>
								<Icon size={18} />
								{label}
							</a>
						))}
					</div>
				</nav>
			</div>
		</header>
	);
}
