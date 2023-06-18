import React, {useContext, useState} from "react";
import {
	FlatList,
	ListRenderItemInfo,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from "react-native";
import {Colors, GlobalStyles} from "../styles";
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
		...GlobalStyles.header3,
		marginTop: "8%",
		marginBottom: 10,
	},
	textInput: {
		width: "75%",
		backgroundColor: Colors.dark,
		color: Colors.light,
		borderWidth: 1,
		borderColor: Colors.light,
		height: 40,
		borderRadius: 10,
		marginBottom: 10,
	},
	emptyResults: {
		color: Colors.lightFaded,
		fontSize: 12,
	},
	akkContainer: {
		width: "75%",
		marginBottom: 10,
	},
	list: {
		width: "80%",
	},
	listItem: {
		marginTop: 10,
		width: "100%",
		alignSelf: "center",
	},
});

export const SearchScreen: React.FC<SearchScreenProps> = props => {
	const engl = props.route.params.engl;
	const {dict} = useContext(DictContext);
	const {width, height} = useWindowDimensions();
	const maxDim = Math.max(width, height);
	const pageStyle = height > width ? {height} : {flex: 1};
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
					autoCapitalize="none"
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
				autoCapitalize="none"
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
			return <Text style={styles.emptyResults}>No results</Text>;
		}

		return (
			<FlatList
				data={defnPairs}
				renderItem={renderDefnPair}
				style={styles.list}
				nestedScrollEnabled
			/>
		);
	};

	return (
		<View style={pageStyle}>
			<ScrollView
				contentContainerStyle={[styles.page, {height: maxDim}]}
				style={GlobalStyles.scrollView}
				nestedScrollEnabled
				keyboardShouldPersistTaps="always">
				<SafeAreaView>{renderTitle()}</SafeAreaView>
				{renderInput()}
				{renderResults()}
			</ScrollView>
		</View>
	);
};
