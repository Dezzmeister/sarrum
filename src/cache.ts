import AsyncStorage from "@react-native-async-storage/async-storage";
import {Consts} from "./consts";

export type DictText = {
	method: "cache" | "url";
	text: string;
	version: number | null;
};

export async function getDictText(): Promise<DictText | undefined> {
	const cachedVersion = await AsyncStorage.getItem(Consts.cacheKeys.version)
		.then(v => Number(v))
		.catch(_ => null);

	const version: number | null = await fetch(Consts.dictVersionUrl)
		.then(res => res.json())
		.then(data => data.version)
		.catch(_ => null);

	// There is a newer dictionary - update local copy
	if (cachedVersion === null || (version !== null && cachedVersion !== version)) {
		// Query for dict
		const rawText = await fetch(Consts.dictUrl)
			.then(res => res.text())
			.catch(_ => null);

		if (rawText === null) {
			const cachedText = await AsyncStorage.getItem(Consts.cacheKeys.dict).catch(_ => null);

			// Nothing can be done - dict is not obtainable online or through query
			if (cachedText === null) {
				return undefined;
			}

			return {
				method: "cache",
				text: cachedText,
				version: cachedVersion,
			};
		}

		await AsyncStorage.setItem(Consts.cacheKeys.version, `${version}`);
		await AsyncStorage.setItem(Consts.cacheKeys.dict, rawText);

		return {
			method: "url",
			text: rawText,
			version,
		};
	}

	// Try cached dictionary first
	const cachedText = await AsyncStorage.getItem(Consts.cacheKeys.dict).catch(_ => null);

	if (cachedText !== null) {
		return {
			method: "cache",
			text: cachedText,
			version: cachedVersion,
		};
	}

	// Try URL as a last resort
	const rawText = await fetch(Consts.dictUrl)
		.then(res => res.text())
		.catch(_ => null);

	if (rawText !== null) {
		await AsyncStorage.setItem(Consts.cacheKeys.version, `${version}`);
		await AsyncStorage.setItem(Consts.cacheKeys.dict, rawText);

		return {
			method: "url",
			text: rawText,
			version,
		};
	}

	return undefined;
}
