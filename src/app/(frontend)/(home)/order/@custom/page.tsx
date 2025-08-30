import { getPayload } from 'payload';
import CustomPrintForm from './form';
import config from '@/payload.config';

export default async function Custom() {
	const payload = await getPayload({ config });
	const [presets, printingOptions] = await Promise.all([
		payload.find({
			collection: 'presets',
			pagination: false,
		}),
		payload.findGlobal({
			slug: 'printing-options',
		}),
	]);

	return (
		<div className='flex flex-col gap-y-4'>
			<p className='text-muted-foreground'>Upload your 3D models and configure printing settings to create custom prints.</p>

			<CustomPrintForm presets={presets.docs} printingOptions={printingOptions}></CustomPrintForm>
		</div>
	);
}
