// Иконки брендов (в lucide их нет). Цвет — currentColor.
interface IconProps {
	className?: string;
	size?: number;
}

export function InstagramIcon({ className, size = 20 }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
			<rect
				x="3"
				y="3"
				width="18"
				height="18"
				rx="5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
			/>
			<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
		</svg>
	);
}

export function WhatsappIcon({ className, size = 20 }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
			<path
				fill="currentColor"
				d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.17-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.07.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.85 3.73Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06a6.7 6.7 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5l.37-.43c.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.7 2.7 0 0 0-.85 2.02c0 1.19.87 2.34.99 2.5.12.17 1.7 2.6 4.13 3.65.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.11-.22-.17-.47-.29Z"
			/>
		</svg>
	);
}

export function TwoGisIcon({ className, size = 20 }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
			<path
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinejoin="round"
				d="M12 21.5s-6.75-6.2-6.75-11.25a6.75 6.75 0 1 1 13.5 0C18.75 15.3 12 21.5 12 21.5Z"
			/>
			<text
				x="12"
				y="12.6"
				textAnchor="middle"
				fontSize="6.4"
				fontWeight="800"
				fill="currentColor"
				fontFamily="Arial, sans-serif"
			>
				2Г
			</text>
		</svg>
	);
}
