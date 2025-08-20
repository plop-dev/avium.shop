'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { User } from 'next-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { BellDot, CreditCard, LogOut, MoreVertical, UserCircle } from 'lucide-react';
import getInitials from '@/utils/getInitials';

export function NavUser({ user }: { user: User | null }) {
	const { isMobile } = useSidebar();

	// Skeleton loading state when user is null
	if (!user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size='lg' className='pointer-events-none' aria-busy='true' aria-live='polite'>
						<Skeleton className='h-8 w-8 rounded-lg' />
						<div className='flex-1 space-y-1'>
							<Skeleton className='h-4 w-28' />
							<Skeleton className='h-3 w-40' />
						</div>
						<Skeleton className='ml-auto h-4 w-4 rounded' />
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage src={user.image || '#'} alt={user.name || ''} className='rounded-lg' width={48} height={48} />
								<AvatarFallback className='rounded-lg'>{getInitials(user.name || 'u', 2, true)}</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user.name}</span>
								<span className='text-muted-foreground truncate text-xs'>{user.email}</span>
							</div>
							<MoreVertical className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded-lg'>
									<AvatarImage
										src={user.image || '#'}
										alt={user.name || ''}
										className='rounded-xl'
										width={48}
										height={48}
									/>
									<AvatarFallback className='rounded-lg'>{getInitials(user.name || 'u', 2, true)}</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>{user.name}</span>
									<span className='text-muted-foreground truncate text-xs'>{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<UserCircle />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<BellDot />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
