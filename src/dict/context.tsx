import React, {useState, useEffect, useCallback} from "react";
import {Dictionary} from "./dict";
import {getLines} from "../cache";

export type DictContextType = {
	loading: boolean;
	error: boolean;
	dict?: Dictionary;
	reloadDict?: () => void;
};

export const DictContext = React.createContext<DictContextType>({
	loading: true,
	error: false,
	dict: undefined,
});

export const DictProvider: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const [dict, setDict] = useState<Dictionary | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	// Forces the entire dictionary to be reloaded by flipping a flag back
	// and forth
	const [flipflop, setFlipFlop] = useState(false);

	const getDictionary = useCallback(async () => {
		const lines = await getLines();
		console.log(`Reloading dictionary with ${lines} lines`);
		const localDict = await Dictionary.create(lines);
		setLoading(false);

		if (!localDict) {
			setError(true);
		} else {
			setDict(localDict);
			setError(false);
		}
	}, []);

	const reloadDict = () => {
		setFlipFlop(flip => !flip);
	};

	useEffect(() => {
		getDictionary();
	}, [getDictionary, flipflop]);

	return (
		<DictContext.Provider value={{loading, error, dict, reloadDict}}>
			{children}
		</DictContext.Provider>
	);
};
