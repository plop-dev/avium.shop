'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { parseAsString, useQueryState } from 'nuqs';

function MessageToaster() {
	const displayedMessages = useRef(new Set<string>());

	const [error, setError] = useQueryState('error', parseAsString);
	const [success, setSuccess] = useQueryState('success', parseAsString);
	const [message, setMessage] = useQueryState('message', parseAsString);

	useEffect(() => {
		const messageToShow = error || success || message;
		if (messageToShow && !displayedMessages.current.has(messageToShow)) {
			displayedMessages.current.add(messageToShow);

			if (error) {
				toast.error(error);
				setError(null);
			} else if (success) {
				toast.success(success);
				setSuccess(null);
			} else if (message) {
				toast(message);
				setMessage(null);
			}
		}
	}, [error, success, message]);

	return null;
}

export { MessageToaster };
