import { motion, type Transition, type Variants } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

export type AnimationType = 'spring' | 'tween' | 'bounce';

interface AnimatedTextProps {
	text: string;
	className?: string;
	initialDelay?: number;
	isOdd?: boolean;
	animationType?: AnimationType;
}

export const AnimatedText = ({
	text,
	className = '',
	initialDelay = 0,
	isOdd = false,
	animationType = 'spring',
}: AnimatedTextProps) => {
	const characters = text.split('');

	const getTransitionPreset = (type: AnimationType): Transition => {
		switch (type) {
			case 'tween':
				return { type: 'tween', duration: 0.5, ease: 'easeOut' };
			case 'bounce':
				return { type: 'spring', damping: 8, stiffness: 200 };
			default:
				return { type: 'spring', damping: 15, stiffness: 150 };
		}
	};

	const containerVariants: Variants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.04,
				delayChildren: initialDelay,
			},
		},
	};

	const letterVariants: Variants = {
		hidden: (i: number) => {
			const isGoingUp = isOdd ? i % 2 !== 0 : i % 2 === 0;
			return { y: isGoingUp ? '-100%' : '100%' };
		},
		visible: {
			y: '0%',
			transition: getTransitionPreset(animationType),
		},
	};

	return (
		<motion.div
			className={cn('flex flex-wrap overflow-hidden', className)}
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-50px' }}
		>
			{characters.map((char, i) => (
				<motion.span
					key={i + char}
					custom={i}
					variants={letterVariants}
					className="inline-block"
					style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
				>
					{char}
				</motion.span>
			))}
		</motion.div>
	);
};
