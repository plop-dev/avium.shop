export const getServerSideURL = () => {
	let url = process.env.NEXT_PUBLIC_SERVER_URL;

	if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return process.env.VERCEL_PROJECT_PRODUCTION_URL;
	}

	if (!url) {
		url = 'http://localhost:3000';
	}

	return url;
};
