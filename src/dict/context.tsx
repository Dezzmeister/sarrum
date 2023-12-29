import React, {useState, useEffect, useCallback} from "react";
import {Dictionary, type Section} from "./dict";
import {getSections} from "../cache";
import {Consts} from "../consts";

export type DictContextType = {
	loading: boolean;
	error: boolean;
    // The active dictionary with at most every section available
    // This is recreated from the full dictionary whenever `reloadDict` is called
	dict?: Dictionary;
    allSections?: readonly Section[];
	reloadDict: () => Promise<void>;
};

export const DictContext = React.createContext<DictContextType>({
	loading: true,
	error: false,
	dict: undefined,
    allSections: undefined,
    reloadDict: async () => {},
});

export const DictProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children,
}) => {
    const [fullDict, setFullDict] = useState<Dictionary | undefined>(undefined);
    const [dict, setDict] = useState<Dictionary | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadFullDict = async () => {
            console.log("Loading full dictionary...");
            const localDict = await Dictionary.create();
            console.log("Done.");

            if (!localDict) {
                setError(true);
                return;
            } 

            const sections = await getSections();
            setFullDict(localDict);

            // This can happen if the previous dictionary had no sections - we don't want the user
            // to have an empty dictionary
            if (sections && localDict.sections.every(section => !sections.includes(section.num))) {
                setDict(localDict.withSections());
            } else {
                setDict(localDict.withSections(sections));
            }

            setLoading(false);
            setError(false);
        };

        void loadFullDict();
    }, []);

    const reloadDict = useCallback(async () => {
        console.log("Reloading dictionary...");
        if (!fullDict) {
            console.log("Full dictionary does not exist! Stopping...");
            return;
        }

        setLoading(true);

        const sections = await getSections();
        setDict(fullDict.withSections(sections));
        setLoading(false);
        console.log("Done.");
    }, [fullDict]);

    return (
        <DictContext.Provider value={{loading, error, dict, reloadDict, allSections: fullDict?.sections}}>
            {children}
        </DictContext.Provider>
    );
};
