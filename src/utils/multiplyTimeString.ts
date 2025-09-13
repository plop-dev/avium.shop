export function multiplyTimeString(timeStr: string, x: number): string {
	// Parse the time string
	const timeParts = timeStr.split(' ');
	let totalSeconds = 0;

	for (const part of timeParts) {
		if (part.endsWith('h')) {
			totalSeconds += parseInt(part.slice(0, -1)) * 3600; // Convert hours to seconds
		} else if (part.endsWith('m')) {
			totalSeconds += parseInt(part.slice(0, -1)) * 60; // Convert minutes to seconds
		} else if (part.endsWith('s')) {
			totalSeconds += parseInt(part.slice(0, -1)); // Seconds remain as is
		}
	}

	// Multiply total seconds by x
	totalSeconds *= x;

	// Convert back to hours, minutes, seconds
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	// Format the result
	const result: string[] = [];
	if (hours > 0) {
		result.push(`${hours}h`);
	}
	if (minutes > 0) {
		result.push(`${minutes}m`);
	}
	if (seconds > 0) {
		result.push(`${seconds}s`);
	}

	return result.join(' ');
}
