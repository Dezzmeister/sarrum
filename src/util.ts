/**
 * Returns true if two arrays have the same values, in the same order.
 */
export function arrCmp<T>(xs: T[], ys: T[]): boolean {
	if (xs.length !== ys.length) {
		return false;
	}

	for (let i = 0; i < xs.length; i++) {
		if (xs[i] !== ys[i]) {
			return false;
		}
	}

	return true;
}
