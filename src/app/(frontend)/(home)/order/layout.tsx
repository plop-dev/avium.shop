import { Separator } from '@/components/ui/separator';

export default function Layout({ custom, shop }: { custom: React.ReactNode; shop: React.ReactNode }) {
	return (
		<div className='flex flex-col gap-y-8 mt-8 px-32 2xl:px-64'>
			{custom}
			<Separator orientation='horizontal' className='relative'>
				<small className='absolute bg-background p-4 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>Or</small>
			</Separator>
			{shop}
		</div>
	);
}
