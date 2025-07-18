'use client';

import * as X from 'next/image';
import * as React from 'react';

const NextImage = X.default;

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

const AVATAR_NAME = 'Avatar';

// Create a context for the Avatar
const AvatarContext = React.createContext<AvatarContextValue | undefined>(undefined);

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type AvatarContextValue = {
	imageLoadingStatus: ImageLoadingStatus;
	onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
};

type AvatarProps = React.ComponentPropsWithoutRef<'span'>;

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>((props, forwardedRef) => {
	const [imageLoadingStatus, setImageLoadingStatus] = React.useState<ImageLoadingStatus>('idle');

	const value = {
		imageLoadingStatus,
		onImageLoadingStatusChange: setImageLoadingStatus,
	};

	return (
		<AvatarContext.Provider value={value}>
			<span {...props} ref={forwardedRef} />
		</AvatarContext.Provider>
	);
});

Avatar.displayName = AVATAR_NAME;

/* -------------------------------------------------------------------------------------------------
 * AvatarImage
 * -----------------------------------------------------------------------------------------------*/

const IMAGE_NAME = 'AvatarImage';

type AvatarImageProps = React.ComponentPropsWithoutRef<typeof NextImage> & {
	onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
};

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>((props, forwardedRef) => {
	const { src, onLoadingStatusChange = () => {}, ...imageProps } = props;
	const context = React.useContext(AvatarContext);

	const imageLoadingStatus = useImageLoadingStatus(src, imageProps.referrerPolicy);

	React.useEffect(() => {
		if (context) {
			if (imageLoadingStatus !== 'idle') {
				onLoadingStatusChange(imageLoadingStatus);
				context.onImageLoadingStatusChange(imageLoadingStatus);
			}
		}
	}, [imageLoadingStatus, context, onLoadingStatusChange]);

	return imageLoadingStatus === 'loaded' ? <NextImage {...imageProps} ref={forwardedRef} src={src} alt='' /> : null;
});

AvatarImage.displayName = IMAGE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AvatarFallback
 * -----------------------------------------------------------------------------------------------*/

const FALLBACK_NAME = 'AvatarFallback';

type AvatarFallbackProps = React.ComponentPropsWithoutRef<'span'> & {
	delayMs?: number;
};

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>((props, forwardedRef) => {
	const { delayMs, ...fallbackProps } = props;
	const context = React.useContext(AvatarContext);
	const [canRender, setCanRender] = React.useState(delayMs === undefined);

	React.useEffect(() => {
		if (delayMs !== undefined) {
			const timerId = window.setTimeout(() => setCanRender(true), delayMs);
			return () => window.clearTimeout(timerId);
		}
	}, [delayMs]);

	return canRender && context?.imageLoadingStatus !== 'loaded' ? <span {...fallbackProps} ref={forwardedRef} /> : null;
});

AvatarFallback.displayName = FALLBACK_NAME;

/* -----------------------------------------------------------------------------------------------*/

function useImageLoadingStatus(src?: AvatarImageProps['src'], referrerPolicy?: React.HTMLAttributeReferrerPolicy) {
	const [loadingStatus, setLoadingStatus] = React.useState<ImageLoadingStatus>('idle');

	React.useEffect(() => {
		if (!src) {
			setLoadingStatus('error');
			return;
		}

		let isMounted = true;
		const image = new window.Image();

		const updateStatus = (status: ImageLoadingStatus) => () => {
			if (!isMounted) return;
			setLoadingStatus(status);
		};

		setLoadingStatus('loading');
		image.onload = updateStatus('loaded');
		image.onerror = updateStatus('error');
		image.src = src as string;
		if (referrerPolicy) {
			image.referrerPolicy = referrerPolicy;
		}

		return () => {
			isMounted = false;
		};
	}, [src, referrerPolicy]);

	return loadingStatus;
}

const Root = Avatar;
const Image = AvatarImage;
const Fallback = AvatarFallback;

export { Avatar, AvatarFallback, AvatarImage, Fallback, Image, Root };
export type { AvatarFallbackProps, AvatarImageProps, AvatarProps };
