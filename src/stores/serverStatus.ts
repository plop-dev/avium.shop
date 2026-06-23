import { atom } from 'nanostores';
import { type ServerData } from '@/components/dashboard/nav-secondary';

export const $serverStatus = atom<ServerData | undefined>();

export function setServerStatus(serverStatus: ServerData) {
	const currrentData = $serverStatus.get();
	$serverStatus.set({ ...serverStatus, ...currrentData });
}
