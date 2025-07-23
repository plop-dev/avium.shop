import { atom } from 'nanostores';

export type Email = `${string}@${string}.${string}`;

export const $resetPasswordEmail = atom<Email | undefined>();

export function setResetPasswordEmail(email: Email) {
	$resetPasswordEmail.set(email);
}
