import { z } from 'zod';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = ['.stl', '.obj', '.3mf'];

const printSchema = z
	.object({
		file: z
			.instanceof(File, { message: 'A 3D model file is required.' })
			.refine(file => file.size <= MAX_FILE_SIZE, `Max file size is 100MB.`)
			.refine(file => ACCEPTED_FILE_TYPES.some(type => file.name.endsWith(type)), 'Only .stl, .obj, and .3mf files are accepted.'),
		quantity: z.coerce.number().min(1, 'Quantity must be at least 1').max(10000, "that's not happening").default(1),
		printingOptions: z.object({
			preset: z.string().optional(),
			layerHeight: z.coerce.number().optional(),
			infill: z.coerce.number().min(0, 'Infill must be at least 0').max(100, 'Infill must be at most 100'),
		}),
	})
	.refine(data => data.printingOptions.preset || data.printingOptions.layerHeight, {
		message: 'Either a preset or custom printing options must be selected.',
		path: ['printingOptions.preset'],
	});

export const customOrderFormSchema = z.object({
	name: z.string().min(3, 'Order name must be at least 3 characters long.'),
	prints: z.array(printSchema).min(1, 'At least one print is required.'),
	comments: z.string().optional(),
});
