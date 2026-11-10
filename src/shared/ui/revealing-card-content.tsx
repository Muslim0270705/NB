import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealingCardContentProps {
	children: ReactNode;
	delay?: number;
}

export const RevealingCardContent = ({ children, delay = 0 }: RevealingCardContentProps) => {
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			whileInView={{
				height: 'auto',
				opacity: 1,
			}}
			viewport={{ once: true, amount: 0.3 }}
			transition={{
				height: {
					delay: delay,
					duration: 0.8,
					ease: [0.22, 1, 0.36, 1],
				},
				opacity: {
					delay: delay + 0.1,
					duration: 0.6,
				},
			}}
			className="overflow-hidden"
		>
			<div className="pb-1">{children}</div>
		</motion.div>
	);
};
