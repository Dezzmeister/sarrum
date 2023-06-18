import React, {useState, useEffect, useCallback} from "react";
import {Dictionary} from "./dict";

export type DictContextType = {
	loading: boolean;
	error: boolean;
	dict?: Dictionary;
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

	const getDictionary = useCallback(async () => {
		const localDict = await Dictionary.create();
		setLoading(false);

		if (!localDict) {
			setError(true);
		} else {
			setDict(localDict);
			setError(false);
		}
	}, []);

	useEffect(() => {
		getDictionary();
	}, [getDictionary]);

	return (
		<DictContext.Provider value={{loading, error, dict}}>
			{children}
		</DictContext.Provider>
	);
};
