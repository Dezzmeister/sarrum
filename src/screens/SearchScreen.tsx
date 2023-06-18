import React, {useContext, useState} from "react";
import {
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import {Colors} from "../colors";
import {ScreenProps} from "../nav";
import {DictEntry} from "../dict/dict";
import {AkkadianInput} from "../components/AkkadianInput";
import {DictContext} from "../dict/context";
import {DefnCard} from "../components/DefnCard";

export type SearchScreenProps = ScreenProps<{
	engl: boolean;
}>;

type DefnPair = [string, DictEntry];

const QUERY_LIMIT = 15;
const QUERY_CUTOFF = 4;

const styles = StyleSheet.create({
	page: {
		height: "100%",
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		fontSize: 40,
		fontWeight: "400",
		color: Colors.light,
		marginTop: "8%",
		marginBottom: 10,
	},
	textInput: {
		width: "60%",
		backgroundColor: Colors.dark,
		color: Colors.light,
		borderWidth: 1,
		borderColor: Colors.light,
		height: 40,
		borderRadius: 10,
		marginBottom: 10,
	},
	akkContainer: {
		width: "60%",
		marginBottom: 10,
	},
	buttonContainer: {
		marginTop: "15%",
		width: "50%",
	},
	buttonText: {
		fontSize: 40,
	},
	list: {
		width: "100%",
	},
	listItem: {
		marginTop: 10,
		width: "80%",
		alignSelf: "center",
	},
});

export const SearchScreen: React.FC<SearchScreenProps> = props => {
	const engl = props.route.params.engl;
	const {dict} = useContext(DictContext);
	const [query, setQuery] = useState("");
	const [defnPairs, setDefnPairs] = useState<DefnPair[] | undefined>(
		undefined,
	);

	const onSubmit = () => {
		const words = dict!.search(query, QUERY_LIMIT, QUERY_CUTOFF, engl);
		const pairs: DefnPair[] = [];

		for (const word of words) {
			const defns = dict!.getDefn(word, engl);
			defns.forEach(defn => pairs.push([word, defn]));
		}

		setDefnPairs(pairs);
	};

	const renderTitle = () => {
		if (engl) {
			return <Text style={styles.title}>Lookup English</Text>;
		}

		return <Text style={styles.title}>Lookup Akkadian</Text>;
	};

	const renderInput = () => {
		if (engl) {
			return (
				<TextInput
					onChangeText={txt => setQuery(txt)}
					onSubmitEditing={onSubmit}
					autoFocus
					style={styles.textInput}
					// TODO: ios
					cursorColor={Colors.light}
				/>
			);
		}

		return (
			<AkkadianInput
				onChangeText={txt => setQuery(txt)}
				onSubmitEditing={onSubmit}
				autoFocus
				style={styles.akkContainer}
				// TODO: ios
				cursorColor={Colors.light}
			/>
		);
	};

	const renderDefnPair = (pairInfo: ListRenderItemInfo<DefnPair>) => {
		const {
			item: [word, defn],
		} = pairInfo;

		return (
			<DefnCard
				word={word}
				entry={defn}
				style={styles.listItem}
				engl={engl}
			/>
		);
	};

	const renderResults = () => {
		if (defnPairs === undefined) {
			return null;
		}

		if (defnPairs.length === 0) {
			return <Text>No results</Text>;
		}

		return (
			<FlatList
				data={defnPairs}
				renderItem={renderDefnPair}
				style={styles.list}
			/>
		);
	};

	return (
		<View style={styles.page}>
			{renderTitle()}
			{renderInput()}
			{renderResults()}
		</View>
	);
};
