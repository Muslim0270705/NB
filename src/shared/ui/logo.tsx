import { useId } from 'react';
import { cn } from '@/shared/lib/utils';
import { LOGO_BAND, LOGO_BARBER, LOGO_NS, LOGO_STUDIO, LOGO_VIEWBOX } from './logo-paths';

interface LogoProps {
	className?: string;
	/** full — NS + BARBER + STUDIO; mark — только монограмма NS с прорезью */
	variant?: 'full' | 'mark';
	inverted?: boolean;
	/** Текст для скринридеров; пустая строка — декоративный логотип */
	title?: string;
}

// Векторный логотип: чёткий на любом экране, цвет — currentColor.
// Размер задаётся высотой через className (например, h-12), ширина считается сама.
export function Logo({
	className,
	variant = 'full',
	inverted = false,
	title = 'NS Barber Studio',
}: LogoProps) {
	const maskId = `ns-cut-${useId().replace(/[^\w-]/g, '')}`;
	const [x, y, w, h] = LOGO_VIEWBOX.split(' ').map(Number);
	// Для монограммы обрезаем низ с надписью STUDIO
	const viewBox = variant === 'mark' ? `${x} ${y} ${w} ${310 - y}` : LOGO_VIEWBOX;

	return (
		<svg
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
			className={cn('block h-12 w-auto', inverted ? 'text-cream' : 'text-ink', className)}
			role={title ? 'img' : undefined}
			aria-label={title || undefined}
			aria-hidden={title ? undefined : true}
		>
			<defs>
				<mask id={maskId} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
					<rect x={x} y={y} width={w} height={h} fill="#fff" />
					<rect
						x={LOGO_BAND.x}
						y={LOGO_BAND.y}
						width={LOGO_BAND.w}
						height={LOGO_BAND.h}
						fill="#000"
					/>
				</mask>
			</defs>
			<g fill="currentColor">
				<path mask={`url(#${maskId})`} d={LOGO_NS} />
				{variant === 'full' && (
					<>
						<path d={LOGO_BARBER} />
						<path d={LOGO_STUDIO} />
					</>
				)}
			</g>
		</svg>
	);
}
