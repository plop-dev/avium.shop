export default function numToGBP(n: number): string {
	return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}
