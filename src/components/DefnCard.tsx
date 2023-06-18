import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {Colors} from "../styles";
import {
	DictEntry,
	GrammarKinds,
	RELATION_NAMES,
	UserWordRelationKinds,
	WordAttrs,
	WordRelationKind,
	WordRelationKinds,
} from "../dict/dict";

type DefnCardProps = {
	word: string;
	entry: DictEntry;
	style: object;
	engl: boolean;
};

type RelationBuckets = {
	[key in string]?: string[];
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		padding: 4,
		borderWidth: 2,
		borderRadius: 10,
		borderColor: Colors.light,
		backgroundColor: Colors.dark,
	},
	cardHeader: {
		fontSize: 20,
		fontWeight: "bold",
		color: Colors.light,
	},
	text: {
		fontSize: 16,
		color: Colors.light,
	},
});

function getWordAttrs(entry: DictEntry): string {
	let out = "(" + GrammarKinds[entry.grammarKind];

	if (entry.wordAttrs.length === 0) {
		return out + ")";
	}

	out += "; ";

	for (let i = 0; i < entry.wordAttrs.length - 1; i++) {
		out += WordAttrs[entry.wordAttrs[i]] + ", ";
	}

	out += WordAttrs[entry.wordAttrs[entry.wordAttrs.length - 1]];

	return out + ")";
}

function getDefnStr(entry: DictEntry): string {
	let out = "";

	for (let i = 0; i < entry.defns.length - 1; i++) {
		out += entry.defns[i] + ", ";
	}

	out += entry.defns[entry.defns.length - 1];

	return out;
}

function getWordRels<
	T extends typeof WordRelationKinds | typeof UserWordRelationKinds,
>(entry: DictEntry, relationObj: T): string {
	const buckets: RelationBuckets = {};

	for (const rel of entry.relations) {
		if (!(rel.kind in relationObj)) {
			continue;
		}

		if (!buckets[rel.kind]) {
			buckets[rel.kind] = [];
		}

		buckets[rel.kind]!.push(rel.word);
	}

	let out = "";

	for (const kind in buckets) {
		if (!buckets[kind]) {
			continue;
		}

		out += RELATION_NAMES[kind as WordRelationKind] + ": ";

		for (let j = 0; j < buckets[kind]!.length - 1; j++) {
			out += buckets[kind]![j] + ", ";
		}

		out += buckets[kind]![buckets[kind]!.length - 1] + "\n";
	}

	return out.trim();
}

export const DefnCard: React.FC<DefnCardProps> = ({
	word,
	entry,
	style,
	engl,
}) => {
	const renderRelText = () => {
		const relText = getWordRels(
			entry,
			engl ? UserWordRelationKinds : WordRelationKinds,
		);

		if (relText) {
			return <Text style={styles.text}>{`\n${relText}`}</Text>;
		}

		return null;
	};

	return (
		<View style={[styles.card, style]}>
			<Text style={styles.cardHeader}>
				{word} {getWordAttrs(entry)}:
			</Text>
			<Text style={styles.text}>{getDefnStr(entry)}</Text>
			{renderRelText()}
		</View>
	);
};
