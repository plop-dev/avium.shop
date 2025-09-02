'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customOrderFormSchema } from '@/schemas/customOrderForm';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FilePlus2, ImagePlus, Loader2, PlusCircle, Printer, Trash2, Upload, X, Palette, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { cn } from '@/lib/utils';
import { NumberInput } from '@/components/ui/number-input';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Preset, PrintingOption } from '@/payload-types';
import { Progress } from '@/components/ui/progress';
import { UploadedFileResponse, uploadFile } from './utils';
import { addCustomPrintToBasket, CustomPrint } from '@/stores/basket';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { $orderValidation, setOrderNameValid } from '@/stores/order';
import { useStore } from '@nanostores/react';

type CustomOrderFormValues = z.infer<typeof customOrderFormSchema>;

const defaultPrintItem = {
	file: undefined as unknown as File,
	quantity: 1,
	material: {
		plastic: '',
		color: '',
	},
	printingOptions: {
		infill: 10,
	},
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5mb

function PresetSelection({ onChange, value, presets }: { onChange: (value?: string) => void; value?: string; presets: Preset[] }) {
	return (
		<div className='grid grid-cols-1 gap-2 sm:grid-cols-3 p-[1px]'>
			{presets.map(preset => (
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

function MaterialSelection({ index, printingOptions }: { index: number; printingOptions: PrintingOption }) {
	const { control, setValue } = useFormContext<CustomOrderFormValues>();
	const selectedPlastic = useWatch({
		control,
		name: `prints.${index}.material.plastic`,
	});
	const selectedColor = useWatch({
		control,
		name: `prints.${index}.material.color`,
	});

	// Find the selected plastic block to get its colours
	const plasticBlock = printingOptions.plastic?.find(p => p.id === selectedPlastic);
	const availableColours = plasticBlock?.colours || [];

	// Reset colour when plastic changes
	useEffect(() => {
		if (selectedPlastic && selectedColor) {
			const isColorAvailable = availableColours.some(c => c.colour === selectedColor);
			if (!isColorAvailable) {
				setValue(`prints.${index}.material.color`, '', { shouldValidate: false });
			}
		}
	}, [selectedPlastic, selectedColor, availableColours, setValue, index]);

	return (
		<div className='space-y-6'>
			<FormField
				control={control}
				name={`prints.${index}.material.plastic`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Plastic Type</FormLabel>
						<FormControl>
							<div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 p-[1px]'>
								{printingOptions.plastic?.map(plastic => (
									<Card
										key={plastic.id}
										onClick={() => field.onChange(field.value === plastic.id ? '' : plastic.id)}
										className={cn(
											'cursor-pointer transition-all hover:border-primary/50 gap-0 py-2',
											field.value === plastic.id && 'border-primary ring-1 ring-primary/50',
										)}>
										<CardHeader className='p-3 pb-1'>
											<CardTitle className='text-sm'>{plastic.name}</CardTitle>
										</CardHeader>
										<CardContent className='p-3 pt-0'>
											{plastic.description && <p className='text-xs text-muted-foreground'>{plastic.description}</p>}
										</CardContent>
									</Card>
								))}
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`prints.${index}.material.color`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Color</FormLabel>
						<FormControl>
							{!selectedPlastic ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Palette className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>Select a plastic type first</p>
								</div>
							) : availableColours.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Palette className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>No colours available for this plastic</p>
								</div>
							) : (
								<div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 p-[1px]'>
									{availableColours.map(colour => (
										<Card
											key={colour.id}
											onClick={() => field.onChange(field.value === colour.colour ? '' : colour.colour)}
											className={cn(
												'cursor-pointer transition-all hover:border-primary/50 gap-0 p-0',
												field.value === colour.colour && 'border-primary ring-1 ring-primary/50',
											)}>
											<CardContent className='p-1 flex flex-col items-center gap-2'>
												<div
													className='w-8 h-8 rounded-full border-2 border-border shadow-sm'
													style={{ backgroundColor: colour.colour }}
												/>
												<span className='text-xs font-medium capitalize'>{colour.colour}</span>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}

function PrintItemCard({
	index,
	remove,
	presets,
	printingOptions,
}: {
	index: number;
	remove: (index: number) => void;
	presets: Preset[];
	printingOptions: PrintingOption;
}) {
	const [isDragging, setIsDragging] = useState(false);

	const {
		control,
		getValues,
		setValue,
		formState: { errors },
	} = useFormContext<CustomOrderFormValues>();
	const presetValue = useWatch({
		control,
		name: `prints.${index}.printingOptions.preset`,
	});
	const fileValue = useWatch({
		control,
		name: `prints.${index}.file`,
	});
	const fields = getValues().prints;

	// Check for errors in each section
	const fileErrors = errors.prints?.[index]?.file;
	const materialErrors = errors.prints?.[index]?.material;
	const settingsErrors = errors.prints?.[index]?.printingOptions || errors.prints?.[index]?.quantity;

	const {
		previewUrl,
		fileName,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange: originalHandleFileChange,
		handleRemove,
	} = useImageUpload({
		onUpload: (url: string) => console.log('Uploaded file URL:', url),
	});

	// Custom file change handler that updates both the hook and form state
	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setValue(`prints.${index}.file`, file, { shouldValidate: true });
			}
			originalHandleFileChange(e);
		},
		[originalHandleFileChange, setValue, index],
	);

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
			const allowedExtensions = ['.stl', '.3mf', '.obj'];
			const fileExtension = file?.name.toLowerCase().split('.').pop();

			if (file && fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
				setValue(`prints.${index}.file`, file, { shouldValidate: true });
				const fakeEvent = {
					target: {
						files: [file],
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				originalHandleFileChange(fakeEvent);
			}
		},
		[originalHandleFileChange, setValue, index],
	);

	// Get the display file (either from form state or image upload hook)
	const displayFile = fileValue || (fileName ? { name: fileName } : null);
	const hasFile = displayFile || previewUrl;

	return (
		<div className='relative bg-background p-4 rounded-lg border-2 space-y-4'>
			<div className='flex items-center gap-2'>
				<Printer className='h-5 w-5 text-primary' />
				<h3 className='text-lg font-medium'>Print #{index + 1}</h3>
				{fields.length > 1 && (
					<Button type='button' variant='destructive' size='sm' className='ml-auto' onClick={() => remove(index)}>
						<Trash2 className='h-4 w-4 mr-1' />
						Remove
					</Button>
				)}
			</div>

			<Accordion type='multiple' defaultValue={['file', 'material']} className='w-full'>
				<AccordionItem value='file'>
					<AccordionTrigger>
						<div className={cn('flex items-center gap-2', fileErrors && 'text-red-500')}>
							<Upload className='h-4 w-4' />
							3D Model File
						</div>
					</AccordionTrigger>
					<AccordionContent className='space-y-4'>
						<FormField
							control={control}
							name={`prints.${index}.file`}
							render={({ field: { onChange, value, ...rest } }) => (
								<FormItem>
									<FormControl>
										<div className='relative'>
											<div className='w-full space-y-2'>
												<p className='text-sm text-muted-foreground'>Supported formats: STL, 3MF, OBJ</p>

												<Input
													type='file'
													accept='.stl,.3mf,.obj'
													className='hidden'
													ref={fileInputRef}
													onChange={handleFileChange}
												/>

												{!hasFile ? (
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
															<FilePlus2 className='h-5 w-5 text-muted-foreground' />
														</div>
														<div className='text-center'>
															<p className='text-sm font-medium'>Click to select or drag and drop</p>
														</div>
													</div>
												) : (
													<div className='relative'>
														<div className='group relative h-28 overflow-hidden rounded-lg border'>
															<h1 className='absolute top-1/2 left-1/2 -translate-1/2 opacity-50 thicc-text text-4xl'>
																{(displayFile?.name || fileName)?.split('.').pop()?.toUpperCase()}
															</h1>
															<div className='absolute inset-0 bg-foreground/10 opacity-0 transition-opacity group-hover:opacity-50' />
														</div>
														{(displayFile?.name || fileName) && (
															<div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
																<span className='truncate'>{displayFile?.name || fileName}</span>
																<button
																	onClick={() => {
																		handleRemove();
																		setValue(`prints.${index}.file`, undefined as unknown as File, {
																			shouldValidate: false,
																		});
																	}}
																	className='ml-auto rounded-full p-1 hover:bg-muted'>
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
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value='material'>
					<AccordionTrigger>
						<div className={cn('flex items-center gap-2', materialErrors && 'text-red-500')}>
							<Palette className='h-4 w-4' />
							Material & Colour
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<MaterialSelection index={index} printingOptions={printingOptions} />
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value='settings'>
					<AccordionTrigger>
						<div className={cn('flex items-center gap-2', settingsErrors && 'text-red-500')}>
							<Settings className='h-4 w-4' />
							Print Settings
						</div>
					</AccordionTrigger>
					<AccordionContent className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<FormField
								control={control}
								name={`prints.${index}.quantity`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<div onClick={e => e.stopPropagation()}>
												<NumberInput min={1} max={100000} {...field} />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name={`prints.${index}.printingOptions.infill`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Infill %</FormLabel>
										<FormControl>
											<div onClick={e => e.stopPropagation()}>
												<NumberInput {...field} />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={control}
							name={`prints.${index}.printingOptions.preset`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Print Quality Preset</FormLabel>
									<FormControl>
										<PresetSelection onChange={field.onChange} value={field.value} presets={presets} />
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
										<span className='bg-background px-2 text-muted-foreground'>Custom Settings</span>
									</div>
								</div>

								<FormField
									control={control}
									name={`prints.${index}.printingOptions.layerHeight`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Layer Height (mm)</FormLabel>
											<FormControl>
												<Input type='number' step='0.01' placeholder='e.g., 0.2' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

export default function CustomPrintForm({ presets, printingOptions }: { presets: Preset[]; printingOptions: PrintingOption }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isAddingPrint, setIsAddingPrint] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({
		progress: 0,
		currentChunk: 0,
		chunkTotal: 0,
	});
	const [triggerFile, setTriggerFile] = useState<File | null>(null);
	const [uploadToastId, setUploadToastId] = useState<string | number | null>(null);
	const [orderComments, setOrderComments] = useState('');
	const orderValidation = useStore($orderValidation);

	const form = useForm<CustomOrderFormValues>({
		resolver: zodResolver(customOrderFormSchema) as Resolver<CustomOrderFormValues>,
		//* resolver: (() => ({ values: {}, errors: {} })) as Resolver<CustomOrderFormValues>, USE THIS TO DISABLE VALIDATION
		mode: 'onSubmit',
		defaultValues: {
			prints: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'prints',
	});

	// File upload hook for the trigger
	const {
		previewUrl: triggerPreviewUrl,
		fileName: triggerFileName,
		fileInputRef: triggerFileInputRef,
		handleThumbnailClick: triggerHandleThumbnailClick,
		handleFileChange: triggerHandleFileChange,
		handleRemove: triggerHandleRemove,
	} = useImageUpload({
		onUpload: (url: string) => console.log('Uploaded file URL:', url),
	});

	// Handle file selection on trigger
	const handleTriggerFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setTriggerFile(file);
				// Ensure there's at least one print item and set the file
				if (fields.length === 0) {
					append({ ...defaultPrintItem, file });
				} else {
					form.setValue('prints.0.file', file, { shouldValidate: false });
				}
				setIsOpen(true);
			}
			triggerHandleFileChange(e);
		},
		[triggerHandleFileChange, setTriggerFile, fields.length, append, form],
	);

	// Drag and drop handlers for trigger
	const [isDragging, setIsDragging] = useState(false);

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
			const allowedExtensions = ['.stl', '.3mf', '.obj'];
			const fileExtension = file?.name.toLowerCase().split('.').pop();

			if (file && fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
				setTriggerFile(file);
				// Ensure there's at least one print item and set the file
				if (fields.length === 0) {
					append({ ...defaultPrintItem, file });
				} else {
					form.setValue('prints.0.file', file, { shouldValidate: false });
				}
				setIsOpen(true);
				const fakeEvent = {
					target: {
						files: [file],
					},
				} as unknown as React.ChangeEvent<HTMLInputElement>;
				triggerHandleFileChange(fakeEvent);
			}
		},
		[triggerHandleFileChange, setTriggerFile, fields.length, append, form],
	);

	useEffect(() => {
		if (fields.length === 0) {
			append(defaultPrintItem, { shouldFocus: false });
		}
	}, [append, fields.length]);

	// Update order name validation whenever it changes
	useEffect(() => {
		const isValid = orderValidation.orderName.trim().length >= 3;
		setOrderNameValid(isValid, orderValidation.orderName);
	}, [orderValidation.orderName]);

	// Update toast when upload progress changes
	useEffect(() => {
		if (uploadToastId !== null && uploadProgress.chunkTotal > 0) {
			toast.loading(
				<div className='w-full'>
					<div className='flex gap-x-2 justify-between w-full items-center'>
						<p>Uploading {uploadProgress.progress.toFixed(0)}%</p>
						<span className='text-muted-foreground text-xs'>
							File: {uploadProgress.currentChunk}/{uploadProgress.chunkTotal}
						</span>
					</div>
					<Progress
						value={uploadProgress.progress}
						className='absolute -bottom-[1px] left-0 w-full rounded-t-none h-1'></Progress>
				</div>,
				{
					id: uploadToastId,
					dismissible: false,
					closeButton: false,
					duration: Infinity,
				},
			);
		}
	}, [uploadProgress, uploadToastId]);

	async function onSubmit(data: CustomOrderFormValues) {
		// Validate order name before proceeding
		if (!orderValidation.orderNameValid) {
			toast.error('Please enter a valid order name (at least 3 characters)');
			return;
		}

		setIsLoading(true);
		let uploadResponse: UploadedFileResponse | undefined = undefined;

		// Use the persistent order name and comments
		const orderData = {
			...data,
			name: orderValidation.orderName,
			comments: orderComments,
		};

		//#region upload
		const files = orderData.prints.map(p => p.file);

		const toastId = toast.loading('Preparing upload...', {
			dismissible: false,
			closeButton: false,
			duration: Infinity,
		});
		setUploadToastId(toastId);

		try {
			for (const file of files) {
				console.log('Uploading file:', file.name);
				uploadResponse = await uploadFile(
					file,
					(progress, currentChunk, totalChunks) => {
						setUploadProgress({ progress, currentChunk, chunkTotal: totalChunks });
					},
					process.env.NEXT_PUBLIC_AVIUM_API_URL as string,
					CHUNK_SIZE,
				);

				console.log('Finished uploading file:', file.name);
			}

			toast.success('Files uploaded successfully!', { id: toastId, dismissible: true, duration: 2000 });
		} catch (error) {
			toast.error('An error occurred during file upload.', { id: toastId, dismissible: true });
			console.error('File upload error:', error);
		} finally {
			setUploadToastId(null);
		}

		//#endregion

		//TODO: Redo flow (ui/ux) for custom orders -> submit for quote
		//#region get quote for each print

		//#endregion

		//#region add to basket

		// every print will be a separate item in the basket (order name chosen in form is irrelevant for now)

		if (!uploadResponse) {
			toast.error('An error occurred during file upload. Please try again.', { dismissible: true });
			console.error('No upload response available.');
			setIsLoading(false);
			return;
		}

		try {
			console.log('Adding to basket with upload response:', uploadResponse);

			for (const print of orderData.prints) {
				addCustomPrintToBasket({
					id: crypto.randomUUID(),
					model: {
						filename: print.file.name,
						filetype: (print.file.name.split('.').pop() || 'stl') as 'stl' | 'obj' | '3mf',
						serverPath: uploadResponse.url,
					},
					printingOptions: {
						...print.printingOptions,
						colour: print.material.color,
						plastic: print.material.plastic,
					},
					price: 0, // TODO: calculate price based on options
					quantity: print.quantity,
				});
			}

			// Reset form but keep order name and comments
			form.reset({
				prints: [],
			});
			triggerHandleRemove();
			setTriggerFile(null);
		} catch (error) {
			toast.error('An error occurred adding items to basket.', { dismissible: true });
			console.error('Add to basket error:', error);
		}

		//#endregion

		setIsOpen(false);
		setIsLoading(false);
	}

	async function handleAddPrint() {
		setIsAddingPrint(true);
		// Validate current form first
		const isValid = await form.trigger();
		if (isValid) {
			append(defaultPrintItem);
			toast.success('Print item added successfully!');
		} else {
			toast.error('Please fix the errors above before adding another print.');
		}
		setIsAddingPrint(false);
	}

	return (
		<div className='space-y-4'>
			<Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
				<div className='w-full space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm cursor-pointer'>
					<div className=''>
						<h3 className='text-base font-medium'>3D File Upload</h3>
						<p className='text-sm text-muted-foreground'>Supported formats: STL, 3MF, OBJ</p>
					</div>

					<Input
						type='file'
						accept='.stl,.3mf,.obj'
						className='hidden'
						ref={triggerFileInputRef}
						onChange={handleTriggerFileChange}
					/>

					{!triggerPreviewUrl ? (
						<div
							onClick={e => {
								if (!orderValidation.orderNameValid) {
									toast.error('Please enter an order name first');
									return;
								}
								triggerHandleThumbnailClick();
							}}
							onDragOver={handleDragOver}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDrop={e => {
								if (!orderValidation.orderNameValid) {
									toast.error('Please enter an order name first');
									return;
								}
								handleDrop(e);
							}}
							className={cn(
								'flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted',
								isDragging && 'border-primary/50 bg-primary/5',
								!orderValidation.orderNameValid && 'opacity-50 cursor-not-allowed',
							)}>
							<div className='rounded-full bg-background p-2 shadow-sm'>
								<FilePlus2 className='h-5 w-5 text-muted-foreground' />
							</div>
							<div className='text-center'>
								<p className='text-sm font-medium'>
									{!orderValidation.orderNameValid ? 'Enter order name first' : 'Click to select or drag and drop'}
								</p>
							</div>
						</div>
					) : (
						<div className='relative'>
							<div className='group relative h-48 overflow-hidden rounded-lg border' onClick={() => setIsOpen(true)}>
								<h1 className='absolute top-1/2 left-1/2 -translate-1/2 opacity-50 thicc-text text-4xl'>
									{triggerFileName?.split('.')[triggerFileName?.split('.').length - 1].toUpperCase()}
								</h1>
								<div className='absolute inset-0 bg-foreground/10 opacity-0 transition-opacity group-hover:opacity-50' />
							</div>
							{triggerFileName && (
								<div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
									<span className='truncate'>{triggerFileName}</span>
									<button
										onClick={e => {
											e.stopPropagation();
											triggerHandleRemove();
											setTriggerFile(null);
											if (fields.length > 0) {
												form.setValue('prints.0.file', undefined as unknown as File, { shouldValidate: false });
											}
										}}
										className='ml-auto rounded-full p-1 hover:bg-muted'>
										<X className='h-4 w-4' />
									</button>
								</div>
							)}
						</div>
					)}
				</div>
				<DialogContent className='!w-4xl !max-w-4xl overflow-y-auto max-h-[calc(100vh-12rem)]' asChild>
					<div className='flex flex-col items-center justify-center space-y-6 min-w-3xl'>
						<DialogHeader className='w-full'>
							<DialogTitle className='flex items-center gap-2'>
								<Printer className='h-5 w-5 text-primary' />
								Add a Custom Print to Your Order
							</DialogTitle>
							<DialogDescription>Configure your 3D printing requirements and upload your model files</DialogDescription>
						</DialogHeader>

						<div className='w-full space-y-6'>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<h2 className='text-xl font-semibold'>Print Items</h2>
											<span className='text-sm text-muted-foreground'>{fields.length} item(s)</span>
										</div>

										{fields.map((field, index) => (
											<PrintItemCard
												key={field.id}
												index={index}
												remove={remove}
												presets={presets}
												printingOptions={printingOptions}
											/>
										))}

										<div className='flex gap-3'>
											<Button
												type='button'
												variant='secondary'
												className='flex-1 border-dashed bg-secondary/70 hover:bg-secondary/50'
												onClick={handleAddPrint}
												disabled={isAddingPrint}>
												<LoadingSwap isLoading={isAddingPrint} className='flex items-center'>
													<PlusCircle className='mr-2 h-4 w-4' />
													Add Print
												</LoadingSwap>
											</Button>
										</div>
									</div>

									<Separator />

									<div className='space-y-2'>
										<label
											htmlFor='orderComments'
											className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
											Order Comments (Optional)
										</label>
										<Textarea
											id='orderComments'
											placeholder='Any special instructions, material preferences, or questions about your order?'
											value={orderComments}
											onChange={e => setOrderComments(e.target.value)}
											className='min-h-[100px] w-full'
										/>
										<p className='text-sm text-muted-foreground'>These comments will apply to the entire order</p>
									</div>

									<Button
										type='submit'
										className='w-full'
										size='lg'
										disabled={isLoading || !orderValidation.orderNameValid}>
										<LoadingSwap isLoading={isLoading}>
											{!orderValidation.orderNameValid ? 'Please enter a valid order name' : 'Submit for Quote'}
										</LoadingSwap>
									</Button>
								</form>
							</Form>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
