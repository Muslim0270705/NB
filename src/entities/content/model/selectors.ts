import type { Service, SiteContent } from './types';

export function allServices(content: SiteContent): (Service & { category: string })[] {
	return content.categories.flatMap((cat) =>
		cat.services.map((svc) => ({ ...svc, category: cat.title }))
	);
}

export function findService(content: SiteContent, serviceId: string) {
	return allServices(content).find((svc) => svc.id === serviceId);
}

export function minPrice(content: SiteContent): number {
	const prices = allServices(content)
		.map((svc) => svc.price)
		.filter((p) => p > 0);
	return prices.length ? Math.min(...prices) : 0;
}
