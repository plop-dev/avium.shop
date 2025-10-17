'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import getInitials from '@/utils/getInitials';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { useState } from 'react';

function UserMenu({
	userData,
	handleLogout,
	logoutLoading,
}: {
	userData: { name: string; image: string };
	handleLogout: () => Promise<{ success: boolean; error?: string }>;
	logoutLoading: boolean;
}) {
	const [isLogOutLoading, setIsLogOutLoading] = useState(false);

	return (
		<DropdownMenu open={isLogOutLoading} onOpenChange={setIsLogOutLoading}>
			<DropdownMenuTrigger>
				<Avatar className='flex items-center justify-center cursor-pointer'>
					<AvatarImage className='border-2 rounded-full' src={userData.image} alt='User' width={36} height={36}></AvatarImage>
					<AvatarFallback className='border-2 rounded-full w-9 aspect-square grid place-items-center'>
						{getInitials(userData.name)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='start'>
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem>Dashboard</DropdownMenuItem>
					<DropdownMenuItem>Profile</DropdownMenuItem>
					<DropdownMenuItem>Orders</DropdownMenuItem>
					<DropdownMenuItem>Settings</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem>Contact</DropdownMenuItem>
				<DropdownMenuItem>GitHub</DropdownMenuItem>
				<DropdownMenuItem disabled>API</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant='destructive'
					onClick={async e => {
						e.preventDefault();

						setIsLogOutLoading(true);

						const res = await handleLogout();

						if (res.success) {
							toast.success('Logged out successfully');
						} else {
							toast.error(res.error || 'Failed to log out');
						}
						setIsLogOutLoading(false);
					}}
					disabled={logoutLoading}
					className='relative'>
					Log out
					<Loader2
						className={cn('absolute top-1/2 -translate-y-1/2 right-2 animate-spin', {
							hidden: !logoutLoading,
						})}></Loader2>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { UserMenu };
