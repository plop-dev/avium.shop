import { atom } from 'nanostores';

export type Email = `${string}@${string}.${string}`;

export const $verifyEmail = atom<Email | undefined>();

export function setVerifyEmail(email: Email) {
	$verifyEmail.set(email);
}
