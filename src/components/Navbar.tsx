'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import logo from '@/assets/logo.png';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
	NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

import { buttonVariants } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserMenu } from './UserMenu';
import Basket from './Basket';

export interface NavbarListItemProps {
	title: string;
	href: string;
	description: string;
}

export interface NavMenuLinkItem {
	title: string;
	href: string;
	description?: string;
	icon?: React.ReactNode;
}

export interface NavMenuItem {
	title: string;
	type: 'link' | 'dropdown';
	href?: string;
	content?: {
		layout?: 'grid' | 'list';
		className?: string;
		featured?: {
			title: string;
			description: string;
			href: string;
		}[];
		items?: (NavbarListItemProps | NavMenuLinkItem)[];
	};
}

export interface NavbarProps {
	items: NavMenuItem[];
	user?: User;
}

//* example usage
/**
 ** Default components for the Navbar.
	defaultComponents: NavbarListItemProps[] = [
		{
			title: 'Alert Dialog',
			href: '/docs/primitives/alert-dialog',
			description: 'A modal dialog that interrupts the user with important content and expects a response.',
		},
		{
			title: 'Hover Card',
			href: '/docs/primitives/hover-card',
			description: 'For sighted users to preview content available behind a link.',
		},
		{
			title: 'Progress',
			href: '/docs/primitives/progress',
			description: 'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
		},
		{
			title: 'Scroll-area',
			href: '/docs/primitives/scroll-area',
			description: 'Visually or semantically separates content.',
		},
		{
			title: 'Tabs',
			href: '/docs/primitives/tabs',
			description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
		},
		{
			title: 'Tooltip',
			href: '/docs/primitives/tooltip',
			description:
				'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
		},
	];

 ** Default navigation menu items for the Navbar.
 defaultNavItems: NavMenuItem[] = [
	 {
		 title: 'Home',
		 type: 'dropdown',
		 content: {
			 layout: 'grid',
			 className: 'grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]',
			 featured: {
				 title: 'shadcn/ui',
				 description: 'Beautifully designed components built with Tailwind CSS.',
				 href: '/',
			 },
			 items: [
				 {
					 title: 'Introduction',
					 href: '/docs',
					 description: 'Re-usable components built using Radix UI and Tailwind CSS.',
				 },
				 {
					 title: 'Installation',
					 href: '/docs/installation',
					 description: 'How to install dependencies and structure your app.',
				 },
				 {
					 title: 'Typography',
					 href: '/docs/primitives/typography',
					 description: 'Styles for headings, paragraphs, lists...etc',
				 },
			 ],
		 },
	 },
	 {
		 title: 'Components',
		 type: 'dropdown',
		 content: {
			 layout: 'grid',
			 className: 'grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]',
			 items: defaultComponents,
		 },
	 },
	 {
		 title: 'Docs',
		 type: 'link',
		 href: '/docs',
	 },
	 {
		 title: 'List',
		 type: 'dropdown',
		 content: {
			 layout: 'list',
			 className: 'grid w-[300px] gap-4',
			 items: [
				 {
					 title: 'Components',
					 href: '#',
					 description: 'Browse all components in the library.',
				 },
				 {
					 title: 'Documentation',
					 href: '#',
					 description: 'Learn how to use the library.',
				 },
				 {
					 title: 'Blog',
					 href: '#',
					 description: 'Read our latest blog posts.',
				 },
			 ],
		 },
	 },
	 {
		 title: 'Simple',
		 type: 'dropdown',
		 content: {
			 layout: 'list',
			 className: 'grid w-[200px] gap-4',
			 items: [
				 { title: 'Components', href: '#' },
				 { title: 'Documentation', href: '#' },
				 { title: 'Blocks', href: '#' },
			 ],
		 },
	 },
	 {
		 title: 'With Icon',
		 type: 'dropdown',
		 content: {
			 layout: 'list',
			 className: 'grid w-[200px] gap-4',
			 items: [
				 { title: 'Backlog', href: '#', icon: <CircleHelpIcon /> },
				 { title: 'To Do', href: '#', icon: <CircleIcon /> },
				 { title: 'Done', href: '#', icon: <CircleCheckIcon /> },
			 ],
		 },
	 },
 ];
 
 */

