'use server';

import { list } from '@vercel/blob';
import mime from 'mime-types'; //? idk how to add types

export async function Video({
	type,
	filename,
	...props
}: { type: string; filename: string } & React.VideoHTMLAttributes<HTMLVideoElement>) {
	const { blobs } = await list({
		prefix: filename,
		limit: 1,
	});

	const { url } = blobs[0];

	return (
		<video {...props}>
			<source src={url} type={type}></source>
			Your browser does not support the video tag.
		</video>
	);
}
