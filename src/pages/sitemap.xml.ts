import type { APIRoute } from 'astro';

// Одностраничный сайт: в карте только главная. Админка закрыта от индексации.
export const GET: APIRoute = ({ site }) => {
	const home = new URL('/', site).href;
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url><loc>${home}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
