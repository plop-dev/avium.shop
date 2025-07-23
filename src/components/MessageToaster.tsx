'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { parseAsString, useQueryState } from 'nuqs';

function MessageToaster() {
	const displayedMessages = useRef(new Set<string>());

	const [error] = useQueryState('error', parseAsString);
	const [success] = useQueryState('success', parseAsString);
	const [message] = useQueryState('message', parseAsString);

	console.log('MessageToaster rendered with:', { error, success, message });

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

	return null;
}

export { MessageToaster };
