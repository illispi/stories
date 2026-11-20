/** Age between min and max, most often in the middle (triangular, not uniform). */
export const fakeAge = (min: number, max: number) =>
	Math.round(min + ((Math.random() + Math.random()) / 2) * (max - min));
