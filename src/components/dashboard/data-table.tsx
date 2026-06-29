'use client';

import * as React from 'react';
import { stringify } from 'qs-esm';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	Over,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleCheckFilled,
	IconDotsVertical,
	IconGripVertical,
	IconLayoutColumns,
	IconLoader,
	IconPlus,
	IconTrendingUp,
	IconPrinter,
} from '@tabler/icons-react';
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	Row,
	RowData,
	SortingState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { z } from 'zod';
import { cn } from '@/lib/utils';

import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { Check, User, Download, Package } from 'lucide-react';
import numToGBP from '@/utils/numToGBP';
import { Textarea } from '../ui/textarea';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { Where } from 'payload';
import { orderSchema } from '@/schemas';

// server actions

export type ZodOrder = z.infer<typeof orderSchema>;

// Define the status order and metadata
const statusSteps = [
	{ value: 'in-queue', label: 'In Queue', icon: <IconLoader className='size-4' /> },
	{ value: 'printing', label: 'Printing', icon: <IconPrinter className='size-4' /> },
	{ value: 'packaging', label: 'Packaging', icon: <IconPlus className='size-4' /> },
	{ value: 'shipped', label: 'Shipped', icon: <IconCircleCheckFilled className='size-4' /> },
];

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
	const { attributes, listeners } = useSortable({
		id,
	});

	return (
		<Button
			{...attributes}
			{...listeners}
			variant='ghost'
			size='icon'
			className='text-muted-foreground size-6 min-h-0 min-w-0 hover:bg-transparent'>
			<IconGripVertical className='text-muted-foreground size-3' />
			<span className='sr-only'>Drag to reorder</span>
		</Button>
	);
}

declare module '@tanstack/react-table' {
	interface ColumnMeta<TData extends RowData, TValue> {
		headerClassName?: string;
		cellClassName?: string;
	}
}

