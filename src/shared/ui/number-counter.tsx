import { animate, useInView, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface NumberCounterProps {
	target: number;
	suffix?: string;
	duration?: number;
	className?: string;
}

export function NumberCounter({
	target,
	suffix = '',
	duration = 2,
	className = '',
}: NumberCounterProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-50px' });
	const motionValue = useMotionValue(0);

	useEffect(() => {
		if (!isInView) return;

		const controls = animate(motionValue, target, {
			duration,
			ease: 'easeOut',
			onUpdate: (latest) => {
				if (ref.current) {
					ref.current.textContent = Math.round(latest).toLocaleString('ru-RU') + suffix;
				}
			},
		});

		return () => controls.stop();
	}, [isInView, motionValue, target, suffix, duration]);

	return (
		<span ref={ref} className={className}>
			0{suffix}
		</span>
	);
}
