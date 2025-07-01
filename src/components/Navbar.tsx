'use client';

import * as React from 'react';
import Link from 'next/link';
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

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
		};
		items: (NavbarListItemProps | NavMenuLinkItem)[];
	};
}

export interface NavbarProps {
	items?: NavMenuItem[];
}

const defaultComponents: NavbarListItemProps[] = [
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

const defaultNavItems: NavMenuItem[] = [
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

const Navbar = ({ items = defaultNavItems }: NavbarProps) => {
	return (
		<NavigationMenu viewport={false}>
			<NavigationMenuList>
				{items.map((item, index) => (
					<NavigationMenuItem key={index}>
						{item.type === 'link' ? (
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link href={item.href || '#'}>{item.title}</Link>
							</NavigationMenuLink>
						) : (
							<>
								<NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
								{item.content && (
									<NavigationMenuContent>
										<ul className={item.content.className}>
											{item.content.featured && (
												<li className='row-span-3'>
													<NavigationMenuLink asChild>
														<a
															className='from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md'
															href={item.content.featured.href}>
															<div className='mt-4 mb-2 text-lg font-medium'>
																{item.content.featured.title}
															</div>
															<p className='text-muted-foreground text-sm leading-tight'>
																{item.content.featured.description}
															</p>
														</a>
													</NavigationMenuLink>
												</li>
											)}
											{item.content.layout === 'grid' ? (
												item.content.items.map((contentItem, contentIndex) =>
													'description' in contentItem ? (
														<ListItem key={contentIndex} title={contentItem.title} href={contentItem.href}>
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
											)}
										</ul>
									</NavigationMenuContent>
								)}
							</>
						)}
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
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
