'use server';

export type VideoMimeType = 'video/mp4' | 'video/webm' | 'video/ogg' | 'video/avi' | 'video/mov' | 'video/wmv' | 'video/flv' | 'video/mkv';

export async function Video({ type, url, ...props }: { type: VideoMimeType; url: string } & React.VideoHTMLAttributes<HTMLVideoElement>) {
	return (
		<video {...props}>
			<source src={url} type={type}></source>
			Your browser does not support the video tag.
		</video>
	);
}
