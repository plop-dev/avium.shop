'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch, useFormContext, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, z } from 'zod';
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
import { Filament, Preset, PricingFormula, PrintingOption, Quote } from '@/payload-types';
import { Progress } from '@/components/ui/progress';
import { SlicingResult, SlicingSettings, uploadFile } from './utils';
import { addCustomPrintToBasket, CustomPrint } from '@/stores/basket';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { $orderValidation, setOrderNameValid } from '@/stores/order';
import { useStore } from '@nanostores/react';
import BasketItem from '@/components/BasketItem';
import useSWR, { Fetcher } from 'swr';
import { stringify } from 'qs-esm';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { evaluate } from 'mathjs';
import { timeStringToSeconds } from '@/utils/multiplyTimeString';

type CustomOrderFormValues = z.infer<typeof customOrderFormSchema>;

const defaultPrintItem = {
	file: undefined as unknown as File,
	quantity: 1,
	material: {
		plastic: '',
		colour: '',
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
	const selectedColour = useWatch({
		control,
		name: `prints.${index}.material.colour`,
	});

	const plasticBlock = printingOptions.plastic?.find(p => p.id === selectedPlastic);
	const availableColours = plasticBlock?.colours || [];

	useEffect(() => {
		if (selectedPlastic && selectedColour) {
			const isColourAvailable = availableColours.some(c => c.colour === selectedColour);
			if (!isColourAvailable) {
				setValue(`prints.${index}.material.colour`, '', { shouldValidate: false });
			}
		}
	}, [selectedPlastic, selectedColour, availableColours, setValue, index]);

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
				name={`prints.${index}.material.colour`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Colour</FormLabel>
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
			const allowedExtensions = ['.stl', '.3mf'];
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

			<Accordion type='single' defaultValue={'file'} className='w-full'>
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
													accept='.stl,.3mf'
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
											<FormControl className='!px-4'>
												<Input
													type='number'
													className='mx-0.5 !w-[calc(100%-0.5rem)]'
													step='0.01'
													placeholder='e.g., 0.2'
													{...field}
													value={field.value || ''}
												/>
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
	const [isQuoteView, setIsQuoteView] = useState(false);
	const [orderComments, setOrderComments] = useState('');
	const [userData, setUserData] = useState<User | null>(null);
	const [triggerFile, setTriggerFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState<
		Map<
			number,
			{
				progress: number;
				currentChunk: number;
				chunkTotal: number;
			}
		>
	>(new Map());

	const [quotes, setQuotes] = useState<
		Map<
			number,
			{
				id: string;
				sliceResult: SlicingResult & { price: number };
				originalSettings: {
					infill: number;
					preset?: string;
					layerHeight?: number;
					plastic: string;
				};
			}
		>
	>(new Map());

	//* debug -------------------------
	useEffect(() => {
		console.log('Quotes:', quotes);
	}, [quotes]);

	useEffect(() => {
		console.log('Quote view:', isQuoteView);
	}, [isQuoteView]);

	useEffect(() => {
		console.log('Upload progress:', uploadProgress);
	}, [uploadProgress]);
	//* -------------------------------

	const user = useSession();

	const orderValidation = useStore($orderValidation);

	const form = useForm<CustomOrderFormValues>({
		resolver: zodResolver(customOrderFormSchema) as Resolver<CustomOrderFormValues>,

		mode: 'onSubmit',
		defaultValues: {
			prints: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'prints',
	});

	useEffect(() => {
		if (user.status === 'authenticated') {
			setUserData(user.data.user || null);
		}
	}, [user]);

	//#region file upload

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

	const handleTriggerFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setTriggerFile(file);

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
			const allowedExtensions = ['.stl', '.3mf'];
			const fileExtension = file?.name.toLowerCase().split('.').pop();

			if (file && fileExtension && allowedExtensions.includes(`.${fileExtension}`)) {
				setTriggerFile(file);

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
		// Only auto-add default print item when not in quote view
		// This prevents empty items from appearing when all quotes are removed
		if (fields.length === 0 && !isQuoteView) {
			append(defaultPrintItem, { shouldFocus: false });
		}
	}, [append, fields.length, isQuoteView]);

	//#endregion

	useEffect(() => {
		const isValid = orderValidation.orderName.trim().length >= 3;
		setOrderNameValid(isValid, orderValidation.orderName);
	}, [orderValidation.orderName]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			const quoteIds = getQuoteIds();
			if (quoteIds.length > 0) {
				const cleanup = async () => {
					for (const quoteId of quoteIds) {
						try {
							await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/slice/${quoteId}`, { method: 'DELETE' });
							await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' });
						} catch (error) {
							console.error('Error cleaning up on unload:', error);
						}
					}
				};
				cleanup();
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [quotes]);

	function hasSettingsChanged(printIndex: number, currentPrint: CustomOrderFormValues['prints'][0]): boolean {
		const quote = quotes.get(printIndex);
		if (!quote) return true;

		const currentSettings = {
			plastic: currentPrint.material.plastic,
			infill: currentPrint.printingOptions.infill || 10,
			preset: currentPrint.printingOptions.preset,
			layerHeight: currentPrint.printingOptions.layerHeight,
		};

		return (
			quote.originalSettings.plastic !== currentSettings.plastic ||
			quote.originalSettings.infill !== currentSettings.infill ||
			quote.originalSettings.preset !== currentSettings.preset ||
			quote.originalSettings.layerHeight !== currentSettings.layerHeight
		);
	}

	function getQuoteIds(): string[] {
		return Array.from(quotes.values()).map(quote => quote.id);
	}

	//#region on quote submit
	async function onSubmit(data: CustomOrderFormValues) {
		if (!orderValidation.orderNameValid) {
			toast.error('Please enter a valid order name (at least 3 characters)');
			return;
		}

		if (!userData) {
			toast.error('You must be logged in to submit an order. Please log in and try again.', { dismissible: true });
			return;
		}

		setIsQuoteView(true);

		const printsToProcess = data.prints
			.map((print, index) => ({ print, index }))
			.filter(({ index, print }) => {
				return !quotes.has(index) || hasSettingsChanged(index, print);
			});

		if (printsToProcess.length === 0) {
			return;
		}

		for (const { print, index: i } of printsToProcess) {
			const existingQuote = quotes.get(i);
			if (existingQuote) {
				setUploadProgress(prev => {
					const updated = new Map(prev);
					updated.set(i, { progress: 0, currentChunk: 0, chunkTotal: 0 });
					return updated;
				});

				try {
					await Promise.all([
						fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/slice/${existingQuote.id}`, { method: 'DELETE' }),
						fetch(`/api/quotes/${existingQuote.id}`, { method: 'DELETE' }),
					]);
				} catch (error) {
					console.error('Error cleaning up old quote:', existingQuote.id, error);
				}
			}

			const quoteRes: { doc: Quote } = await fetch('/api/quotes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user: userData.id,
					printingOptions: {
						...print.printingOptions,
						colour: print.material.colour,
						plastic: print.material.plastic,
					},
					model: {
						filename: print.file.name,
						filetype: (print.file.name.split('.').pop() || 'stl') as 'stl' | '3mf',
						modelUrl: '',
						gcodeUrl: '',
					},
				}),
			}).then(res => res.json());

			try {
				const query = stringify(
					{
						where: {
							name: print.material.plastic,
						},
						limit: 1,
					},
					{ addQueryPrefix: true },
				);

				const filamentRes = await fetch(`/api/filaments${query}`);
				const filamentJSON = await filamentRes.json();

				if (filamentJSON.totalDocs === 0) {
					toast.error(`No filament profile found for ${print.material.plastic}. Please contact support.`, { dismissible: true });
					cancelQuote();
					setIsLoading(false);
					return;
				}

				const filamentRequestData = new FormData();
				filamentRequestData.append('name', `${quoteRes.doc.id}`);
				filamentRequestData.append(
					'file',
					new Blob([JSON.stringify(filamentJSON.docs[0].data)], { type: 'application/json' }),
					'filament.json',
				);
				console.log('filamentJSON', filamentJSON);

				await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/profiles/filaments`, {
					method: 'POST',
					body: filamentRequestData,
				});
			} catch (error) {
				console.error('Error fetching filament data:', error);
				toast.error('An error occurred fetching filament data. Please try again.', { dismissible: true });
				cancelQuote();
				setIsLoading(false);
				return;
			}

			//* only works if a preset is not used
			try {
				const body: {
					name: string;
					layerHeight?: number;
					infill?: number;
					preset?: string;
				} = {
					name: quoteRes.doc.id,
					layerHeight: print.printingOptions.layerHeight || 0.2,
					infill: print.printingOptions.infill || 10,
				};

				await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/generate/presets`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				});
			} catch (error) {
				console.error('Error generating preset profile:', error);
				toast.error('An error occurred generating preset profile. Please try again.', { dismissible: true });
				cancelQuote();
				setIsLoading(false);
				return;
			}

			try {
				const slicerSettings: SlicingSettings = {
					exportType: 'gcode',
					filament: quoteRes.doc.id,
					plate: '0',
					printer: 'machine', // 'machine' default printer profile (bbl p1s .4 nozzle)
					multicolorOnePlate: false,
					preset: quoteRes.doc.id,
				};

				if (print.printingOptions.preset) {
					const query = stringify(
						{
							where: {
								name: print.printingOptions.preset,
							},
							limit: 1,
						},
						{ addQueryPrefix: true },
					);
					const presetRes = await fetch(`/api/presets${query}`);
					const presetJSON = await presetRes.json();

					slicerSettings.preset = presetJSON.docs[0].bambulabName;
				}

				const res = await uploadFile(
					print.file,
					(progress, currentChunk, totalChunks) => {
						setUploadProgress(prev => {
							const updated = new Map(prev);
							updated.set(i, { progress, currentChunk, chunkTotal: totalChunks });
							return updated;
						});
					},
					process.env.NEXT_PUBLIC_AVIUM_API_URL as string,
					CHUNK_SIZE,
					slicerSettings,
					quoteRes.doc.id,
				);

				if (res) {
					console.log('Quote response received for print:', quoteRes.doc.id);

					const pricingFormulaRes = await fetch(`/api/globals/pricing-formula`);
					if (!pricingFormulaRes.ok) {
						toast.error('An error occurred fetching pricing formula. Please try again.', { dismissible: true });
						cancelQuote();
						setIsLoading(false);
						return;
					}
					const pricingFormula = await pricingFormulaRes.json().then((res: PricingFormula) => res.pricingFormula);

					if (!pricingFormula) {
						toast.error('An error occurred fetching pricing formula. Please try again.', { dismissible: true });
						cancelQuote();
						setIsLoading(false);
						return;
					}

					const cost = Number(res.filament.cost) || 0;
					console.log(
						`formula: ${pricingFormula}, weight: ${res.filament.used_g}g, time: ${timeStringToSeconds(
							res.times.total,
						)}, cost: £${cost}`,
					);
					const price = (
						evaluate(pricingFormula, {
							weight: res.filament.used_g,
							time: timeStringToSeconds(res.times.total),
							cost: cost,
						}) / 100
					).toFixed(2) as unknown as number;

					const req = await fetch(`/api/quotes/${quoteRes.doc.id}`, {
						method: 'PATCH',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							// price,
							model: {
								modelUrl: res.modelUrl,
								gcodeUrl: res.gcodeUrl,
							},
							time: res.times.total,
						}),
					});
					if (!req.ok) {
						toast.error('An error occurred updating quote data. Please try again.', { dismissible: true });
						console.error('Error updating quote:', req.statusText);
						cancelQuote();
						setIsLoading(false);
						return;
					}

					setQuotes(
						prev =>
							new Map([
								...prev,
								[
									i,
									{
										id: quoteRes.doc.id,
										sliceResult: { ...res, price },
										originalSettings: {
											infill: print.printingOptions.infill || 10,
											preset: print.printingOptions.preset,
											layerHeight: print.printingOptions.layerHeight,
											plastic: print.material.plastic,
										},
									},
								],
							]),
					);
				} else {
					toast.error('An error occurred getting a quote. Please try again.', { dismissible: true });
					console.error('No response from slicing API');
					cancelQuote();
					setIsLoading(false);
					return;
				}

				try {
					await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/profiles/presets/${quoteRes.doc.id}`, { method: 'DELETE' });
					await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/profiles/filaments/${quoteRes.doc.id}`, { method: 'DELETE' });
				} catch (error) {
					console.error('Error deleting temporary files:', error);
				}
			} catch (error) {
				toast.error('An error occurred getting a quote. Please try again.', { dismissible: true });
				console.error('Quote request error:', error);
				cancelQuote();
				setIsLoading(false);
				return;
			}
		}
	}
	//#endregion

	async function confirmQuote() {
		setIsLoading(true);

		const currentFormData = form.getValues();

		currentFormData.prints.forEach(async (item, index) => {
			const quote = quotes.get(index);

			if (quote) {
				addCustomPrintToBasket({
					id: quote.id,
					model: {
						filename: item.file.name,
						filetype: (item.file.name.split('.').pop() || 'stl') as 'stl' | '3mf',
					},
					quantity: item.quantity,
					printingOptions: {
						...item.printingOptions,
						colour: item.material.colour,
						plastic: item.material.plastic,
					},
					price: quote.sliceResult.price || 0,
					time: quote.sliceResult.times.total || '',
				});

				// update quote in db
				const req = await fetch(`/api/quotes/${quote.id}`, {
					method: 'PATCH',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						printingOptions: {
							colour: item.material.colour,
							plastic: item.material.plastic,
							...item.printingOptions,
						},
					}),
				});

				if (!req.ok) {
					toast.error('An error occurred updating quote data. Please try again.', { dismissible: true });
					console.error('Error updating quote:', req.statusText);
					cancelQuote();
					setIsLoading(false);
					return;
				}
			}
		});

		toast.success(`${currentFormData.prints.length} item(s) added to basket`);

		setIsOpen(false);
		setIsLoading(false);
	}

	async function cancelQuote() {
		const quotesToCleanup = getQuoteIds();

		setQuotes(new Map());
		setIsLoading(false);
		setIsQuoteView(false);
		setUploadProgress(new Map());

		const cleanupPromises = quotesToCleanup.map(async quoteId => {
			try {
				await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/slice/${quoteId}`, { method: 'DELETE' }),
					fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' }),
				]);
			} catch (error) {
				console.error('Error cleaning up quote:', quoteId, error);
			}
		});

		await Promise.allSettled(cleanupPromises);
	}

	async function handleAddPrint() {
		setIsAddingPrint(true);

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
			<Dialog
				open={isOpen}
				onOpenChange={open => {
					if (!open && isQuoteView && quotes.size > 0) {
						cancelQuote();
					}
					setIsOpen(open);
				}}
				modal={true}>
				<div className='w-full space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm cursor-pointer'>
					<div className=''>
						<h3 className='text-base font-medium'>3D File Upload</h3>
						<p className='text-sm text-muted-foreground'>Supported formats: STL, 3MF, OBJ</p>
					</div>

					<Input type='file' accept='.stl,.3mf' className='hidden' ref={triggerFileInputRef} onChange={handleTriggerFileChange} />

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

				{/* REPLACED: DialogContent with sliding two-panel layout */}
				<DialogContent className='!w-4xl !max-w-4xl max-h-[calc(100vh-8rem)] overflow-hidden' asChild>
					<div className='relative w-full h-[calc(100vh-12rem)] overflow-hidden'>
						<div
							className='flex w-[200%] h-full transition-transform duration-500 ease-out'
							style={{ transform: isQuoteView ? 'translateX(-50%)' : 'translateX(0%)' }}>
							{/* Left panel: original form */}
							<div className='w-1/2 flex-none px-4 h-full'>
								<div className='flex flex-col space-y-6 h-full overflow-y-auto'>
									<DialogHeader className='w-full'>
										<DialogTitle className='flex items-center gap-2'>
											<Printer className='h-5 w-5 text-primary' />
											Add a Custom Print to Your Order
										</DialogTitle>
										<DialogDescription>
											Configure your 3D printing requirements and upload your model files
										</DialogDescription>
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
														className='min-h-[100px] w-[calc(100%-0.5rem)] mx-0.5'
													/>
													<p className='text-sm text-muted-foreground'>
														These comments will apply to the entire order
													</p>
												</div>

												<Button
													type='submit'
													className='w-full'
													size='lg'
													disabled={isLoading || !orderValidation.orderNameValid}>
													<LoadingSwap isLoading={isLoading}>
														{!orderValidation.orderNameValid
															? 'Please enter a valid order name'
															: 'Submit for Quote'}
													</LoadingSwap>
												</Button>
											</form>
										</Form>
									</div>
								</div>
							</div>

							{/* Right panel: quote view */}
							<div className='w-1/2 flex-none px-4 h-full'>
								<div className='flex flex-col gap-4 h-full overflow-y-auto'>
									<div className='flex items-center justify-between'>
										<div>
											<h2 className='text-xl font-semibold flex items-center gap-2'>
												<Printer className='h-5 w-5 text-primary' />
												Your Quote
											</h2>
											<p className='text-sm text-muted-foreground'>
												Review your prints while we calculate the quote.
											</p>
										</div>
										<div className='flex gap-x-2'>
											<Button onClick={() => setIsQuoteView(false)} variant='default'>
												Add Another Print
											</Button>
											<Button variant={'destructive'} onClick={() => cancelQuote()}>
												Cancel & Back to Form
											</Button>
										</div>
									</div>

									<div className='flex flex-col gap-3'>
										{form.getValues().prints.map((p, i) => {
											const filename = p.file?.name || 'No file selected';
											const quote = quotes.get(i);

											return (
												<BasketItem
													item={{
														id: quote?.id || '',
														model: {
															filename,
															filetype: (filename.split('.').pop() || 'stl') as 'stl' | '3mf',
														},
														price: quote?.sliceResult.price || null,
														time: quote?.sliceResult.times.total || null,
														printingOptions: {
															colour: p.material.colour,
															plastic: p.material.plastic,
															infill: p.printingOptions.infill,
															layerHeight: p.printingOptions.layerHeight,
															preset: p.printingOptions.preset,
														},
														quantity: p.quantity,
													}}
													progress={uploadProgress.get(i)?.progress}
													onQuantityChange={(id, qty) => {
														form.setValue(`prints.${i}.quantity`, qty);
													}}
													onRemove={async id => {
														remove(i);

														const updatedQuotes = new Map(quotes);
														updatedQuotes.delete(i);

														const reindexedQuotes = new Map<
															number,
															NonNullable<typeof updatedQuotes extends Map<number, infer T> ? T : never>
														>();
														updatedQuotes.forEach((quote, index) => {
															if (quote && index > i) {
																reindexedQuotes.set(index - 1, quote);
															} else if (quote) {
																reindexedQuotes.set(index, quote);
															}
														});

														setQuotes(reindexedQuotes);

														// Also clean up progress tracking
														setUploadProgress(prev => {
															const updated = new Map(prev);
															updated.delete(i);

															// Re-index remaining progress entries
															const reindexedProgress = new Map<
																number,
																{ progress: number; currentChunk: number; chunkTotal: number }
															>();
															updated.forEach((progress, index) => {
																if (index > i) {
																	reindexedProgress.set(index - 1, progress);
																} else {
																	reindexedProgress.set(index, progress);
																}
															});

															return reindexedProgress;
														});

														try {
															await fetch(`${process.env.NEXT_PUBLIC_AVIUM_API_URL}/slice/${id}`, {
																method: 'DELETE',
															});
															await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
														} catch (error) {
															console.error('Error cleaning up quote:', id, error);
														}
													}}
													key={i}></BasketItem>
											);
										})}

										{form.getValues().prints.length === 0 && (
											<p className='text-sm text-muted-foreground'>No prints found.</p>
										)}
									</div>

									<Button
										className='mt-auto w-full'
										onClick={() => {
											if (isLoading || form.getValues().prints.length === 0) cancelQuote();
											else confirmQuote();
										}}
										disabled={quotes.size !== form.getValues().prints.length}>
										{isLoading || form.getValues().prints.length === 0 ? (
											'Back to Form'
										) : (
											<>
												Add {form.getValues().prints.reduce((c: number, p) => (c += p.quantity), 0)} Print
												{form.getValues().prints.reduce((c: number, p) => (c += p.quantity), 0) > 1 && 's'} To
												Basket
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
