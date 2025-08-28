import { getPayload } from 'payload';
import CustomPrintForm from './form';
import config from '@/payload.config';

export default async function Custom() {
	const payload = await getPayload({ config });
	const presets = await payload.find({
		collection: 'presets',
		pagination: false,
	});

	return (
		<div className='flex flex-col gap-y-2'>
			<div>
				<h2 className='p-0'>Custom Print</h2>
				<p className='text-muted-foreground'>Create your own custom print with your own printer settings</p>
			</div>

			<CustomPrintForm presets={presets.docs}></CustomPrintForm>
		</div>
	);
}
