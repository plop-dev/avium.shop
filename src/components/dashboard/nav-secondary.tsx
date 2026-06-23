'use client';

import * as React from 'react';
import { type Icon } from '@tabler/icons-react';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarData } from './app-sidebar';
import { useStore } from '@nanostores/react';
import { $serverStatus } from '@/stores/serverStatus';

export type ServerData = {
	isOnline: boolean;
	lastHeartbeat?: string;
	ramUsage?: number;
	cpuUsage?: number;
	error?: string;
};

export function NavSecondary({
	items,
	...props
}: {
	items: SidebarData['navSecondary'];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const serverData = useStore($serverStatus);

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{serverData && (
						<SidebarMenuItem className='rounded-xl border-3 border-muted p-2 flex flex-col gap-1'>
							<h5>Server Status</h5>
							<p className='text-xs text-muted-foreground'>Refreshes every 30 seconds</p>
							<span className='flex items-center gap-2 mt-2'>
								{serverData.isOnline ? (
									<>
										Online
										<div className='w-[10px] aspect-square rounded-full bg-green-500 relative'>
											<div className='w-[10px] aspect-square rounded-full bg-green-500 animate-ping absolute left-1/2 top-1/2 -translate-1/2'></div>
										</div>
									</>
								) : (
									<>
										Offline
										<div className='w-[10px] aspect-square rounded-full bg-muted-foreground/50 relative'></div>
									</>
								)}
							</span>

							<span>
								Last Heartbeat:{' '}
								{serverData.lastHeartbeat ? new Date(serverData.lastHeartbeat).toLocaleTimeString() : 'Non received'}
							</span>

							<span>RAM Usage: {serverData.ramUsage ?? 'N/A'}%</span>
							<span>CPU Usage: {serverData.cpuUsage ?? 'N/A'}%</span>

							{serverData.error && <span className='text-destructive mt-4'>{serverData.error}</span>}
						</SidebarMenuItem>
					)}

					{items?.map(item => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild>
								<a href={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
