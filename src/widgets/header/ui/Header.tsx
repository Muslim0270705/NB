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

	// Как в Nomad College: светлая плашка над первым экраном, тёмная при прокрутке
	const dark = scrolled || open;

	const socials = [
		{ href: instagramLink(instagram), label: 'Instagram', icon: InstagramIcon },
		{ href: twoGisUrl, label: '2ГИС', icon: TwoGisIcon },
		...(whatsapp ? [{ href: whatsappLink(whatsapp), label: 'WhatsApp', icon: WhatsappIcon }] : []),
	];

	return (
		<header
			className={cn(
				'fixed left-1/2 top-0 z-50 w-full max-w-[1296px] -translate-x-1/2 transition-[background-color,color,top] duration-300',
				dark ? 'bg-ink text-cream lg:top-0' : 'bg-cream text-ink lg:top-8'
			)}
		>
			<div className="flex h-16 items-center justify-between gap-6 px-4 lg:h-[68px] lg:px-6">
				<a href="/" aria-label="NS Barber Studio — на главную" className="shrink-0">
					<Logo inverted={dark} className="h-10 lg:h-11" title="" />
				</a>

				<nav aria-label="Основная навигация" className="hidden xl:block">
					<ul className="flex items-center gap-7">
						{NAV.map((item) => (
							<li key={item.href}>
								<a
									href={item.href}
									className="whitespace-nowrap text-body-md font-medium opacity-80 transition-opacity hover:opacity-100"
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
								className="flex size-10 items-center justify-center opacity-80 transition-opacity hover:opacity-100"
							>
								<Icon size={19} />
							</a>
						))}
					</div>
					{phone && (
						<a
							href={telLink(phone)}
							className="hidden items-center gap-2 whitespace-nowrap text-body-md font-semibold md:flex"
						>
							<Phone size={16} />
							{phoneLabel}
						</a>
					)}
					<a
						href={BOOKING_ANCHOR}
						className={buttonClass(dark ? 'light' : 'primary', 'sm', 'hidden sm:inline-flex')}
					>
						Записаться
					</a>
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
						aria-controls="mobile-menu"
						aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
						className="flex size-11 items-center justify-center xl:hidden"
					>
						{open ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			<div
				id="mobile-menu"
				hidden={!open}
				className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-cream/10 bg-ink text-cream xl:hidden"
			>
				<nav aria-label="Мобильная навигация" className="flex flex-col px-4 py-6">
					{NAV.map((item) => (
						<a
							key={item.href}
							href={item.href}
							onClick={() => setOpen(false)}
							className="border-b border-cream/10 py-5 text-h3 font-semibold"
						>
							{item.label}
						</a>
					))}
					<a
						href={BOOKING_ANCHOR}
						onClick={() => setOpen(false)}
						className={buttonClass('light', 'lg', 'mt-8 w-full')}
					>
						Записаться онлайн
					</a>
					{phone && (
						<a href={telLink(phone)} className="mt-6 text-h3 font-bold">
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
								className="flex h-12 items-center gap-2 border border-cream/20 px-4 text-body-md font-semibold"
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
