import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: false, // Désactiver SSR pour hébergement statique
	prerender: [], // Pas de prerender
} satisfies Config;