const columns: ColumnDef<ZodOrder>[] = [
	{
		id: 'order',
		header: () => <div className='w-6 text-right text-xs font-medium text-muted-foreground'>#</div>,
		cell: ({ row }) => <div className='w-6 text-right text-xs text-muted-foreground'>{row.index + 1}</div>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'drag',
		header: () => <span className='sr-only'>Reorder</span>,
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<DragHandle id={row.original.id} />
			</div>
		),
		meta: {
			headerClassName: 'w-8 px-0',
			cellClassName: 'w-8 px-0',
		},
	},
	// {
	// 	id: 'select',
	// 	header: ({ table }) => (
	// 		<div className='flex items-center justify-center'>
	// 			<Checkbox
	// 				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
	// 				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
	// 				aria-label='Select all'
	// 			/>
	// 		</div>
	// 	),
	// 	cell: ({ row }) => (
	// 		<div className='flex items-center justify-center'>
	// 			<Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label='Select row' />
	// 		</div>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false,
	// },
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return <TableCellViewer item={row.original} />;
		},
		enableHiding: false,
	},
	{
		accessorKey: 'customer',
		header: 'Customer',
		cell: ({ row }) => (typeof row.original.customer === 'string' ? row.original.customer : row.original.customer.name),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge variant='outline' className='text-muted-foreground px-1.5'>
				{row.original.status.currentStatus}
			</Badge>
		),
	},
	{
		accessorKey: 'shop-prints',
		header: () => <div className='w-full'>Shop Prints</div>,
		cell: ({ row }) => row.original.prints.filter(p => p.blockType === 'shopProduct') || 0,
	},
	{
		accessorKey: 'custom-prints',
		header: () => <div className='w-full'>Custom Prints</div>,
		cell: ({ row }) => row.original.prints.filter(p => p.blockType === 'customPrint') || 0,
	},
	{
		accessorKey: 'created-at',
		header: () => <div className='w-full'>Created At</div>,
		cell: ({ row }) => (
			<Popover>
				<PopoverTrigger asChild>
					<Button variant='link' className='px-0 flex'>
						{format(new Date(row.original.createdAt), 'PPp')} (
						{Math.floor((Date.now() - new Date(row.original.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago)
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0'>
					<Calendar
						mode='single'
						selected={new Date(row.original.createdAt)}
						disabled
						className='**:[td[role="gridcell"]]:!text-foreground **:!opacity-100'
					/>
				</PopoverContent>
			</Popover>
		),
	},
	// {
	// 	id: 'actions',
	// 	cell: () => (
	// 		<DropdownMenu>
	// 			<DropdownMenuTrigger asChild>
	// 				<Button variant='ghost' className='data-[state=open]:bg-muted text-muted-foreground flex size-8' size='icon'>
	// 					<IconDotsVertical />
	// 					<span className='sr-only'>Open menu</span>
	// 				</Button>
	// 			</DropdownMenuTrigger>
	// 			<DropdownMenuContent align='end' className='w-32'>
	// 				<DropdownMenuItem>Edit</DropdownMenuItem>
	// 				<DropdownMenuItem>Make a copy</DropdownMenuItem>
	// 				<DropdownMenuItem>Favorite</DropdownMenuItem>
	// 				<DropdownMenuSeparator />
	// 				<DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
	// 			</DropdownMenuContent>
	// 		</DropdownMenu>
	// 	),
	// },
];

function DraggableRow({ row }: { row: Row<ZodOrder> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && 'selected'}
			data-dragging={isDragging}
			ref={setNodeRef}
			className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}>
			{row.getVisibleCells().map(cell => (
				<TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

export function DataTable({ data: initialData, limit, page }: { data: ZodOrder[]; limit: number; page: number }) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [selectedRowsPerPage, setSelectedRowsPerPage] = useQueryState(
		'limit',
		parseAsInteger.withDefault(10).withOptions({ shallow: false }),
	);
	const [selectedPage, setSelectedPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow: false }));

	const [pagination, setPagination] = React.useState({
		pageIndex: page - 1,
		pageSize: limit,
	});
	const sortableId = React.useId();
	const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

	const sortedData = React.useMemo(() => {
		return data.reduce<Record<string, ZodOrder[]>>((acc, status) => {
			(acc[status.status.currentStatus] ??= []).push(status);
			return acc;
		}, {});
	}, [data]);

	const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

	useEffect(() => {
		setSelectedRowsPerPage(pagination.pageSize);
		setSelectedPage(pagination.pageIndex + 1);
	}, [pagination]);

	const [currentTab, setCurrentTab] = React.useState('in-queue');

	const tableData = React.useMemo(() => (currentTab ? sortedData[currentTab] || [] : data), [currentTab, data, sortedData]);

	const table = useReactTable({
		data: tableData,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: row => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const dragQueueRef = React.useRef<Array<{ data: ZodOrder; newPriority: number; over: Over }>>([]);
	const isProcessingRef = React.useRef(false);

	const processDragQueue = async () => {
		if (isProcessingRef.current || dragQueueRef.current.length === 0) return;

		isProcessingRef.current = true;

		while (dragQueueRef.current.length > 0) {
			const { data: queueItem, newPriority, over } = dragQueueRef.current.shift()!;

			const where: Where = {
				id: {
					equals: queueItem.id,
				},
			};
			const stringifiedQuery = stringify(
				{
					where,
				},
				{ addQueryPrefix: true },
			);

			try {
				const res = await fetch(`/api/orders${stringifiedQuery}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						queue: newPriority,
					}),
				});

				if (!res.ok) {
					toast.error('Failed to update order priority.');
					dragQueueRef.current.unshift({ data: queueItem, newPriority, over }); // return back to original queue

					arrayMove(data, dataIds.indexOf(over.id), dataIds.indexOf(queueItem.id));
					break;
				}

				toast.success('Order priority updated.');
			} catch (error) {
				console.error('Error updating order:', error);
				toast.error('Failed to update order priority.');
				dragQueueRef.current.unshift({ data: queueItem, newPriority, over }); // return back to original queue
				break;
			}
		}

		isProcessingRef.current = false;
	};

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			const locations = dataIds.indexOf(over.id as string);
			let previous = null;
			let next = null;

			const currentItem = data.find(item => item.id === active.id);

			if (locations + 1 === dataIds.length) next = over.id;
			else {
				previous = over.id;
				next = dataIds[locations - 1] || null;
			}

			const newPriority = !next
				? !previous
					? data[data.length - 1].queue - 1
					: data[0].queue + 1
				: ((data.find(item => item.id === previous)?.queue || 0) + (data.find(item => item.id === next)?.queue || 0)) / 2;

			// dragQueueRef.current.push({ id: active.id as string, newPriority });
			if (currentItem) dragQueueRef.current.push({ data: currentItem, newPriority, over });
			processDragQueue();

			setData(data => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	return (
		<Tabs defaultValue='in-queue' className='w-full flex-col justify-start gap-6' onValueChange={value => setCurrentTab(value)}>
			<div className='flex items-center justify-between px-4 lg:px-6'>
				<Label htmlFor='view-selector' className='sr-only'>
					View
				</Label>
				<Select defaultValue='in-queue'>
					<SelectTrigger className='flex w-fit @4xl/main:hidden' size='sm' id='view-selector'>
						<SelectValue placeholder='Select a view' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='in-queue'>In Queue</SelectItem>
						<SelectItem value='printing'>Printing</SelectItem>
						<SelectItem value='packaging'>Packaging</SelectItem>
						<SelectItem value='shipped'>Shipped</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className='**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex'>
					<TabsTrigger value='in-queue'>
						In Queue <Badge variant='secondary'>{sortedData['in-queue'] ? sortedData['in-queue'].length : 0}</Badge>
					</TabsTrigger>
					<TabsTrigger value='printing'>
						Printing <Badge variant='secondary'>{sortedData['printing'] ? sortedData['printing'].length : 0}</Badge>
					</TabsTrigger>
					<TabsTrigger value='packaging'>
						Packaging <Badge variant='secondary'>{sortedData['packaging'] ? sortedData['packaging'].length : 0}</Badge>
					</TabsTrigger>
					<TabsTrigger value='shipped'>
						Shipped <Badge variant='secondary'>{sortedData['shipped'] ? sortedData['shipped'].length : 0}</Badge>
					</TabsTrigger>
				</TabsList>
				<div className='flex items-center gap-2'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' size='sm'>
								<IconLayoutColumns />
								<span className='hidden lg:inline'>Customise Columns</span>
								<span className='lg:hidden'>Columns</span>
								<IconChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56'>
							{table
								.getAllColumns()
								.filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
								.map(column => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='capitalize'
											checked={column.getIsVisible()}
											onCheckedChange={value => column.toggleVisibility(!!value)}>
											{column.id.replace('-', ' ')}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			{Object.keys(sortedData).map(status => (
				<TabsContent value={status} key={status} className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'>
					<div className='overflow-hidden rounded-lg border'>
						<DndContext
							collisionDetection={closestCenter}
							modifiers={[restrictToVerticalAxis]}
							onDragEnd={handleDragEnd}
							sensors={sensors}
							id={sortableId}>
							<Table>
								<TableHeader className='bg-muted sticky top-0 z-10'>
									{table.getHeaderGroups().map(headerGroup => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map(header => {
												return (
													<TableHead
														key={header.id}
														colSpan={header.colSpan}
														className={header.column.columnDef.meta?.headerClassName}>
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody className='**:data-[slot=table-cell]:first:w-8 **:data-[slot=table-cell]:first:text-right'>
									{table.getRowModel().rows?.length ? (
										<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
											{table.getRowModel().rows.map(row => (
												<DraggableRow key={row.id} row={row} />
											))}
										</SortableContext>
									) : (
										<TableRow>
											<TableCell colSpan={columns.length} className='h-24 text-center'>
												No results.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</DndContext>
					</div>
					<div className='flex items-center justify-end px-4'>
						{/* <div className='text-muted-foreground hidden flex-1 text-sm lg:flex'>
						{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
					</div> */}
						<div className='flex w-full items-center gap-8 lg:w-fit'>
							<div className='hidden items-center gap-2 lg:flex'>
								<Label htmlFor='rows-per-page' className='text-sm font-medium'>
									Rows per page
								</Label>
								<Select
									value={`${table.getState().pagination.pageSize}`}
									onValueChange={value => {
										table.setPageSize(Number(value));
										setSelectedRowsPerPage(Number(value));
									}}>
									<SelectTrigger size='sm' className='w-20' id='rows-per-page'>
										<SelectValue placeholder={table.getState().pagination.pageSize} />
									</SelectTrigger>
									<SelectContent side='top'>
										{[5, 10, 20, 30, 40, 50].map(pageSize => (
											<SelectItem key={pageSize} value={`${pageSize}`}>
												{pageSize}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='flex w-fit items-center justify-center text-sm font-medium'>
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</div>
							<div className='ml-auto flex items-center gap-2 lg:ml-0'>
								<Button
									variant='outline'
									className='hidden h-8 w-8 p-0 lg:flex'
									onClick={() => table.setPageIndex(0)}
									disabled={!table.getCanPreviousPage()}>
									<span className='sr-only'>Go to first page</span>
									<IconChevronsLeft />
								</Button>
								<Button
									variant='outline'
									className='size-8'
									size='icon'
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}>
									<span className='sr-only'>Go to previous page</span>
									<IconChevronLeft />
								</Button>
								<Button
									variant='outline'
									className='size-8'
									size='icon'
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}>
									<span className='sr-only'>Go to next page</span>
									<IconChevronRight />
								</Button>
								<Button
									variant='outline'
									className='hidden size-8 lg:flex'
									size='icon'
									onClick={() => table.setPageIndex(table.getPageCount() - 1)}
									disabled={!table.getCanNextPage()}>
									<span className='sr-only'>Go to last page</span>
									<IconChevronsRight />
								</Button>
							</div>
						</div>
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}

function TableCellViewer({ item }: { item: ZodOrder }) {
	const customerIdValue = typeof item.customer === 'string' ? item.customer : item.customer.id;
	const customerNameValue = typeof item.customer === 'string' ? '' : item.customer.name;

	const isMobile = useIsMobile();
	const [currentStatus, setCurrentStatus] = React.useState(item.status.currentStatus);
	const [statusHistory, setStatusHistory] = React.useState(item.status.statuses);
	const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
	const [orderName, setOrderName] = React.useState(item.name);
	const [customerId, setCustomerId] = React.useState(customerIdValue);
	const [customerName, setCustomerName] = React.useState(customerNameValue);
	const [comments, setComments] = React.useState(item.comments || '');
	const [payment, setPayment] = React.useState(item.payment);
	const [shipping, setShipping] = React.useState(item.shipping);
	const [shippingAddress, setShippingAddress] = React.useState(item.shippingAddress);
	const pricing = item.pricing;
	const queue = item.queue;
	const [prints, setPrints] = React.useState(item.prints || []);

	React.useEffect(() => {
		setCurrentStatus(item.status.currentStatus);
		setStatusHistory(item.status.statuses);
		setOrderName(item.name);
		setCustomerId(customerIdValue);
		setCustomerName(typeof item.customer === 'string' ? '' : item.customer.name);
		setComments(item.comments || '');
		setPayment(item.payment);
		setShipping(item.shipping);
		setShippingAddress(item.shippingAddress);
		setPrints(item.prints || []);
	}, [
		item.id,
		item.name,
		customerIdValue,
		customerNameValue,
		item.comments,
		item.status.currentStatus,
		item.status.statuses,
		item.payment,
		item.shipping,
		item.shippingAddress,
		item.prints,
	]);

	const statusList = statusSteps.map(step => step.value);

	const handleStatusUpdate = (newStatus: string) => {
		setCurrentStatus(newStatus as z.infer<typeof orderSchema>['status']['currentStatus']);

		setStatusHistory(prev => {
			const safePrev = prev ?? [];
			const newIndex = statusList.indexOf(newStatus);
			const now = new Date().toISOString();

	

			const previousStatuses = safePrev.filter(item => {
				const itemIndex = statusList.indexOf(item.stage);
				return itemIndex < newIndex;
			});

			return [...previousStatuses, { stage: newStatus as z.infer<typeof orderSchema>['status']['currentStatus'], timestamp: now }];
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const data = {
			name: orderName.trim(),
			customer: customerId || customerIdValue,
			status: {
				statuses: statusHistory,
				currentStatus: currentStatus,
			},
			prints: prints.map(print => ({ ...print })),
			comments,
			payment,
			shipping,
			shippingAddress,
		};

		const res = await fetch(`/api/orders/${item.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		});

		if (!res.ok) toast.error('Failed to update order.');
		else {
			toast.success('Order updated successfully');
			setIsDrawerOpen(false);
		}
	};

	const customPrints = prints.filter(p => p.blockType === 'customPrint') || [];
	const shopProducts = prints.filter(p => p.blockType === 'shopProduct') || [];

	const handleDownload = (url: string, filename: string) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Downloaded ${filename}`);
	};

	const handleProductDownload = (productId: string) => {
		const link = document.createElement('a');
		link.href = `${process.env.NEXT_PUBLIC_AVIUM_API_URL}/products/${productId}.stl`;
		link.download = productId;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Downloaded ${productId}`);
	};

	return (
		<Drawer direction={isMobile ? 'bottom' : 'right'} open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
			<DrawerTrigger asChild>
				<Button variant='link' className='text-foreground w-fit px-0 text-left'>
					{item.name}
				</Button>
			</DrawerTrigger>
			<DrawerContent className=''>
				<DrawerHeader className='gap-1'>
					<DrawerTitle>
						{orderName}
						<p className='text-sm text-muted-foreground'>{item.id}</p>
					</DrawerTitle>
					<DrawerDescription>Review and update the full order record.</DrawerDescription>
				</DrawerHeader>
				<form onSubmit={handleSubmit} id='order-form' className='flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm'>
					<div className='flex flex-col gap-4'>
						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<Label htmlFor='order-name'>Order Name</Label>
								<Input id='order-name' value={orderName} onChange={e => setOrderName(e.target.value)} />
							</div>
							<div className='mt-3 grid gap-3 md:grid-cols-2'>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='customer-id'>Customer ID</Label>
									<Input id='customer-id' value={customerId} onChange={e => setCustomerId(e.target.value)} />
								</div>
								<div className='flex flex-col gap-2'>
									<Label htmlFor='customer-name'>Customer Name</Label>
									<Input id='customer-name' value={customerName} readOnly />
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<div className='flex items-center justify-between'>
									<Label className='text-base'>Order Status</Label>
									<Badge variant='secondary'>{currentStatus}</Badge>
								</div>
								<StatusTimeline
									currentStatus={currentStatus}
									statusHistory={statusHistory ?? []}
									onUpdateStatus={handleStatusUpdate}
								/>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex items-center justify-between'>
								<Label className='text-base'>Prints</Label>
								<div className='flex gap-2 text-xs text-muted-foreground'>
									<span>Custom: {customPrints.length}</span>
									<span>•</span>
									<span>Shop: {shopProducts.length}</span>
								</div>
							</div>

							<div className='mt-3 flex flex-col gap-4'>
								<Accordion type='multiple'>
									{customPrints.length > 0 && (
										<div className='flex flex-col gap-2'>
											<AccordionItem value='custom-prints-details'>
												<AccordionTrigger>
													<h4 className='text-sm font-semibold text-muted-foreground'>
														Custom Prints
														<Badge
															variant='secondary'
															className='ml-2 bg-muted-foreground/30 size-5 rounded-full px-1'>
															{customPrints.length}
														</Badge>
													</h4>
												</AccordionTrigger>
												<AccordionContent>
													<div className='flex flex-col gap-3'>
														{customPrints.map((print, index) => {
															if (print.blockType !== 'customPrint') return null;
															return (
																<Card key={print.id}>
																	<CardHeader className='pb-3'>
																		<div className='flex items-start justify-between'>
																			<div className='space-y-1 flex-1'>
																				<CardTitle className='text-sm font-medium'>
																					{print.model.filename}
																				</CardTitle>
																				<CardDescription className='text-xs'>
																					Custom Print #{index + 1}
																				</CardDescription>
																			</div>
																			<Badge variant='secondary'>{numToGBP(print.price)}</Badge>
																		</div>
																	</CardHeader>
																	<CardContent className='flex flex-col gap-y-3 pt-0'>
																		<div className='grid gap-3 md:grid-cols-2'>
																			<div className='flex flex-col gap-2'>
																				<Label>Filename</Label>
																				<Input
																					value={print.model.filename}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											model: {
																												...item.model,
																												filename: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>File Type</Label>
																				<Select
																					value={print.model.filetype}
																					onValueChange={value =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											model: {
																												...item.model,
																												filetype: value as
																													| 'stl'
																													| '3mf',
																											},
																										}
																									: item,
																							),
																						)
																					}>
																					<SelectTrigger>
																						<SelectValue />
																					</SelectTrigger>
																					<SelectContent>
																						<SelectItem value='stl'>STL</SelectItem>
																						<SelectItem value='3mf'>3MF</SelectItem>
																					</SelectContent>
																				</Select>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Model URL</Label>
																				<Input
																					value={print.model.modelUrl}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											model: {
																												...item.model,
																												modelUrl: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>G-code URL</Label>
																				<Input
																					value={print.model.gcodeUrl}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											model: {
																												...item.model,
																												gcodeUrl: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																		</div>

																		<div className='grid gap-3 md:grid-cols-2'>
																			<div className='flex flex-col gap-2'>
																				<Label>Preset</Label>
																				<Input
																					value={typeof print.printingOptions.preset === 'string' ? print.printingOptions.preset : ''}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											printingOptions: {
																												...item.printingOptions,
																												preset: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Layer Height</Label>
																				<Input
																					type='number'
																					value={print.printingOptions.layerHeight ?? ''}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											printingOptions: {
																												...item.printingOptions,
																												layerHeight: Number(
																													e.target.value,
																												),
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Infill %</Label>
																				<Input
																					type='number'
																					value={print.printingOptions.infill ?? ''}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											printingOptions: {
																												...item.printingOptions,
																												infill: Number(
																													e.target.value,
																												),
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Material</Label>
																				<Input
																					value={print.printingOptions.plastic}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											printingOptions: {
																												...item.printingOptions,
																												plastic: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Colour</Label>
																				<Input
																					value={print.printingOptions.colour}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											printingOptions: {
																												...item.printingOptions,
																												colour: e.target.value,
																											},
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Estimated Time</Label>
																				<Input
																					value={print.time || ''}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											time:
																												e.target.value || undefined,
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Filament (g)</Label>
																				<Input
																					type='number'
																					value={print.filament ?? ''}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id &&
																								item.blockType === 'customPrint'
																									? {
																											...item,
																											filament:
																												Number(e.target.value) ||
																												undefined,
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Quantity</Label>
																				<Input
																					type='number'
																					value={print.quantity}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id
																									? {
																											...item,
																											quantity: Number(
																												e.target.value,
																											),
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Price</Label>
																				<Input type='number' value={print.price} readOnly />
																			</div>
																		</div>

																		<div className='grid grid-cols-2 gap-2'>
																			<Button
																				className='min-w-[50%-0.25rem]'
																				type='button'
																				variant='outline'
																				size='sm'
																				onClick={() =>
																					handleDownload(
																						print.model.modelUrl,
																						print.model.filename,
																					)
																				}>
																				<Download className='mr-2 size-3.5' />
																				STL
																			</Button>
																			<Button
																				className='min-w-[50%-0.25rem]'
																				type='button'
																				variant='outline'
																				size='sm'
																				onClick={() =>
																					handleDownload(
																						print.model.gcodeUrl,
																						print.model.filename.replace(
																							/\.(stl|3mf)$/i,
																							'.gcode',
																						),
																					)
																				}>
																				<Download className='mr-2 size-3.5' />
																				G-code
																			</Button>
																		</div>

																		<Toggle
																			variant='outline'
																			size='sm'
																			pressed={print.completed ?? undefined}
																			onPressedChange={value =>
																				setPrints(prev =>
																					prev.map(item =>
																						item.id === print.id
																							? { ...item, completed: value }
																							: item,
																					),
																				)
																			}
																			className='cursor-pointer justify-center data-[state=on]:border-green-600 data-[state=on]:bg-green-600/10 data-[state=on]:text-green-600 w-full transition-colors'>
																			<Check className='mr-2 size-4' />
																			Mark as Completed
																		</Toggle>
																	</CardContent>
																</Card>
															);
														})}
													</div>
												</AccordionContent>
											</AccordionItem>
										</div>
									)}

									{shopProducts.length > 0 && (
										<div className='flex flex-col gap-2'>
											<AccordionItem value='shop-products-details'>
												<AccordionTrigger>
													<h4 className='text-sm font-semibold text-muted-foreground'>
														Shop Products
														<Badge
															variant='secondary'
															className='ml-2 bg-muted-foreground/30 size-5 rounded-full px-1'>
															{shopProducts.length}
														</Badge>
													</h4>
												</AccordionTrigger>
												<AccordionContent>
													<div className='flex flex-col gap-3'>
														{shopProducts.map((print, index) => {
															if (print.blockType !== 'shopProduct') return null;
															return (
																<Card key={print.id}>
																	<CardHeader className='pb-3'>
																		<div className='flex items-start justify-between'>
																			<div className='space-y-1 flex-1'>
																				<CardTitle className='text-sm font-medium'>
																					{typeof print.product === 'string' ? print.product : print.product.id}
																				</CardTitle>
																				<CardDescription className='text-xs'>
																					Shop Product #{index + 1}
																				</CardDescription>
																			</div>
																			<Badge variant='secondary'>{numToGBP(print.price)}</Badge>
																		</div>
																	</CardHeader>
																	<CardContent className='space-y-3 pt-0'>
																		<div className='grid gap-3 md:grid-cols-2'>
																			<div className='flex flex-col gap-2'>
																				<Label>Product ID</Label>
																				<Input
																					value={typeof print.product === 'string' ? print.product : print.product.id}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id
																									? {
																											...item,
																											product: e.target.value,
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Quantity</Label>
																				<Input
																					type='number'
																					value={print.quantity}
																					onChange={e =>
																						setPrints(prev =>
																							prev.map(item =>
																								item.id === print.id
																									? {
																											...item,
																											quantity: Number(
																												e.target.value,
																											),
																										}
																									: item,
																							),
																						)
																					}
																				/>
																			</div>
																			<div className='flex flex-col gap-2'>
																				<Label>Price</Label>
																				<Input type='number' value={print.price} readOnly />
																			</div>
																		</div>
																		<Button
																			type='button'
																			variant='outline'
																			size='sm'
																			className='w-full'
																			onClick={() => handleProductDownload(print.id || '')}>
																			<Download className='mr-2 size-3.5' />
																			STL
																		</Button>
																		<Toggle
																			variant='outline'
																			size='sm'
																			pressed={print.completed ?? undefined}
																			onPressedChange={value =>
																				setPrints(prev =>
																					prev.map(item =>
																						item.id === print.id
																							? { ...item, completed: value }
																							: item,
																					),
																				)
																			}
																			className='cursor-pointer justify-center data-[state=on]:border-green-600 data-[state=on]:bg-green-600/10 data-[state=on]:text-green-600 w-full transition-colors'>
																			<Check className='mr-2 size-4' />
																			Mark as Completed
																		</Toggle>
																	</CardContent>
																</Card>
															);
														})}
													</div>
												</AccordionContent>
											</AccordionItem>
										</div>
									)}
								</Accordion>

								{customPrints.length === 0 && shopProducts.length === 0 && (
									<div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
										<Package className='mb-2 size-8 text-muted-foreground' />
										<p className='text-sm text-muted-foreground'>No prints in this order</p>
									</div>
								)}
							</div>
						</div>

						{/* <Button variant={'destructive'}>Cancel Order</Button> */}
						<Toggle
							variant='outline'
							size='sm'
							pressed={item.status.currentStatus === 'cancelled'}
							onPressedChange={value =>
								handleStatusUpdate(
									value
										? 'cancelled'
										: (statusHistory?.[statusHistory.length - 1]?.stage ?? item.status.currentStatus)
								)
							}
							className='cursor-pointer justify-center data-[state=on]:border-destructive data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive w-full transition-colors'>
							<Check className='mr-2 size-4' />
							Mark as Cancelled
						</Toggle>
					</div>

					<div className='flex flex-col gap-4'>
						<div className='rounded-xl border bg-card p-4'>
							<div className='grid gap-3 md:grid-cols-2'>
								<div className='flex flex-col gap-2'>
									<Label>Queue</Label>
									<Input value={queue} readOnly />
								</div>
								<div className='flex flex-col gap-2'>
									<Label>Price</Label>
									<Input value={numToGBP(item.pricing.subtotal || 0)} readOnly />
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<Label>Payment</Label>
								<div className='grid gap-3 md:grid-cols-2'>
									<div className='flex flex-col gap-2'>
										<Label>Provider</Label>
										<Input
											value={payment?.provider || ''}
											onChange={e => setPayment(prev => ({ ...prev, provider: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Status</Label>
										<Select
											value={payment?.status || 'awaiting-payment'}
											onValueChange={value =>
												setPayment(prev => ({
													...prev,
													status: value as NonNullable<typeof prev>['status'],
												}))
											}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='awaiting-payment'>Awaiting Payment</SelectItem>
												<SelectItem value='paid'>Paid</SelectItem>
												<SelectItem value='failed'>Failed</SelectItem>
												<SelectItem value='refunded'>Refunded</SelectItem>
												<SelectItem value='partially-refunded'>Partially Refunded</SelectItem>
												<SelectItem value='cancelled'>Cancelled</SelectItem>
												<SelectItem value='expired'>Expired</SelectItem>
												<SelectItem value='checkout-failed'>Checkout Failed</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Currency</Label>
										<Input
											value={payment?.currency || ''}
											onChange={e => setPayment(prev => ({ ...prev, currency: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Amount</Label>
										<Input
											type='number'
											value={payment?.amount ?? ''}
											onChange={e => setPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Stripe Customer ID</Label>
										<Input
											value={payment?.stripeCustomerId || ''}
											onChange={e => setPayment(prev => ({ ...prev, stripeCustomerId: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Checkout Session ID</Label>
										<Input
											value={payment?.stripeCheckoutSessionId || ''}
											onChange={e => setPayment(prev => ({ ...prev, stripeCheckoutSessionId: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Payment Intent ID</Label>
										<Input
											value={payment?.stripePaymentIntentId || ''}
											onChange={e => setPayment(prev => ({ ...prev, stripePaymentIntentId: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Receipt URL</Label>
										<Input
											value={payment?.receiptUrl || ''}
											onChange={e => setPayment(prev => ({ ...prev, receiptUrl: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Paid At</Label>
										<Input
											type='datetime-local'
											value={payment?.paidAt ? new Date(payment.paidAt).toISOString().slice(0, 16) : ''}
											onChange={e => setPayment(prev => ({ ...prev, paidAt: e.target.value }))}
										/>
									</div>
									<div className='flex items-center gap-2 pt-2'>
										<Checkbox
											checked={payment?.refunded || false}
											onCheckedChange={value => setPayment(prev => ({ ...prev, refunded: !!value }))}
										/>
										<Label>Refunded</Label>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Refunded Amount</Label>
										<Input
											type='number'
											value={payment?.refundedAmount ?? ''}
											onChange={e => setPayment(prev => ({ ...prev, refundedAmount: Number(e.target.value) }))}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<Label>Shipping</Label>
								<div className='grid gap-3 md:grid-cols-2'>
									<div className='flex flex-col gap-2'>
										<Label>Carrier</Label>
										<Input
											value={shipping?.carrier || ''}
											onChange={e => setShipping(prev => ({ ...prev, carrier: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Service</Label>
										<Input
											value={shipping?.service || ''}
											onChange={e => setShipping(prev => ({ ...prev, service: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Tracking Number</Label>
										<Input
											value={shipping?.trackingNumber || ''}
											onChange={e => setShipping(prev => ({ ...prev, trackingNumber: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Tracking URL</Label>
										<Input
											value={shipping?.trackingUrl || ''}
											onChange={e => setShipping(prev => ({ ...prev, trackingUrl: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Label URL</Label>
										<Input
											value={shipping?.labelUrl || ''}
											onChange={e => setShipping(prev => ({ ...prev, labelUrl: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Shipment ID</Label>
										<Input
											value={shipping?.shipmentId || ''}
											onChange={e => setShipping(prev => ({ ...prev, shipmentId: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Transaction ID</Label>
										<Input
											value={shipping?.transactionId || ''}
											onChange={e => setShipping(prev => ({ ...prev, transactionId: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Label Purchased At</Label>
										<Input
											type='datetime-local'
											value={
												shipping?.labelPurchasedAt
													? new Date(shipping.labelPurchasedAt).toISOString().slice(0, 16)
													: ''
											}
											onChange={e => setShipping(prev => ({ ...prev, labelPurchasedAt: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Shipped At</Label>
										<Input
											type='datetime-local'
											value={shipping?.shippedAt ? new Date(shipping.shippedAt).toISOString().slice(0, 16) : ''}
											onChange={e => setShipping(prev => ({ ...prev, shippedAt: e.target.value }))}
										/>
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Delivered At</Label>
										<Input
											type='datetime-local'
											value={shipping?.deliveredAt ? new Date(shipping.deliveredAt).toISOString().slice(0, 16) : ''}
											onChange={e => setShipping(prev => ({ ...prev, deliveredAt: e.target.value }))}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<Label>Pricing</Label>
								<div className='grid gap-3 md:grid-cols-2'>
									<div className='flex flex-col gap-2'>
										<Label>Subtotal</Label>
										<Input value={pricing?.subtotal ?? ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Shipping</Label>
										<Input value={pricing?.shipping ?? ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Tax</Label>
										<Input value={pricing?.tax ?? ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Total</Label>
										<Input value={pricing?.total ?? ''} readOnly />
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<div className='flex flex-col gap-3'>
								<Label>Shipping Address</Label>
								<div className='grid gap-3 md:grid-cols-2'>
									<div className='flex flex-col gap-2 md:col-span-2'>
										<Label>Full Name</Label>
										<Input value={shippingAddress?.fullName || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2 md:col-span-2'>
										<Label>Address Line 1</Label>
										<Input value={shippingAddress?.line1 || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2 md:col-span-2'>
										<Label>Address Line 2</Label>
										<Input value={shippingAddress?.line2 || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>City</Label>
										<Input value={shippingAddress?.city || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>County</Label>
										<Input value={shippingAddress?.county || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Postcode</Label>
										<Input value={shippingAddress?.postcode || ''} readOnly />
									</div>
									<div className='flex flex-col gap-2'>
										<Label>Country</Label>
										<Input value={shippingAddress?.country || ''} readOnly />
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-xl border bg-card p-4'>
							<Label htmlFor='comments'>Comments</Label>
							<Textarea
								id='comments'
								value={comments}
								onChange={e => setComments(e.target.value)}
								placeholder='Add comments to this order...'
								className='mt-2 min-h-[100px]'
							/>
						</div>
					</div>
				</form>
				<DrawerFooter>
					<Button type='submit' form='order-form'>
						Save Changes
					</Button>
					<DrawerClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function StatusTimeline({
	currentStatus,
	statusHistory = [],
	onUpdateStatus,
}: {
	currentStatus: string;
	statusHistory?: { stage: string; timestamp: string }[];
	onUpdateStatus: (newStatus: string) => void;
}) {
	const currentIndex = statusSteps.findIndex(step => step.value === currentStatus);

	const getStatusTimestamp = (status: string) => {
		const historyItem = statusHistory.find(item => item.stage === status);
		return historyItem?.timestamp;
	};

	return (
		<div className='flex flex-col space-y-1'>
			{statusSteps.map((step, index) => {
				const isCompleted = index < currentIndex;
				const isCurrent = index === currentIndex;
				const isFuture = index > currentIndex;
				const canAdvance = index === currentIndex + 1;
				const canRevert = index === currentIndex - 1;
				const canChange = canRevert || canAdvance;

				const timestamp = getStatusTimestamp(step.value);

				return (
					<div key={step.value} className='flex flex-col'>
						<div
							className={cn(
								'flex items-center gap-2 py-1.5 transition-opacity',
								canChange ? 'cursor-pointer hover:opacity-70' : 'cursor-default pointer-events-none',
							)}
							aria-disabled={!canChange}
							onClick={() => {
								if (canChange) {
									onUpdateStatus(step.value);
								}
							}}>
							<div
								className={cn(
									'flex size-8 items-center justify-center rounded-full border',
									isCompleted && 'bg-primary/20 border-primary text-primary',
									isCurrent && 'bg-primary text-primary-foreground border-primary',
									isFuture && 'bg-muted border-muted-foreground/30 text-muted-foreground',
								)}>
								{step.icon}
							</div>
							<div className='flex flex-col'>
								<span
									className={cn(
										'text-sm font-medium',
										isCompleted && 'text-primary',
										isCurrent && 'text-foreground',
										isFuture && 'text-muted-foreground',
									)}>
									{step.label}
								</span>
								{timestamp && (
									<span className='text-xs text-muted-foreground'>Set at {format(new Date(timestamp), 'PPp')}</span>
								)}
							</div>
						</div>

						{index < statusSteps.length - 1 && <div className='ml-4 h-6 w-px bg-border' />}
					</div>
				);
			})}
		</div>
	);
}
