'use client';

import * as React from 'react';

import { NavMain } from '@/components/dashboard/nav-main';
import { NavSecondary } from '@/components/dashboard/nav-secondary';
import { NavUser } from '@/components/dashboard/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { LayoutDashboard, List, Settings, UserLock } from 'lucide-react';
import Link from 'next/link';

export type SidebarData = {
	navMain: {
		title: string;
		url: string;
		icon: React.ElementType;
	}[];
	navSecondary: {
		title: string;
		url: string;
		icon: React.ElementType;
	}[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const data: SidebarData = {
		navMain: [
			{
				title: 'Dashboard',
				url: '#',
				icon: LayoutDashboard,
			},
			{
				title: 'Admin Panel',
				url: '/admin',
				icon: UserLock,
			},
			{
				title: 'Orders',
				url: '#',
				icon: List,
			},
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '/admin/account',
				icon: Settings,
			},
		],
	};

	const [userData, setUserData] = useState<User | null>(null);

	const user = useSession();

	useEffect(() => {
		if (user.status === 'authenticated') {
			setUserData(user.data.user || null);
		}
	}, [user]);

	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className='!p-1.5'>
							<Link href='/'>
								<Image priority src={logo} alt='Avium' height={28} width={28}></Image>
								<span className='font-semibold text-xl'>Avium</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
		</Sidebar>
	);
}
