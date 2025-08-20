import CustomPrintForm from './form';

export default async function Custom() {
	return (
		<div className='px-32 2xl:px-64'>
			<div className='flex flex-col gap-y-2'>
				<div>
					<h2 className='p-0'>Custom Print</h2>
					<p className='text-muted-foreground'>Create your own custom print with your own printer settings</p>
				</div>

				<CustomPrintForm></CustomPrintForm>
			</div>
		</div>
	);
}
