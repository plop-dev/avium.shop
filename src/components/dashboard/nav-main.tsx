'use client';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarData } from './app-sidebar';
import { UserLock } from 'lucide-react';
import Link from 'next/link';

export function NavMain({ items }: { items: SidebarData['navMain'] }) {
	return (
		<SidebarGroup>
			<SidebarGroupContent className='flex flex-col gap-2'>
				<SidebarMenu>
					<SidebarMenuItem className='flex items-center gap-2'>
						<SidebarMenuButton
							tooltip='Go to Admin Panel'
							className='bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
							asChild>
							<Link href={'/admin'}>
								<UserLock></UserLock>
								<span>Admin Panel</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map(item => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton tooltip={item.title} asChild>
								<Link href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
