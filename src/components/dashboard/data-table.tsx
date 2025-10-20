'use client';

import * as React from 'react';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

export const schema = z.object({
	id: z.string(),
	name: z.string(),
	customer: z.string(), //? populate from user collection?
	shopProducts: z.number().optional(),
	customPrints: z.number().optional(),
	total: z.number(),
	queue: z.number(),
	statuses: z.array(
		z.object({
			stage: z.enum(['in-queue', 'printing', 'packaging', 'shipped', 'cancelled']),
			timestamp: z.string(),
		}),
	),
	currentStatus: z.enum(['in-queue', 'printing', 'packaging', 'shipped', 'cancelled']),
	comments: z.number().optional(),
	createdAt: z.string(),
});

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

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
		cell: ({ row }) => row.original.customer,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge variant='outline' className='text-muted-foreground px-1.5'>
				{row.original.currentStatus}
			</Badge>
		),
	},
	{
		accessorKey: 'shop-prints',
		header: () => <div className='w-full'>Shop Prints</div>,
		cell: ({ row }) => row.original.shopProducts || 0,
	},
	{
		accessorKey: 'custom-prints',
		header: () => <div className='w-full'>Custom Prints</div>,
		cell: ({ row }) => row.original.customPrints || 0,
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
	{
		id: 'actions',
		cell: () => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='data-[state=open]:bg-muted text-muted-foreground flex size-8' size='icon'>
						<IconDotsVertical />
						<span className='sr-only'>Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-32'>
					<DropdownMenuItem>Edit</DropdownMenuItem>
					<DropdownMenuItem>Make a copy</DropdownMenuItem>
					<DropdownMenuItem>Favorite</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
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

export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

	const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

	const table = useReactTable({
		data,
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

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData(data => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	return (
		<Tabs defaultValue='in-queue' className='w-full flex-col justify-start gap-6'>
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
					<TabsTrigger value='in-queue'>In Queue</TabsTrigger>
					<TabsTrigger value='printing'>
						Printing <Badge variant='secondary'>3</Badge>
					</TabsTrigger>
					<TabsTrigger value='packaging'>
						Packaging <Badge variant='secondary'>2</Badge>
					</TabsTrigger>
					<TabsTrigger value='shipped'>Shipped</TabsTrigger>
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
			<TabsContent value='in-queue' className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'>
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
								}}>
								<SelectTrigger size='sm' className='w-20' id='rows-per-page'>
									<SelectValue placeholder={table.getState().pagination.pageSize} />
								</SelectTrigger>
								<SelectContent side='top'>
									{[10, 20, 30, 40, 50].map(pageSize => (
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
			<TabsContent value='past-performance' className='flex flex-col px-4 lg:px-6'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
			</TabsContent>
			<TabsContent value='key-personnel' className='flex flex-col px-4 lg:px-6'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
			</TabsContent>
			<TabsContent value='focus-documents' className='flex flex-col px-4 lg:px-6'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed'></div>
			</TabsContent>
		</Tabs>
	);
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
	const isMobile = useIsMobile();
	const [currentStatus, setCurrentStatus] = React.useState(item.currentStatus);
	const [statusHistory, setStatusHistory] = React.useState(item.statuses);

	const statusList = statusSteps.map(step => step.value);

	const handleStatusUpdate = (newStatus: string) => {
		setCurrentStatus(newStatus as z.infer<typeof schema>['currentStatus']);

		setStatusHistory(prev => {
			const newIndex = statusList.indexOf(newStatus);
			const now = new Date().toISOString();

			const previousStatuses = prev.filter(item => {
				const itemIndex = statusList.indexOf(item.stage);
				return itemIndex < newIndex;
			});

			return [...previousStatuses, { stage: newStatus as z.infer<typeof schema>['currentStatus'], timestamp: now }];
		});

		// toast.success(`Order status updated to ${newStatus}`);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get('name'),
			status: currentStatus,
		};
		console.log('Form data submitted:', data);
		toast.success('Order updated successfully');
	};

	return (
		<Drawer direction={isMobile ? 'bottom' : 'right'}>
			<DrawerTrigger asChild>
				<Button variant='link' className='text-foreground w-fit px-0 text-left'>
					{item.name}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className='gap-1'>
					<DrawerTitle>{item.name}</DrawerTitle>
					<DrawerDescription>View order details and edit the status</DrawerDescription>
				</DrawerHeader>
				<form onSubmit={handleSubmit} id='order-form'>
					<div className='flex flex-col gap-4 overflow-y-auto px-4 text-sm'>
						<div className='flex flex-col gap-3'>
							<Label htmlFor='name'>Name</Label>
							<Input id='name' name='name' defaultValue={item.name} />
						</div>
						<div className='flex flex-col gap-3'>
							<Label>Order Status</Label>
							<div className='border rounded-md p-4'>
								<StatusTimeline
									currentStatus={currentStatus}
									statusHistory={statusHistory}
									onUpdateStatus={handleStatusUpdate}
								/>
							</div>
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
