'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import logo from '@/assets/logo.png';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
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
import { Menu, X } from 'lucide-react';

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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const router = useRouter();

	async function handleLogout(): Promise<{ success: boolean; error?: string }> {
		if (logoutLoading) return { success: false, error: 'Logout already in progress' };

		setLogoutLoading(true);

		try {
			await signOut({ redirect: false });
			router.push('/');
			setUserData(null);

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
				className='min-w-full fixed gap-x-2 sm:gap-x-8 h-16 items-center z-50 bg-background border-b-border border-b-2 box-border left-0 px-4 sm:px-8 lg:px-32 2xl:px-64'
				onValueChange={value => {
					console.log('navmenu value changed:', value);
					setIsOpen(value !== '');
				}}>
				<div className='flex-shrink-0'>
					<Link href='/' className='flex items-center gap-4'>
						<Image src={logo} loading='eager' alt='Avium Logo' height={28} width={28}></Image>
						<span className='hidden sm:inline text-lg font-bold whitespace-nowrap'>Avium</span>
					</Link>
				</div>

				<NavigationMenuList ref={listRef} className='relative hidden md:flex'>
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
								<NavigationMenuLink asChild className={navigationMenuTriggerStyle({ className: 'cursor-pointer' })}>
									<Link href={item.href || '#'}>{item.title}</Link>
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

				<div className='flex gap-x-2 sm:gap-x-4 ml-auto items-center'>
					{!userData ? (
						<div className='hidden sm:flex sm:gap-x-4'>
							<Link href={'/auth/login'} className={buttonVariants({ variant: 'default', size: 'sm' })}>
								Login
							</Link>
							<Link href={'/auth/signup'} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
								Sign Up
							</Link>
						</div>
					) : (
						<div className='h-full flex items-center sm:flex gap-x-4'>
							<UserMenu
								userData={{ name: userData.name || '', image: userData.image || '#' }}
								handleLogout={handleLogout}
								logoutLoading={logoutLoading}
								className='lg:hidden flex'
							/>
							<Basket></Basket>
						</div>
					)}

					<ThemeToggle></ThemeToggle>

					<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='md:hidden p-2' aria-label='Toggle menu'>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</NavigationMenu>

			{mobileMenuOpen && (
				<div className='fixed top-16 left-0 right-0 z-40 bg-background border-b border-border md:hidden'>
					<div className='flex flex-col p-4'>
						{items.map((item, index) => (
							<Link
								key={index}
								href={item.href || '#'}
								className='py-2 px-2 text-sm hover:bg-muted rounded-md'
								onClick={() => setMobileMenuOpen(false)}>
								{item.title}
							</Link>
						))}
						{!userData ? (
							<>
								<Link href={'/auth/login'} className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'mt-4')}>
									Login
								</Link>
								<Link href={'/auth/signup'} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-2')}>
									Sign Up
								</Link>
							</>
						) : (
							<div className='flex flex-col gap-y-2 mt-4'>
								<Basket></Basket>
								<div className='inline'>
									<UserMenu
										fullWidth={true}
										userData={{ name: userData.name || '', image: userData.image || '#' }}
										handleLogout={handleLogout}
										logoutLoading={logoutLoading}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
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
