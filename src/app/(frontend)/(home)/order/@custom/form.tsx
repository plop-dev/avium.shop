'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customOrderFormSchema } from '@/schemas/customOrderForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImagePlus, Loader2, PlusCircle, Printer, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { cn } from '@/lib/utils';
import { Input as NumberInput } from '@/components/ui/number-input';
import { useImageUpload } from '@/hooks/use-image-upload';

type CustomOrderFormValues = z.infer<typeof customOrderFormSchema>;

const defaultPrintItem = {
	file: undefined as unknown as File,
	quantity: 1,
	printingOptions: {
		infill: 10,
	},
};

const mockPresets = [
	{ id: 'preset-1', name: 'Standard Quality', description: 'A balance of speed and detail.' },
	{ id: 'preset-2', name: 'High Detail', description: 'For intricate models requiring high precision.' },
	{ id: 'preset-3', name: 'Fast Draft', description: 'Quick prints for prototyping.' },
];

function PresetSelection({ onChange, value }: { onChange: (value?: string) => void; value?: string }) {
	return (
		<div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
			{mockPresets.map(preset => (
				<Card
					key={preset.id}
					onClick={() => onChange(value === preset.id ? undefined : preset.id)}
					className={cn(
						'cursor-pointer transition-all hover:border-primary/50 gap-0 py-2',
						value === preset.id && 'border-primary ring-1 ring-primary/50',
					)}>
					<CardHeader className='p-2 pb-0'>
						<CardTitle className='text-sm'>{preset.name}</CardTitle>
					</CardHeader>
					<CardContent className='p-2 pt-0'>
						<p className='text-xs text-muted-foreground'>{preset.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function PrintItemCard({ index, remove }: { index: number; remove: (index: number) => void }) {
	const { previewUrl, fileName, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload({
		onUpload: (url: string) => console.log('Uploaded image URL:', url),
	});

	const [isDragging, setIsDragging] = useState(false);

	const { control, getValues } = useFormContext<CustomOrderFormValues>();
	const presetValue = useWatch({
		control,
		name: `prints.${index}.printingOptions.preset`,
	});
	const fields = getValues().prints;

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const file = e.dataTransfer.files?.[0];
			if (file && file.type.startsWith('image/')) {
				const fakeEvent = {
					target: {
						files: [file],
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				handleFileChange(fakeEvent);
			}
		},
		[handleFileChange],
	);

	return (
		<div className='relative bg-background p-4 rounded-lg border-2 space-y-3'>
			<div className='flex items-center gap-2'>
				<Printer className='h-5 w-5 text-primary' />
				<h3 className='text-lg font-medium'>Print #{index + 1}</h3>
			</div>

			<FormField
				control={control}
				name={`prints.${index}.file`}
				render={({ field: { onChange, value, ...rest } }) => (
					<FormItem>
						<FormLabel>3D Model File</FormLabel>
						<FormControl>
							<div className='relative'>
								<div className='w-full space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm'>
									<div className=''>
										<h3 className='text-base font-medium'>Image Upload</h3>
										<p className='text-sm text-muted-foreground'>Supported formats: STL, 3MF, OBJ</p>
									</div>

									<Input
										type='file'
										accept='.stl,.3mf,.obj'
										className='hidden'
										ref={fileInputRef}
										onChange={handleFileChange}
									/>

									{!previewUrl ? (
										<div
											onClick={handleThumbnailClick}
											onDragOver={handleDragOver}
											onDragEnter={handleDragEnter}
											onDragLeave={handleDragLeave}
											onDrop={handleDrop}
											className={cn(
												'flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted',
												isDragging && 'border-primary/50 bg-primary/5',
											)}>
											<div className='rounded-full bg-background p-2 shadow-sm'>
												<ImagePlus className='h-5 w-5 text-muted-foreground' />
											</div>
											<div className='text-center'>
												<p className='text-sm font-medium'>Click to select or drag and drop</p>
											</div>
										</div>
									) : (
										<div className='relative'>
											<div className='group relative h-28 overflow-hidden rounded-lg border'>
												<h1 className='absolute top-1/2 left-1/2 -translate-1/2 opacity-50 thicc-text text-4xl'>
													{fileName?.split('.')[fileName?.split('.').length - 1].toUpperCase()}
												</h1>
												<div className='absolute inset-0 bg-foreground/10 opacity-0 transition-opacity group-hover:opacity-50' />
											</div>
											{fileName && (
												<div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
													<span className='truncate'>{fileName}</span>
													<button onClick={handleRemove} className='ml-auto rounded-full p-1 hover:bg-muted'>
														<X className='h-4 w-4' />
													</button>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`prints.${index}.quantity`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Quantity</FormLabel>
						<FormControl>
							{/* <Input type='number' {...field}></Input> */}
							<NumberInput min={1} max={10000} {...field}></NumberInput>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className='mt-2'>
				<h4 className='text-sm font-medium mb-2'>Printing Options</h4>
				<div className='bg-text rounded-md p-3 border'>
					<FormField
						control={control}
						name={`prints.${index}.printingOptions.preset`}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Preset</FormLabel>
								<FormControl>
									<PresetSelection onChange={field.onChange} value={field.value} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{!presetValue && (
						<>
							<div className='relative my-3'>
								<div className='absolute inset-0 flex items-center'>
									<span className='w-full border-t' />
								</div>
								<div className='relative flex justify-center text-xs'>
									<span className='bg-background px-2 text-muted-foreground'>OR</span>
								</div>
							</div>

							<FormField
								control={control}
								name={`prints.${index}.printingOptions.layerHeight`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Custom Layer Height (mm)</FormLabel>
										<FormControl>
											<Input type='number' step='0.01' placeholder='e.g., 0.2' {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}

					<div className='grid grid-cols-2 gap-4 mt-3'>
						<FormField
							control={control}
							name={`prints.${index}.printingOptions.infill`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Infill %</FormLabel>
									<FormControl>
										<NumberInput {...field}></NumberInput>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
			</div>

			{fields.length > 1 && (
				<Button type='button' variant='destructive' size='icon' className='absolute top-3 right-3' onClick={() => remove(index)}>
					<Trash2 className='h-4 w-4' />
				</Button>
			)}
		</div>
	);
}

export default function CustomPrintForm() {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CustomOrderFormValues>({
		resolver: zodResolver(customOrderFormSchema) as Resolver<CustomOrderFormValues>,
		mode: 'onSubmit',
		defaultValues: {
			name: '',
			prints: [],
			comments: '',
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'prints',
	});

	useEffect(() => {
		if (fields.length === 0) {
			append(defaultPrintItem, { shouldFocus: false });
		}
	}, [append, fields.length]);

	async function onSubmit(data: CustomOrderFormValues) {
		setIsLoading(true);
		console.log(data);
		toast.info('Form data logged to console. No backend interaction is implemented.');
		// NOTE: No backend/Payload interaction as per instructions.
		// In a real scenario, you would probably upload files and then submit the form data.
		setTimeout(() => {
			setIsLoading(false);
			toast.success('Form submitted successfully (simulated).');
		}, 1000);
	}

	return (
		<div className='flex flex-col items-center justify-center'>
			<div className='w-full space-y-4'>
				{/* <div className='flex flex-col items-center text-center'>
					<div className='bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full mb-4'>
						<Printer className='h-5 w-5' />
					</div>
					<h1 className='text-3xl font-bold'>Custom Print Order</h1>
					<p className='text-muted-foreground mt-2'>Submit your 3D models for custom printing</p>
				</div> */}

				<Card className='py-0'>
					<CardContent className='p-4 pt-4 space-y-4'>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
								<div className='space-y-3'>
									<FormField
										control={form.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Order Name</FormLabel>
												<FormControl>
													<Input placeholder='e.g., My Custom Parts' {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div>
									<Separator className='my-3' />
									<div className='flex justify-between items-center mb-3'>
										<h2 className='text-xl font-semibold'>Print Details</h2>
									</div>

									<div className='space-y-3'>
										{fields.map((field, index) => (
											<PrintItemCard key={field.id} index={index} remove={remove} />
										))}

										<Button
											type='button'
											variant='outline'
											className='w-full mt-2 border-dashed'
											onClick={() => append(defaultPrintItem)}>
											<PlusCircle className='mr-2 h-4 w-4' />
											Add another print
										</Button>
									</div>
								</div>

								<div>
									<Separator className='my-3' />
									<div className='mb-3'>
										<h2 className='text-xl font-semibold'>Additional Information</h2>
									</div>

									<FormField
										control={form.control}
										name='comments'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Comments (optional)</FormLabel>
												<FormControl>
													<Textarea
														placeholder='Any special instructions for your order?'
														className='min-h-[100px]'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Button type='submit' className='w-full' disabled={isLoading}>
									<LoadingSwap isLoading={isLoading}>Submit for Quote</LoadingSwap>
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
