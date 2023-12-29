import {Dictionary} from "./dict";

export function englSearch(dict: Dictionary, query: string, limit: number): string[] {
	const out: string[] = [];

	for (const word of dict.englKeys) {
		if (word.indexOf(query) !== -1) {
			out.push(word);
		}
	}

	out.sort((a, b) => a.length - b.length);

	if (out.length > limit) {
		out.splice(limit, out.length - limit);
	}

	return out;
}

export function levSearch(dict: Dictionary, query: string, limit: number, cutoff: number): string[] {
	const results: [number, string][] = [];

	for (const word of dict.akkKeys) {
		const lev = levDist(query, word);
		let dist = lev;

		if (query.length <= word.length) {
			const ham = hammingDist(query, word);

			dist = Math.min(lev, ham);
		}

		if (dist <= cutoff) {
			results.push([dist, word]);
		}
	}

	// Sort by distance metric (Levenshtein or Hamming)
	results.sort((a, b) => a[0] - b[0]);

	if (results.length > limit) {
		results.splice(limit, results.length - limit);
	}

	return results.map(r => r[1]);
}

export function basicSearch(dict: Dictionary, query: string, limit: number): string[] {
	const out: string[] = [];

	for (const word of dict.akkKeys) {
		if (akkStartsWith(word, query)) {
			out.push(word);
		}
	}

	out.sort((a, b) => a.length - b.length);

	if (out.length > limit) {
		out.splice(limit, out.length - limit);
	}

	return out;
}

/**
 * Compare chars without regard to diacritical marks.
 */
function cmpChars(a: string, b: string): boolean {
	switch (a) {
		case "š":
		case "ṣ":
		case "s":
			return b === "š" || b === "ṣ" || b === "s";
		case "t":
		case "ṭ":
			return b === "t" || b === "ṭ";
		case "h":
		case "ẖ":
			return b === "h" || b === "ẖ";
		case "a":
		case "ā":
		case "â":
			return b === "a" || b === "ā" || b === "â";
		case "e":
		case "ē":
		case "ê":
			return b === "e" || b === "ē" || b === "ê";
		case "i":
		case "ī":
		case "î":
			return b === "i" || b === "ī" || b === "î";
		case "u":
		case "ū":
		case "û":
			return b === "u" || b === "ū" || b === "û";
	}

	return a === b;
}

/**
 * startsWith that doesn't distinguish between diacritical marks on the letters
 * used to represent Akkadian.
 */
function akkStartsWith(s: string, sub: string): boolean {
	if (s.length < sub.length) {
		return false;
	}

	for (let i = 0; i < sub.length; i++) {
		if (!cmpChars(s.charAt(i), sub.charAt(i))) {
			return false;
		}
	}

	return true;
}

/**
 * Algorithm adapted from https://www.codeproject.com/Articles/13525/Fast-memory-efficient-Levenshtein-algorithm-2
 */
function levDist(s: string, t: string): number {
	const n = s.length;
	const m = t.length;
	let rowIdx: number;
	let colIdx: number;
	let rowI: string;
	let colJ: string;
	let cost: number;

	if (n === 0) {
		return m;
	}

	if (m === 0) {
		return n;
	}

	let v0: number[] = Array(n + 1);
	let v1: number[] = Array(n + 1);
	let vTmp: number[];

	for (rowIdx = 1; rowIdx <= n; rowIdx++) {
		v0[rowIdx] = rowIdx;
	}

	for (colIdx = 1; colIdx <= m; colIdx++) {
		v1[0] = colIdx;
		colJ = t.charAt(colIdx - 1);

		for (rowIdx = 1; rowIdx <= n; rowIdx++) {
			rowI = s.charAt(rowIdx - 1);

			if (cmpChars(rowI, colJ)) {
				cost = 0;
			} else {
				cost = 1;
			}

			let mMin = v0[rowIdx] + 1;
			let b = v1[rowIdx - 1] + 1;
			let c = v0[rowIdx - 1] + cost;

			if (b < mMin) {
				mMin = b;
			}

			if (c < mMin) {
				mMin = c;
			}

			v1[rowIdx] = mMin;
		}

		vTmp = v0;
		v0 = v1;
		v1 = vTmp;
	}

	return v0[n];
}

function hammingDist(s: string, t: string): number {
	let out = 0;

	for (let i = 0; i < s.length; i++) {
		if (!cmpChars(s.charAt(i), t.charAt(i))) {
			out++;
		}
	}

	return out;
}
