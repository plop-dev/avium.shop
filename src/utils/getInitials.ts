export default function getInitials(name: string, maxChars: number = 2, allCaps: boolean = true): string {
	return allCaps
		? name
				.split(' ')
				.map(n => n[0])
				.join('')
				.substring(0, maxChars)
				.toUpperCase()
		: name
				.split(' ')
				.map(n => n[0])
				.join('')
				.substring(0, maxChars);
}
