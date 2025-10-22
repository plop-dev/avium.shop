import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DataTable } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';

const data = [
	{
		id: 'a1b2c3d4',
		name: 'Order Alpha',
		customer: 'user_001',
		shopProducts: 2,
		customPrints: 1,
		total: 49.99,
		queue: 1,
		currentStatus: 'in-queue',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		comments: 'test comments',
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'customPrint' as const,
				id: 'cp_001',
				model: {
					filename: 'dragon_figurine.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/dragon_figurine.stl',
					gcodeUrl: 'https://storage.example.com/gcode/dragon_figurine.gcode',
				},
				printingOptions: {
					preset: 'preset_001',
					layerHeight: 0.2,
					infill: 20,
					plastic: 'PLA',
					colour: 'Red',
				},
				time: '4h 32m',
				filament: 85,
				quantity: 1,
				price: 24.99,
				completed: false,
			},
			{
				blockType: 'shopProduct' as const,
				id: 'sp_001',
				product: 'prod_keychain_001',
				quantity: 2,
				price: 25.0,
				completed: false,
			},
		],
	},
	{
		id: 'e5f6g7h8',
		name: 'Order Beta',
		customer: 'user_002',
		shopProducts: 1,
		customPrints: 0,
		total: 19.99,
		queue: 2,
		currentStatus: 'in-queue',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		comments: 'i want it quick pls',
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'shopProduct' as const,
				id: 'sp_002',
				product: 'prod_phone_stand',
				quantity: 1,
				price: 19.99,
				completed: false,
			},
		],
	},
	{
		id: 'i9j0k1l2',
		name: 'Order Gamma',
		customer: 'user_003',
		shopProducts: 1,
		customPrints: 2,
		total: 54.97,
		queue: 3,
		currentStatus: 'printing',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T08:00:00Z',
			},
			{
				stage: 'printing',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'customPrint' as const,
				id: 'cp_002',
				model: {
					filename: 'vase_organic.3mf',
					filetype: '3mf' as const,
					modelUrl: 'https://storage.example.com/models/vase_organic.3mf',
					gcodeUrl: 'https://storage.example.com/gcode/vase_organic.gcode',
				},
				printingOptions: {
					layerHeight: 0.3,
					infill: 15,
					plastic: 'PETG',
					colour: 'Blue',
				},
				time: '2h 15m',
				filament: 45,
				quantity: 1,
				price: 17.99,
				completed: true,
			},
			{
				blockType: 'customPrint' as const,
				id: 'cp_003',
				model: {
					filename: 'chess_set.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/chess_set.stl',
					gcodeUrl: 'https://storage.example.com/gcode/chess_set.gcode',
				},
				printingOptions: {
					preset: 'preset_002',
					layerHeight: 0.15,
					infill: 25,
					plastic: 'PLA',
					colour: 'White',
				},
				time: '6h 45m',
				filament: 120,
				quantity: 1,
				price: 34.99,
				completed: false,
			},
			{
				blockType: 'shopProduct' as const,
				id: 'sp_003',
				product: 'prod_coaster_set',
				quantity: 1,
				price: 1.99,
				completed: false,
			},
		],
	},
	{
		id: 'm3n4o5p6',
		name: 'Order Delta',
		customer: 'user_004',
		total: 59.99,
		queue: 4,
		currentStatus: 'packaging',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T07:00:00Z',
			},
			{
				stage: 'printing',
				timestamp: '2025-10-10T08:00:00Z',
			},
			{
				stage: 'packaging',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		shopProducts: 0,
		customPrints: 3,
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'customPrint' as const,
				id: 'cp_004',
				model: {
					filename: 'action_figure_base.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/action_figure_base.stl',
					gcodeUrl: 'https://storage.example.com/gcode/action_figure_base.gcode',
				},
				printingOptions: {
					layerHeight: 0.12,
					infill: 30,
					plastic: 'ABS',
					colour: 'Black',
				},
				time: '3h 20m',
				filament: 62,
				quantity: 2,
				price: 19.99,
				completed: true,
			},
			{
				blockType: 'customPrint' as const,
				id: 'cp_005',
				model: {
					filename: 'lamp_shade.3mf',
					filetype: '3mf' as const,
					modelUrl: 'https://storage.example.com/models/lamp_shade.3mf',
					gcodeUrl: 'https://storage.example.com/gcode/lamp_shade.gcode',
				},
				printingOptions: {
					preset: 'preset_003',
					layerHeight: 0.25,
					infill: 10,
					plastic: 'PLA',
					colour: 'Yellow',
				},
				time: '5h 10m',
				filament: 95,
				quantity: 1,
				price: 29.99,
				completed: true,
			},
			{
				blockType: 'customPrint' as const,
				id: 'cp_006',
				model: {
					filename: 'custom_bracket.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/custom_bracket.stl',
					gcodeUrl: 'https://storage.example.com/gcode/custom_bracket.gcode',
				},
				printingOptions: {
					layerHeight: 0.2,
					infill: 50,
					plastic: 'PETG',
					colour: 'Gray',
				},
				time: '1h 45m',
				filament: 38,
				quantity: 1,
				price: 10.01,
				completed: false,
			},
		],
	},
	{
		id: 'q7r8s9t0',
		name: 'Order Epsilon',
		customer: 'user_005',
		shopProducts: 2,
		customPrints: 2,
		total: 89.99,
		queue: 5,
		currentStatus: 'shipped',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T06:00:00Z',
			},
			{
				stage: 'printing',
				timestamp: '2025-10-10T07:00:00Z',
			},
			{
				stage: 'packaging',
				timestamp: '2025-10-10T08:00:00Z',
			},
			{
				stage: 'shipped',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'customPrint' as const,
				id: 'cp_007',
				model: {
					filename: 'miniature_house.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/miniature_house.stl',
					gcodeUrl: 'https://storage.example.com/gcode/miniature_house.gcode',
				},
				printingOptions: {
					preset: 'preset_001',
					layerHeight: 0.16,
					infill: 20,
					plastic: 'PLA',
					colour: 'Green',
				},
				time: '7h 30m',
				filament: 145,
				quantity: 1,
				price: 39.99,
				completed: true,
			},
			{
				blockType: 'customPrint' as const,
				id: 'cp_008',
				model: {
					filename: 'phone_case_custom.3mf',
					filetype: '3mf' as const,
					modelUrl: 'https://storage.example.com/models/phone_case_custom.3mf',
					gcodeUrl: 'https://storage.example.com/gcode/phone_case_custom.gcode',
				},
				printingOptions: {
					layerHeight: 0.2,
					infill: 35,
					plastic: 'TPU',
					colour: 'Purple',
				},
				time: '2h 50m',
				filament: 52,
				quantity: 1,
				price: 24.99,
				completed: true,
			},
			{
				blockType: 'shopProduct' as const,
				id: 'sp_004',
				product: 'prod_desk_organizer',
				quantity: 1,
				price: 15.0,
				completed: true,
			},
			{
				blockType: 'shopProduct' as const,
				id: 'sp_005',
				product: 'prod_cable_holder',
				quantity: 2,
				price: 10.01,
				completed: true,
			},
		],
	},
	{
		id: 'u1v2w3x4',
		name: 'Order Zeta',
		customer: 'user_006',
		shopProducts: 1,
		customPrints: 1,
		total: 29.99,
		queue: 6,
		currentStatus: 'in-queue',
		statuses: [
			{
				stage: 'in-queue',
				timestamp: '2025-10-10T09:15:00Z',
			},
		],
		createdAt: '2025-10-10T09:15:00Z',
		prints: [
			{
				blockType: 'customPrint' as const,
				id: 'cp_009',
				model: {
					filename: 'gear_mechanism.stl',
					filetype: 'stl' as const,
					modelUrl: 'https://storage.example.com/models/gear_mechanism.stl',
					gcodeUrl: 'https://storage.example.com/gcode/gear_mechanism.gcode',
				},
				printingOptions: {
					layerHeight: 0.2,
					infill: 40,
					plastic: 'PLA',
					colour: 'Orange',
				},
				time: '3h 15m',
				filament: 68,
				quantity: 1,
				price: 19.99,
				completed: false,
			},
			{
				blockType: 'shopProduct' as const,
				id: 'sp_006',
				product: 'prod_bookmark_set',
				quantity: 1,
				price: 10.0,
				completed: false,
			},
		],
	},
];

export default async function AdminPage() {
	return (
		<div className='@container/main flex flex-1 flex-col gap-2'>
			<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
				<SectionCards />
				<div className='px-4 lg:px-6'>
					<ChartAreaInteractive />
				</div>
				<DataTable
					data={data.map(item => ({
						...item,
						currentStatus: item.currentStatus as 'in-queue' | 'printing' | 'packaging' | 'shipped' | 'cancelled',
						statuses: item.statuses.map((status: { stage: string; timestamp: string }) => ({
							...status,
							stage: status.stage as 'in-queue' | 'printing' | 'packaging' | 'shipped' | 'cancelled',
						})),
					}))}
				/>
			</div>
		</div>
	);
}
