'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

function MessageToaster({ error, success, message }: { error?: string; success?: string; message?: string }) {
	const displayedMessages = useRef(new Set<string>());

	useEffect(() => {
		const messageToShow = error || success || message;
		if (messageToShow && !displayedMessages.current.has(messageToShow)) {
			displayedMessages.current.add(messageToShow);

			if (error) {
				toast.error(error);
			} else if (success) {
				toast.success(success);
			} else if (message) {
				toast(message);
			}
		}
	}, [error, success, message]);

	return <></>;
}

export { MessageToaster };
