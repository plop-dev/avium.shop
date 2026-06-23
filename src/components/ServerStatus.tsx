'use client';

import { $serverStatus, setServerStatus } from '@/stores/serverStatus';
import { useEffect } from 'react';
import { ServerData } from './dashboard/nav-secondary';

export function ServerStatus() {
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;

		const start = () => {
			ping();
			interval = setInterval(ping, 30_000);
		};

		const stop = () => {
			if (interval) clearInterval(interval);
		};

		const ping = async () => {
			let res: Response | null = null;

			try {
				res = await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/health`, {
					method: 'GET',
					cache: 'no-store',
					keepalive: true,
				});

				res.json().then((data: ServerData) => {
					const serverData = {
						isOnline: data.isOnline,
						lastHeartbeat: new Date().toISOString(),
						ramUsage: data.ramUsage,
						cpuUsage: data.cpuUsage,
					};
					$serverStatus.set(serverData);
				});
			} catch (error) {
				setServerStatus({
					isOnline: false,
					error: `Error ${error}`,
				});
			}

			if (res && !res.ok) {
				setServerStatus({
					isOnline: false,
					error: `Error ${res.status}: ${res.statusText}`,
				});
			}
		};

		const handleVisibility = () => {
			if (document.hidden) {
				stop();
			} else {
				start();
			}
		};

		handleVisibility();

		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			stop();
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	}, []);

	return null;
}