const Navbar = ({ items, user }: NavbarProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [userData, setUserData] = useState<User | null>(user || null);
	const [logoutLoading, setLogoutLoading] = useState(false);
	const listRef = useRef<HTMLUListElement>(null);
	const [indicatorStyle, setIndicatorStyle] = useState({
		left: 0,
		opacity: 0,
	});
	const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	async function handleLogout(): Promise<{ success: boolean; error?: string }> {
		if (logoutLoading) return { success: false, error: 'Logout already in progress' };

		setLogoutLoading(true);

		try {
			await signOut({ redirect: false });
			router.push('/');
			setUserData(null);

			toast.success('Logged out successfully', {
				duration: 3000,
				dismissible: true,
			});

			setLogoutLoading(false);
			return { success: true };
		} catch (error) {
			setLogoutLoading(false);
			return { success: false, error: 'Failed to logout' };
		}
	}

	// Update indicator position when hoveredIndex changes
	useEffect(() => {
		if (!listRef.current) return;

		// If menu is closed, hide indicator
		if (!isOpen) {
			setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
			return;
		}

		// Use the active item index when menu is open
		const currentIndex = isOpen ? (activeItemIndex !== null ? activeItemIndex : hoveredIndex) : null;

		if (currentIndex === null) {
			// below is commented because indicator hides too quick
			// setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
			return;
		}

		// Get direct references to DOM elements
		const menuItems = listRef.current.querySelectorAll('[data-slot="navigation-menu-item"]');
		if (menuItems[currentIndex] && items[currentIndex]?.type === 'dropdown') {
			const item = menuItems[currentIndex] as HTMLElement;
			const rect = item.getBoundingClientRect();
			const listRect = listRef.current.getBoundingClientRect();
			const centerPosition = rect.left + rect.width / 2 - listRect.left;

			setIndicatorStyle({
				left: centerPosition - 10,
				opacity: 1,
			});
		} else {
			setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
		}
	}, [hoveredIndex, items, isOpen, activeItemIndex]);

	return (
		<>
			<NavigationMenu
				className='min-w-full fixed gap-x-8 h-16 items-center z-50 bg-background border-b-border border-b-2 box-border left-0 px-64'
				onValueChange={value => {
					console.log('navmenu value changed:', value);
					setIsOpen(value !== '');
				}}>
				<div className='flex-shrink-0'>
					<Link href='/' className='flex items-center gap-4'>
						<Image src={logo} alt='Avium Logo' height={28} width={28}></Image>
						<span className='text-lg font-bold whitespace-nowrap'>Avium</span>
					</Link>
				</div>

				<NavigationMenuList ref={listRef} className='relative'>
					{/* Indicator Element with matching animation classes from NavigationMenuContent */}
					<div
						className={cn(
							'absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-border shadow-md',
							'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
						)}
						data-motion={isOpen ? 'from-start' : 'to-start'}
						style={{
							bottom: '-22px',
							left: indicatorStyle.left,
							opacity: indicatorStyle.opacity,
							pointerEvents: 'none',
						}}
					/>

					{items.map((item, index) => (
						<NavigationMenuItem
							key={index}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}>
							{item.type === 'link' ? (
								<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
									<span className='cursor-default'>{item.title}</span>
								</NavigationMenuLink>
							) : (
								<>
									<NavigationMenuTrigger
										onPointerDown={e => e.preventDefault()}
										onMouseDown={e => e.preventDefault()}
										onClick={e => e.preventDefault()}
										className='cursor-pointer'>
										{item.title}
									</NavigationMenuTrigger>
									{item.content && (
										<NavigationMenuContent>
											<ul className={item.content.className}>
												{item.content.featured &&
													item.content.featured.map((featuredItem, featuredIndex) => (
														<li
															key={featuredIndex}
															style={{
																gridRow: `span ${Math.ceil(
																	(item.content?.items?.length || 0) /
																		(item.content?.featured?.length || 1),
																)} / span ${Math.ceil(
																	(item.content?.items?.length || 0) /
																		(item.content?.featured?.length || 1),
																)}`,
															}}>
															<NavigationMenuLink asChild>
																<Link
																	className='from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md'
																	href={featuredItem.href}>
																	<div className='mt-4 mb-2 text-lg font-medium'>
																		{featuredItem.title}
																	</div>
																	<p className='text-muted-foreground text-sm leading-tight'>
																		{featuredItem.description}
																	</p>
																</Link>
															</NavigationMenuLink>
														</li>
													))}
												{item.content.items &&
													(item.content.layout === 'grid' ? (
														item.content.items.map((contentItem, contentIndex) =>
															'description' in contentItem ? (
																<ListItem
																	key={contentIndex}
																	title={contentItem.title}
																	href={contentItem.href}>
																	{contentItem.description}
																</ListItem>
															) : null,
														)
													) : (
														<li>
															{item.content.items.map((contentItem, contentIndex) => (
																<NavigationMenuLink key={contentIndex} asChild>
																	<Link
																		href={contentItem.href}
																		className={
																			'icon' in contentItem && contentItem.icon
																				? 'flex-row items-center gap-2'
																				: ''
																		}>
																		{'icon' in contentItem && contentItem.icon}
																		{'description' in contentItem && contentItem.description ? (
																			<div>
																				<div className='font-medium'>{contentItem.title}</div>
																				<div className='text-muted-foreground'>
																					{contentItem.description}
																				</div>
																			</div>
																		) : (
																			contentItem.title
																		)}
																	</Link>
																</NavigationMenuLink>
															))}
														</li>
													))}
											</ul>
										</NavigationMenuContent>
									)}
								</>
							)}
						</NavigationMenuItem>
					))}
				</NavigationMenuList>

				<NavigationMenuViewport className='bg-popover/80 backdrop-blur-lg shadow-md' />

				<div className='flex gap-x-4 ml-auto'>
					{/* {user.status === 'loading' && <Skeleton className='w-[200px] h-9'></Skeleton>} */}

					{!userData ? (
						<>
							<Link href={'/auth/login'} className={buttonVariants({ variant: 'default' })}>
								Login
							</Link>
							<Link href={'/auth/signup'} className={buttonVariants({ variant: 'outline' })}>
								Sign Up
							</Link>
						</>
					) : (
						<div className='h-full flex items-center gap-x-4'>
							<Basket></Basket>
							<UserMenu
								userData={{ name: userData.name || '', image: userData.image || '#' }}
								handleLogout={handleLogout}
								logoutLoading={logoutLoading}
							/>
						</div>
					)}

					<ThemeToggle></ThemeToggle>
				</div>
			</NavigationMenu>
		</>
	);
};

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
	return (
		<li {...props}>
			<NavigationMenuLink asChild>
				<Link href={href}>
					<div className='text-sm leading-none font-medium'>{title}</div>
					<p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>{children}</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
}

export default Navbar;
