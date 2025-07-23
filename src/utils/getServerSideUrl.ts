/**
 * INCLUDES HTTP(S)
 *
 * @returns The server URL as a string
 */
export const getServerSideURL = () => {
	// either in dev, preview, or production

	if (process.env.VERCEL_ENV === 'production') {
		return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
	} else if (process.env.VERCEL_ENV === 'preview') {
		return 'https://' + process.env.VERCEL_BRANCH_URL;
	} else {
		return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
	}
};
