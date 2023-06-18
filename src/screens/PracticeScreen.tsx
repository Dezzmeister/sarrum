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
import {DictEntry, GrammarKinds, WordAttrs} from "../dict/dict";
import {AkkadianInput} from "../components/AkkadianInput";
import {DictContext} from "../dict/context";
import {DefnCard} from "../components/DefnCard";
import {InfoCard} from "../components/InfoCard";
import {arrCmp} from "../util";

export type PracticeScreenProps = ScreenProps<{
	engl: boolean;
}>;

type WordDefn = {
	word: string;
	entry: DictEntry;
};

const styles = StyleSheet.create({
	page: {
		alignItems: "center",
		backgroundColor: Colors.dark,
	},
	title: {
		...GlobalStyles.header3,
		marginTop: "8%",
		marginBottom: 10,
	},
	desc: {
		...GlobalStyles.desc1,
		marginTop: 20,
		width: "75%",
	},
	questionContainer: {
		width: "75%",
		marginTop: 15,
		marginBottom: 15,
	},
	cardText: {
		fontSize: 15,
		color: Colors.light,
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
	summaryView: {
		width: "100%",
		display: "flex",
		alignItems: "center",
	},
	yourAnswerContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		width: "75%",
		marginTop: 5,
		marginBottom: 5,
	},
	akkContainer: {
		width: "75%",
		marginBottom: 10,
	},
	list: {
		width: "75%",
	},
	listItem: {
		marginTop: 10,
		width: "100%",
		alignSelf: "center",
	},
});

function questionAttrs(entry: DictEntry): string {
	let out = GrammarKinds[entry.grammarKind];

	if (entry.wordAttrs.length !== 0) {
		out += "; ";

		for (let i = 0; i < entry.wordAttrs.length - 1; i++) {
			out += WordAttrs[entry.wordAttrs[i]] + ", ";
		}

		out += WordAttrs[entry.wordAttrs[entry.wordAttrs.length - 1]];
	}

	let isPretOf = false;
	let isGenOf = false;
	let isAccOf = false;
	let isDatOf = false;

	for (const rel of entry.relations) {
		if (rel.kind === "PreteriteOf") {
			isPretOf = true;
		} else if (rel.kind === "GenitiveOf") {
			isGenOf = true;
		} else if (rel.kind === "AccusativeOf") {
			isAccOf = true;
		} else if (rel.kind === "DativeOf") {
			isDatOf = true;
		}
	}

	if (isPretOf) {
		out += ", pret";
	}

	if (isGenOf && isAccOf) {
		out += ", gen-acc";
	} else if (isGenOf) {
		out += ", gen";
	} else if (isAccOf) {
		out += ", acc";
	} else if (isDatOf) {
		out += ", dat";
	}

	return "(" + out + ")";
}

export const PracticeScreen: React.FC<PracticeScreenProps> = props => {
	const engl = props.route.params.engl;
	const {dict} = useContext(DictContext);
	const {width, height} = useWindowDimensions();
	const maxDim = Math.max(width, height);
	const pageStyle = height > width ? {height} : {flex: 1};
	const [[questionWord, questionEntry], setQuestion] = useState(() =>
		dict!.randomEntry(engl),
	);
	const [answer, setAnswer] = useState("");
	const [correct, setCorrect] = useState(0);
	const [total, setTotal] = useState(0);
	const [summary, setSummary] = useState<WordDefn[] | undefined>(undefined);
	const [oldAnswer, setOldAnswer] = useState("");

	const onSubmit = () => {
		setTotal(prevTotal => prevTotal + 1);

		const realAnswer = answer.trim();
		const wasCorrect = questionEntry.defns.includes(realAnswer);
		const defns: WordDefn[] = [];

		if (!engl || !wasCorrect) {
			defns.push({
				word: questionWord,
				entry: questionEntry,
			});
		}

		if (wasCorrect) {
			setCorrect(prevCorrect => prevCorrect + 1);

			if (engl) {
				const entries = dict?.getDefn(realAnswer, false) as DictEntry[];

				for (const e of entries) {
					if (
						e.grammarKind === questionEntry.grammarKind &&
						arrCmp(e.wordAttrs, questionEntry.wordAttrs)
					) {
						defns.push({
							word: realAnswer,
							entry: e,
						});
					}
				}
			}
		}

		setSummary(defns);
		setAnswer("");
		setOldAnswer(answer);
		setQuestion(dict!.randomEntry(engl));
	};

	const renderTitle = () => {
		if (engl) {
			return <Text style={styles.title}>Practice English</Text>;
		}

		return <Text style={styles.title}>Practice Akkadian</Text>;
	};

	const renderInput = () => {
		if (!engl) {
			return (
				<TextInput
					onChangeText={txt => setAnswer(txt)}
					value={answer}
					onSubmitEditing={onSubmit}
					autoFocus
					style={styles.textInput}
					// TODO: ios
					cursorColor={Colors.light}
					autoCapitalize="none"
					placeholder="Enter answer here"
					placeholderTextColor={Colors.lightFaded}
				/>
			);
		}

		return (
			<AkkadianInput
				onChangeText={txt => setAnswer(txt)}
				value={answer}
				onSubmitEditing={onSubmit}
				autoFocus
				style={styles.akkContainer}
				// TODO: ios
				cursorColor={Colors.light}
				autoCapitalize="none"
				placeholder="Enter answer here"
				placeholderTextColor={Colors.lightFaded}
			/>
		);
	};

	const renderScore = () => {
		const ratio = (100 * correct) / total;

		return `${correct}/${total} (${ratio.toFixed(2)}%)`;
	};

	const renderWordDefn = (pairInfo: ListRenderItemInfo<WordDefn>) => {
		const {
			item: {word, entry},
		} = pairInfo;

		return (
			<DefnCard
				word={word}
				entry={entry}
				style={styles.listItem}
				engl={engl}
			/>
		);
	};

	const renderAnswer = () => {
		if (total === 0 || summary === undefined) {
			return null;
		}

		return (
			<View style={styles.summaryView}>
				<InfoCard style={styles.yourAnswerContainer}>
					<Text style={styles.cardText}>
						Your answer: {oldAnswer}
					</Text>
					<Text style={styles.cardText}>{renderScore()}</Text>
				</InfoCard>
				<FlatList
					data={summary}
					renderItem={renderWordDefn}
					style={styles.list}
					nestedScrollEnabled
				/>
			</View>
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
				<Text style={styles.desc}>
					Directions: Translate the word or phrase given into the
					target language. Note the part of speech and grammatical
					abbreviations.
				</Text>
				<InfoCard style={styles.questionContainer}>
					<Text style={styles.cardText}>
						{questionWord} {questionAttrs(questionEntry)}
					</Text>
				</InfoCard>
				{renderInput()}
				{renderAnswer()}
			</ScrollView>
		</View>
	);
};
